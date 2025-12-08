import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- URL CONFIGURATION ---
// 1. Get the Environment Variable (or default to localhost)
const RAW_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
// 2. Safety: Remove any trailing slash if it exists (e.g., "url.com/" -> "url.com")
const BASE_URL = RAW_URL.replace(/\/$/, "");
// 3. Construct the final API endpoint
const API_URL = `${BASE_URL}/api/users/`;

// --- HELPER: Get Token from State ---
const getToken = (thunkAPI) => {
    const state = thunkAPI.getState();
    // Safety check: ensure user exists
    if (!state.auth || !state.auth.user) {
        return null;
    }
    
    return {
        headers: {
            Authorization: `Bearer ${state.auth.user.token}`,
        },
    };
};

// --- ACTION 1: Get All Users ---
export const getUsers = createAsyncThunk('admin/getAll', async (_, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        if (!config) return thunkAPI.rejectWithValue("No authentication token found");

        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        const message = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// --- ACTION 2: Delete User ---
export const deleteUser = createAsyncThunk('admin/delete', async (id, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        if (!config) return thunkAPI.rejectWithValue("No authentication token found");

        await axios.delete(API_URL + id, config);
        return id; // Return the ID so we can filter it out of the list
    } catch (error) {
        const message = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// --- SLICE LOGIC ---
export const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        users: [],
        isLoading: false,
        isError: false,
        message: ''
    },
    reducers: {
        resetAdmin: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Users Cases
            .addCase(getUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete User Cases
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted user from the list instantly
                state.users = state.users.filter((user) => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;