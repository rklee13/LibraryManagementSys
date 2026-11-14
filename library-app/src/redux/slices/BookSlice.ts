import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import axios from "axios";
import type { Book } from "../../models/Book";
import type { PageInfo } from "../../models/Page";
import type { CheckinBookPayload, CheckoutBookPayload } from "../../models/Book";
import type { RootState } from "../ReduxStore";

interface BookSliceState {
    loading: boolean;
    error: boolean;
    managementLoading: boolean;
    managementError: string | null;
    deletingBookId: string | null;
    books: Book[];
    currentBook: Book | undefined;
    pagingInformation: PageInfo | null;
}

const initialState: BookSliceState = {
    loading: true,
    error: false,
    managementLoading: false,
    managementError: null,
    deletingBookId: null,
    books: [],
    currentBook: undefined,
    pagingInformation: null
}

export type BookWritePayload = Omit<Book, '_id' | 'records' | 'publicationDate'> & { publicationDate: string };

interface BookMutationThunkConfig {
    state: RootState;
    rejectValue: string;
}

function requestErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message;
    }
    return error instanceof Error ? error.message : 'The book request failed.';
}

function authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
}

function getAuthToken(state: RootState): string | null {
    return state.authentication.authToken || localStorage.getItem('authToken');
}

export const fetchAllBooks = createAsyncThunk(
    'book/all',
    async (_payload, thunkAPI) => {
        try {
            // Retrieves all books from the server running locally 
            let req = await axios.get('http://localhost:8000/book/');
            return req.data.books;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const queryBooks = createAsyncThunk(
    'book/query',
    async (payload: string, thunkAPI) => {
        try {
            let req = await axios.get(`http://localhost:8000/book/query${payload}`);
            return req.data.page;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const checkoutBook = createAsyncThunk(
    'book/checkout',
    async (payload: CheckoutBookPayload, thunkAPI) => {
        try {
            const returnDate = new Date();
            returnDate.setDate(returnDate.getDate() + 14);
            const getPatron = await axios.get(`http://localhost:8000/card/${payload.libraryCard}`);
            let patronId = getPatron.data.libraryCard.user._id;

            const record = {
                status: "LOANED",
                loanedDate: new Date(),
                dueDate: returnDate,
                patron: patronId,
                employeeOut: payload.employee._id,
                item: payload.book._id
            }

            const loadReq = await axios.post('http://localhost:8000/loan/', record);
            const loan = loadReq.data.record;

            return loan;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const checkinBook = createAsyncThunk(
    'book/checkin',
    async (payload: CheckinBookPayload, thunkAPI) => {
        try {
            // most recent record at the top
            let record = payload.book.records[0];

            const updatedRecord = {
                status: "AVAILABLE",
                loanedDate: record.loanedDate,
                dueDate: record.dueDate,
                returnedDate: new Date(),
                patron: record.patron,
                employeeOut: record.employeeOut,
                employeeIn: payload.employee._id,
                item: record.item,
                _id: record._id
            }

            let loan = await axios.put(`http://localhost:8000/loan/`, updatedRecord);

            return loan.data.record;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const loadBookByBarcode = createAsyncThunk(
    'book/id',
    async (payload: string, thunkAPI) => {
        try {
            let res = await axios.get(`http://localhost:8000/book/query?barcode=${payload}`);

            let book = res.data.page.items[0];

            if (!book || book.barcode !== payload) throw new Error();

            return book;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const createBook = createAsyncThunk<Book, BookWritePayload, BookMutationThunkConfig>(
    'book/create',
    async (book: BookWritePayload, thunkAPI) => {
        const token = getAuthToken(thunkAPI.getState());
        if (!token) return thunkAPI.rejectWithValue('Authentication is required. Please sign in again.');
        try {
            const response = await axios.post('http://localhost:8000/book/', book, {
                headers: authHeaders(token)
            });
            return response.data.savedBook as Book;
        } catch (error) {
            return thunkAPI.rejectWithValue(requestErrorMessage(error));
        }
    }
);

export const updateBook = createAsyncThunk<Book, { bookId: string; book: BookWritePayload }, BookMutationThunkConfig>(
    'book/update',
    async ({ bookId, book }: { bookId: string; book: BookWritePayload }, thunkAPI) => {
        const token = getAuthToken(thunkAPI.getState());
        if (!token) return thunkAPI.rejectWithValue('Authentication is required. Please sign in again.');
        try {
            const response = await axios.put(`http://localhost:8000/book/${bookId}`, book, {
                headers: authHeaders(token)
            });
            return response.data.updatedBook as Book;
        } catch (error) {
            return thunkAPI.rejectWithValue(requestErrorMessage(error));
        }
    }
);

export const deleteBook = createAsyncThunk<string, string, BookMutationThunkConfig>(
    'book/delete',
    async (bookId: string, thunkAPI) => {
        const token = getAuthToken(thunkAPI.getState());
        if (!token) return thunkAPI.rejectWithValue('Authentication is required. Please sign in again.');
        try {
            await axios.delete(`http://localhost:8000/book/${bookId}`, {
                headers: authHeaders(token)
            });
            return bookId;
        } catch (error) {
            return thunkAPI.rejectWithValue(requestErrorMessage(error));
        }
    }
);

export const BookSlice = createSlice({
    name: 'book',
    initialState,
    reducers: {
        setCurrentBook(state, action: PayloadAction<Book | undefined>) {
            state = {
                ...state,
                currentBook: action.payload
            }

            return state;
        },
        clearBookManagementFeedback(state) {
            state.managementError = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllBooks.pending, (state, action) => {
            state = {
                ...state,
                books: [],
                loading: true,
                error: false
            }
            return state;
        });

        builder.addCase(queryBooks.pending, (state, action) => {
            state = {
                ...state,
                books: [],
                loading: true
            }
            return state;
        });

        builder.addCase(checkoutBook.pending, (state, action) => {
            state = {
                ...state,
                loading: true
            }
            return state;
        });

        builder.addCase(checkinBook.pending, (state, action) => {
            state = {
                ...state,
                loading: true
            }
            return state;
        });

        builder.addCase(loadBookByBarcode.pending, (state, action) => {
            state = {
                ...state,
                loading: true
            }
            return state;
        });

        builder.addCase(createBook.pending, (state) => {
            state.managementLoading = true;
            state.managementError = null;
        });
        builder.addCase(updateBook.pending, (state) => {
            state.managementLoading = true;
            state.managementError = null;
        });
        builder.addCase(deleteBook.pending, (state, action) => {
            state.deletingBookId = action.meta.arg;
            state.managementError = null;
        });

        builder.addCase(fetchAllBooks.fulfilled, (state, action) => {
            state = {
                ...state,
                books: action.payload,
                loading: false,
                error: false
            }

            return state;
        });

        builder.addCase(fetchAllBooks.rejected, (state) => {
            state.loading = false;
            state.error = true;
        });

        builder.addCase(queryBooks.fulfilled, (state, action) => {
            state = {
                ...state,
                books: action.payload.items,
                pagingInformation: {
                    totalCount: action.payload.totalCount,
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    limit: action.payload.limit,
                    pageCount: action.payload.pageCount
                },
                loading: false
            }

            return state;
        })

        builder.addCase(checkoutBook.fulfilled, (state, action) => {
            let bookList: Book[] = JSON.parse(JSON.stringify(state.books));

            // We need to add the new record so that we don't have to re-fetch all of our data
            bookList = bookList.map((book) => {
                if (book._id === action.payload.item) {
                    book.records = [action.payload, ...book.records];
                    return book;
                }

                return book;
            });

            state = {
                ...state,
                loading: false,
                books: bookList
            }

            return state;
        });

        builder.addCase(checkinBook.fulfilled, (state, action) => {
            let bookList: Book[] = JSON.parse(JSON.stringify(state.books));

            bookList = bookList.map((book) => {
                // Replace top one with current one so we don't get the same one twice, so we just modify the top one
                if (book._id === action.payload.item) {
                    book.records.splice(0, 1, action.payload);
                    return book;
                }

                return book;
            });

            state = {
                ...state,
                loading: false,
                books: bookList
            }

            return state;
        });

        builder.addCase(loadBookByBarcode.fulfilled, (state, action) => {
            state = {
                ...state,
                loading: false,
                currentBook: action.payload
            }

            return state;
        });

        builder.addCase(loadBookByBarcode.rejected, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: true
            }

            return state;
        });

        builder.addCase(createBook.fulfilled, (state, action) => {
            state.managementLoading = false;
            state.books = [action.payload, ...state.books];
        });
        builder.addCase(updateBook.fulfilled, (state, action) => {
            state.managementLoading = false;
            state.books = state.books.map((book) => book._id === action.payload._id ? action.payload : book);
            if (state.currentBook?._id === action.payload._id) state.currentBook = action.payload;
        });
        builder.addCase(deleteBook.fulfilled, (state, action) => {
            state.deletingBookId = null;
            state.books = state.books.filter((book) => book._id !== action.payload);
            if (state.currentBook?._id === action.payload) state.currentBook = undefined;
        });
        builder.addCase(createBook.rejected, (state, action) => {
            state.managementLoading = false;
            state.managementError = action.payload as string || action.error.message || 'Unable to add this book.';
        });
        builder.addCase(updateBook.rejected, (state, action) => {
            state.managementLoading = false;
            state.managementError = action.payload as string || action.error.message || 'Unable to update this book.';
        });
        builder.addCase(deleteBook.rejected, (state, action) => {
            state.deletingBookId = null;
            state.managementError = action.payload as string || action.error.message || 'Unable to remove this book.';
        });
    }
})

export const { setCurrentBook, clearBookManagementFeedback } = BookSlice.actions;
export default BookSlice.reducer;