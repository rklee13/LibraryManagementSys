import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../../../components/Modal/Modal';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import { deleteBook, clearBookManagementFeedback } from '../../../../redux/slices/BookSlice';
import { setBookRemovalTarget } from '../../../../redux/slices/ModalSlice';
import './BookRemovalModal.css';

export function BookRemovalModal() {
    const dispatch: AppDispatch = useDispatch();
    const book = useSelector((state: RootState) => state.modal.bookToRemove);
    const { deletingBookId, managementError } = useSelector((state: RootState) => state.book);
    if (!book) return null;

    const close = () => {
        dispatch(setBookRemovalTarget(null));
        dispatch(clearBookManagementFeedback());
    };
    const confirmRemoval = async () => {
        const result = await dispatch(deleteBook(book._id));
        if (deleteBook.fulfilled.match(result)) close();
    };
    const deleting = deletingBookId === book._id;

    return (
        <Modal toggleModal={close} content={
            <div className="book-removal-dialog">
                <p className="book-management-eyebrow">Remove from catalog</p>
                <h2>Remove “{book.title}”?</h2>
                <p>This will permanently remove this book from the catalog. Books with an active loan cannot be removed.</p>
                {managementError && <p className="book-management-error" role="alert">{managementError}</p>}
                <div className="book-removal-actions">
                    <button className="book-secondary-button" type="button" onClick={close} disabled={deleting}>Cancel</button>
                    <button className="book-danger-button" type="button" onClick={confirmRemoval} disabled={deleting}>
                        {deleting ? 'Removing...' : 'Remove book'}
                    </button>
                </div>
            </div>
        } />
    );
}
