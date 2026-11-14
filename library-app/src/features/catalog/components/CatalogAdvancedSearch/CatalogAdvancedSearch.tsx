import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

import './CatalogAdvancedSearch.css';

interface CatalogAdvancedSearchProps {
    genres: string[];
    subjects: string[];
}

export const CatalogAdvancedSearch: React.FC<CatalogAdvancedSearchProps> = ({ genres, subjects }) => {
    const navigate = useNavigate();

    const isbnRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const authorRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const subjectRef = useRef<HTMLInputElement>(null);
    const genreRef = useRef<HTMLInputElement>(null);

    const search = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams();
        const values: Array<[string, string | undefined]> = [
            ["barcode", isbnRef.current?.value],
            ["title", titleRef.current?.value],
            ["author", authorRef.current?.value],
            ["description", descriptionRef.current?.value],
            ["subject", subjectRef.current?.value],
            ["genre", genreRef.current?.value]
        ];

        values.forEach(([key, value]) => {
            const trimmedValue = value?.trim();
            if (trimmedValue) params.set(key, trimmedValue);
        });

        const query = params.toString();
        navigate(query ? `/catalog?${query}` : "/catalog");
    }

    const clear = () => {
        [isbnRef, titleRef, authorRef, descriptionRef, subjectRef, genreRef].forEach((inputRef) => {
            if (inputRef.current) inputRef.current.value = "";
        });
        navigate("/catalog");
    }

    return (
        <div className="catalog-advanced-search">
            <h2>Advanced Book Search</h2>
            <p>Fill in as many or little fields to narrow down your search results</p>
            <form className="catalog-advanced-search-form" onSubmit={search}>
                <div className="catalog-advanced-form-input-group">
                    <p>ISBN</p>
                    <input id="isbn" type="text" className="catalog-advanced-form-input" placeholder={"ISBN"} ref={isbnRef} />
                </div>
                <div className="catalog-advanced-form-input-group">
                    <p>Title</p>
                    <input id="title" type="text" className="catalog-advanced-form-input" placeholder={"Title"} ref={titleRef} />
                </div>
                <div className="catalog-advanced-form-input-group">
                    <p>Author</p>
                    <input id="author" type="text" className="catalog-advanced-form-input" placeholder={"Author"} ref={authorRef} />
                </div>
                <div className="catalog-advanced-form-input-group">
                    <p>Description</p>
                    <input id="description" type="text" className="catalog-advanced-form-input" placeholder={"Description"} ref={descriptionRef} />
                </div>
                <div className="catalog-advanced-form-input-group">
                    <p>Subject</p>
                    <input id="subject" type="text" className="catalog-advanced-form-input" placeholder={"Subject"} list="catalog-subject-options" ref={subjectRef} />
                    <datalist id="catalog-subject-options">
                        {subjects.map((subject) => <option key={subject} value={subject} />)}
                    </datalist>
                </div>
                <div className="catalog-advanced-form-input-group">
                    <p>Genre</p>
                    <input id="genre" type="text" className="catalog-advanced-form-input" placeholder={"Genre"} list="catalog-genre-options" ref={genreRef} />
                    <datalist id="catalog-genre-options">
                        {genres.map((genre) => <option key={genre} value={genre} />)}
                    </datalist>
                </div>
                <div className="catalog-advanced-search-actions">
                    <button type="submit" className="catalog-advanced-search-button">Search</button>
                    <button type="button" className="catalog-advanced-search-button catalog-advanced-clear-button" onClick={clear}>Clear</button>
                </div>
            </form>
        </div>
    )
}