import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/ReduxStore";
import { useLocation } from "react-router-dom";
import axios from "axios";

import './CatalogSearch.css';
import { queryBooks } from "../../../../redux/slices/BookSlice";
import { BookCard } from "../../../book";
import { CatalogAdvancedSearch } from "../CatalogAdvancedSearch/CatalogAdvancedSearch";
import { CatalogSearchPageNavigator } from "../CatalogSearchPageNavigator/CatalogSearchPageNavigator";

export const CatalogSearch: React.FC = () => {
    const bookState = useSelector((state: RootState) => state.book);
    const dispatch: AppDispatch = useDispatch();

    const location = useLocation();
    const [facets, setFacets] = useState<{ genres: string[]; subjects: string[] }>({ genres: [], subjects: [] });
    const [facetError, setFacetError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(queryBooks(location.search));
    }, [location.search]);

    useEffect(() => {
        const controller = new AbortController();
        axios.get<{ genres: string[]; subjects: string[] }>(
            'http://localhost:8000/books/facets',
            { signal: controller.signal }
        ).then((response) => {
            setFacets(response.data);
            setFacetError(null);
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) {
                setFacetError(axios.isAxiosError(error) ? error.message : 'Unable to load catalog suggestions.');
            }
        });

        return () => controller.abort();
    }, []);

    return (
        <div className="catalog-search">
            <div className="catalog-search-advanced-search-section">
                <CatalogAdvancedSearch genres={facets.genres} subjects={facets.subjects} />
                {facetError && <p role="status">Catalog suggestions unavailable: {facetError}</p>}
            </div>
            {
                !bookState.loading ?
                    <>
                        <h2>Displaying {bookState.pagingInformation?.pageCount} books out of {bookState.pagingInformation?.totalCount}</h2>
                        <div className="catalog-search-item-area">
                            {
                                bookState.books.map((book) => <BookCard key={book.barcode} book={book} />)
                            }
                        </div>
                        <div className="catalog-search-pages">
                            <CatalogSearchPageNavigator />
                        </div>
                    </> : <></>
            }
        </div>
    )
}