import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginUserPayload, RegisterUserPayload, FetchUserPayload } from '../../models/User';
import axios from 'axios';

interface AuthenticationSliceState {
    loggedInUser: User | undefined;
    profileUser: User | undefined;  // librarians can look at other's profiles
    libraryCard: string;
    loading: boolean;
    error: boolean;
    registerSuccess: boolean;
    authToken: string | undefined;
}

const initialState: AuthenticationSliceState = {
    loggedInUser: undefined,
    profileUser: undefined,
    libraryCard: "",
    loading: false,
    error: false,
    registerSuccess: false,
    authToken: undefined
};

// Async thunk for logging in a user
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginUserPayload, thunkAPI) => {
        try {
            // Use the axios library to send an async POST request passing the user object
            const req = await axios.post('http://localhost:8000/auth/login', credentials);
            const { user, token } = req.data;
            localStorage.setItem('authToken', token);
            return { user, token };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (user: RegisterUserPayload, thunkAPI) => {
        try {
            const req = await axios.post('http://localhost:8000/auth/register', user);
            return req.data.user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUser = createAsyncThunk(
    'auth/fetch',
    async (payload: FetchUserPayload, thunkAPI) => {
        try {
            const req = await axios.get(`http://localhost:8000/users/${payload.userId}`);
            const user = req.data.user;

            return {
                user,
                property: payload.property
            }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const updateUser = createAsyncThunk(
    'auth/update',
    async (payload: User, thunkAPI) => {
        try {
            const req = await axios.put('http://localhost:8000/users/', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` }
            });

            return req.data.user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const getLibraryCard = createAsyncThunk(
    'auth/libraryCard',
    async (userId: string, thunkAPI) => {
        try {
            const req = await axios.post('http://localhost:8000/card/', { user: userId });

            return req.data.libraryCard;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Creates a slice of the Redux store for authentication, including reducers and extra reducers for handling async actions
export const AuthenticationSlice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
        resetRegisterSuccess(state) {
            state = {
                ...state,
                registerSuccess: false
            }
            return state;
        },
        resetUser(state, action: PayloadAction<string>) {
            // Reset login user when user logs out or reset the profile user
            state = {
                ...state,
                [action.payload]: undefined,
                authToken: action.payload === 'loggedInUser' ? undefined : state.authToken
            }
            return state;
        }
    },
    extraReducers: (builder) => {
        //#region Pending state
        builder.addCase(loginUser.pending, (state, action) => {
            state = {
                ...state,
                loading: true,
                error: false
            };
            return state;
        });

        builder.addCase(registerUser.pending, (state, action) => {
            state = {
                ...state,
                loading: true,
                error: false
            };
            return state;
        });

        builder.addCase(fetchUser.pending, (state, action) => {
            state = {
                ...state,
                loading: true,
                error: false
            };
            return state;
        });

        builder.addCase(updateUser.pending, (state, action) => {
            state = {
                ...state,
                loading: true,
                error: false
            };
            return state;
        });

        builder.addCase(getLibraryCard.pending, (state, action) => {
            state = {
                ...state,
                loading: true,
                error: false
            };
            return state;
        });
        //#endregion

        //#region Resolved state
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: false,
                loggedInUser: action.payload.user,
                authToken: action.payload.token
            };
            return state;
        });

        builder.addCase(registerUser.fulfilled, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: false,
                registerSuccess: true
            };
            return state;
        });

        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state = {
                ...state,
                [action.payload.property]: action.payload.user, // dynamically sets the property
                loading: false
            };
            return state;
        });

        builder.addCase(updateUser.fulfilled, (state, action) => {
            // Logged in user CAN ONLY update their OWN profile (regardless of type)
            // so logged in user and profile user should be the same
            state = {
                ...state,
                loggedInUser: action.payload,
                profileUser: action.payload,
                loading: false
            };
            return state;
        });

        builder.addCase(getLibraryCard.fulfilled, (state, action) => {
            state = {
                ...state,
                loading: false,
                libraryCard: action.payload._id
            };
            return state;
        });
        //#endregion

        //#region Rejected state
        builder.addCase(loginUser.rejected, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: true
            };
            return state;
        });

        builder.addCase(registerUser.rejected, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: true
            };
            return state;
        });

        builder.addCase(fetchUser.rejected, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: true
            };
            return state;
        });

        builder.addCase(updateUser.rejected, (state, action) => {
            state = {
                ...state,
                loading: false,
                error: true
            };
            return state;
        });
        //#endregion
    }
});

// Allows export name of reducers to be used in components for dispatching actions
export const { resetRegisterSuccess, resetUser } = AuthenticationSlice.actions;

// Export the reducer to be used in the Redux store
export default AuthenticationSlice.reducer;