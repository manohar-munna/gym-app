import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- CONFIG ---
const DEFAULT_TASKS = [
    { name: 'Warmup', completed: false, reps: '', weight: '' },
    { name: 'Main Lift', completed: false, reps: '', weight: '' },
    { name: 'Accessory', completed: false, reps: '', weight: '' },
    { name: 'Cool down', completed: false, reps: '', weight: '' },
];

// --- GRAPH HELPER ---
const processGraphData = (activities, metric, range) => {
    const rawData = [];
    const dates = Object.keys(activities).sort();

    // 1. Extract Raw Data
    dates.forEach(date => {
        const log = activities[date];
        let val = null;
        
        if (metric === 'bodyWeight') {
            if (log.bodyWeight) val = log.bodyWeight;
        } else {
            const task = log.tasks?.find(t => t.name.toLowerCase().includes(metric.toLowerCase()));
            if (task && task.weight) val = parseFloat(task.weight);
        }

        if (val !== null) rawData.push({ date, value: val });
    });

    if (range === 'daily') {
        return rawData.map(d => ({ ...d, date: d.date.slice(5).replace('-','/') })); // MM/DD
    }

    // 2. Grouping Logic (Weekly/Monthly)
    const grouped = {};
    rawData.forEach(item => {
        const d = new Date(item.date);
        let key;
        if (range === 'weekly') {
            // Calculate Week Number
            const firstDay = new Date(d.getFullYear(), 0, 1);
            const pastDays = (d - firstDay) / 86400000;
            const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
            key = `W${weekNum}`;
        } else {
            // Monthly (Jan, Feb...)
            key = d.toLocaleString('default', { month: 'short' });
        }

        if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
        grouped[key].total += item.value;
        grouped[key].count += 1;
    });

    // 3. Calculate Averages
    return Object.keys(grouped).map(key => ({
        date: key,
        value: parseFloat((grouped[key].total / grouped[key].count).toFixed(1))
    }));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Analysis State
  const [graphMetric, setGraphMetric] = useState('bodyWeight');
  const [graphRange, setGraphRange] = useState('daily'); // daily, weekly, monthly

  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('idle');

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user?.token}` } });
  const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, "");

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    
    const fetchData = async () => {
        try {
            const userRes = await axios.get(`${BASE_URL}/api/users/profile`, getAuthHeader());
            const updatedUser = { ...user, ...userRes.data, token: user.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setProfileData({ name: userRes.data.name, phone: userRes.data.profile?.phone || '' });

            const actRes = await axios.get(`${BASE_URL}/api/activity`, getAuthHeader());
            const logMap = {};
            actRes.data.forEach(log => { logMap[log.date] = log; });
            setActivities(logMap);
        } catch (error) { if(error.response?.status === 401) onLogout(); }
    };
    fetchData();
  }, [navigate, activeTab]);

  const onLogout = () => { dispatch(logout()); dispatch(reset()); navigate('/'); };

  // --- CALENDAR LOGIC ---
  const changeMonth = (offset) => {
      const newDate = new Date(currentMonth);
      newDate.setMonth(newDate.getMonth() + offset);
      setCurrentMonth(newDate);
  };

  const generateCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay(); 
      const grid = Array(firstDay).fill(null);

      const today = new Date(); today.setHours(0,0,0,0);
      const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date(); joinDate.setHours(0,0,0,0);
      const expiryDate = user?.subscription?.endDate ? new Date(user.subscription.endDate) : new Date();

      for(let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const current = new Date(year, month, i);
          const log = activities[dateStr];
          
          let intensity = 'bg-zinc-900 border-zinc-800 text-zinc-600'; 
          if (log) {
              // Priority 1: Note or Weight exists (Blue-ish gray to show data exists)
              if (log.bodyWeight || log.note) intensity = 'bg-slate-900 border-slate-700 text-slate-300';
              
              // Priority 2: Tasks (Green Overrides)
              if (log.tasks) {
                  const count = log.tasks.filter(t => t.completed).length;
                  if (count > 0 && count <= 2) intensity = 'bg-green-900/40 border-green-800 text-green-400';
                  else if (count > 2) intensity = 'bg-green-600 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.6)]';
              }
          }

          const isFuture = current > today;
          const isToday = current.getTime() === today.getTime();
          const isBeforeJoin = current < joinDate;

          grid.push({ day: i, dateKey: dateStr, intensity, log, isFuture, isToday, disabled: isBeforeJoin && !log });
      }
      return grid;
  };

  // --- MODAL ---
  const openDay = (dayObj) => {
      if (!dayObj || dayObj.disabled) return;
      setSelectedDate(dayObj);
      
      if (dayObj.log) {
          setModalData({ 
              tasks: dayObj.log.tasks, 
              note: dayObj.log.note || '',
              bodyWeight: dayObj.log.bodyWeight || '' 
          });
      } else {
          setModalData({ tasks: [...DEFAULT_TASKS], note: '', bodyWeight: '' });
      }
  };

  const updateTask = (index, field, value) => {
      const newTasks = [...modalData.tasks];
      newTasks[index] = { ...newTasks[index], [field]: value };
      setModalData({ ...modalData, tasks: newTasks });
  };
  const addTask = () => {
      setModalData({ ...modalData, tasks: [...modalData.tasks, { name: '', completed: false, reps: '', weight: '' }] });
  };
  const deleteTask = (index) => {
      const newTasks = modalData.tasks.filter((_, i) => i !== index);
      setModalData({ ...modalData, tasks: newTasks });
  };

  const saveActivity = async () => {
      setIsLoading(true);
      try {
          const payload = { 
              date: selectedDate.dateKey, 
              tasks: modalData.tasks, 
              note: modalData.note,
              // Send null if empty string
              bodyWeight: modalData.bodyWeight === '' ? null : Number(modalData.bodyWeight)
          };
          const res = await axios.post(`${BASE_URL}/api/activity`, payload, getAuthHeader());
          
          // Update local state instantly so graph reflects it
          setActivities(prev => ({ ...prev, [selectedDate.dateKey]: res.data }));
          
          setIsLoading(false);
          setSelectedDate(null);
      } catch (error) { alert("Failed to save"); setIsLoading(false); }
  };

  // --- ANALYSIS ---
  const graphData = useMemo(() => {
      return processGraphData(activities, graphMetric, graphRange);
  }, [activities, graphMetric, graphRange]);

  const handleUpdateProfile = async () => {
      setUpdateStatus('loading');
      try {
          const rawPhone = profileData.phone.replace(/\s/g, ''); 
          const payload = { ...profileData, phone: rawPhone };
          await axios.put(`${BASE_URL}/api/users/profile`, payload, getAuthHeader());
          setUpdateStatus('success');
          setTimeout(() => { setUpdateStatus('idle'); setIsEditing(false); }, 1000);
      } catch (error) { setUpdateStatus('idle'); }
  };

  const formatDisplayDate = (ymd) => ymd ? ymd.split('-').reverse().join('-') : '';
  const localUser = JSON.parse(localStorage.getItem('user')) || user;
  
  const calculateDaysLeft = () => {
      if(!localUser?.subscription?.endDate) return 0;
      const end = new Date(localUser.subscription.endDate);
      const now = new Date();
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
  };

  // Count attendance (dates with at least one completed task OR weight logged)
  const attendanceCount = Object.values(activities).filter(log => 
      (log.tasks && log.tasks.some(t => t.completed)) || log.bodyWeight
  ).length;

  return (
    <div className="min-h-screen bg-gymBlack text-white pt-24 px-4 pb-20 font-sans flex justify-center">
      <div className="w-full max-w-lg">
      
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">Arena<span className="text-gymGold">Dash</span></h1>
                <p className="text-xs text-gray-500">Welcome, {localUser?.name}</p>
            </div>
            <div className="flex bg-[#111] rounded-lg p-1 border border-white/5 shadow-lg">
                <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTab === 'overview' ? 'bg-gymGold text-black' : 'text-gray-400'}`}>Track</button>
                <button onClick={() => setActiveTab('analyse')} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTab === 'analyse' ? 'bg-gymGold text-black' : 'text-gray-400'}`}>Analyse</button>
                <button onClick={() => setActiveTab('profile')} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTab === 'profile' ? 'bg-gymGold text-black' : 'text-gray-400'}`}>Profile</button>
            </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
                
                {/* SUBSCRIPTION CARD */}
                <div className="bg-[#111] px-5 py-4 rounded-xl border border-white/5 flex justify-between items-center relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gymGold/5 rounded-full blur-xl"></div>
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Current Plan</p>
                            <span className="bg-green-900/30 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-900/50">
                                Attendance: {attendanceCount}
                            </span>
                        </div>
                        {localUser?.subscription?.plan ? (
                            <div>
                                <h2 className="text-xl font-black text-white mt-1">{localUser.subscription.plan}</h2>
                                <div className="text-xs flex gap-3 mt-2 font-mono items-center">
                                    <span className="text-gray-400">Exp: {new Date(localUser.subscription.endDate).toLocaleDateString('en-GB')}</span>
                                    <span className="text-gray-600">|</span>
                                    <span className="text-gymGold font-bold">{calculateDaysLeft()} Days Left</span>
                                </div>
                            </div>
                        ) : <span className="text-gray-400 text-sm font-bold block mt-2">No active plan</span>}
                    </div>
                </div>

                {/* CALENDAR */}
                <div className="bg-[#111] p-4 rounded-xl border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <button onClick={() => changeMonth(-1)} className="text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full hover:bg-white/10">❮</button>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => changeMonth(1)} className="text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full hover:bg-white/10">❯</button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-center text-gray-600 text-[10px] font-bold">{d}</div>)}
                        {generateCalendar().map((dayObj, i) => (
                            dayObj ? (
                                <button 
                                    key={dayObj.dateKey} 
                                    onClick={() => openDay(dayObj)}
                                    disabled={dayObj.disabled}
                                    className={`
                                        aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all border relative
                                        ${dayObj.disabled ? 'opacity-20 cursor-not-allowed bg-black border-transparent text-gray-600' : dayObj.intensity}
                                        ${!dayObj.disabled && 'hover:scale-110 active:scale-95 cursor-pointer'}
                                        ${dayObj.isToday ? 'ring-1 ring-gymGold ring-offset-1 ring-offset-black' : ''}
                                    `}
                                >
                                    {dayObj.day}
                                </button>
                            ) : <div key={`empty-${i}`} />
                        ))}
                    </div>
                </div>
            </motion.div>
        )}

        {/* --- ANALYSE TAB (UPDATED) --- */}
        {activeTab === 'analyse' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-[#111] p-6 rounded-xl border border-white/5 space-y-6 shadow-lg">
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold">Progress Graph</h2>
                    
                    {/* CUSTOM DROPDOWNS */}
                    <div className="flex gap-2">
                        <select 
                            value={graphMetric} 
                            onChange={(e) => setGraphMetric(e.target.value)} 
                            className="bg-black text-white text-xs p-2 rounded border border-gymGold outline-none flex-1 focus:ring-1 focus:ring-gymGold"
                        >
                            <option value="bodyWeight">Body Weight</option>
                            <option value="Bench Press">Bench Press</option>
                            <option value="Squat">Squat</option>
                            <option value="Deadlift">Deadlift</option>
                        </select>

                        <select 
                            value={graphRange} 
                            onChange={(e) => setGraphRange(e.target.value)} 
                            className="bg-black text-white text-xs p-2 rounded border border-gray-700 outline-none w-24 focus:border-gymGold"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly Avg</option>
                            <option value="monthly">Monthly Avg</option>
                        </select>
                    </div>
                </div>
                
                <div className="h-64 w-full bg-[#0a0a0a] rounded-lg border border-white/5 p-2">
                    {graphData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="date" stroke="#666" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#666" fontSize={10} domain={['auto', 'auto']} width={30} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #FFD700', color: '#fff', fontSize: '12px' }} 
                                    itemStyle={{ color: '#FFD700' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#FFD700" strokeWidth={3} connectNulls dot={{r:3, fill:'#FFD700'}} activeDot={{r:6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <span className="text-2xl mb-2">📉</span>
                            <p className="text-xs">No data recorded yet.</p>
                            <button onClick={() => setActiveTab('overview')} className="mt-2 text-gymGold text-xs underline">Log Weight</button>
                        </div>
                    )}
                </div>
                
                <p className="text-[10px] text-gray-500 text-center italic">
                    Showing {graphRange} progress for {graphMetric === 'bodyWeight' ? 'body weight' : graphMetric}.
                </p>
            </motion.div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-[#111] p-6 rounded-xl border border-white/5 space-y-5 shadow-lg">
                <h2 className="text-lg font-bold text-white">Edit Profile</h2>
                <div>
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Full Name</label>
                    <input type="text" value={profileData.name} disabled={!isEditing} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className={`w-full bg-black border ${isEditing ? 'border-gymGold text-white' : 'border-gray-800 text-gray-500'} p-3 text-sm rounded mt-1 outline-none transition-colors`} />
                </div>
                <div>
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">WhatsApp Number</label>
                    <input type="text" inputMode="numeric" value={profileData.phone} disabled={!isEditing} 
                        onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, ''); 
                            if (val.length > 10) val = val.slice(0, 10);
                            if (val.length > 5) val = `${val.slice(0, 5)} ${val.slice(5)}`;
                            setProfileData({ ...profileData, phone: val });
                        }}
                        className={`w-full bg-black border ${isEditing ? 'border-gymGold text-white' : 'border-gray-800 text-gray-500'} p-3 text-sm rounded mt-1 outline-none transition-colors`} placeholder="98765 43210" 
                    />
                </div>
                <div className="pt-2 flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => {if(isEditing) setUpdateStatus('idle'); handleUpdateProfile();}} className="flex-1 bg-gymGold text-black font-bold py-3 rounded text-xs uppercase hover:bg-white transition flex justify-center items-center gap-2">
                                {updateStatus === 'loading' ? <span className="animate-spin">↻</span> : updateStatus === 'success' ? '✓ Saved' : 'Save Changes'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="flex-1 border border-gray-600 text-gray-400 font-bold py-3 rounded text-xs uppercase hover:bg-gray-800 transition">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex-1 border border-gymGold text-gymGold font-bold py-3 rounded text-xs uppercase hover:bg-gymGold hover:text-black transition">Edit Profile</button>
                    )}
                    <button onClick={onLogout} className="flex-1 border border-red-900 text-red-500 font-bold py-3 rounded text-xs uppercase hover:bg-red-900 hover:text-white transition">Logout</button>
                </div>
            </motion.div>
        )}

        {/* --- MODAL (CENTERED) --- */}
        <AnimatePresence>
            {selectedDate && modalData && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1c1c1c] w-full max-w-md rounded-2xl border border-gymGold/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-5 border-b border-gray-800 bg-[#151515] flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Training Log</p>
                                <h2 className="text-2xl font-black text-white">{formatDisplayDate(selectedDate.dateKey)}</h2>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>

                        <div className="p-5 overflow-y-auto custom-scrollbar">
                            <div className="mb-6 bg-black/30 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-400">Body Weight (kg)</label>
                                <input 
                                    type="number" 
                                    value={modalData.bodyWeight} 
                                    onChange={(e) => setModalData({...modalData, bodyWeight: e.target.value})}
                                    placeholder="0.0"
                                    className="w-24 bg-transparent text-right text-white font-bold outline-none border-b border-gray-700 focus:border-gymGold"
                                />
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-end border-b border-gray-800 pb-2 mb-2">
                                    <h4 className="text-xs font-bold text-gymGold uppercase">Exercises</h4>
                                    <button onClick={addTask} className="text-xs text-green-500 font-bold hover:text-white">+ Add Task</button>
                                </div>
                                {modalData.tasks.map((task, i) => (
                                    <div key={i} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${task.completed ? 'bg-green-900/10 border-green-900/50' : 'bg-black/40 border-gray-800'}`}>
                                        <div className="flex items-center gap-3">
                                            {/* CHECKBOX: Enabled if NOT Future */}
                                            <div 
                                                onClick={() => !selectedDate.isFuture && updateTask(i, 'completed', !task.completed)} 
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 
                                                    ${selectedDate.isFuture ? 'cursor-not-allowed opacity-30 border-gray-600' : 'cursor-pointer'}
                                                    ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-white'}`}
                                            >
                                                {task.completed && <span className="text-black text-xs font-bold">✓</span>}
                                            </div>
                                            <input type="text" value={task.name} onChange={(e) => updateTask(i, 'name', e.target.value)} placeholder="Exercise Name" className={`bg-transparent outline-none w-full text-sm font-bold ${task.completed ? 'text-green-400 line-through' : 'text-white'}`} />
                                            <button onClick={() => deleteTask(i)} className="text-red-500 text-xs font-bold px-2">✕</button>
                                        </div>
                                        <div className="flex gap-2 pl-9">
                                            <input type="text" value={task.reps || ''} onChange={(e) => updateTask(i, 'reps', e.target.value)} placeholder="Reps" className="bg-black/50 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 w-1/2 outline-none focus:border-gymGold" />
                                            <input type="text" value={task.weight || ''} onChange={(e) => updateTask(i, 'weight', e.target.value)} placeholder="Kg" className="bg-black/50 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 w-1/2 outline-none focus:border-gymGold" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-4">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Notes</label>
                                <textarea value={modalData.note} onChange={(e) => setModalData({...modalData, note: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white text-sm outline-none focus:border-gymGold h-20 resize-none placeholder-gray-700" placeholder="Details..."></textarea>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-800 bg-[#151515]">
                            <button onClick={saveActivity} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform shadow-lg">{isLoading ? 'Saving...' : 'Save Log'}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Dashboard;