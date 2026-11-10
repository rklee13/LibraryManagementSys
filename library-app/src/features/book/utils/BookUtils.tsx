import type { JSX } from "react/jsx-runtime";
import type { Book } from "../../../models/Book";
import { BookCheckout } from "../components/BookCheckout/BookCheckout";
import { BookCheckin } from "../components/BookCheckin/BookCheckin";

export function mapAuthorsToString(book: Book) {
    if (!book || !book.authors || book.authors.length == 0) return "";

    return book.authors.join(", ");
}

export function determineLoanModalContent(book: Book): JSX.Element {
    if (book.records.length === 0 || book.records[0].status === "AVAILABLE") {
        return <BookCheckout />;
    }

    return <BookCheckin />;
}