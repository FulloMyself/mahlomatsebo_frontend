import React, { useState } from 'react';
import api, { setAuthToken } from '../api';
import { demoCredentials } from '../data/siteContent';

const roles = ['student', 'staff', 'admin'];

const emptyRegistration = {
  name: '',
  idNumber: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  province: '',
  employmentStatus: '',
  desiredProgram: '',
  motivation: '',
  password: '',
};

export default function Auth({ onSignIn }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [mode, setMode] = useState('login');
  const [loginUser, setLoginUser] = useState('');
  const [password, setPassword] = useState('');
  const [registration, setRegistration] = useState(emptyRegistration);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    const demo = demoCredentials[selectedRole];
    const enteredUser = loginUser.trim().toLowerCase();
    const email = enteredUser.includes('@') ? enteredUser : demo.email;

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (enteredUser && enteredUser !== demo.username && !enteredUser.includes('@')) {
      setError(`Use the ${selectedRole} demo username or email for this role.`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const user = {
        ...response.data,
        role: response.data.role || selectedRole,
      };

      setAuthToken(user.token);
      onSignIn(user);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Authentication failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    const demo = demoCredentials[selectedRole];
    setLoginUser(demo.username);
    setPassword(demo.password);
    setError('');
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (!registration.name || !registration.email || !registration.password) {
      setError('Please complete your name, email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/auth/register', {
        ...registration,
        email: registration.email.toLowerCase(),
        role: 'student',
      });

      const user = {
        ...response.data,
        role: response.data.role || 'student',
      };

      setAuthToken(user.token);
      onSignIn(user);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Registration failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Member portal</span>
          <h1>{mode === 'login' ? 'Sign in to your role dashboard' : 'Register as a student'}</h1>
        </div>

        <div className="mode-switch">
          <button type="button" className={mode === 'login' ? 'secondary-btn active' : 'secondary-btn'} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'secondary-btn active' : 'secondary-btn'} onClick={() => setMode('register')}>Register</button>
        </div>

        {mode === 'login' && (
          <>
            <div className="role-tabs" role="tablist" aria-label="Role tabs">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={selectedRole === role ? 'role-tab active' : 'role-tab'}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label>
                Username or email
                <input
                  type="text"
                  value={loginUser}
                  onChange={(event) => setLoginUser(event.target.value)}
                  placeholder={demoCredentials[selectedRole].username}
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={demoCredentials[selectedRole].password}
                />
              </label>

              {error && <p className="field-error">{error}</p>}

              <div className="auth-actions">
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'Continue'}
                </button>
                <button type="button" className="secondary-btn" onClick={fillDemoCredentials}>Use demo login</button>
              </div>
            </form>
          </>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form register-form">
            <div className="form-two-column">
              <label>
                Full name
                <input
                  type="text"
                  value={registration.name}
                  onChange={(event) => setRegistration({ ...registration, name: event.target.value })}
                  placeholder="Your full name"
                />
              </label>

              <label>
                ID / Passport number
                <input
                  type="text"
                  value={registration.idNumber}
                  onChange={(event) => setRegistration({ ...registration, idNumber: event.target.value })}
                  placeholder="ID or passport number"
                />
              </label>
            </div>

            <div className="form-two-column">
              <label>
                Date of birth
                <input
                  type="date"
                  value={registration.dateOfBirth}
                  onChange={(event) => setRegistration({ ...registration, dateOfBirth: event.target.value })}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={registration.email}
                  onChange={(event) => setRegistration({ ...registration, email: event.target.value })}
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <div className="form-two-column">
              <label>
                Phone number
                <input
                  type="tel"
                  value={registration.phone}
                  onChange={(event) => setRegistration({ ...registration, phone: event.target.value })}
                  placeholder="071 234 5678"
                />
              </label>

              <label>
                Province
                <input
                  type="text"
                  value={registration.province}
                  onChange={(event) => setRegistration({ ...registration, province: event.target.value })}
                  placeholder="Gauteng"
                />
              </label>
            </div>

            <label>
              Residential address
              <input
                type="text"
                value={registration.address}
                onChange={(event) => setRegistration({ ...registration, address: event.target.value })}
                placeholder="Street, suburb, city"
              />
            </label>

            <div className="form-two-column">
              <label>
                Employment status
                <select
                  value={registration.employmentStatus}
                  onChange={(event) => setRegistration({ ...registration, employmentStatus: event.target.value })}
                >
                  <option value="">Select one</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="self-employed">Self-employed</option>
                </select>
              </label>

              <label>
                Desired programme
                <select
                  value={registration.desiredProgram}
                  onChange={(event) => setRegistration({ ...registration, desiredProgram: event.target.value })}
                >
                  <option value="">Choose a programme</option>
                  <option value="ECD Foundations Programme">ECD Foundations Programme</option>
                  <option value="First Aid Level 2">First Aid Level 2</option>
                  <option value="Basic Fire Fighting Essentials">Basic Fire Fighting Essentials</option>
                  <option value="Emergency Preparedness">Emergency Preparedness</option>
                  <option value="OHS Practitioner Training">OHS Practitioner Training</option>
                </select>
              </label>
            </div>

            <label>
              Motivation / background
              <textarea
                value={registration.motivation}
                onChange={(event) => setRegistration({ ...registration, motivation: event.target.value })}
                placeholder="Tell us why you want to join this training or programme."
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={registration.password}
                onChange={(event) => setRegistration({ ...registration, password: event.target.value })}
                placeholder="Create a password"
              />
            </label>

            {error && <p className="field-error">{error}</p>}

            <div className="auth-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Create Student Account'}
              </button>
            </div>
          </form>
        )}

        <div className="demo-box">
          <strong>Demo credentials</strong>
          <ul>
            {Object.entries(demoCredentials).map(([role, creds]) => (
              <li key={role}>
                <span>{role}</span>
                <code>{creds.email}</code>
                <code>{creds.password}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
