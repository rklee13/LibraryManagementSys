import { Response, Request } from "express";
import { findAllBooks, registerBook, modifyBook, removeBook, queryBooks } from "../services/BookService";

import { IBook } from "../models/Book";
import { IBookModel } from "../daos/BookDao";
import { BookAlreadyExistsError, BookDoesNotExistError, BookHasActiveLoanError } from "../utils/LibraryErrors";

async function getAllBooks(req: Request, res: Response) {
    try {
        let books = await findAllBooks();
        res.status(200).json({ message: "Retrieved all books.", count: books.length, books });
    } catch (error) {
        res.status(500).json({ message: "Unable to retrieve books at this time.", error });
    }
}

async function createBook(req: Request, res: Response) {
    try {
        let savedBook = await registerBook(req.body);
        res.status(201).json({ message: "Book registered successfully.", savedBook });
    } catch (error) {
        if (error instanceof BookAlreadyExistsError) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unable to save book at this time.", error });
        }
    }
}

async function updateBook(req: Request, res: Response) {
    const bookId = req.params.bookId;
    try {
        let updatedBook = await modifyBook(typeof bookId === "string" ? bookId : bookId[0], req.body);
        res.status(200).json({ message: "Book updated successfully.", updatedBook });
    } catch (error) {
        if (error instanceof BookDoesNotExistError) {
            res.status(404).json({ message: "Cannot update book that does not exist.", error });
        } else if (error instanceof BookAlreadyExistsError) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unable to update book at this time.", error });
        }
    }
}

async function deleteBook(req: Request, res: Response) {
    const { bookId } = req.params;
    try {
        let message = await removeBook(typeof bookId === "string" ? bookId : bookId[0]);
        res.status(202).json({ message });
    } catch (error) {
        if (error instanceof BookDoesNotExistError) {
            res.status(404).json({ message: "Cannot delete a book that does not exist.", error });
        } else if (error instanceof BookHasActiveLoanError) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Unable to delete book at this time.", error });
        }
    }
}

async function searchForBooksByQuery(req: Request, res: Response) {
    let { title, barcode, author, description, subject, genre, page = 1, limit = 25 } = req.query;

    let books = await queryBooks(
        Number(page),
        Number(limit),
        title as string,    // as string will convert to an empty string if value is undefined
        barcode as string,
        description as string,
        author as string,
        subject as string,
        genre as string
    );

    // No need to check for errors because an empty array is still valid
    res.status(200).json({ message: "Retrieved books from query", page: books });
}

export default { getAllBooks, createBook, updateBook, deleteBook, searchForBooksByQuery };