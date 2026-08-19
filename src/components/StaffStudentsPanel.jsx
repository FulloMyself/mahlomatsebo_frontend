import React, { useEffect, useState } from 'react';
import api from '../api';

export default function StaffStudentsPanel({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const resp = await api.get(`/staff/${user._id}/students`);
        setStudents(resp.data.students || []);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleAssign = async () => {
    const email = prompt('Student email to assign to you:');
    if (!email) return;
    try {
      // Find student by email
      const usersResp = await api.get('/users');
      const found = (usersResp.data.users || []).find((u) => u.email === email);
      if (!found) return alert('Student not found');
      await api.post(`/staff/${user._id}/assign-student`, { studentId: found._id });
      setStudents((prev) => [...prev, found]);
    } catch (err) {
      console.error('Assign failed', err);
      alert(err?.response?.data?.message || 'Could not assign student');
    }
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div>
      <button type="button" className="primary-btn" onClick={handleAssign} style={{marginBottom:12}}>Assign student</button>
      {students.length === 0 ? (
        <p>No students assigned yet.</p>
      ) : (
        <ul className="student-list">
          {students.map((s) => (
            <li key={s._id} className="student-list-item">
              <div>
                <strong>{s.name}</strong>
                <div className="muted">{s.email}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
