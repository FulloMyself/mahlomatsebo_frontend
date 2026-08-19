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
          <Link to="/#services">Services</Link>
          <Link to="/#methodology">Methodology</Link>
          <Link to="/#impact">Impact</Link>
          <Link to="/#contact">Contact</Link>
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
        <div className="footer-grid">
          <div className="footer-column about">
            <strong>{company.name}</strong>
            <p className="tagline">{company.tagline}</p>
            <p className="about-copy">Mahloma Tsebo Solutions delivers accredited training, safety and community-focused programmes that strengthen workplaces and learning environments.</p>
          </div>

          <div className="footer-column links">
            <h4>Quick links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/#contact">Contact</Link></li>
              <li><Link to="/auth">Sign in</Link></li>
            </ul>
          </div>

          <div className="footer-column contact">
            <h4>Contact</h4>
            <p>{company.address}</p>
            <p>{company.phone}</p>
            <p>{company.email}</p>
          </div>

          <div className="footer-column social">
            <h4>Connect</h4>
            <p>Follow us on social media for updates and events.</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} {company.name}. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
}
