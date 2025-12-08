import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction
    ? 'https://swamy-gym-app.vercel.app' // <-- MAKE SURE THIS IS YOUR REAL BACKEND URL
    : 'http://localhost:5000/api/users/';

// ✅ USE THE FULL URL (This fixes the 404 Proxy issue)
// const API_URL = 'http://localhost:5000/api/users/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  // Fix: Ensure we don't have double slashes
  const response = await axios.post('http://localhost:5000/api/users/login', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  register,
  logout,
  login,
};

export default authService;

