import React, { useEffect, useState } from 'react';
import api from '../api';

const defaultSummary = {
  totalUsers: 0,
  totalStudents: 0,
  totalStaff: 0,
  totalAdmins: 0,
  activePrograms: 0,
  totalApplications: 0,
};

export default function Dashboard({ user }) {
  const role = user?.role || 'student';
  const [dashboardData, setDashboardData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        if (role === 'admin' || role === 'staff') {
          const response = await api.get('/users/dashboard');
          setDashboardData(response.data);
        }

        const trainingResponse = await api.get('/trainings');
        setPrograms(trainingResponse.data.trainings || []);

        if (role === 'student') {
          const profileResponse = await api.get('/users/profile');
          setApplications(profileResponse.data.applications || []);
        }
      } catch (error) {
        console.error('Dashboard load failed', error);
      }
    };

    loadData();
  }, [role]);

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProgramId) {
      setMessage('Please select a programme or course.');
      return;
    }

    try {
      await api.post('/trainings/apply', {
        trainingId: selectedProgramId,
        notes,
      });

      setMessage('Application submitted successfully.');
      setNotes('');
      setSelectedProgramId('');

      const profileResponse = await api.get('/users/profile');
      setApplications(profileResponse.data.applications || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to submit your application.');
    }
  };

  const handleEnrollmentUpdate = async (id, status) => {
    try {
      await api.put(`/trainings/applications/${id}/status`, { status });
      const response = await api.get('/users/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Enrollment update failed', error);
    }
  };

  const summary = dashboardData?.summary || defaultSummary;
  const recentActivity = dashboardData?.recentActivity || [];
  const userList = dashboardData?.users || [];
  const applicationsQueue = dashboardData?.applications || [];

  if (role === 'admin' || role === 'staff') {
    return (
      <section className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Portal</span>
            <h1>{role === 'admin' ? 'Admin dashboard' : 'Staff dashboard'}</h1>
          </div>
          <div className="role-badge">{role}</div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span>Total users</span>
            <strong>{summary.totalUsers}</strong>
          </div>
          <div className="metric-card">
            <span>Students</span>
            <strong>{summary.totalStudents}</strong>
          </div>
          <div className="metric-card">
            <span>Staff</span>
            <strong>{summary.totalStaff}</strong>
          </div>
          <div className="metric-card">
            <span>Applications</span>
            <strong>{summary.totalApplications}</strong>
          </div>
          <div className="metric-card">
            <span>Active programmes</span>
            <strong>{summary.activePrograms}</strong>
          </div>
        </div>

        <div className="dashboard-panels">
          <article className="dashboard-panel-card">
            <h3>Live user overview</h3>
            <p>Track who has access to the learning platform, who is active, and which roles are being managed.</p>
          </article>
          <article className="dashboard-panel-card">
            <h3>Programme oversight</h3>
            <p>Review scheduled programmes, capacity, and active enrolment activity across all courses and pathways.</p>
          </article>
          <article className="dashboard-panel-card">
            <h3>Admission control</h3>
            <p>Accept student applications and confirm their placement for the course or programme they selected.</p>
          </article>
        </div>

        <div className="dashboard-table-card">
          <h3>Application queue</h3>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Programme</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applicationsQueue.length > 0 ? applicationsQueue.map((application) => (
                <tr key={application._id}>
                  <td>{application.user?.name}</td>
                  <td>{application.training?.title}</td>
                  <td><span className="status-pill ok">{application.status}</span></td>
                  <td>
                    <button type="button" className="secondary-btn small-btn" onClick={() => handleEnrollmentUpdate(application._id, 'enrolled')}>Enroll</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4">No applications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-table-card">
          <h3>Recent activity</h3>
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? recentActivity.map((entry, index) => (
                <tr key={`${entry.label}-${index}`}>
                  <td>{entry.label}</td>
                  <td><span className="status-pill ok">{entry.status}</span></td>
                  <td>{new Date(entry.updatedAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3">No activity yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-table-card">
          <h3>Users</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((person) => (
                <tr key={person._id}>
                  <td>{person.name}</td>
                  <td>{person.email}</td>
                  <td>{person.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Student portal</span>
          <h1>My student dashboard</h1>
        </div>
        <div className="role-badge">{user?.role || 'student'}</div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Student name</span>
          <strong>{user?.name || 'Learner'}</strong>
        </div>
        <div className="metric-card">
          <span>Applications</span>
          <strong>{applications.length}</strong>
        </div>
        <div className="metric-card">
          <span>Available programmes</span>
          <strong>{programs.length}</strong>
        </div>
      </div>

      <div className="dashboard-panels">
        <article className="dashboard-panel-card">
          <h3>Application status</h3>
          <p>Track the programmes you have applied for and wait for admin confirmation.</p>
        </article>
        <article className="dashboard-panel-card">
          <h3>Study support</h3>
          <p>Access upcoming sessions, note requests, and follow-up communication from staff.</p>
        </article>
      </div>

      <div className="dashboard-table-card">
        <h3>Apply for a new course or programme</h3>
        <form className="student-form" onSubmit={handleApplicationSubmit}>
          <label>
            Select programme
            <select value={selectedProgramId} onChange={(event) => setSelectedProgramId(event.target.value)}>
              <option value="">Choose a course or programme</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>{program.title}</option>
              ))}
            </select>
          </label>
          <label>
            Motivation / notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Tell us why you want to join this learning pathway." />
          </label>
          <button type="submit" className="primary-btn">Apply now</button>
        </form>
        {message && <p className="form-success">{message}</p>}
      </div>

      <div className="dashboard-table-card">
        <h3>My applications</h3>
        <table>
          <thead>
            <tr>
              <th>Programme</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? applications.map((application) => (
              <tr key={application._id}>
                <td>{application.training?.title || 'Programme'}</td>
                <td><span className="status-pill ok">{application.status}</span></td>
                <td>{new Date(application.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3">No applications submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

