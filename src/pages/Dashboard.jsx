import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import StaffCalendar from '../components/StaffCalendar';
import StaffStudentsPanel from '../components/StaffStudentsPanel';
import ProfileSettings from '../components/ProfileSettings';
import AdminCalendar from '../components/AdminCalendar';

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
        if (role === 'admin') {
          const response = await api.get('/users/dashboard');
          setDashboardData(response.data);
        }

        const trainingResponse = await api.get('/trainings');
        setPrograms(trainingResponse.data.trainings || []);

        if (role === 'student') {
          const profileResponse = await api.get('/users/profile');
          setApplications(profileResponse.data.applications || []);
        }

        // For staff role we intentionally do not load global dashboard data — staff should only access
        // their own students and schedules via dedicated endpoints handled by the Staff components.

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

  // Enroll modal state and handlers
  const [enrollModal, setEnrollModal] = useState({ open: false, application: null, staffId: '' });
  const [adminToast, setAdminToast] = useState({ text: '', type: '' });

  // auto-dismiss admin toast
  useEffect(() => {
    if (!adminToast.text) return;
    const t = setTimeout(() => setAdminToast({ text: '', type: '' }), 3500);
    return () => clearTimeout(t);
  }, [adminToast]);

  const openEnrollModal = (application) => {
    setEnrollModal({ open: true, application, staffId: '' });
  };

  const closeEnrollModal = () => setEnrollModal({ open: false, application: null, staffId: '' });

  const handleConfirmEnrollment = async () => {
    if (!enrollModal?.application) return;
    const app = enrollModal.application;
    try {
      // mark application as enrolled
      await api.put(`/trainings/applications/${app._id}/status`, { status: 'enrolled' });

      // if admin selected a staff member, assign the student to that staff
      if (enrollModal.staffId) {
        // admin can call assign-student endpoint on behalf of staff
        await api.post(`/staff/${enrollModal.staffId}/assign-student`, { studentId: app.user._id });
      }

      // refresh dashboard data
      const response = await api.get('/users/dashboard');
      setDashboardData(response.data);
      // show success toast
      setAdminToast({ text: 'Successful student enrolment', type: 'success' });
      closeEnrollModal();
    } catch (error) {
      console.error('Confirm enrollment failed', error);
      setAdminToast({ text: error?.response?.data?.message || 'Enrollment failed', type: 'error' });
    }
  };

  const summary = dashboardData?.summary || defaultSummary;
  const recentActivity = dashboardData?.recentActivity || [];
  const userList = dashboardData?.users || [];
  const applicationsQueue = dashboardData?.applications || [];

  // derive set of users who already have an enrolled application
  const enrolledUserIds = new Set((applicationsQueue || []).filter((a) => a.status === 'enrolled').map((a) => a.user?._id));

  const [activeTab, setActiveTab] = useState('overview');

  // Shared small tab header
  const Tabs = ({ onChange }) => (
    <div className="dashboard-tabs">
      <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
      <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Settings</button>
    </div>
  );

  if (role === 'admin') {
    return (
      <section className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Portal</span>
            <h1>Admin dashboard</h1>
          </div>
          <div className="role-badge">{role}</div>
        </div>

        <Tabs />

        {activeTab === 'overview' && (
          <>
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

              <article className="dashboard-panel-card" style={{gridColumn: '1 / -1'}}>
                <h3>Admin calendar</h3>
                <AdminCalendar recentActivity={recentActivity} />
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
                        {application.status === 'enrolled' || enrolledUserIds.has(application.user?._id) ? (
                          <button type="button" className="ghost-btn small-btn" disabled>Already enrolled</button>
                        ) : (
                          <button type="button" className="secondary-btn small-btn" onClick={() => openEnrollModal(application)}>Enroll</button>
                        )}
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

            {/* Enrollment modal */}
            {enrollModal.open && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <div className="modal-header">
                    <strong>Enroll student</strong>
                    <button className="close-btn" onClick={closeEnrollModal}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Student:</strong> {enrollModal.application.user?.name} ({enrollModal.application.user?.email})</p>
                    <p><strong>Programme:</strong> {enrollModal.application.training?.title}</p>

                    <label style={{display:'block', marginTop:10}}>
                      Assign to staff (optional)
                      <select value={enrollModal.staffId} onChange={(e) => setEnrollModal((s) => ({...s, staffId: e.target.value}))}>
                        <option value="">Do not assign</option>
                        {userList.filter(u => u.role === 'staff').map(st => (
                          <option key={st._id} value={st._id}>{st.name} — {st.email}</option>
                        ))}
                      </select>
                    </label>

                  </div>
                  <div className="modal-footer">
                    <button className="ghost-btn" onClick={closeEnrollModal}>Cancel</button>
                    <button className="primary-btn" onClick={handleConfirmEnrollment}>Confirm enroll</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <ProfileSettings user={user} />
        )}
      </section>
    );
  }

  if (role === 'staff') {
    return (
      <section className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Portal</span>
            <h1>Staff dashboard</h1>
          </div>
          <div className="role-badge">{role}</div>
        </div>

        <Tabs />

        {activeTab === 'overview' && (
          <div className="dashboard-panels">
            <section style={{flex:1, minWidth:520}}>
              <h3>Class schedule</h3>
              <StaffCalendar user={user} />
            </section>

            <aside style={{width:360}} className="dashboard-panel-card">
              <h3>My students</h3>
              <StaffStudentsPanel user={user} />
            </aside>
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileSettings user={user} />
        )}
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

