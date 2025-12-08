import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// CHANGED: Import the new filename
import adminReducer from '../features/auth/adminReducer'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});