import BookDao, { IBookModel } from "../daos/BookDao";
import { IBook } from "../models/Book";
import { IPagination } from "../models/Pagination";
import { BookAlreadyExistsError, BookDoesNotExistError, BookHasActiveLoanError } from "../utils/LibraryErrors";

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
    const updates = typeof idOrBook === 'string' ? book : idOrBook.toObject();
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
    const savedBook = new BookDao(book);
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
export async function queryBooks(page: number, limit: number, title?: string, barcode?: string, description?: string, author?: string, subject?: string, genre?: string): Promise<IPagination<IBookModel>> {
    let books: IBookModel[] = await BookDao.find(); // Get all books from the database
    let filteredBooks: IBookModel[] = [];

    books.forEach((book) => {
        // Go from most specific to least specific search criteria
        if (barcode) {
            // If this book's barcode is the same as the search barcode and it isn't already in filteredBooks, then add it
            if (book.barcode.toLowerCase().includes(barcode.toLowerCase()) && !filteredBooks.some(b => b['barcode'] === book.barcode)) {
                filteredBooks.push(book);
            }
        }

        if (title) {
            // Check if this is the book based on title and verify the book wasn't already added based on the barcode
            if (book.title.toLowerCase().includes(title.toLowerCase()) && !filteredBooks.some(b => b['barcode'] === book.barcode)) {
                filteredBooks.push(book);
            }
        }

        if (description) {
            // Check if this is the book based on description and verify the book wasn't already added based on the barcode
            if (book.description.toLowerCase().includes(description.toLowerCase()) && !filteredBooks.some(b => b['barcode'] === book.barcode)) {
                filteredBooks.push(book);
            }
        }

        if (author) {
            // Check if this is the book has the author and verify the book wasn't already added based on the barcode
            if (book.authors.some(a => a.toLowerCase().includes(author.toLowerCase())) && !filteredBooks.some(b => b['barcode'] === book.barcode)) {
                filteredBooks.push(book);
            }
        }

        if (subject) {
            // Check if this is the book has the subject and verify the book wasn't already added based on the barcode
            if (book.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase())) && !filteredBooks.some(b => b['barcode'] === book.barcode)) {
                filteredBooks.push(book);
            }
        }

        if (genre) {
            // Check if this is the book has the genre and verify the book wasn't already added based on the barcode
            if (book.genre.toLowerCase() === genre.toLowerCase() && !filteredBooks.some(b => b['barcode'] === book.barcode)) {
                filteredBooks.push(book);
            }
        }
    });

    return paginateBooks(filteredBooks, page, limit);
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