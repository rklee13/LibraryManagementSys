import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../models/User';

interface ModalSliceState {
    displayLogin: boolean;
    displayLibraryCard: boolean;
    displayLoan: boolean;
    userToRemove: User | null;
}

const initialState: ModalSliceState = {
    displayLogin: false, // false by default, meaning the login form will NOT be displayed initially
    displayLibraryCard: false,
    displayLoan: false,
    userToRemove: null
}

export const ModalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        setDisplayLogin: (state, action: PayloadAction<boolean>) => {
            state = {
                ...state,
                displayLogin: action.payload
            };
            return state;
        },
        setDisplayLibraryCard: (state, action: PayloadAction<boolean>) => {
            state = {
                ...state,
                displayLibraryCard: action.payload
            };
            return state;
        },
        setDisplayLoan: (state, action: PayloadAction<boolean>) => {
            state = {
                ...state,
                displayLoan: action.payload
            };
            return state;
        },
        setUserRemovalTarget: (state, action: PayloadAction<User | null>) => {
            state.userToRemove = action.payload;
        }
    }
});

export const { setDisplayLogin, setDisplayLibraryCard, setDisplayLoan, setUserRemovalTarget } = ModalSlice.actions;

export default ModalSlice.reducer;