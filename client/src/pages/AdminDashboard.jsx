import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { getUsers, deleteUser, resetAdmin } from '../features/auth/adminReducer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get Auth State (Me)
  const { user } = useSelector((state) => state.auth);
  
  // Get Admin State (Other Users)
  const { users, isLoading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState('overview');

  // FETCH USERS ON LOAD
  useEffect(() => {
    if (activeTab === 'members') {
      dispatch(getUsers());
    }
    return () => { dispatch(resetAdmin()) }
  }, [activeTab, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="min-h-screen bg-gymBlack flex text-white font-sans">
      
      {/* SIDEBAR (No Changes) */}
      <div className="w-64 bg-[#111] border-r border-gray-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Gym<span className="text-gymGold">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'overview' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>📊 Overview</button>
          <button onClick={() => setActiveTab('members')} className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'members' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>👥 Manage Members</button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full py-2 bg-red-900/50 text-red-500 hover:bg-red-900 rounded font-bold transition-colors">Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold uppercase">{activeTab === 'overview' ? 'Dashboard Overview' : 'Member Management'}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Admin</p>
              <p className="font-bold text-gymGold">{user && user.name}</p>
            </div>
          </div>
        </div>

        {/* VIEW: OVERVIEW (Stats based on Real Data) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#111] p-6 rounded border border-gray-800">
              <p className="text-gray-400 text-sm uppercase">Total Members</p>
              <h3 className="text-4xl font-black text-white mt-2">{users.length || '...'}</h3> {/* Real Count (requires users to be loaded) */}
              <p className="text-xs text-gray-500 mt-2">Click 'Manage Members' to refresh data</p>
            </div>
            {/* Add more real stats later */}
          </div>
        )}

        {/* VIEW: MEMBERS (Real Data Table) */}
        {activeTab === 'members' && (
          <div className="bg-[#111] rounded border border-gray-800 overflow-hidden">
            
            {isLoading ? (
               <div className="p-8 text-center text-gymGold animate-pulse">Loading Database...</div>
            ) : (
              <table className="w-full text-left text-gray-400">
                <thead className="bg-black text-gray-200 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => (
                    <tr key={member._id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                      <td className="p-4 font-bold text-white">{member.name}</td>
                      <td className="p-4">{member.email}</td>
                      <td className="p-4">{new Date(member.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {member.isAdmin ? <span className="text-gymGold font-bold">ADMIN</span> : 'User'}
                      </td>
                      <td className="p-4">
                        {!member.isAdmin && (
                          <button 
                            onClick={() => handleDelete(member._id)}
                            className="text-red-500 hover:text-red-400 text-sm font-bold"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {users.length === 0 && !isLoading && <div className="p-8 text-center">No members found.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;