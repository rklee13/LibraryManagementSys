import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Book } from '../../models/Book';
import type { AppDispatch, RootState } from '../../redux/ReduxStore';
import { clearBookManagementFeedback, fetchAllBooks } from '../../redux/slices/BookSlice';
import { BookForm } from '../../features/book-management/components/BookForm/BookForm';
import { InventoryTable } from '../../features/book-management/components/InventoryTable/InventoryTable';
import './ManageBooksPage.css';

export default function ManageBooksPage() {
    const dispatch: AppDispatch = useDispatch();
    const { books, loading, error, managementError } = useSelector((state: RootState) => state.book);
    const [formOpen, setFormOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | undefined>();

    useEffect(() => {
        dispatch(clearBookManagementFeedback());
        dispatch(fetchAllBooks());
    }, [dispatch]);

    const openCreateForm = () => {
        dispatch(clearBookManagementFeedback());
        setEditingBook(undefined);
        setFormOpen(true);
    };
    const openEditForm = (book: Book) => {
        dispatch(clearBookManagementFeedback());
        setEditingBook(book);
        setFormOpen(true);
    };
    const closeForm = () => {
        setFormOpen(false);
        setEditingBook(undefined);
    };

    return (
        <div className="page">
            <div className="page-container manage-books-container">
                <header className="manage-books-header">
                    <div>
                        <p className="book-management-eyebrow">Library operations</p>
                        <h1>Book catalog</h1>
                        <p>Manage titles, inventory details, and availability across your library.</p>
                    </div>
                    {!formOpen && <button className="book-primary-button" type="button" onClick={openCreateForm}>Add a book</button>}
                </header>

                {managementError && !formOpen && <p className="book-management-error" role="alert">{managementError}</p>}
                {formOpen && (
                    <section className="manage-books-panel" aria-labelledby="book-form-title">
                        <div className="manage-books-section-heading">
                            <div>
                                <p className="book-management-eyebrow">{editingBook ? 'Update catalog record' : 'New catalog record'}</p>
                                <h2 id="book-form-title">{editingBook ? 'Edit book' : 'Add a book'}</h2>
                            </div>
                        </div>
                        {managementError && <p className="book-management-error" role="alert">{managementError}</p>}
                        <BookForm key={editingBook?._id || 'new-book'} book={editingBook}
                            onCancel={closeForm} onSaved={closeForm} />
                    </section>
                )}

                <section className="manage-books-panel" aria-labelledby="book-inventory-title">
                    <div className="manage-books-section-heading">
                        <div>
                            <p className="book-management-eyebrow">Inventory</p>
                            <h2 id="book-inventory-title">Catalog books</h2>
                        </div>
                        <span className="manage-books-count">{books.length} total</span>
                    </div>
                    {loading ? (
                        <p className="manage-books-feedback" role="status">Loading books...</p>
                    ) : error ? (
                        <p className="book-management-error" role="alert">Unable to load the catalog. Please try again.</p>
                    ) : (
                        <InventoryTable books={books} onEdit={openEditForm} />
                    )}
                </section>
            </div>
        </div>
    );
}
