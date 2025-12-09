import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { getUsers, deleteUser, updateUser } from '../features/auth/adminReducer'; // Added updateUser

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { users, isLoading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all'); // all, Strength, Cardio, inactive
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    plan: 'Strength',
    startDate: '',
    endDate: '',
    phone: ''
  });

  useEffect(() => {
    if (activeTab === 'members' && users.length === 0) {
      dispatch(getUsers());
    }
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

  // --- MODAL & DATE LOGIC ---
  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
        plan: user.subscription?.plan || 'Strength',
        startDate: user.subscription?.startDate ? user.subscription.startDate.split('T')[0] : '',
        endDate: user.subscription?.endDate ? user.subscription.endDate.split('T')[0] : '',
        phone: user.profile?.phone || ''
    });
    setShowModal(true);
  };

  const handleDateChange = (e) => {
      const start = new Date(e.target.value);
      setFormData(prev => ({ ...prev, startDate: e.target.value }));

      // Auto-calculate +30 Days
      if (!isNaN(start.getTime())) {
          const end = new Date(start);
          end.setDate(end.getDate() + 30); // Add 30 Days
          setFormData(prev => ({ 
              ...prev, 
              startDate: e.target.value,
              endDate: end.toISOString().split('T')[0] 
          }));
      }
  };

  const handleSave = () => {
      dispatch(updateUser({ id: editingUser._id, userData: formData }));
      setShowModal(false);
  };

  // --- FILTERING LOGIC ---
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'inactive') return !user.subscription || !user.subscription.plan;
    return user.subscription?.plan === filter;
  });

  // --- WHATSAPP ---
  const sendWhatsApp = (member) => {
    const phone = member.profile?.phone || ''; 
    if (!phone) return alert("Please add a phone number first (Click Edit).");
    
    const planName = member.subscription?.plan || "Membership";
    const expiryDate = member.subscription?.endDate ? new Date(member.subscription.endDate).toLocaleDateString() : "soon";
    const message = `Hello ${member.name}, this is Swamy Gym. Your ${planName} expires on ${expiryDate}. Please renew!`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return -1;
    const diff = new Date(endDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gymBlack flex text-white font-sans relative">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#111] border-r border-gray-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Gym<span className="text-gymGold">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded ${activeTab === 'overview' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>📊 Overview</button>
          <button onClick={() => setActiveTab('members')} className={`w-full text-left px-4 py-3 rounded ${activeTab === 'members' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>👥 Manage Members</button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full py-2 bg-red-900/50 text-red-500 hover:bg-red-900 rounded font-bold">Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 p-8">
        
        {/* VIEW: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-[#111] rounded border border-gray-800 overflow-hidden min-h-[80vh]">
            
            {/* Filter Tabs */}
            <div className="p-6 border-b border-gray-800 bg-[#0a0a0a] flex flex-wrap gap-4 items-center justify-between">
              <h3 className="text-xl font-bold">Manage Members</h3>
              
              <div className="flex space-x-2 bg-gray-900 p-1 rounded">
                {['all', 'Strength', 'Strength+Cardio', 'inactive'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1 text-sm rounded uppercase font-bold transition-all ${filter === f ? 'bg-gymGold text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        {f === 'inactive' ? 'No Plan' : f}
                    </button>
                ))}
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-400 whitespace-nowrap">
                <thead className="bg-black text-gray-200 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Plan Details</th>
                    <th className="p-4">Validity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((member) => {
                     const hasPlan = member.subscription && member.subscription.plan;
                     const daysLeft = hasPlan ? getDaysLeft(member.subscription.endDate) : -1;
                     
                     return (
                      <tr key={member._id} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="p-4">
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                          <div className="text-xs text-gymGold mt-1">{member.profile?.phone || "No Phone"}</div>
                        </td>

                        <td className="p-4">
                          {hasPlan ? (
                             <div>
                                 <span className="text-white font-bold block">{member.subscription.plan}</span>
                                 <span className="text-xs text-gray-500">
                                    {member.subscription.plan === 'Strength' ? '₹1200 / month' : '₹1500 / month'}
                                 </span>
                             </div>
                          ) : <span className="text-gray-600 italic">No Plan Assigned</span>}
                        </td>

                        <td className="p-4">
                           {hasPlan ? (
                               <div className="text-sm">
                                   <div className="text-green-500">Start: {new Date(member.subscription.startDate).toLocaleDateString()}</div>
                                   <div className="text-red-400">End: {new Date(member.subscription.endDate).toLocaleDateString()}</div>
                               </div>
                           ) : '-'}
                        </td>

                        <td className="p-4">
                            {member.isAdmin ? <span className="badge bg-blue-900 text-blue-300">ADMIN</span> 
                            : !hasPlan ? <span className="badge bg-gray-800 text-gray-400">INACTIVE</span>
                            : daysLeft < 0 ? <span className="badge bg-red-900 text-red-300">EXPIRED</span>
                            : <span className="badge bg-green-900 text-green-300">ACTIVE ({daysLeft} days)</span>}
                        </td>

                        <td className="p-4">
                          <button onClick={() => sendWhatsApp(member)} className="text-green-500 hover:text-green-400 text-xl" title="Chat">
                            <i className="fa-brands fa-whatsapp"></i> 💬
                          </button>
                        </td>

                        <td className="p-4">
                            <button onClick={() => handleEditClick(member)} className="text-gymGold font-bold mr-4 hover:underline">Edit</button>
                            {!member.isAdmin && <button onClick={() => handleDelete(member._id)} className="text-red-500 font-bold hover:underline">Delete</button>}
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- EDIT USER MODAL --- */}
      {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1c1c1c] p-8 rounded-lg w-full max-w-md border border-gymGold shadow-2xl relative">
                  <h2 className="text-2xl font-bold mb-6 text-white uppercase">Edit Member</h2>
                  
                  <div className="space-y-4">
                      {/* Phone */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">WhatsApp Number</label>
                          <input 
                              type="number" 
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-black border border-gray-700 p-2 rounded text-white focus:border-gymGold outline-none"
                              placeholder="9876543210"
                          />
                      </div>

                      {/* Plan Selector */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Select Plan</label>
                          <select 
                              value={formData.plan} 
                              onChange={(e) => setFormData({...formData, plan: e.target.value})}
                              className="w-full bg-black border border-gray-700 p-2 rounded text-white focus:border-gymGold outline-none"
                          >
                              <option value="Strength">Strength Training (₹1200)</option>
                              <option value="Strength+Cardio">Strength + Cardio (₹1500)</option>
                          </select>
                      </div>

                      {/* Start Date (Auto-calculates End Date) */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Payment Date (Start)</label>
                          <input 
                              type="date" 
                              value={formData.startDate} 
                              onChange={handleDateChange}
                              className="w-full bg-black border border-gray-700 p-2 rounded text-white focus:border-gymGold outline-none"
                          />
                      </div>

                      {/* End Date (Read Only) */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Valid Till (Auto +30 Days)</label>
                          <input 
                              type="date" 
                              value={formData.endDate} 
                              readOnly
                              className="w-full bg-gray-900 border border-gray-800 p-2 rounded text-gray-500 cursor-not-allowed"
                          />
                      </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                      <button onClick={handleSave} className="flex-1 bg-gymGold text-black font-bold py-3 uppercase tracking-widest hover:bg-white transition">Save Changes</button>
                      <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-600 text-gray-400 font-bold py-3 uppercase tracking-widest hover:bg-gray-800 transition">Cancel</button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Simple style for badges */}
      <style>{`.badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }`}</style>
    </div>
  );
};

export default AdminDashboard;