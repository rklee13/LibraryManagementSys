import React from "react";
import { useSelector, useDispatch } from "react-redux";

import './BookCheckin.css';
import type { AppDispatch, RootState } from "../../../../redux/ReduxStore";
import { checkinBook, setCurrentBook } from "../../../../redux/slices/BookSlice";
import { setDisplayLoan } from "../../../../redux/slices/ModalSlice";

export const BookCheckin: React.FC = () => {
    const user = useSelector((state: RootState) => state.authentication.loggedInUser);
    const book = useSelector((state: RootState) => state.book.currentBook);

    const dispatch: AppDispatch = useDispatch();

    const checkin = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // If the login user is an employee and we have a book, launch the checkin book modal
        if (book && user && user.type === "EMPLOYEE") {
            dispatch(checkinBook({
                book,
                employee: user
            }));
            dispatch(setDisplayLoan(false));
            dispatch(setCurrentBook(undefined));
        }
    }

    return (
        <div className="book-checkin">
            {
                book && user &&
                <form className="book-checkin-form">
                    <h3>Check In Book Title: {book.title}</h3>
                    <h4>Check In Employee ID:</h4>
                    <input type="text" className="book-checkin-input" value={user._id} disabled />
                    <button className="book-checkin-button" onClick={checkin}>Check In Book</button>
                </form>
            }
        </div>
    );
}