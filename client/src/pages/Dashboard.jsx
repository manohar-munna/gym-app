import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gymBlack text-white p-6 md:p-10 pt-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic">
            Welcome Back, <span className="text-gymGold">{user && user.name}</span>
          </h1>
          <p className="text-gray-400 mt-2">Member since: {user && new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-sm text-gray-500">Registered Email</p>
           <p className="font-bold">{user && user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1 */}
        <div className="bg-[#111] p-8 rounded border-l-4 border-gymGold shadow-lg">
          <h3 className="text-2xl font-bold mb-2 uppercase">Current Plan</h3>
          <p className="text-gray-400 text-sm mb-4">You have no active subscription.</p>
          <button className="w-full py-3 bg-gymGold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
            Buy Membership
          </button>
        </div>

        {/* Widget 2 */}
        <div className="bg-[#111] p-8 rounded border-l-4 border-blue-600 shadow-lg">
          <h3 className="text-2xl font-bold mb-2 uppercase">Diet Plan</h3>
          <p className="text-gray-400 text-sm">Your trainer has not assigned a diet yet.</p>
        </div>

        {/* Widget 3 */}
        <div className="bg-[#111] p-8 rounded border-l-4 border-green-600 shadow-lg">
          <h3 className="text-2xl font-bold mb-2 uppercase">Attendance</h3>
          <div className="flex items-end gap-2">
             <span className="text-5xl font-black text-white">0</span>
             <span className="text-gray-400 mb-2">days this month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;