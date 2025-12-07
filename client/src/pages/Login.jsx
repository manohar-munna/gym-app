import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message); // You can replace this with a toast notification later
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gymBlack flex items-center justify-center text-white text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gymBlack flex items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gymGold opacity-20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gray-600 opacity-20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-gymGray/50 backdrop-blur-md p-8 rounded-lg border border-gray-700 shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-wider">
          Member <span className="text-gymGold">Login</span>
        </h2>
        <p className="text-gray-400 text-center mb-8">Welcome back, Titan.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-300 uppercase">Email</label>
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={handleChange}
              className="w-full mt-2 p-3 bg-black/50 border border-gray-600 rounded text-white focus:border-gymGold focus:outline-none transition-colors"
              placeholder="iron@soul.com"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 uppercase">Password</label>
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={handleChange}
              className="w-full mt-2 p-3 bg-black/50 border border-gray-600 rounded text-white focus:border-gymGold focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full py-3 bg-gymGold text-black font-black uppercase tracking-widest hover:bg-white transition-all duration-300 rounded-sm">
            Enter Gym
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          New here? <Link to="/register" className="text-gymGold hover:underline font-bold">Join the Elite</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;