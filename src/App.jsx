import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import { company } from './data/siteContent';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mts_user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem('mts_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mts_user');
    }
  }, [user]);

  const handleSignIn = (signedInUser) => {
    setUser(signedInUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Mahloma Tsebo home">
          <span className="brand-mark">M</span>
          <span>
            <strong>{company.name}</strong>
            <small>{company.tagline}</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#methodology">Methodology</a>
          <a href="#impact">Impact</a>
          <a href="#contact">Contact</a>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button type="button" className="ghost-btn" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <Link to="/auth" className="primary-btn small-btn">Sign in</Link>
          )}
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth onSignIn={handleSignIn} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div>
          <strong>{company.name}</strong>
          <p>{company.address}</p>
        </div>
        <div>
          <p>{company.phone}</p>
          <p>{company.email}</p>
        </div>
      </footer>
    </div>
  );
}
