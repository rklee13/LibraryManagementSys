import React, { useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';

import './Navbar.css';
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/ReduxStore";
import { setDisplayLogin } from "../../../../redux/slices/ModalSlice";
import { Book, Search } from "@mui/icons-material";

export const Navbar: React.FC = () => {
    const searchRef = useRef<HTMLInputElement>(null);
    const authState = useSelector((state: RootState) => state.authentication);

    const navigate = useNavigate();

    const dispatch: AppDispatch = useDispatch();

    const handleSearch = (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        const searchInput = searchRef.current;
        const query = searchInput?.value.trim();
        if (!query) return;

        const searchParams = new URLSearchParams({
            barcode: query,
            title: query,
            description: query,
            matchMode: 'or'
        });
        navigate(`/catalog?${searchParams.toString()}`);
        if (searchInput) searchInput.value = '';
    };

    const toggleLogin = () => {
        dispatch(setDisplayLogin(true));
    };

    return (
        <nav className="navbar" aria-label="Main navigation">
            <Link to="/" className="navbar-logo-section">
                <Book aria-hidden="true" />
                <span className="navbar-brand-title">My Library</span>
            </Link>
            <div className="navbar-option-section">
                <Link to="/catalog" className="navbar-option navbar-link">
                    View catalog
                </Link>
                {authState.loggedInUser?.type === 'ADMIN' &&
                    <Link to="/admin" className="navbar-option navbar-link">Admin</Link>}
                {(authState.loggedInUser?.type === 'ADMIN' || authState.loggedInUser?.type === 'EMPLOYEE') &&
                    <Link to="/manage-books" className="navbar-option navbar-link">Manage Books</Link>}
                <form className="navbar-search-box" role="search" onSubmit={handleSearch}>
                    <input
                        className="navbar-search-input"
                        type="search"
                        aria-label="Search the catalog"
                        placeholder="Search books"
                        ref={searchRef}
                    />
                    <button className="navbar-search-button" type="submit" aria-label="Submit catalog search">
                        <Search aria-hidden="true" />
                    </button>
                </form>
                {
                    authState.loggedInUser ?
                        <Link className="navbar-option navbar-account" to={`/profile/${authState.loggedInUser._id}`}>
                            {authState.loggedInUser.firstName}'s account
                        </Link>
                        :
                        <button className="navbar-option navbar-account" type="button" onClick={toggleLogin}>
                            Sign in
                        </button>
                }
            </div>
        </nav>
    );
}