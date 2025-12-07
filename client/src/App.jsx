import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute'; // <--- 1. IMPORT THIS

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {loading && location.pathname === '/' && <Preloader setComplete={() => setLoading(false)} />}

      <div className="bg-gymBlack min-h-screen text-white">
        
        {!isAdminRoute && <Navbar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 2. PROTECT THIS ROUTE */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

        </Routes>
      </div>
    </>
  );
}

export default App;