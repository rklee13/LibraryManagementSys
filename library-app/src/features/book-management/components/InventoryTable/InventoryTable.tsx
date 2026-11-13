import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { Book } from '../../../../models/Book';
import type { AppDispatch } from '../../../../redux/ReduxStore';
import { clearBookManagementFeedback } from '../../../../redux/slices/BookSlice';
import { setBookRemovalTarget } from '../../../../redux/slices/ModalSlice';
import './InventoryTable.css';

interface InventoryTableProps {
    books: Book[];
    onEdit(book: Book): void;
}

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

function hasActiveLoan(book: Book): boolean {
    return book.records.some((record) => record.status === 'LOANED' && !record.returnedDate);
}

export function InventoryTable({ books, onEdit }: InventoryTableProps) {
    const dispatch: AppDispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const genres = useMemo(() => [...new Set(books.map((book) => book.genre).filter(Boolean))].sort(), [books]);
    const visibleBooks = useMemo(() => {
        const query = search.trim().toLowerCase();
        return books.filter((book) => {
            const matchesGenre = genre === 'ALL' || book.genre === genre;
            const searchable = `${book.title} ${book.barcode} ${book.genre} ${book.authors.join(' ')}`.toLowerCase();
            return matchesGenre && (!query || searchable.includes(query));
        });
    }, [books, genre, search]);
    const totalPages = Math.max(1, Math.ceil(visibleBooks.length / pageSize));
    const displayedPage = Math.min(currentPage, totalPages);
    const pageBooks = visibleBooks.slice((displayedPage - 1) * pageSize, displayedPage * pageSize);
    const paginationItems = useMemo<PaginationItem[]>(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }
        if (displayedPage <= 4) {
            return [1, 2, 3, 4, 5, 'end-ellipsis', totalPages];
        }
        if (displayedPage >= totalPages - 3) {
            return [1, 'start-ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, 'start-ellipsis', displayedPage - 1, displayedPage, displayedPage + 1, 'end-ellipsis', totalPages];
    },
        [displayedPage, totalPages]
    );

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const updateSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };
    const updateGenre = (value: string) => {
        setGenre(value);
        setCurrentPage(1);
    };
    const updatePageSize = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
    };
    const rangeStart = visibleBooks.length === 0 ? 0 : (displayedPage - 1) * pageSize + 1;
    const rangeEnd = Math.min(displayedPage * pageSize, visibleBooks.length);

    return (
        <div className="inventory">
            <div className="inventory-toolbar">
                <label>
                    <span className="visually-hidden">Search books</span>
                    <input type="search" value={search} onChange={(event) => updateSearch(event.target.value)}
                        placeholder="Search title, author or barcode" />
                </label>
                <label>
                    <span className="visually-hidden">Filter by genre</span>
                    <select value={genre} onChange={(event) => updateGenre(event.target.value)}>
                        <option value="ALL">All genres</option>
                        {genres.map((value) => <option value={value} key={value}>{value}</option>)}
                    </select>
                </label>
                <span className="inventory-count">{visibleBooks.length} books</span>
            </div>
            {visibleBooks.length === 0 ? (
                <p className="inventory-empty">No books match these filters.</p>
            ) : (
                <div className="inventory-table-scroll">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th scope="col">Book</th>
                                <th scope="col">Barcode</th>
                                <th scope="col">Genre</th>
                                <th scope="col">Loan status</th>
                                <th scope="col"><span className="visually-hidden">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageBooks.map((book) => {
                                const active = hasActiveLoan(book);
                                return (
                                    <tr key={book._id}>
                                        <td>
                                            <div className="inventory-book">
                                                <img src={book.cover} alt="" />
                                                <div>
                                                    <strong>{book.title}</strong>
                                                    <span>{book.authors.join(', ')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{book.barcode}</td>
                                        <td>{book.genre}</td>
                                        <td><span className={`inventory-status ${active ? 'is-loaned' : 'is-available'}`}>
                                            {active ? 'On loan' : 'Available'}
                                        </span></td>
                                        <td className="inventory-actions">
                                            <div className="inventory-action-buttons">
                                                <button type="button" className="book-edit-button" onClick={() => onEdit(book)}>Edit</button>
                                                <button type="button" className="book-danger-button"
                                                    onClick={() => {
                                                        dispatch(clearBookManagementFeedback());
                                                        dispatch(setBookRemovalTarget(book));
                                                    }}>Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="inventory-pagination" aria-label="Inventory pagination">
                <span className="inventory-range">
                    Showing {rangeStart}–{rangeEnd} of {visibleBooks.length} books
                </span>
                <label className="inventory-page-size">
                    <span>Per page</span>
                    <select value={pageSize} onChange={(event) => updatePageSize(Number(event.target.value))}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </label>
                <nav className="inventory-page-controls" aria-label="Inventory pages">
                    <button type="button" className="inventory-page-button"
                        onClick={() => setCurrentPage((page) => page - 1)} disabled={displayedPage === 1}>
                        Previous
                    </button>
                    <div className="inventory-page-numbers">
                        {paginationItems.map((item) => (
                            typeof item === 'number' ? (
                                <button type="button" key={item}
                                    className={`inventory-page-button${item === displayedPage ? ' is-active' : ''}`}
                                    aria-label={`Go to page ${item}`}
                                    aria-current={item === displayedPage ? 'page' : undefined}
                                    onClick={() => setCurrentPage(item)}>
                                    {item}
                                </button>
                            ) : (
                                <span key={item} className="inventory-page-ellipsis" aria-hidden="true">…</span>
                            )
                        ))}
                    </div>
                    <button type="button" className="inventory-page-button"
                        onClick={() => setCurrentPage((page) => page + 1)} disabled={displayedPage === totalPages}>
                        Next
                    </button>
                </nav>
            </div>
        </div>
    );
}
