import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import './BookCheckout.css';
import type { AppDispatch, RootState } from "../../../../redux/ReduxStore";
import { checkoutBook, setCurrentBook } from "../../../../redux/slices/BookSlice";
import { setDisplayLoan } from "../../../../redux/slices/ModalSlice";

export const BookCheckout: React.FC = () => {
    const user = useSelector((state: RootState) => state.authentication.loggedInUser);
    const book = useSelector((state: RootState) => state.book.currentBook);

    const dispatch: AppDispatch = useDispatch();

    const libraryCardRef = useRef<HTMLInputElement>(null);

    const checkout = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // If the login user is an employee and we have a book, launch the checkout book modal
        if (book && user && user.type === "EMPLOYEE" && libraryCardRef && libraryCardRef.current) {
            dispatch(checkoutBook({
                book,
                employee: user,
                libraryCard: libraryCardRef.current.value
            }))
        }

        // Clean up
        dispatch(setCurrentBook(undefined));
        dispatch(setDisplayLoan(false));
    }

    return (
        <div className="book-checkout">
            {
                book && user &&
                <form className="book-checkout-form">
                    <h3>Loan book Title: {book.title}</h3>
                    <h4>Enter patrons Library Card:</h4>
                    <input type="text" className="book-checkout-input" placeholder="Library Card ID" ref={libraryCardRef} />
                    <h4>Checkout Employee ID:</h4>
                    <input type="text" className="book-checkout-input" value={user._id} disabled />
                    <button className="book-checkout-button" onClick={checkout}>Loan Book</button>
                </form>
            }
        </div>
    )
}