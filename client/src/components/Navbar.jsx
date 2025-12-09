import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full p-4 md:p-6 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* LOGO */}
        <Link to="/" className="text-xl md:text-2xl font-black uppercase tracking-widest text-white cursor-pointer no-underline z-50">
          SWAMY<span className="text-gymGold">GYM</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              <span className="text-gray-400 font-medium text-sm">
                Welcome, <span className="text-white font-bold">{user.name.split(' ')[0]}</span>
              </span>
              {user.isAdmin ? (
                  <Link to="/admin" className="text-gymGold hover:text-white font-bold text-sm tracking-wide">ADMIN PANEL</Link>
              ) : (
                  <Link to="/dashboard" className="text-gymGold hover:text-white font-bold text-sm tracking-wide">DASHBOARD</Link>
              )}
              <button onClick={onLogout} className="px-4 py-2 border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded text-xs font-bold uppercase">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-gymGold font-bold text-sm transition-colors">LOGIN</Link>
              <Link to="/register" className="px-6 py-2 bg-white text-black font-black text-sm hover:bg-gymGold transition-colors rounded-sm">JOIN NOW</Link>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white z-50 text-2xl focus:outline-none">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-[#111] border-b border-gray-800 shadow-2xl flex flex-col items-center py-8 space-y-6 md:hidden"
          >
            {user ? (
              <>
                <div className="text-center">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Logged in as</p>
                  <p className="text-white font-black text-xl">{user.name}</p>
                </div>
                {user.isAdmin ? (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="text-gymGold font-bold text-lg">ADMIN PANEL</Link>
                ) : (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-gymGold font-bold text-lg">MY DASHBOARD</Link>
                )}
                <button onClick={onLogout} className="text-red-500 font-bold tracking-widest text-sm">LOGOUT</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-white font-bold text-lg">LOGIN</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="bg-gymGold text-black font-black px-8 py-3 rounded-sm">JOIN NOW</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;