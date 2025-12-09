import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  useEffect(() => {
    if (!user) navigate('/login');
    // Set initial phone if exists
    if (user?.profile?.phone) setPhone(user.profile.phone);
  }, [user, navigate]);

  const handleUpdatePhone = async () => {
     // Simple direct API call for user update (assuming we set up the route, or re-use admin logic for simplicity)
     // For now, let's just use the Admin logic but strictly for the phone part in UI
     // NOTE: Ideally, you create a separate user update route, but we can reuse the Redux state if we refresh.
     alert("To update profile details, please contact Admin at the front desk.");
     setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gymBlack text-white p-6 md:p-10 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic">
            Welcome Back, <span className="text-gymGold">{user && user.name}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-gray-400">
             <span>Member ID: #{user && user._id.slice(-6)}</span>
             <span className="text-gymGold">|</span>
             {/* Phone Display */}
             <div className="flex items-center gap-2">
                <span>📞 {user?.profile?.phone || "No Phone Linked"}</span>
             </div>
          </div>
        </div>
        <button onClick={onLogout} className="mt-4 md:mt-0 px-6 py-2 border border-red-600 text-red-500 font-bold hover:bg-red-600 hover:text-white transition">LOGOUT</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Plan */}
        <div className="bg-[#111] p-8 rounded border-l-4 border-gymGold shadow-lg">
          <h3 className="text-2xl font-bold mb-2 uppercase">Current Plan</h3>
          {user?.subscription?.plan ? (
             <div>
                <p className="text-3xl text-white font-black">{user.subscription.plan}</p>
                <p className="text-green-500 mt-2">Valid till: {new Date(user.subscription.endDate).toLocaleDateString()}</p>
             </div>
          ) : (
             <p className="text-gray-400 text-sm mb-4">You have no active subscription.</p>
          )}
        </div>
        {/* Other widgets remain same */}
      </div>
    </div>
  );
};

export default Dashboard;