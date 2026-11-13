import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Book } from '../../../../models/Book';
import type { AppDispatch, RootState } from '../../../../redux/ReduxStore';
import { clearBookManagementFeedback, createBook, updateBook, type BookWritePayload } from '../../../../redux/slices/BookSlice';
import './BookForm.css';

interface BookFormProps {
    book?: Book;
    onCancel(): void;
    onSaved(): void;
}

const emptyBook: BookWritePayload = {
    barcode: '',
    cover: '',
    title: '',
    authors: [],
    description: '',
    subjects: [],
    publicationDate: '',
    publisher: '',
    pages: 1,
    genre: ''
};

function formValues(book?: Book): BookWritePayload {
    if (!book) return emptyBook;
    return {
        barcode: book.barcode,
        cover: book.cover,
        title: book.title,
        authors: book.authors,
        description: book.description,
        subjects: book.subjects,
        publicationDate: new Date(book.publicationDate).toISOString().slice(0, 10),
        publisher: book.publisher,
        pages: book.pages,
        genre: book.genre
    };
}

function splitList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function BookForm({ book, onCancel, onSaved }: BookFormProps) {
    const dispatch: AppDispatch = useDispatch();
    const { managementLoading } = useSelector((state: RootState) => state.book);
    const [form, setForm] = useState<BookWritePayload>(() => formValues(book));
    const [authorsText, setAuthorsText] = useState(() => book?.authors.join(', ') || '');
    const [subjectsText, setSubjectsText] = useState(() => book?.subjects.join(', ') || '');

    const updateText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        if (name === 'authors') {
            setAuthorsText(value);
            setForm((current) => ({ ...current, authors: splitList(value) }));
        } else if (name === 'subjects') {
            setSubjectsText(value);
            setForm((current) => ({ ...current, subjects: splitList(value) }));
        } else if (name === 'pages') {
            setForm((current) => ({ ...current, pages: Number(value) }));
        } else {
            setForm((current) => ({ ...current, [name]: value }));
        }
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch(clearBookManagementFeedback());
        const result = book
            ? await dispatch(updateBook({ bookId: book._id, book: form }))
            : await dispatch(createBook(form));
        if ((book ? updateBook.fulfilled : createBook.fulfilled).match(result)) onSaved();
    };

    return (
        <form className="book-form" onSubmit={submit}>
            <div className="book-form-grid">
                <label>
                    Title
                    <input name="title" value={form.title} onChange={updateText} maxLength={300} required />
                </label>
                <label>
                    Barcode (ISBN)
                    <input name="barcode" value={form.barcode} onChange={updateText}
                        pattern="(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+" required />
                </label>
                <label>
                    Authors <span className="book-form-hint">(comma-separated)</span>
                    <input name="authors" value={authorsText} onChange={updateText} required />
                </label>
                <label>
                    Genre
                    <input name="genre" value={form.genre} onChange={updateText} required />
                </label>
                <label>
                    Publisher
                    <input name="publisher" value={form.publisher} onChange={updateText} required />
                </label>
                <label>
                    Publication date
                    <input name="publicationDate" type="date" value={form.publicationDate}
                        onChange={updateText} required />
                </label>
                <label>
                    Pages
                    <input name="pages" type="number" min="1" step="1" value={form.pages}
                        onChange={updateText} required />
                </label>
                <label>
                    Subjects <span className="book-form-hint">(comma-separated)</span>
                    <input name="subjects" value={subjectsText} onChange={updateText} />
                </label>
                <label className="book-form-cover-field">
                    Cover image URL
                    <input name="cover" type="url" value={form.cover} onChange={updateText} required />
                </label>
                <label className="book-form-description">
                    Description
                    <textarea name="description" rows={5} value={form.description}
                        onChange={updateText} required />
                </label>
                {form.cover && (
                    <div className="book-cover-preview">
                        <span>Cover preview</span>
                        <img src={form.cover} alt={`Cover preview for ${form.title || 'new book'}`} />
                    </div>
                )}
            </div>
            <div className="book-form-actions">
                <button type="button" className="book-secondary-button" onClick={onCancel} disabled={managementLoading}>
                    Cancel
                </button>
                <button type="submit" className="book-primary-button" disabled={managementLoading}>
                    {managementLoading ? 'Saving...' : book ? 'Save changes' : 'Add book'}
                </button>
            </div>
        </form>
    );
}
