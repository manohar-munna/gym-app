import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Preloader from './components/Preloader'; // <--- Import this

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      {/* Show Preloader until animation finishes */}
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div className="bg-gymBlack min-h-screen text-white">
        {/* Navbar */}
        <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference">
          <Link to="/" className="text-2xl font-bold uppercase tracking-widest text-white cursor-pointer no-underline">
            SWAMY<span className="text-gymGold">GYM</span>
          </Link>
          <div className="space-x-6 hidden md:block">
            <Link to="/login" className="text-white hover:text-gymGold font-semibold transition-colors no-underline">LOGIN</Link>
            <Link to="/register" className="text-white hover:text-gymGold font-semibold transition-colors no-underline">REGISTER</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;