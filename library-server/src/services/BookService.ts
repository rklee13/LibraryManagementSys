import BookDao, { IBookModel } from "../daos/BookDao";
import { IBook } from "../models/Book";
import { IPagination } from "../models/Pagination";
import { BookAlreadyExistsError, BookDoesNotExistError, BookHasActiveLoanError } from "../utils/LibraryErrors";
import { buildFlexibleRegex, expandRelatedTerms, normalizeGenre } from "../utils/SearchExpander";

export async function findAllBooks(): Promise<IBookModel[]> {
    return await BookDao.find();
}

export async function findBookById(id: string): Promise<IBookModel> {
    try {
        let book = await BookDao.findById(id);
        if (book) return book;

        throw new BookDoesNotExistError("The specified book does not exist.");
    } catch (error) {
        throw error;
    }
}

export function modifyBook(book: IBookModel): Promise<IBookModel>;
export function modifyBook(id: string, book: Partial<IBook>): Promise<IBookModel>;
export async function modifyBook(idOrBook: string | IBookModel, book?: Partial<IBook>): Promise<IBookModel> {
    const id = typeof idOrBook === 'string' ? idOrBook : idOrBook._id.toString();
    const updates = typeof idOrBook === 'string' ? { ...book } : idOrBook.toObject();
    if (updates?.genre) updates.genre = normalizeGenre(updates.genre);
    let updatedBook: IBookModel | null;
    try {
        updatedBook = await BookDao.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
    } catch (error) {
        if (isDuplicateBarcodeError(error)) {
            throw new BookAlreadyExistsError("A book with this barcode already exists.");
        }
        throw error;
    }
    if (updatedBook) return updatedBook;
    throw new BookDoesNotExistError("The book you are trying to modify does not exist.");
}

export async function registerBook(book: IBook): Promise<IBookModel> {
    const savedBook = new BookDao({ ...book, genre: normalizeGenre(book.genre) });
    try {
        return await savedBook.save();
    } catch (error) {
        if (isDuplicateBarcodeError(error)) {
            throw new BookAlreadyExistsError("A book with this barcode already exists.");
        }
        throw error;
    }
}

function isDuplicateBarcodeError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

export async function removeBook(id: string): Promise<string> {
    const book = await BookDao.findById(id);
    if (!book) throw new BookDoesNotExistError("The book you are trying to delete does not exist.");
    if (book.records.some((record) => record.status === 'LOANED' && !record.returnedDate)) {
        throw new BookHasActiveLoanError("This book cannot be deleted while it has an active loan.");
    }
    await BookDao.findByIdAndDelete(id);
    return "Successfully deleted book.";
}

// Fuzzy search based on the given search parameters - they are optional 
export async function queryBooks(page: number, limit: number, title?: string, barcode?: string, description?: string, author?: string, subject?: string, genre?: string, matchMode = 'and'): Promise<IPagination<IBookModel>> {
    const query = BookDao.find();
    const andConditions: Parameters<typeof query.and>[0] = [];
    const searchTerm = (term?: string) => term?.trim();

    const barcodeTerm = searchTerm(barcode);
    if (barcodeTerm) andConditions.push({ barcode: new RegExp(barcodeTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });

    const titleTerm = searchTerm(title);
    if (titleTerm) andConditions.push({ title: buildFlexibleRegex(titleTerm) });

    const descriptionTerm = searchTerm(description);
    if (descriptionTerm) andConditions.push({ description: buildFlexibleRegex(descriptionTerm) });

    const authorTerm = searchTerm(author);
    if (authorTerm) andConditions.push({ authors: buildFlexibleRegex(authorTerm) });

    const subjectTerm = searchTerm(subject);
    if (subjectTerm) {
        const relatedTerms = await expandRelatedTerms(subjectTerm);
        andConditions.push({
            $or: relatedTerms.map((term) => ({ subjects: buildFlexibleRegex(term) }))
        });
    }

    const genreTerm = searchTerm(genre);
    if (genreTerm) andConditions.push({ genre: buildFlexibleRegex(genreTerm, true) });

    if (andConditions.length) {
        if (matchMode === 'or') query.or(andConditions);
        else query.and(andConditions);
    }
    const books: IBookModel[] = await query;
    return paginateBooks(books, page, limit);
}

export async function getBookFacets(): Promise<{ genres: string[]; subjects: string[] }> {
    const [genres, subjects]: [string[], string[]] = await Promise.all([
        BookDao.distinct('genre'),
        BookDao.distinct('subjects')
    ]);

    return {
        genres: genres.sort((a, b) => a.localeCompare(b)),
        subjects: subjects.sort((a, b) => a.localeCompare(b))
    };
}

export function paginateBooks(books: IBookModel[], page: number, limit: number): IPagination<IBookModel> {
    let pageBooks: IBookModel[] = [];

    // Returns x amount of books per page based on the limit
    const pages = Math.ceil(books.length / Number(limit));
    const startPoint = (Number(page) - 1) * Number(limit);
    if (Number(page) === pages) {
        pageBooks = books.slice(startPoint);
    } else {
        const endPoint = startPoint + Number(limit);
        pageBooks = books.slice(startPoint, endPoint);
    }

    const pageObject = {
        totalCount: books.length,
        currentPage: Number(page),
        totalPages: pages,
        limit: Number(limit),
        pageCount: pageBooks.length,
        items: pageBooks
    }

    return pageObject;
}