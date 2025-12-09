import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { getUsers, deleteUser, updateUser } from '../features/auth/adminReducer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { users, isLoading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all'); // all, Strength, Strength+Cardio, inactive, expiring
  const [sortOption, setSortOption] = useState('expiry'); // expiry, name, newest
  const [customDays, setCustomDays] = useState(''); // Manual day input
  
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

  // --- HELPER FUNCTIONS ---
  const getDaysLeft = (endDate) => {
    if (!endDate) return -999;
    const diff = new Date(endDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    let revenue = 0;
    let active = 0;
    let expiring = 0;

    users.forEach(u => {
        if(u.subscription?.plan) {
            active++;
            // Calculate Revenue
            if(u.subscription.plan === 'Strength') revenue += 1200;
            if(u.subscription.plan === 'Strength+Cardio') revenue += 1500;
            
            // Check Expiring
            const days = getDaysLeft(u.subscription.endDate);
            if(days >= 0 && days <= 5) expiring++;
        }
    });

    return { revenue, active, expiring, total: users.length };
  }, [users]);

  // --- FILTERING & SORTING LOGIC ---
  const filteredUsers = users.filter(user => {
    // 1. Filter Tabs
    if (filter === 'all') return true;
    if (filter === 'inactive') return !user.subscription || !user.subscription.plan;
    if (filter === 'expiring') {
        const days = getDaysLeft(user.subscription?.endDate);
        return days >= 0 && days <= 5;
    }
    
    // 2. Custom Days Filter (Manual Input)
    if (customDays !== '') {
        const days = getDaysLeft(user.subscription?.endDate);
        return days >= 0 && days <= parseInt(customDays);
    }

    return user.subscription?.plan === filter;
  }).sort((a, b) => {
      // 3. Sorting Logic
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      
      // Sort by Expiry (Items with no expiry go to bottom)
      const dateA = a.subscription?.endDate ? new Date(a.subscription.endDate) : new Date('2099-01-01');
      const dateB = b.subscription?.endDate ? new Date(b.subscription.endDate) : new Date('2099-01-01');
      return dateA - dateB;
  });

  // --- MODAL & DATE LOGIC ---
  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
        plan: user.subscription?.plan || 'Strength',
        // HTML Input type="date" requires YYYY-MM-DD format
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

  // --- WHATSAPP LOGIC ---
  const sendWhatsApp = (member) => {
    const phone = member.profile?.phone || ''; 
    if (!phone) return alert("Please add a phone number first (Click Edit).");
    
    const planName = member.subscription?.plan || "Membership";
    const expiryDate = formatDate(member.subscription?.endDate);
    const daysLeft = getDaysLeft(member.subscription?.endDate);

    const message = `Hello ${member.name}, reminder from Swamy Gym. Your ${planName} expires in *${daysLeft} days* (${expiryDate}). Please renew to continue your training! 💪`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
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
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-bold uppercase mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 opacity-10 rounded-bl-full transition-all group-hover:scale-110"></div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Est. Revenue</p>
                    <h3 className="text-4xl font-black text-white mt-2">₹{stats.revenue.toLocaleString()}</h3>
                    <p className="text-green-500 text-xs mt-2">Monthly Potential</p>
                </div>

                {/* Active Members */}
                <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gymGold opacity-10 rounded-bl-full transition-all group-hover:scale-110"></div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Active Members</p>
                    <h3 className="text-4xl font-black text-white mt-2">{stats.active}</h3>
                    <p className="text-gray-500 text-xs mt-2"> / {stats.total} Total Registered</p>
                </div>

                {/* Expiring Soon */}
                <div className="bg-[#111] p-6 rounded border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-10 rounded-bl-full transition-all group-hover:scale-110"></div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Expiring Soon</p>
                    <h3 className="text-4xl font-black text-white mt-2">{stats.expiring}</h3>
                    <p className="text-red-400 text-xs mt-2">In next 5 days</p>
                </div>
            </div>
            
            {/* Quick Action */}
            <div className="mt-8">
                <button onClick={() => setActiveTab('members')} className="bg-gymGold text-black font-bold px-6 py-3 rounded uppercase tracking-widest hover:bg-white transition">
                    Manage & Renew Members →
                </button>
            </div>
          </div>
        )}

        {/* VIEW: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-[#111] rounded border border-gray-800 overflow-hidden min-h-[80vh]">
            
            {/* CONTROL BAR */}
            <div className="p-6 border-b border-gray-800 bg-[#0a0a0a]">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Manage Members</h3>
                  <button onClick={() => dispatch(getUsers())} className="text-xs text-gymGold border border-gymGold px-3 py-1 hover:bg-gymGold hover:text-black transition rounded">
                  ↻ Refresh Data
                  </button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-900 p-1 rounded overflow-x-auto">
                    {['all', 'Strength', 'Strength+Cardio', 'expiring', 'inactive'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => { setFilter(f); setCustomDays(''); }}
                            className={`px-4 py-2 text-xs rounded uppercase font-bold transition-all whitespace-nowrap ${filter === f && customDays === '' ? 'bg-gymGold text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            {f === 'expiring' ? '⚠️ Expiring (5 Days)' : f}
                        </button>
                    ))}
                </div>

                {/* Sort & Manual Filter */}
                <div className="flex gap-2">
                    {/* Manual Days Filter */}
                    <input 
                        type="number" 
                        placeholder="Days Left..." 
                        value={customDays}
                        onChange={(e) => { setCustomDays(e.target.value); setFilter('custom'); }}
                        className="bg-black border border-gray-700 text-white px-3 py-2 rounded text-sm w-32 focus:border-gymGold outline-none"
                    />

                    {/* Sorting Dropdown */}
                    <select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                        className="bg-black border border-gray-700 text-white px-3 py-2 rounded text-sm focus:border-gymGold outline-none"
                    >
                        <option value="expiry">Sort: Expiry Date</option>
                        <option value="name">Sort: Name (A-Z)</option>
                        <option value="newest">Sort: Newest Joined</option>
                    </select>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-400 whitespace-nowrap">
                <thead className="bg-black text-gray-200 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Name / Contact</th>
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
                     const daysLeft = hasPlan ? getDaysLeft(member.subscription.endDate) : -999;
                     
                     return (
                      <tr key={member._id} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="p-4">
                          <div className="font-bold text-white text-lg">{member.name}</div>
                          <div className="text-xs text-gymGold mt-1">📞 {member.profile?.phone || "No Phone"}</div>
                        </td>

                        <td className="p-4">
                          {hasPlan ? (
                             <div>
                                 <span className="text-white font-bold block">{member.subscription.plan}</span>
                                 <span className="text-xs text-gray-500">
                                    {member.subscription.plan === 'Strength' ? '₹1200' : '₹1500'}
                                 </span>
                             </div>
                          ) : <span className="text-gray-600 italic">No Plan</span>}
                        </td>

                        <td className="p-4">
                           {hasPlan ? (
                               <div className="text-sm">
                                   <div className="text-green-500 font-mono">Start: {formatDate(member.subscription.startDate)}</div>
                                   <div className="text-red-400 font-mono">End: {formatDate(member.subscription.endDate)}</div>
                               </div>
                           ) : '-'}
                        </td>

                        <td className="p-4">
                            {member.isAdmin ? <span className="badge bg-blue-900 text-blue-300">ADMIN</span> 
                            : !hasPlan ? <span className="badge bg-gray-800 text-gray-400">INACTIVE</span>
                            : daysLeft < 0 ? <span className="badge bg-red-900 text-red-300">EXPIRED</span>
                            : daysLeft <= 5 ? <span className="badge bg-orange-900 text-orange-300 animate-pulse">EXPIRING ({daysLeft}d)</span>
                            : <span className="badge bg-green-900 text-green-300">ACTIVE ({daysLeft}d)</span>}
                        </td>

                        <td className="p-4">
                          <button onClick={() => sendWhatsApp(member)} className="text-green-500 hover:text-green-400 text-2xl transition-transform hover:scale-110" title="Send Expiry Reminder">
                            <i className="fa-brands fa-whatsapp"></i> 💬
                          </button>
                        </td>

                        <td className="p-4">
                            <button onClick={() => handleEditClick(member)} className="text-black bg-gymGold px-3 py-1 rounded font-bold text-xs mr-2 hover:bg-white">EDIT</button>
                            {!member.isAdmin && <button onClick={() => handleDelete(member._id)} className="text-red-500 text-xs font-bold hover:underline">DELETE</button>}
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && <div className="p-8 text-center">No members found matching filter.</div>}
          </div>
        )}
      </div>

      {/* --- EDIT USER MODAL --- */}
      {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1c1c1c] p-8 rounded-lg w-full max-w-md border border-gymGold shadow-2xl relative">
                  <h2 className="text-2xl font-bold mb-6 text-white uppercase border-b border-gray-700 pb-2">Edit Member</h2>
                  
                  <div className="space-y-4">
                      {/* Phone */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">WhatsApp Number</label>
                          <input 
                              type="number" 
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-gymGold outline-none"
                              placeholder="9876543210"
                          />
                      </div>

                      {/* Plan Selector */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Select Plan</label>
                          <select 
                              value={formData.plan} 
                              onChange={(e) => setFormData({...formData, plan: e.target.value})}
                              className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-gymGold outline-none"
                          >
                              <option value="Strength">Strength Training (₹1200)</option>
                              <option value="Strength+Cardio">Strength + Cardio (₹1500)</option>
                          </select>
                      </div>

                      {/* Start Date */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Payment Date (Start)</label>
                          <input 
                              type="date" 
                              value={formData.startDate} 
                              onChange={handleDateChange}
                              className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-gymGold outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">You can type or select from calendar</p>
                      </div>

                      {/* End Date (Read Only) */}
                      <div>
                          <label className="block text-gray-400 text-sm mb-1">Valid Till (Auto +30 Days)</label>
                          <input 
                              type="date" 
                              value={formData.endDate} 
                              readOnly
                              className="w-full bg-gray-900 border border-gray-800 p-3 rounded text-gray-500 cursor-not-allowed"
                          />
                      </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                      <button onClick={handleSave} className="flex-1 bg-gymGold text-black font-bold py-3 uppercase tracking-widest hover:bg-white transition">Save</button>
                      <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-600 text-gray-400 font-bold py-3 uppercase tracking-widest hover:bg-gray-800 transition">Cancel</button>
                  </div>
              </div>
          </div>
      )}
      
      <style>{`.badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; }`}</style>
    </div>
  );
};

export default AdminDashboard;