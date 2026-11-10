import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalSliceState {
    displayLogin: boolean;
    displayLibraryCard: boolean;
    displayLoan: boolean;
}

const initialState: ModalSliceState = {
    displayLogin: false, // false by default, meaning the login form will NOT be displayed initially
    displayLibraryCard: false,
    displayLoan: false
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
        }
    }
});

export const { setDisplayLogin, setDisplayLibraryCard, setDisplayLoan } = ModalSlice.actions;

export default ModalSlice.reducer;