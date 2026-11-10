import React from "react";
import './BookOfTheWeek.css';
import { BookInformation } from "../../../book";

export const BookOfTheWeek: React.FC = () => {
    return (
        <div className="book-of-the-week">
            <h1>Book of the Week:</h1>
            <BookInformation
                book={{
                    _id: "1234",
                    barcode: "1234",
                    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1679700759i/123829884.jpg",
                    title: "Java: The Ultimate Beginner's Guide to Learn Java Quickly With No Prior Experience",
                    authors: ["Mark Reed"],
                    description: "An independent and object-oriented languageNo complex features making it easy to learnPortable codes can be used on other PC'sA secure and virus-free systemCan run on any computer architectureFast and reliableStrong memory managementAnd lots more...Learning to program with your computer is now easier than it has ever been and even if you have never tried to learn something like this before, you will find step-by-step instructions that don't just make it easy, but fun as well.If you are a novice and interested in learning your first computer program, then get a copy of Java today and get started right now!",
                    subjects: ["java", "learning"],
                    publicationDate: new Date("2020-01-01"),
                    publisher: "new publisher",
                    pages: 200,
                    genre: "Non-fiction",
                    records: []
                }}
            />
        </div>
    );
}