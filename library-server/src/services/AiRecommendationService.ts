import BookDao from "../daos/BookDao";
import LoanRecordDao from "../daos/LoanRecordDao";
import { IBook } from "../models/Book";

interface BookContext {
    _id: string;
    title: string;
    authors: string[];
    genre: string;
    subjects: string[];
    description: string;
}

interface RecommendationCandidate {
    bookId: string;
    reason: string;
}

export interface BookRecommendation {
    book: IBook & { _id: string };
    reason: string;
}

interface RecommendationRequest {
    prompt?: string;
    userId?: string;
    limit?: number;
}

const STOP_WORDS = new Set([
    "about", "after", "also", "and", "are", "book", "books", "for", "from",
    "help", "into", "like", "that", "the", "their", "this", "want", "with"
]);

function tokenize(value: string): string[] {
    return value.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) ?? [];
}

function wordsInBook(book: BookContext): Set<string> {
    return new Set(tokenize([
        book.title,
        ...book.authors,
        book.genre,
        ...book.subjects,
        book.description
    ].join(" ")));
}

function fallbackRecommendations(
    books: BookContext[],
    history: BookContext[],
    prompt: string | undefined,
    excludedIds: Set<string>,
    limit: number
): RecommendationCandidate[] {
    const promptWords = new Set(tokenize(prompt ?? ""));
    const historyGenres = new Set(history.flatMap((book) => tokenize(book.genre)));
    const historySubjects = new Set(history.flatMap((book) => book.subjects.flatMap(tokenize)));
    const candidates = books.filter((book) => !excludedIds.has(book._id)).map((book) => {
        const bookWords = wordsInBook(book);
        const promptMatches = [...promptWords].filter((word) => bookWords.has(word));
        const genreMatches = tokenize(book.genre).filter((word) => historyGenres.has(word));
        const subjectMatches = book.subjects.flatMap(tokenize).filter((word) => historySubjects.has(word));
        const score = promptMatches.length * 3 + genreMatches.length * 2 + subjectMatches.length;

        let reason = "This book is available in our catalog and may be a good discovery.";
        if (promptMatches.length > 0) {
            reason = `It matches your interest in ${promptMatches.slice(0, 3).join(", ")}.`;
        } else if (genreMatches.length > 0 || subjectMatches.length > 0) {
            const overlap = [...new Set([...genreMatches, ...subjectMatches])].slice(0, 3);
            reason = `Its ${overlap.join(", ")} themes connect with books you have borrowed.`;
        }

        return { bookId: book._id, reason, score };
    });

    return candidates
        .sort((left, right) => right.score - left.score || left.bookId.localeCompare(right.bookId))
        .slice(0, limit)
        .map(({ bookId, reason }) => ({ bookId, reason }));
}

async function getAiRecommendations(
    books: BookContext[],
    history: BookContext[],
    prompt: string | undefined,
    excludedIds: Set<string>,
    limit: number
): Promise<RecommendationCandidate[]> {
    const catalogText = JSON.stringify(books);
    const historyText = JSON.stringify(history.map(({ title, authors, genre, subjects }) => ({
        title, authors, genre, subjects
    })));
    const instructions = [
        "Recommend books from the catalog for the reader, ranked by best match.",
        "Return ONLY a JSON object with the shape {\"recommendations\":[{\"bookId\":\"<catalog _id>\",\"reason\":\"<one crisp sentence>\"}]}.",
        "Use only bookId values present in the catalog. Do not repeat ids.",
        excludedIds.size > 0 ? `Exclude these already borrowed book ids: ${JSON.stringify([...excludedIds])}.` : "",
        `Return at most ${limit} recommendations.`,
        `Reader request: ${prompt?.trim() || "Suggest books matching the reader's borrowing history."}`,
        `Borrowing history: ${historyText}`,
        `Catalog: ${catalogText}`
    ].filter(Boolean).join("\n");

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: instructions }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            }
        );
        if (!response.ok) throw new Error(`Gemini recommendation request failed (${response.status}).`);
        const data = await response.json() as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
        return parseRecommendations(text, books, excludedIds, limit);
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: instructions }],
                response_format: { type: "json_object" }
            })
        });
        if (!response.ok) throw new Error(`OpenAI recommendation request failed (${response.status}).`);
        const data = await response.json() as {
            choices?: Array<{ message?: { content?: string | null } }>;
        };
        return parseRecommendations(data.choices?.[0]?.message?.content ?? undefined, books, excludedIds, limit);
    }

    return fallbackRecommendations(books, history, prompt, excludedIds, limit);
}

function parseRecommendations(
    text: string | undefined,
    books: BookContext[],
    excludedIds: Set<string>,
    limit: number
): RecommendationCandidate[] {
    if (!text) throw new Error("The AI recommendation service returned an empty response.");

    let result: { recommendations?: Array<{ bookId?: unknown; reason?: unknown }> };
    try {
        result = JSON.parse(text);
    } catch {
        throw new Error("The AI recommendation service returned invalid JSON.");
    }

    if (!Array.isArray(result.recommendations)) {
        throw new Error("The AI recommendation service returned an invalid recommendation list.");
    }

    const validIds = new Set(books.map((book) => book._id));
    const seenIds = new Set<string>();
    return result.recommendations.flatMap((recommendation) => {
        const bookId = typeof recommendation.bookId === "string" ? recommendation.bookId : "";
        const reason = typeof recommendation.reason === "string" ? recommendation.reason.trim() : "";
        if (!validIds.has(bookId) || excludedIds.has(bookId) || seenIds.has(bookId) || !reason) return [];
        seenIds.add(bookId);
        return [{ bookId, reason }];
    }).slice(0, limit);
}

export async function recommendBooks({
    prompt,
    userId,
    limit = 6
}: RecommendationRequest): Promise<BookRecommendation[]> {
    if (!prompt?.trim() && !userId) throw new Error("Provide a request or a user id for personalized recommendations.");

    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 20);
    const borrowedIds = userId
        ? (await LoanRecordDao.distinct("item", { patron: userId })).map(String)
        : [];
    const excludedIds = new Set(borrowedIds);

    const [catalogRows, historyRows] = await Promise.all([
        BookDao.find().select("_id title authors genre subjects description").lean(),
        borrowedIds.length
            ? BookDao.find({ _id: { $in: borrowedIds } }).select("_id title authors genre subjects description").lean()
            : Promise.resolve([])
    ]);

    const toContext = (book: typeof catalogRows[number]): BookContext => ({
        _id: String(book._id),
        title: book.title,
        authors: book.authors,
        genre: book.genre,
        subjects: book.subjects,
        description: (book.description ?? "").slice(0, 180)
    });
    const catalog = catalogRows.map(toContext);
    const history = historyRows.map(toContext);
    const candidates = await getAiRecommendations(catalog, history, prompt, excludedIds, safeLimit);
    const bookIds = candidates.map(({ bookId }) => bookId);
    if (bookIds.length === 0) return [];

    const fullBooks = await BookDao.find({ _id: { $in: bookIds } });
    const booksById = new Map(fullBooks.map((book) => [book._id.toString(), book]));
    return candidates.flatMap(({ bookId, reason }) => {
        const book = booksById.get(bookId);
        return book ? [{ book: { ...book.toObject(), _id: book._id.toString() }, reason }] : [];
    });
}
