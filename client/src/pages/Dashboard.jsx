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
    <div className="min-h-screen bg-gymBlack text-white p-10 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold uppercase">
          Welcome, <span className="text-gymGold">{user && user.name}</span>
        </h1>
        <button 
          onClick={onLogout}
          className="bg-red-600 px-4 py-2 rounded text-white font-bold hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1 */}
        <div className="bg-gymGray p-6 rounded-lg border-l-4 border-gymGold">
          <h3 className="text-xl font-bold mb-2">My Plan</h3>
          <p className="text-gray-400">No active plan</p>
          <button className="mt-4 text-gymGold text-sm font-bold uppercase">Buy Membership →</button>
        </div>

        {/* Widget 2 */}
        <div className="bg-gymGray p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-2">Diet Plan</h3>
          <p className="text-gray-400">Status: Pending</p>
        </div>

        {/* Widget 3 */}
        <div className="bg-gymGray p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="text-xl font-bold mb-2">Attendance</h3>
          <p className="text-gray-400">0 Days Present</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;