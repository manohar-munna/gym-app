import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');

  // Placeholder Data for UI (We will connect API later)
  const mockUsers = [
    { id: 1, name: "Manohar", email: "manohar@gmail.com", plan: "Gold", status: "Active", joinDate: "2024-01-10" },
    { id: 2, name: "Rahul", email: "rahul@test.com", plan: "Silver", status: "Pending", joinDate: "2024-02-05" },
    { id: 3, name: "Priya", email: "priya@test.com", plan: "None", status: "Inactive", joinDate: "2024-03-01" },
  ];

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gymBlack flex text-white font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-[#111] border-r border-gray-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Gym<span className="text-gymGold">Admin</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'overview' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            📊 Overview
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'members' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            👥 Manage Members
          </button>
          <button 
            className="w-full text-left px-4 py-3 rounded text-gray-400 hover:bg-gray-800 transition-colors"
          >
            💳 Fee Dues (Coming Soon)
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full py-2 bg-red-900/50 text-red-500 hover:bg-red-900 rounded font-bold transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold uppercase">
            {activeTab === 'overview' ? 'Dashboard Overview' : 'Member Management'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Admin</p>
              <p className="font-bold text-gymGold">{user && user.name}</p>
            </div>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">
              {user && user.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* --- VIEW: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Widget 1 */}
            <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gymGold opacity-10 rounded-bl-full"></div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Total Members</p>
              <h3 className="text-4xl font-black text-white mt-2">142</h3>
              <p className="text-green-500 text-sm mt-2">↑ 12% this month</p>
            </div>

            {/* Widget 2 */}
            <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-10 rounded-bl-full"></div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Active Plans</p>
              <h3 className="text-4xl font-black text-white mt-2">98</h3>
              <p className="text-gray-500 text-sm mt-2">Gold is most popular</p>
            </div>

            {/* Widget 3 */}
            <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 opacity-10 rounded-bl-full"></div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Monthly Revenue</p>
              <h3 className="text-4xl font-black text-white mt-2">₹4.2L</h3>
              <p className="text-green-500 text-sm mt-2">On track</p>
            </div>

             {/* Widget 4 */}
             <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-10 rounded-bl-full"></div>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Pending Fees</p>
              <h3 className="text-4xl font-black text-white mt-2">12</h3>
              <p className="text-red-500 text-sm mt-2">Needs attention</p>
            </div>
          </div>
        )}

        {/* --- VIEW: MEMBERS --- */}
        {activeTab === 'members' && (
          <div className="bg-[#111] rounded border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">All Members</h3>
              <input 
                type="text" 
                placeholder="Search member..." 
                className="bg-black border border-gray-700 text-white px-4 py-2 rounded focus:border-gymGold focus:outline-none"
              />
            </div>
            
            <table className="w-full text-left text-gray-400">
              <thead className="bg-black text-gray-200 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Join Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="p-4 font-bold text-white">{member.name}</td>
                    <td className="p-4">{member.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        member.plan === 'Gold' ? 'bg-yellow-900 text-yellow-500' : 
                        member.plan === 'Silver' ? 'bg-gray-700 text-gray-300' : 'bg-red-900 text-red-500'
                      }`}>
                        {member.plan}
                      </span>
                    </td>
                    <td className="p-4">{member.joinDate}</td>
                    <td className="p-4">
                      <span className={`w-2 h-2 inline-block rounded-full mr-2 ${
                        member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {member.status}
                    </td>
                    <td className="p-4">
                      <button className="text-gymGold hover:underline text-sm font-bold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;