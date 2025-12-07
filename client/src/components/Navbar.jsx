import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference">
      {/* LOGO */}
      <Link to="/" className="text-2xl font-bold uppercase tracking-widest text-white cursor-pointer no-underline">
        SWAMY<span className="text-gymGold">GYM</span>
      </Link>

      {/* NAVIGATION LINKS */}
      <div className="space-x-8 hidden md:flex items-center">
        
        {/* LOGIC: If User is Logged In */}
        {user ? (
          <>
            <span className="text-gray-400 font-medium">
              Hello, <span className="text-white font-bold">{user.name}</span>
            </span>
            
            {/* If Admin, show Admin Link. If Member, show Dashboard */}
            {user.isAdmin ? (
                <Link to="/admin" className="text-gymGold hover:text-white font-bold no-underline">
                  ADMIN PANEL
                </Link>
            ) : (
                <Link to="/dashboard" className="text-gymGold hover:text-white font-bold no-underline">
                  MY DASHBOARD
                </Link>
            )}

            <button 
              onClick={onLogout} 
              className="px-4 py-2 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded text-sm font-bold uppercase"
            >
              Logout
            </button>
          </>
        ) : (
          /* LOGIC: If User is Guest (Not Logged In) */
          <>
            <Link to="/login" className="text-white hover:text-gymGold font-semibold transition-colors no-underline">
              LOGIN
            </Link>
            <Link to="/register" className="px-6 py-2 bg-white text-black font-bold hover:bg-gymGold transition-colors rounded-sm no-underline">
              JOIN NOW
            </Link>
          </>
        )}

      </div>
    </nav>
  );
};

export default Navbar;