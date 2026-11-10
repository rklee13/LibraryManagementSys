import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from './slices/AuthenticationSlice';
import modalReducer from './slices/ModalSlice';
import bookReducer from './slices/BookSlice';

// Create the Redux store
export const store = configureStore({
    reducer: {
        // Add your reducers here
        authentication: authenticationReducer,
        modal: modalReducer,
        book: bookReducer
    }
});

// Define RootState and AppDispatch types for use throughout the application
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;