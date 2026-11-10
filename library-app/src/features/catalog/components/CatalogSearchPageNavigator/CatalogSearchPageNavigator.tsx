import React, { useState } from "react";
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
            //  Determine if the page already exist
            if (search.includes("&page=")) {
                // If it is there split it, and add int the page with the new information to keep the search term intact
                let splitString = search.split("&page=");
                let newTerms = splitString[0] + `&page=${pagingInformation.currentPage - 1}`;
                navigate(`/catalog${newTerms}`);
            } else {
                // If it isn't there, then add it
                let newTerms = search + `&page=${pagingInformation.currentPage - 1}`;
                navigate(`/catalog${newTerms}`);
            }
        }
    }

    const navigateToNumber = (event: React.MouseEvent<HTMLParagraphElement>) => {
        if (search.includes("&page=")) {
            let splitString = search.split("&page=");
            let newTerms = splitString[0] + `&page=${event.currentTarget.id}`; // navigate to specific page
            navigate(`/catalog${newTerms}`);
        } else {
            let newTerms = search + `&page=${event.currentTarget.id}`;
            navigate(`/catalog${newTerms}`);
        }
    }

    const navigateNext = () => {
        if (pagingInformation && pagingInformation.currentPage !== pagingInformation.totalPages) {
            if (search.includes("&page=")) {
                let splitString = search.split("&page=");
                let newTerms = splitString[0] + `&page=${pagingInformation.currentPage + 1}`;
                navigate(`/catalog${newTerms}`);
            } else {
                let newTerms = search + `&page=${pagingInformation.currentPage + 1}`;
                navigate(`/catalog${newTerms}`);
            }
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