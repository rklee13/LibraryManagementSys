import { useNavigate } from "react-router-dom";
import type { Book } from "../../../../models/Book";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/ReduxStore";
import React, { useEffect, useState } from "react";
import { setCurrentBook } from "../../../../redux/slices/BookSlice";
import { setDisplayLoan } from "../../../../redux/slices/ModalSlice";
import { mapAuthorsToString } from "../../utils/BookUtils";
import './BookCard.css';

interface BookCardProps {
    book: Book
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
    const user = useSelector((state: RootState) => state.authentication.loggedInUser);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const [available, setAvailable] = useState<boolean>(() => {
        // If there is no loan records, then it is available
        if (book.records.length === 0) return true;

        // Otherwise check if the top loan record is set to available
        return book.records[0].status === "AVAILABLE";
    });

    const [buttonClass, setButtonClass] = useState<string>("");

    const handleLoan = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (user?.type === "EMPLOYEE") {
            dispatch(setCurrentBook(book));
            dispatch(setDisplayLoan(true));
        }
    }

    // Navigate to the books resource page whenever the book card is selected
    const displayBook = () => {
        navigate(`/resource/${book.barcode}`)
    }

    useEffect(() => {
        let c = "book-card-loan-button";

        if (available) c += " available";
        else c += " unavailable";

        if (user && user.type === "EMPLOYEE") {
            if (available) c += " checkout";
            else if (!available) c += " checkin";
        }

        setButtonClass(c);
    }, [available, user?.type, book.records]);

    return (
        <div id="book-card" className="book-card" onClick={displayBook}>
            <img className="book-card-cover" src={book.cover} alt="" />
            <div className="book-card-info">
                <h1 className="book-card-title">{book.title}</h1>
                <h3 className="book-card-author">{mapAuthorsToString(book)}</h3>
                <p className="book-card-description">{book.description}</p>
            </div>
            <button className={buttonClass} onClick={handleLoan}>Status: {available ? "AVAILABLE" : "UNAVAILABLE"}</button>
        </div>
    )
}