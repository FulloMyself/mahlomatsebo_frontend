import React, { useEffect, useState } from 'react';
import api from '../apiClient';

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

  if (loading) return <div>Loading students...</div>;

  return (
    <div>
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
