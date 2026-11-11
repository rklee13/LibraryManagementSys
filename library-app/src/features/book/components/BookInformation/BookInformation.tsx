import React from "react";
import { Link } from "react-router-dom";

import './BookInformation.css';
import type { Book } from "../../../../models/Book";
import { mapAuthorsToString } from "../../utils/BookUtils";

interface BookInfoProps {
    book: Book;
    coverLinkToResource?: boolean;
}

export const BookInformation: React.FC<BookInfoProps> = ({ book, coverLinkToResource = false }) => {
    const cover = <img className="book-info-cover" src={book.cover} alt={`Cover of ${book.title}`} />;

    return (
        <div className="book-info">
            <div className="book-info-container">
                {coverLinkToResource ? (
                    <Link
                        className="book-info-cover-link"
                        to={`/resource/${encodeURIComponent(book.barcode)}`}
                        aria-label={`View resource page for ${book.title}`}
                    >
                        {cover}
                    </Link>
                ) : cover}
                <div>
                    <h2>{book.title}</h2>
                    <h3>{mapAuthorsToString(book)}</h3>
                    <p>{book.description}</p>
                </div>
            </div>
        </div>
    )
}