import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { ManagedUserPayload, User } from '../../models/User';

interface AdminSliceState {
    users: User[];
    loading: boolean;
    creating: boolean;
    deletingUserId: string | null;
    error: string | null;
    successMessage: string | null;
}

const initialState: AdminSliceState = {
    users: [],
    loading: false,
    creating: false,
    deletingUserId: null,
    error: null,
    successMessage: null
};

function requestError(error: unknown): string {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data.message || error.message;
    }
    return error instanceof Error ? error.message : 'The request could not be completed.';
}

function adminHeaders() {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token || ''}` };
}

export const fetchAdminUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
    'admin/fetchUsers',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get('http://localhost:8000/users/', {
                headers: adminHeaders()
            });
            return response.data.users;
        } catch (error) {
            return thunkAPI.rejectWithValue(requestError(error));
        }
    }
);

export const createManagedUser = createAsyncThunk<User, ManagedUserPayload, { rejectValue: string }>(
    'admin/createUser',
    async (user, thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:8000/users/', user, {
                headers: adminHeaders()
            });
            return response.data.user;
        } catch (error) {
            return thunkAPI.rejectWithValue(requestError(error));
        }
    }
);

export const deleteManagedUser = createAsyncThunk<string, string, { rejectValue: string }>(
    'admin/deleteUser',
    async (userId, thunkAPI) => {
        try {
            await axios.delete(`http://localhost:8000/users/${userId}`, {
                headers: adminHeaders()
            });
            return userId;
        } catch (error) {
            return thunkAPI.rejectWithValue(requestError(error));
        }
    }
);

const AdminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminFeedback(state) {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unable to load users.';
            })
            .addCase(createManagedUser.pending, (state) => {
                state.creating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createManagedUser.fulfilled, (state, action) => {
                state.creating = false;
                state.users.push(action.payload);
                state.successMessage = `${action.payload.firstName} ${action.payload.lastName} was added.`;
            })
            .addCase(createManagedUser.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || 'Unable to add user.';
            })
            .addCase(deleteManagedUser.pending, (state, action) => {
                state.deletingUserId = action.meta.arg;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(deleteManagedUser.fulfilled, (state, action) => {
                state.deletingUserId = null;
                state.users = state.users.filter((user) => user._id !== action.payload);
                state.successMessage = 'User removed successfully.';
            })
            .addCase(deleteManagedUser.rejected, (state, action) => {
                state.deletingUserId = null;
                state.error = action.payload || 'Unable to remove user.';
            });
    }
});

export const { clearAdminFeedback } = AdminSlice.actions;
export default AdminSlice.reducer;
