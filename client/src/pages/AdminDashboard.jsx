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
  const [filter, setFilter] = useState('all');
  const [sortOption, setSortOption] = useState('expiry');
  const [customDays, setCustomDays] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    plan: 'Strength',
    startDate: '',
    endDate: '',
    months: 1, 
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
    if (window.confirm('Delete this user? This cannot be undone.')) {
      dispatch(deleteUser(id));
    }
  };

  // --- LOGIC ---
  const getDaysLeft = (endDate) => {
    if (!endDate) return -999;
    const diff = new Date(endDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const stats = useMemo(() => {
    let revenue = 0;
    let active = 0;
    let expiring = 0;
    const memberList = users.filter(u => !u.isAdmin);
    
    memberList.forEach(u => {
        if(u.subscription?.plan) {
            active++;
            if(u.subscription.plan === 'Strength') revenue += 1200;
            if(u.subscription.plan === 'Strength+Cardio') revenue += 1500;
            const days = getDaysLeft(u.subscription.endDate);
            if(days >= 0 && days <= 5) expiring++;
        }
    });
    return { revenue, active, expiring, total: memberList.length };
  }, [users]);

  // --- FILTERING & SORTING ---
  const filteredUsers = users.filter(user => {
    if (user.isAdmin) return false; // Hide Admins

    const hasPlan = user.subscription && user.subscription.plan;
    const daysLeft = hasPlan ? getDaysLeft(user.subscription.endDate) : -999;

    // 1. Tabs Logic
    if (filter === 'all') return true;
    if (filter === 'inactive') return !hasPlan;
    if (filter === 'expired') return hasPlan && daysLeft < 0; // NEW EXPIRED FILTER
    if (filter === 'expiring') return daysLeft >= 0 && daysLeft <= 5;
    
    // 2. Custom Input
    if (customDays !== '') return daysLeft >= 0 && daysLeft <= parseInt(customDays);

    return user.subscription?.plan === filter;
  }).sort((a, b) => {
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      
      const dateA = a.subscription?.endDate ? new Date(a.subscription.endDate) : new Date('2099-01-01');
      const dateB = b.subscription?.endDate ? new Date(b.subscription.endDate) : new Date('2099-01-01');
      return dateA - dateB;
  });

  // --- EDIT LOGIC ---
  const calculateEndDate = (start, months) => {
    if (!start) return '';
    const date = new Date(start);
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toISOString().split('T')[0];
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
        name: user.name || '',
        plan: user.subscription?.plan || 'Strength',
        startDate: user.subscription?.startDate ? user.subscription.startDate.split('T')[0] : '',
        endDate: user.subscription?.endDate ? user.subscription.endDate.split('T')[0] : '',
        months: 1, 
        phone: user.profile?.phone || ''
    });
    setShowModal(true);
  };

  const handleDateChange = (e) => {
      const newStart = e.target.value;
      const newEnd = calculateEndDate(newStart, formData.months);
      setFormData({ ...formData, startDate: newStart, endDate: newEnd });
  };

  const handleMonthsChange = (e) => {
      const newMonths = e.target.value;
      const newEnd = calculateEndDate(formData.startDate, newMonths);
      setFormData({ ...formData, months: newMonths, endDate: newEnd });
  };

  const handleSave = () => {
      const { months, ...dataToSend } = formData;
      dispatch(updateUser({ id: editingUser._id, userData: dataToSend }));
      setShowModal(false);
  };

  const sendWhatsApp = (member) => {
    const phone = member.profile?.phone || ''; 
    if (!phone) return alert("Please add a phone number first (Click Edit).");
    const planName = member.subscription?.plan || "Membership";
    const expiryDate = formatDate(member.subscription?.endDate);
    const daysLeft = getDaysLeft(member.subscription?.endDate);
    const message = `Hello ${member.name}, reminder from Swamy Gym. Your ${planName} expires in *${daysLeft} days* on ${expiryDate}. Please renew! 💪`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="h-screen bg-gymBlack flex flex-col md:flex-row text-white font-sans overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden bg-[#111] p-4 flex justify-between items-center border-b border-gray-800 flex-shrink-0">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">
            Gym<span className="text-gymGold">Pro</span>
        </h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white text-2xl">
            {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static w-64 bg-[#111] border-r border-gray-800 flex flex-col z-40 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Gym<span className="text-gymGold">Pro</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          <button onClick={() => {setActiveTab('overview'); setIsSidebarOpen(false)}} className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'overview' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>📊 Overview</button>
          <button onClick={() => {setActiveTab('members'); setIsSidebarOpen(false)}} className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'members' ? 'bg-gymGold text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>👥 Manage Members</button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full py-2 bg-red-900/50 text-red-500 hover:bg-red-900 rounded font-bold">Logout</button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#050505]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold uppercase mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-[#111] p-6 rounded-lg border border-gray-800 border-l-4 border-l-green-500">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Est. Revenue</p>
                    <h3 className="text-3xl font-black text-white mt-2">₹{stats.revenue.toLocaleString()}</h3>
                </div>
                <div className="bg-[#111] p-6 rounded-lg border border-gray-800 border-l-4 border-l-gymGold">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Active Members</p>
                    <h3 className="text-3xl font-black text-white mt-2">{stats.active}</h3>
                </div>
                <div className="bg-[#111] p-6 rounded-lg border border-gray-800 border-l-4 border-l-red-500">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Expiring Soon</p>
                    <h3 className="text-3xl font-black text-white mt-2">{stats.expiring}</h3>
                </div>
            </div>
            <button onClick={() => setActiveTab('members')} className="bg-gymGold text-black font-bold px-6 py-3 rounded uppercase tracking-widest hover:bg-white transition mt-8">
                Manage Members →
            </button>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
            
            {/* HEADER */}
            <div className="bg-[#111] border-b border-gray-800 p-4 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg md:text-xl font-bold">Manage Members</h3>
                  <button 
                    onClick={() => dispatch(getUsers())} 
                    className="flex items-center gap-2 text-xs font-bold text-gymGold border border-gymGold px-3 py-1.5 hover:bg-gymGold hover:text-black transition rounded uppercase"
                  >
                    <span className={`text-sm ${isLoading ? 'animate-spin' : ''}`}>↻</span> 
                    {isLoading ? 'Syncing...' : 'Sync Data'}
                  </button>
              </div>

              {/* FILTERS */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
                <div className="flex space-x-1 bg-gray-900 p-1 rounded overflow-x-auto w-full md:w-auto no-scrollbar">
                    {['all', 'Strength', 'Strength+Cardio', 'expiring', 'expired', 'inactive'].map((f) => (
                        <button key={f} onClick={() => { setFilter(f); setCustomDays(''); }} 
                            className={`px-3 py-1.5 text-xs rounded uppercase font-bold whitespace-nowrap transition-all ${filter === f && customDays === '' ? 'bg-gymGold text-black' : 'text-gray-400 hover:text-white'}`}>
                            {f === 'expiring' ? '⚠️ Expiring' : f === 'expired' ? '🔴 Expired' : f}
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <input type="number" placeholder="Days..." value={customDays} onChange={(e) => { setCustomDays(e.target.value); setFilter('custom'); }} 
                        className="bg-black border border-gray-700 text-white px-3 py-1.5 rounded text-sm w-20 focus:border-gymGold outline-none" />
                    
                    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} 
                        className="bg-black border border-gray-700 text-white px-3 py-1.5 rounded text-sm focus:border-gymGold outline-none flex-1">
                        <option value="expiry">Sort: Expiry Date</option>
                        <option value="name">Sort: Name (A-Z)</option>
                        <option value="newest">Sort: Recently Joined</option>
                    </select>
                </div>
              </div>
            </div>
            
            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
                
                {/* --- 1. RUNNING MAN LOADER --- */}
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        {/* CSS Treadmill Runner Animation */}
                        <div className="runner-container">
                            <div className="runner">🏃‍♂️</div>
                        </div>
                        <p className="text-gymGold font-bold animate-pulse">Loading Athletes...</p>
                        <style>{`
                            .runner { font-size: 4rem; animation: run 0.5s infinite alternate; }
                            @keyframes run { from { transform: translateY(0); } to { transform: translateY(-10px); } }
                        `}</style>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 italic mt-10">No members match your filter.</div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block">
                            <table className="w-full text-left text-gray-400 whitespace-nowrap">
                                <thead className="bg-[#151515] text-gray-500 uppercase text-xs font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 bg-[#151515]">Name / Contact</th>
                                    <th className="p-4 bg-[#151515]">Plan</th>
                                    <th className="p-4 bg-[#151515]">Validity (Start → End)</th>
                                    <th className="p-4 bg-[#151515]">Status</th>
                                    <th className="p-4 bg-[#151515]">Days Active</th>
                                    <th className="p-4 bg-[#151515]">Notify</th>
                                    <th className="p-4 bg-[#151515]">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                {filteredUsers.map((member) => (
                                    <MemberRow 
                                        key={member._id} 
                                        member={member} 
                                        formatDate={formatDate} 
                                        getDaysLeft={getDaysLeft}
                                        handleEditClick={handleEditClick}
                                        handleDelete={handleDelete}
                                        sendWhatsApp={sendWhatsApp}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="md:hidden p-4 space-y-3">
                            {filteredUsers.map((member) => (
                                <MemberCard 
                                    key={member._id} 
                                    member={member} 
                                    formatDate={formatDate} 
                                    getDaysLeft={getDaysLeft}
                                    handleEditClick={handleEditClick}
                                    handleDelete={handleDelete}
                                    sendWhatsApp={sendWhatsApp}
                                />
                            ))}
                        </div>
                    </>
                )}
                
                <div className="h-20"></div>
            </div>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#1c1c1c] p-6 md:p-8 rounded-lg w-full max-w-md border border-gymGold shadow-2xl relative animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                      <h2 className="text-xl font-bold text-white uppercase">Edit Member</h2>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Name</label>
                          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-gymGold outline-none" />
                      </div>
                      <div>
                          <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">WhatsApp</label>
                          <input type="number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-gymGold outline-none" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Plan</label>
                            <select value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})}
                                className="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-gymGold outline-none">
                                <option value="Strength">Strength (₹1200)</option>
                                <option value="Strength+Cardio">Str+Cardio (₹1500)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Duration</label>
                            <select value={formData.months} onChange={handleMonthsChange}
                                className="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-gymGold outline-none">
                                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}Mo</option>)}
                            </select>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Start Date</label>
                          <input type="date" value={formData.startDate} onChange={handleDateChange}
                              className="w-full bg-black border border-gray-700 text-white p-3 rounded focus:border-gymGold outline-none [color-scheme:dark]" />
                      </div>
                      <div>
                          <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">End Date (Auto)</label>
                          <input type="date" value={formData.endDate} readOnly
                              className="w-full bg-[#111] border border-gray-800 text-gray-500 p-3 rounded cursor-not-allowed [color-scheme:dark]" />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                      <button onClick={handleSave} className="flex-1 bg-gymGold text-black font-bold py-3 rounded uppercase tracking-widest hover:bg-white transition">Save</button>
                      <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-600 text-gray-400 font-bold py-3 rounded uppercase tracking-widest hover:bg-gray-800 transition">Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// --- DESKTOP ROW ---
const MemberRow = ({ member, formatDate, getDaysLeft, handleEditClick, handleDelete, sendWhatsApp }) => {
    const hasPlan = member.subscription && member.subscription.plan;
    const daysLeft = hasPlan ? getDaysLeft(member.subscription.endDate) : -999;
    
    // Status Logic
    let statusBadge;
    if (!hasPlan) statusBadge = <Badge color="gray" text="INACTIVE" />;
    else if (daysLeft < 0) statusBadge = <Badge color="red" text="EXPIRED" />;
    else if (daysLeft <= 5) statusBadge = <Badge color="orange" text="EXPIRING" />;
    else statusBadge = <Badge color="green" text="ACTIVE" />;

    return (
        <tr className="hover:bg-gray-900/50 transition-colors border-b border-gray-800/50">
            <td className="p-4">
                <div className="font-bold text-white">{member.name}</div>
                <div className="text-xs text-gray-500 mt-1">📞 {member.profile?.phone || "-"}</div>
            </td>
            <td className="p-4">
                {hasPlan ? <span className="text-white font-bold">{member.subscription.plan}</span> : <span className="text-gray-600 italic">No Plan</span>}
            </td>
            <td className="p-4 text-sm font-mono text-gray-300">
               {hasPlan ? (
                   <span className="flex items-center gap-2 text-xs">
                       <span className="text-emerald-500">{formatDate(member.subscription.startDate)}</span> 
                       <span className="text-gray-600">→</span>
                       <span className="text-rose-500">{formatDate(member.subscription.endDate)}</span>
                   </span>
               ) : '-'}
            </td>
            <td className="p-4">{statusBadge}</td>
            <td className="p-4 text-center font-bold text-white">{daysLeft > 0 ? `${daysLeft} days` : '-'}</td>
            <td className="p-4">
                <button onClick={() => sendWhatsApp(member)} className="text-green-500 hover:scale-110 transition text-2xl"><i className="fa-brands fa-whatsapp"></i> 💬</button>
            </td>
            <td className="p-4">
                <button onClick={() => handleEditClick(member)} className="text-gymGold font-bold text-sm mr-3">Edit</button>
                <button onClick={() => handleDelete(member._id)} className="text-red-500 font-bold text-sm">Del</button>
            </td>
        </tr>
    );
};

// --- MOBILE CARD ---
const MemberCard = ({ member, formatDate, getDaysLeft, handleEditClick, handleDelete, sendWhatsApp }) => {
    const hasPlan = member.subscription && member.subscription.plan;
    const daysLeft = hasPlan ? getDaysLeft(member.subscription.endDate) : -999;

    let statusBadge;
    if (!hasPlan) statusBadge = <Badge color="gray" text="INACTIVE" />;
    else if (daysLeft < 0) statusBadge = <Badge color="red" text="EXPIRED" />;
    else if (daysLeft <= 5) statusBadge = <Badge color="orange" text="EXPIRING" />;
    else statusBadge = <Badge color="green" text="ACTIVE" />;

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-md flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-xs text-gray-500">📞 {member.profile?.phone || "No Phone"}</p>
                </div>
                {statusBadge}
            </div>

            <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-sm">
                {hasPlan ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Plan:</span>
                            <span className="text-white font-bold">{member.subscription.plan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Days Active:</span>
                            <span className="text-gymGold font-bold">{daysLeft > 0 ? daysLeft : 0} days</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
                            <span className="text-emerald-500 text-xs">{formatDate(member.subscription.startDate)}</span>
                            <span className="text-gray-500 text-xs">→</span>
                            <span className="text-rose-500 text-xs">{formatDate(member.subscription.endDate)}</span>
                        </div>
                    </div>
                ) : <span className="text-gray-600 italic text-sm">No active plan</span>}
            </div>

            <div className="flex gap-2 mt-1">
                <button onClick={() => sendWhatsApp(member)} className="flex-1 bg-green-900/20 text-green-500 py-2 rounded font-bold border border-green-900/30 flex items-center justify-center gap-2">
                    💬
                </button>
                <button onClick={() => handleEditClick(member)} className="flex-1 bg-gymGold/10 text-gymGold py-2 rounded font-bold border border-gymGold/30">
                    Edit
                </button>
                <button onClick={() => handleDelete(member._id)} className="w-10 bg-red-900/20 text-red-500 rounded font-bold border border-red-900/30">
                    🗑
                </button>
            </div>
        </div>
    );
};

const Badge = ({ color, text }) => {
    const colors = {
        gray: "bg-gray-800 text-gray-400",
        red: "bg-red-900 text-red-300",
        orange: "bg-orange-900 text-orange-300",
        green: "bg-green-900 text-green-300"
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${colors[color]}`}>
            {text}
        </span>
    );
};

export default AdminDashboard;