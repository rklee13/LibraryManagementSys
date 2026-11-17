import { Response, Request } from "express";
import { findAllBooks, registerBook, modifyBook, removeBook, queryBooks, getBookFacets } from "../services/BookService";

import { IBook } from "../models/Book";
import { IBookModel } from "../daos/BookDao";
import { BookAlreadyExistsError, BookDoesNotExistError, BookHasActiveLoanError } from "../utils/LibraryErrors";
import { recommendBooks } from "../services/AiRecommendationService";

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
    let { title, barcode, author, description, subject, genre, matchMode = 'and', page = 1, limit = 25 } = req.query;

    let books = await queryBooks(
        Number(page),
        Number(limit),
        title as string,    // as string will convert to an empty string if value is undefined
        barcode as string,
        description as string,
        author as string,
        subject as string,
        genre as string,
        matchMode as string
    );

    // No need to check for errors because an empty array is still valid
    res.status(200).json({ message: "Retrieved books from query", page: books });
}

async function getBookFacetsHandler(_req: Request, res: Response) {
    try {
        const facets = await getBookFacets();
        res.status(200).json(facets);
    } catch (error) {
        res.status(500).json({ message: "Unable to retrieve book facets at this time.", error });
    }
}

async function recommendBooksHandler(req: Request, res: Response) {
    const { prompt, userId, limit } = req.body as { prompt?: string; userId?: string; limit?: number };
    if (userId && req.authenticatedUser?._id.toString() !== userId) {
        res.status(403).json({ message: "You can only request recommendations from your own borrowing history." });
        return;
    }

    try {
        const recommendations = await recommendBooks({ prompt, userId, limit });
        res.status(200).json({ recommendations });
    } catch (error) {
        res.status(502).json({
            message: error instanceof Error ? error.message : "Unable to generate recommendations at this time."
        });
    }
}

export default { getAllBooks, createBook, updateBook, deleteBook, searchForBooksByQuery, getBookFacetsHandler, recommendBooksHandler };