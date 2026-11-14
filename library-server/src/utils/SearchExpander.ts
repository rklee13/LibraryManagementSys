const relatedTermsCache = new Map<string, string[]>();

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildFlexibleRegex(term: string, exactBoundary = false): RegExp {
    const characters = Array.from(term.trim().replace(/[\s-]+/g, ''));
    const pattern = characters.map(escapeRegex).join('[\\s-]*');
    return new RegExp(exactBoundary ? `^${pattern}$` : pattern, 'i');
}

export async function expandRelatedTerms(term: string): Promise<string[]> {
    const normalizedTerm = term.trim();
    const cacheKey = normalizedTerm.toLocaleLowerCase();
    const cachedTerms = relatedTermsCache.get(cacheKey);
    if (cachedTerms) return [normalizedTerm, ...cachedTerms];

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        try {
            const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(normalizedTerm)}&max=6`;
            const response = await fetch(url, { signal: controller.signal });

            if (!response.ok) throw new Error(`Datamuse returned ${response.status}.`);

            const results: unknown = await response.json();
            if (!Array.isArray(results)) throw new Error('Datamuse returned an invalid response.');

            const relatedTerms = results
                .filter((result): result is { word: string; score: number } =>
                    typeof result === 'object' &&
                    result !== null &&
                    'word' in result &&
                    typeof result.word === 'string' &&
                    'score' in result &&
                    typeof result.score === 'number')
                .filter((result) =>
                    result.score > 0 &&
                    result.word.trim().split(/\s+/).length <= 2 &&
                    result.word.trim().toLocaleLowerCase() !== cacheKey)
                .slice(0, 6)
                .map((result) => result.word.trim());

            relatedTermsCache.set(cacheKey, relatedTerms);
            return [normalizedTerm, ...relatedTerms];
        } finally {
            clearTimeout(timeout);
        }
    } catch {
        relatedTermsCache.set(cacheKey, []);
        return [normalizedTerm];
    }
}

export function normalizeGenre(genre: string): string {
    const trimmedGenre = genre.trim();
    if (trimmedGenre.replace(/[\s-]/g, '').toLocaleLowerCase() === 'nonfiction') {
        return 'Non-Fiction';
    }
    return trimmedGenre;
}
