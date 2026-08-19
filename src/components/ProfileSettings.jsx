import React, { useEffect, useState } from 'react';
import api from '../apiClient';

export default function ProfileSettings({ user, onProfileUpdate }) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', department: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get('/users/profile');
        const profile = resp.data.user || {};
        setForm({ name: profile.name || '', phone: profile.phone || '', department: profile.department || '' });
        setRole(profile.role || '');
        setEmail(profile.email || '');
      } catch (err) {
        console.error('Failed loading profile', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const resp = await api.put('/users/profile', form);
      setMessage('Profile updated successfully');
      setMessageType('success');
      if (onProfileUpdate) onProfileUpdate(resp.data.user);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Unable to update profile');
      setMessageType('error');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      await api.put('/users/profile/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setMessage('Password changed successfully');
      setMessageType('success');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Unable to change password');
      setMessageType('error');
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-settings">
      <h3>Profile settings</h3>
      {message && <div className={`toast-message ${messageType}`}>{message}</div>}
      <form onSubmit={saveProfile} className="profile-form">
        <label className="full-row">
          Role
          <input name="role" value={role} readOnly disabled />
          <small className="helper-text">Your role is managed by the system and cannot be changed here.</small>
        </label>

        <label className="full-row">
          Email
          <input name="email" value={email} readOnly disabled />
          <small className="helper-text">Email address is managed centrally and cannot be edited here.</small>
        </label>

        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>

        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>

        <label className="full-row">
          Department
          <input name="department" value={form.department} onChange={handleChange} />
        </label>

        <div className="actions full-row">
          <button type="submit" className="primary-btn">Save profile</button>
        </div>
      </form>

      <hr />

      <h4>Change password</h4>
      <form onSubmit={changePassword} className="password-form">
        <label>
          Current password
          <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePassChange} />
        </label>
        <label>
          New password
          <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePassChange} />
        </label>
        <div className="actions full-row">
          <button type="submit" className="primary-btn">Change password</button>
        </div>
      </form>
    </div>
  );
}
