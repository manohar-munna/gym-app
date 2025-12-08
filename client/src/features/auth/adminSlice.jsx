import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Use relative path for both Dev and Prod
const API_URL = '/api/users/';

// Get user token helper
const getToken = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// GET ALL USERS
export const getUsers = createAsyncThunk('admin/getAll', async (_, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// DELETE USER
export const deleteUser = createAsyncThunk('admin/delete', async (id, thunkAPI) => {
    try {
        const config = getToken(thunkAPI);
        await axios.delete(API_URL + id, config);
        return id;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
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
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((user) => user._id !== action.payload);
            });
    }
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;