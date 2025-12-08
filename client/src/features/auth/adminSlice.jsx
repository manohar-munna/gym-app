// src/features/auth/adminSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';
import { logout } from './authSlice';

// FETCH ALL USERS (ADMIN)
export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await adminService.getUsers(token);
    } catch (error) {
      // Force logout if token invalid
      if (error.message.includes('not authorized')) {
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// DELETE USER (ADMIN)
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await adminService.deleteUser(id, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  isLoading: false,
  isError: false,
  message: '',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdmin: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user._id !== action.meta.arg
        );
      });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
