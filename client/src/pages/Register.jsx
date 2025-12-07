import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { name, email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
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
    dispatch(register({ name, email, password }));
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gymBlack flex items-center justify-center text-white text-2xl">Creating Account...</div>;
  }

  return (
    <div className="min-h-screen bg-gymBlack flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-gymGold opacity-20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-gymGray/50 backdrop-blur-md p-8 rounded-lg border border-gray-700 shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-wider">
          Join <span className="text-gymGold">IronSoul</span>
        </h2>
        <p className="text-gray-400 text-center mb-8">Begin your transformation today.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-300 uppercase">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={name}
              onChange={handleChange} 
              className="w-full mt-2 p-3 bg-black/50 border border-gray-600 rounded text-white focus:border-gymGold focus:outline-none" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 uppercase">Email</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={handleChange} 
              className="w-full mt-2 p-3 bg-black/50 border border-gray-600 rounded text-white focus:border-gymGold focus:outline-none" 
              placeholder="john@example.com" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 uppercase">Password</label>
            <input 
              type="password" 
              name="password" 
              value={password}
              onChange={handleChange} 
              className="w-full mt-2 p-3 bg-black/50 border border-gray-600 rounded text-white focus:border-gymGold focus:outline-none" 
              placeholder="••••••••" 
            />
          </div>

          <button className="w-full py-3 bg-gymGold text-black font-black uppercase tracking-widest hover:bg-white transition-all duration-300 rounded-sm mt-4">
            Register Now
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already a member? <Link to="/login" className="text-gymGold hover:underline font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;