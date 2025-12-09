import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// URL Configuration
const RAW_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BASE_URL = RAW_URL.replace(/\/$/, "");
const API_URL = `${BASE_URL}/api/users/`;

const getToken = (thunkAPI) => {
    const state = thunkAPI.getState();
    if (!state.auth || !state.auth.user) return null;
    return {
        headers: { Authorization: `Bearer ${state.auth.user.token}` },
    };
};

export const getUsers = createAsyncThunk('admin/getAll', async (_, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        if (!config) return thunkAPI.rejectWithValue("No token");
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const deleteUser = createAsyncThunk('admin/delete', async (id, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        await axios.delete(API_URL + id, config);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

// --- NEW: UPDATE USER ---
export const updateUser = createAsyncThunk('admin/update', async ({ id, userData }, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        const response = await axios.put(API_URL + id, userData, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const adminSlice = createSlice({
    name: 'admin',
    initialState: { users: [], isLoading: false, isError: false, message: '' },
    reducers: {
        resetAdmin: (state) => { state.isLoading = false; state.isError = false; state.message = ''; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUsers.fulfilled, (state, action) => { state.users = action.payload; })
            .addCase(deleteUser.fulfilled, (state, action) => { state.users = state.users.filter(u => u._id !== action.payload); })
            // UPDATE CASE
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload; // Update the user in the list instantly
                }
            });
    }
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;