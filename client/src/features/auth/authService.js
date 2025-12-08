// src/features/auth/authService.js

const API_URL = '/api/users/';

// Register user
const register = async (userData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');

  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

// Login user
const login = async (userData) => {
  const response = await fetch(API_URL + 'login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');

  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

// Logout user
const logout = () => localStorage.removeItem('user');

const authService = { register, login, logout };
export default authService;
