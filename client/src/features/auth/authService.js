const API_URL = '/api/users/';

// Register user
const register = async (userData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

// Login user
const login = async (userData) => {
  const res = await fetch(API_URL + 'login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

// Logout user
const logout = () => localStorage.removeItem('user');

export default { register, login, logout };
