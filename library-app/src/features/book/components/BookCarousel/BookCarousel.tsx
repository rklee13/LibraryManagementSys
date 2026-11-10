import React, { useState } from "react";

import './BookCarousel.css';
import type { Book } from "../../../../models/Book";
import { BookCard } from "../BookCard/BookCard";

interface BookCarouselProps {
    books: Book[];
}

export const BookCarousel: React.FC<BookCarouselProps> = ({ books }) => {
    const [order, setOrder] = useState<Book[]>(books);

    // Moves first item from front to back
    const moveLeft = () => {
        // Get first book/item
        let item = order[0];

        // Remove first book/item from the array
        let reordered = order.slice(1, order.length);

        // Put the removed/first book/item to the back and then re-set/update the order object
        reordered.push(item);
        setOrder(reordered);
    }

    // Moves last item from the back to the front
    const moveRight = () => {
        // Get first book/item
        let item = order[order.length - 1];

        // Remove last book/item from the array
        let reordered = order.slice(0, order.length - 1);

        // Put the removed/last book/item to the front and then re-set/update the order object
        reordered = [item, ...reordered];
        setOrder(reordered);
    }

    return (
        <div className="book-carousel">
            <div className="book-carousel-left-button" onClick={moveLeft}>
                {'<'}
            </div>
            <div className="book-carousel-right-button" onClick={moveRight}>
                {'>'}
            </div>
            {order.map((item) => <BookCard key={item.barcode} book={item} />)}
        </div>
    )
}