import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIG ---
const DEFAULT_TASKS = [
    { name: 'Warmup / Cardio', completed: false },
    { name: 'Strength Training', completed: false },
    { name: 'Abs / Core', completed: false },
    { name: 'Cool down / Stretch', completed: false },
    { name: 'Protein Intake', completed: false }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState({}); // Stores logs by date "YYYY-MM-DD"
  const [selectedDate, setSelectedDate] = useState(null); // The date clicked
  const [modalData, setModalData] = useState(null); // The data for that date
  const [isLoading, setIsLoading] = useState(false);

  // Profile Edit State
  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);

  // --- API URL HELPER ---
  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user?.token}` } });
  const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, "");

  useEffect(() => {
    if (!user) navigate('/login');
    else {
        fetchActivities();
        setProfileData({ name: user.name || '', phone: user.profile?.phone || '' });
    }
  }, [user, navigate]);

  // --- FETCH ACTIVITY LOGS ---
  const fetchActivities = async () => {
      try {
          const res = await axios.get(`${BASE_URL}/api/activity`, getAuthHeader());
          // Convert array to object map: { "2024-12-09": { ...log } }
          const logMap = {};
          res.data.forEach(log => { logMap[log.date] = log; });
          setActivities(logMap);
      } catch (error) {
          console.error("Failed to fetch logs");
      }
  };

  // --- SAVE ACTIVITY LOG ---
  const saveActivity = async () => {
      setIsLoading(true);
      try {
          // Prepare payload
          const payload = {
              date: selectedDate,
              tasks: modalData.tasks,
              note: modalData.note
          };
          
          const res = await axios.post(`${BASE_URL}/api/activity`, payload, getAuthHeader());
          
          // Update Local State immediately
          setActivities(prev => ({ ...prev, [selectedDate]: res.data }));
          setIsLoading(false);
          setSelectedDate(null); // Close modal
      } catch (error) {
          alert("Failed to save progress");
          setIsLoading(false);
      }
  };

  const handleUpdateProfile = async () => {
      try {
          const res = await axios.put(`${BASE_URL}/api/users/profile`, profileData, getAuthHeader());
          let storedUser = JSON.parse(localStorage.getItem('user'));
          storedUser = { ...storedUser, name: res.data.name, profile: res.data.profile };
          localStorage.setItem('user', JSON.stringify(storedUser));
          alert("Profile Updated!");
          setIsEditing(false);
      } catch (error) { alert("Update failed"); }
  };

  const onLogout = () => { dispatch(logout()); dispatch(reset()); navigate('/'); };

  // --- CALENDAR GENERATION ---
  const generateCalendar = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const grid = [];

      for(let i = 1; i <= daysInMonth; i++) {
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const log = activities[dateKey];
          
          // Heatmap Logic
          let intensity = 'bg-zinc-800 border-zinc-700 text-zinc-500'; // Default (Absent)
          let completedCount = 0;

          if (log && log.tasks) {
              completedCount = log.tasks.filter(t => t.completed).length;
              if (completedCount === 0) intensity = 'bg-zinc-800 border-zinc-700 text-zinc-500'; // Opened but did nothing
              else if (completedCount <= 2) intensity = 'bg-green-900/40 border-green-800 text-green-400'; // Light work
              else if (completedCount <= 4) intensity = 'bg-green-600/60 border-green-500 text-white'; // Good work
              else intensity = 'bg-gymGold text-black font-bold shadow-[0_0_10px_rgba(255,215,0,0.4)]'; // Beast Mode
          }

          grid.push({ day: i, dateKey, intensity, log });
      }
      return grid;
  };

  // --- OPEN MODAL ---
  const openDay = (dayObj) => {
      setSelectedDate(dayObj.dateKey);
      // Load existing data OR default template
      if (dayObj.log) {
          setModalData({ tasks: dayObj.log.tasks, note: dayObj.log.note || '' });
      } else {
          setModalData({ tasks: DEFAULT_TASKS, note: '' });
      }
  };

  const toggleTask = (index) => {
      const newTasks = [...modalData.tasks];
      newTasks[index] = { ...newTasks[index], completed: !newTasks[index].completed };
      setModalData({ ...modalData, tasks: newTasks });
  };

  return (
    <div className="min-h-screen bg-gymBlack text-white pt-20 px-4 pb-10 font-sans flex justify-center">
      <div className="w-full max-w-2xl">
      
        {/* COMPACT HEADER */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">
                    Arena<span className="text-gymGold">Dash</span>
                </h1>
                <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
            </div>
            
            <div className="flex bg-[#111] rounded-lg p-1 border border-white/5">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${activeTab === 'overview' ? 'bg-gymGold text-black' : 'text-gray-400'}`}>Track</button>
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${activeTab === 'profile' ? 'bg-gymGold text-black' : 'text-gray-400'}`}>Profile</button>
            </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
                
                {/* SUBSCRIPTION MINI-CARD */}
                <div className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gymGold/5 rounded-full blur-xl"></div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Plan</p>
                        {user?.subscription?.plan ? (
                            <div>
                                <h2 className="text-lg font-black text-white">{user.subscription.plan}</h2>
                                <p className="text-xs text-green-500 mt-0.5">Exp: {new Date(user.subscription.endDate).toLocaleDateString()}</p>
                            </div>
                        ) : <span className="text-gray-400 text-sm font-bold">No active plan</span>}
                    </div>
                    {user?.subscription?.plan && (
                        <div className="text-right">
                            <p className="text-2xl font-black text-gymGold">{Object.keys(activities).length}</p>
                            <p className="text-[10px] text-gray-500 uppercase">Sessions</p>
                        </div>
                    )}
                </div>

                {/* COMPACT HEATMAP CALENDAR */}
                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">📅 Performance Log</h3>
                        <div className="flex gap-2 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-zinc-800 border border-zinc-700"></div> Rest</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-600"></div> Work</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gymGold"></div> Beast</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1.5">
                        {['S','M','T','W','T','F','S'].map((d,i) => (
                            <div key={i} className="text-center text-gray-600 text-[10px] font-bold">{d}</div>
                        ))}
                        
                        {generateCalendar().map((dayObj) => (
                            <button 
                                key={dayObj.dateKey} 
                                onClick={() => openDay(dayObj)}
                                className={`
                                    aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all border
                                    ${dayObj.intensity} hover:scale-110 active:scale-95
                                `}
                            >
                                {dayObj.day}
                            </button>
                        ))}
                    </div>
                </div>

            </motion.div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-[#111] p-6 rounded-xl border border-white/5 space-y-4">
                <h2 className="text-lg font-bold">Edit Profile</h2>
                <div>
                    <label className="text-gray-500 text-[10px] uppercase font-bold">Full Name</label>
                    <input type="text" value={profileData.name} disabled={!isEditing} onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className={`w-full bg-black border ${isEditing ? 'border-gymGold text-white' : 'border-gray-800 text-gray-400'} p-2 text-sm rounded mt-1 outline-none transition-colors`} />
                </div>
                <div>
                    <label className="text-gray-500 text-[10px] uppercase font-bold">WhatsApp</label>
                    <input type="number" value={profileData.phone} disabled={!isEditing} onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className={`w-full bg-black border ${isEditing ? 'border-gymGold text-white' : 'border-gray-800 text-gray-400'} p-2 text-sm rounded mt-1 outline-none transition-colors`} />
                </div>
                <div className="pt-2 flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={handleUpdateProfile} className="flex-1 bg-gymGold text-black font-bold py-2 rounded text-xs uppercase hover:bg-white transition">Save</button>
                            <button onClick={() => setIsEditing(false)} className="flex-1 border border-gray-600 text-gray-400 font-bold py-2 rounded text-xs uppercase hover:bg-gray-800 transition">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex-1 border border-gymGold text-gymGold font-bold py-2 rounded text-xs uppercase hover:bg-gymGold hover:text-black transition">Edit</button>
                    )}
                    <button onClick={onLogout} className="flex-1 border border-red-900 text-red-500 font-bold py-2 rounded text-xs uppercase hover:bg-red-900 hover:text-white transition">Logout</button>
                </div>
            </motion.div>
        )}

        {/* --- BOTTOM SHEET MODAL (COMPACT) --- */}
        <AnimatePresence>
            {selectedDate && modalData && (
                <>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectedDate(null)} className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
                    <motion.div initial={{y: "100%"}} animate={{y: 0}} exit={{y: "100%"}} transition={{type:"spring", damping:25, stiffness:300}}
                        className="fixed bottom-0 left-0 w-full bg-[#151515] rounded-t-2xl z-[70] p-5 border-t border-gymGold shadow-2xl max-h-[85vh] overflow-y-auto">
                        
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4"></div>
                        
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Daily Log</p>
                                <h2 className="text-2xl font-black text-white">{selectedDate}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Tasks Done</p>
                                <p className="text-lg font-bold text-gymGold">{modalData.tasks.filter(t => t.completed).length} / {modalData.tasks.length}</p>
                            </div>
                        </div>

                        {/* CHECKLIST */}
                        <div className="space-y-2 mb-6">
                            {modalData.tasks.map((task, i) => (
                                <div key={i} onClick={() => toggleTask(i)} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${task.completed ? 'bg-green-900/20 border-green-900' : 'bg-black/30 border-gray-800'}`}>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                        {task.completed && <span className="text-black text-xs font-bold">✓</span>}
                                    </div>
                                    <span className={`text-sm ${task.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>{task.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* NOTES */}
                        <div className="mb-4">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Workout Notes</label>
                            <textarea 
                                value={modalData.note}
                                onChange={(e) => setModalData({...modalData, note: e.target.value})}
                                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white text-sm outline-none focus:border-gymGold h-20 resize-none"
                                placeholder="Weights used, how you felt..."
                            ></textarea>
                        </div>

                        <button onClick={saveActivity} className="w-full bg-white text-black font-bold py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform">
                            {isLoading ? 'Saving...' : 'Save & Close'}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Dashboard;