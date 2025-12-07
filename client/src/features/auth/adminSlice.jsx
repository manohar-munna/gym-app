import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get user token helper
const getToken = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// 1. GET ALL USERS
export const getUsers = createAsyncThunk('admin/getAll', async (_, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        const message = error.response && error.response.data && error.response.data.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// 2. DELETE USER
export const deleteUser = createAsyncThunk('admin/delete', async (id, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        await axios.delete(API_URL + id, config);
        return id; // Return the ID so we can remove it from the list immediately
    } catch (error) {
        const message = error.response && error.response.data && error.response.data.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const adminSlice = createSlice({
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
            // Get Users
            .addCase(getUsers.pending, (state) => { state.isLoading = true; })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((user) => user._id !== action.payload);
            });
    }
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;