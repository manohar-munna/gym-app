import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { getUsers, deleteUser, resetAdmin } from '../features/auth/adminReducer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { users, isLoading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState('overview');

  // --- 1. CACHING LOGIC ---
  useEffect(() => {
    if (activeTab === 'members') {
      // Only fetch if we don't have users yet (Prevents re-fetching)
      if (users.length === 0) {
        dispatch(getUsers());
      }
    }
    // We REMOVED the cleanup return () => dispatch(resetAdmin()) 
    // This ensures data stays in Redux store when you switch tabs
  }, [activeTab, dispatch, users.length]);

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

  // --- 2. WHATSAPP LOGIC ---
  const sendWhatsApp = (member) => {
    // Check if phone exists (fallback to placeholder if missing)
    const phone = member.profile?.phone || member.phone || ''; 
    
    if (!phone) {
      alert("This user has not added a phone number.");
      return;
    }

    const planName = member.subscription?.plan || "Gym Membership";
    const expiryDate = member.subscription?.endDate 
      ? new Date(member.subscription.endDate).toLocaleDateString() 
      : "soon";

    // Pre-filled Message
    const message = `Hello ${member.name}, this is a reminder from Swamy Gym. Your ${planName} is set to expire on ${expiryDate}. Please renew to continue your training! 💪`;
    
    // Create Link
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(url, '_blank');
  };

  // --- HELPER: Calculate Days Left ---
  const getDaysLeft = (endDate) => {
    if (!endDate) return -1;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gymBlack flex text-white font-sans">
      
      {/* SIDEBAR */}
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

        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#111] p-6 rounded border border-gray-800">
              <p className="text-gray-400 text-sm uppercase">Total Members</p>
              <h3 className="text-4xl font-black text-white mt-2">{users.length}</h3>
              <p className="text-xs text-gray-500 mt-2">Cached Data</p>
            </div>
          </div>
        )}

        {/* VIEW: MEMBERS (Updated Table) */}
        {activeTab === 'members' && (
          <div className="bg-[#111] rounded border border-gray-800 overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="text-xl font-bold">All Members</h3>
              <div className="flex gap-2">
                <button onClick={() => dispatch(getUsers())} className="text-sm text-gymGold border border-gymGold px-3 py-1 hover:bg-gymGold hover:text-black transition">
                  ↻ Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-400 whitespace-nowrap">
                <thead className="bg-black text-gray-200 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Notify</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => {
                     // Subscription Logic (Handle missing data safely)
                     const hasPlan = member.subscription && member.subscription.plan;
                     const daysLeft = hasPlan ? getDaysLeft(member.subscription.endDate) : -1;
                     
                     return (
                      <tr key={member._id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                        
                        {/* Name & Email */}
                        <td className="p-4">
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </td>

                        {/* Plan */}
                        <td className="p-4">
                          {hasPlan ? (
                             <span className="text-white font-bold">{member.subscription.plan}</span>
                          ) : (
                             <span className="text-gray-600 italic">No Plan</span>
                          )}
                        </td>

                        {/* Start Date */}
                        <td className="p-4">
                           {hasPlan ? new Date(member.subscription.startDate).toLocaleDateString() : '-'}
                        </td>

                        {/* Expiry Date */}
                        <td className="p-4">
                           {hasPlan ? new Date(member.subscription.endDate).toLocaleDateString() : '-'}
                        </td>

                        {/* Status Widget */}
                        <td className="p-4">
                          {member.isAdmin ? (
                             <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs font-bold">ADMIN</span>
                          ) : !hasPlan ? (
                             <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs font-bold">INACTIVE</span>
                          ) : daysLeft < 0 ? (
                             <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-bold">EXPIRED</span>
                          ) : daysLeft < 5 ? (
                             <span className="px-2 py-1 bg-orange-900 text-orange-300 rounded text-xs font-bold">EXPIRING SOON</span>
                          ) : (
                             <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs font-bold">ACTIVE</span>
                          )}
                        </td>

                        {/* WhatsApp Button */}
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => sendWhatsApp(member)}
                            className="text-green-500 hover:text-green-400 transition-colors text-xl"
                            title="Send WhatsApp Reminder"
                          >
                            <i className="fa-brands fa-whatsapp"></i> 💬
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          {!member.isAdmin && (
                            <button 
                              onClick={() => handleDelete(member._id)}
                              className="text-red-500 hover:text-red-400 text-sm font-bold ml-2"
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>

            {users.length === 0 && !isLoading && <div className="p-8 text-center">No members found.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;