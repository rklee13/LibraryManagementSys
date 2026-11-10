import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import './CatalogOverviewSection.css';
import type { Book } from "../../../../models/Book";
import type { RootState } from "../../../../redux/ReduxStore";
import { BookCarousel } from "../../../book";

interface CatalogOverviewSectionProps {
    books: Book[];
    label: string;
}

export const CatalogOverviewSection: React.FC<CatalogOverviewSectionProps> = ({ books, label }) => {
    const bookState = useSelector((state: RootState) => state.book);
    const navigate = useNavigate();

    const handleViewMore = () => {
        // search our catalog and select all books by genre and subject
        navigate(`catalog?genre=${label}&subject=${label}`);
    }

    return (
        <div className="catalog-overview-section">
            <div className="catalog-overview-section-top">
                <h4>{label}</h4>
                <p className="catalog-overview-section-more" onClick={handleViewMore}>View more...</p>
            </div>
            {books.length > 0 && !bookState.loading && <BookCarousel books={books} />}
        </div>
    )
}