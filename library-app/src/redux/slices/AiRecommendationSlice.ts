import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Book } from "../../models/Book";
import type { RootState } from "../ReduxStore";
import { resetUser } from "./AuthenticationSlice";

export interface BookRecommendation {
    book: Book;
    reason: string;
}

interface AiRecommendationState {
    recommendations: BookRecommendation[];
    loading: boolean;
    error: string | null;
    activeRequestId?: string;
}

interface RecommendationRequest {
    prompt?: string;
    userId?: string;
}

const initialState: AiRecommendationState = {
    recommendations: [],
    loading: false,
    error: null
};

export const fetchAiRecommendations = createAsyncThunk<
    BookRecommendation[],
    RecommendationRequest,
    { state: RootState; rejectValue: string }
>("aiRecommendations/fetch", async (request, thunkApi) => {
    const token = thunkApi.getState().authentication.authToken || localStorage.getItem("authToken");
    const clearSession = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        thunkApi.dispatch(resetUser("loggedInUser"));
        thunkApi.dispatch(resetUser("profileUser"));
        thunkApi.dispatch(setAiRecommendationError("Your sign-in session has expired. Please sign in again."));
    };

    if (request.userId && !token) {
        clearSession();
        return thunkApi.rejectWithValue("Your sign-in session has expired. Please sign in again.");
    }

    try {
        const response = await axios.post("http://localhost:8000/books/ai-recommend", request, {
            headers: request.userId ? { Authorization: `Bearer ${token}` } : undefined
        });
        return response.data.recommendations as BookRecommendation[];
    } catch (error) {
        if (request.userId && axios.isAxiosError(error) && error.response?.status === 401) {
            clearSession();
            return thunkApi.rejectWithValue("Your sign-in session has expired. Please sign in again.");
        }
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : error instanceof Error ? error.message : "Unable to get recommendations right now.";
        return thunkApi.rejectWithValue(message);
    }
});

const aiRecommendationSlice = createSlice({
    name: "aiRecommendations",
    initialState,
    reducers: {
        clearAiRecommendations(state) {
            state.recommendations = [];
            state.error = null;
            state.loading = false;
            state.activeRequestId = undefined;
        },
        setAiRecommendationError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAiRecommendations.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.activeRequestId = action.meta.requestId;
            })
            .addCase(fetchAiRecommendations.fulfilled, (state, action) => {
                if (state.activeRequestId !== action.meta.requestId) return;
                state.loading = false;
                state.recommendations = action.payload;
                state.activeRequestId = undefined;
            })
            .addCase(fetchAiRecommendations.rejected, (state, action) => {
                if (state.activeRequestId !== action.meta.requestId) return;
                state.loading = false;
                state.error = action.payload || action.error.message || "Unable to get recommendations right now.";
                state.activeRequestId = undefined;
            })
            .addCase(resetUser, (state, action) => {
                if (action.payload !== "loggedInUser") return;
                state.recommendations = [];
                state.loading = false;
                state.error = null;
                state.activeRequestId = undefined;
            });
    }
});

export const { clearAiRecommendations, setAiRecommendationError } = aiRecommendationSlice.actions;
export default aiRecommendationSlice.reducer;
