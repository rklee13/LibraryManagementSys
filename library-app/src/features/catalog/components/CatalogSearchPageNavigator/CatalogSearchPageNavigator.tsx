import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import './CatalogSearchPageNavigator.css';
import type { RootState } from "../../../../redux/ReduxStore";
import { calculatePaging } from "../../utils/CatalogUtils";

export const CatalogSearchPageNavigator: React.FC = () => {
    const pagingInformation = useSelector((state: RootState) => state.book.pagingInformation);

    const navigate = useNavigate();
    const { search } = useLocation();

    const navigatePrevious = () => {
        // Check to make sure we don't go to negative pages.
        if (pagingInformation && pagingInformation.currentPage !== 1) {
            const params = new URLSearchParams(search);
            params.set("page", `${pagingInformation.currentPage - 1}`);
            navigate(`/catalog?${params.toString()}`);
        }
    }

    const navigateToNumber = (event: React.MouseEvent<HTMLParagraphElement>) => {
        const params = new URLSearchParams(search);
        params.set("page", event.currentTarget.id);
        navigate(`/catalog?${params.toString()}`);
    }

    const navigateNext = () => {
        if (pagingInformation && pagingInformation.currentPage !== pagingInformation.totalPages) {
            const params = new URLSearchParams(search);
            params.set("page", `${pagingInformation.currentPage + 1}`);
            navigate(`/catalog?${params.toString()}`);
        }
    }

    return (
        <div className="catalog-search-page-navigator">
            <p className="catalog-search-page-navigator-navigate" onClick={navigatePrevious}>Prev</p>
            <div className="catalog-search-page-numbers">
                {pagingInformation && calculatePaging(pagingInformation).map((num) => {
                    if (num === `${pagingInformation.currentPage}`) return <p key={num} className="catalog-search-page-number number-active">{num}</p>

                    return <p key={num} id={num} className="catalog-search-page-number" onClick={navigateToNumber}>{num}</p>
                })}
            </div>
            <p className="catalog-search-page-navigator-navigate" onClick={navigateNext}>Next</p>
        </div>
    )
}