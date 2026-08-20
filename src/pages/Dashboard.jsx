import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import StaffCalendar from '../components/StaffCalendar';
import StaffStudentsPanel from '../components/StaffStudentsPanel';
import ProfileSettings from '../components/ProfileSettings';
import AdminCalendar from '../components/AdminCalendar';
import StudentCalendar from '../components/StudentCalendar';
import { 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaBook, 
  FaTools, 
  FaClipboardCheck, 
  FaCertificate, 
  FaCalendarPlus, 
  FaClock, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

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
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [bookingModal, setBookingModal] = useState({ open: false, booking: null, staffId: '', action: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (role === 'admin') {
          const response = await api.get('/users/dashboard');
          setDashboardData(response.data);
          
          // Fetch bookings for admin
          try {
            const [pendingResponse, allBookingsResponse, usersResponse] = await Promise.all([
              api.get('/bookings/pending'),
              api.get('/bookings'),
              api.get('/users'),
            ]);
            
            setPendingBookings(pendingResponse.data.bookings || []);
            setAllBookings(allBookingsResponse.data.bookings || []);
            setStaffList((usersResponse.data.users || []).filter(u => u.role === 'staff'));
          } catch (error) {
            console.warn('Bookings endpoints not available:', error);
          }
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
      await api.put(`/trainings/applications/${app._id}/status`, { status: 'enrolled' });

      if (enrollModal.staffId) {
        await api.post(`/staff/${enrollModal.staffId}/assign-student`, { studentId: app.user._id });
      }

      const response = await api.get('/users/dashboard');
      setDashboardData(response.data);
      setAdminToast({ text: 'Successful student enrolment', type: 'success' });
      closeEnrollModal();
    } catch (error) {
      console.error('Confirm enrollment failed', error);
      setAdminToast({ text: error?.response?.data?.message || 'Enrollment failed', type: 'error' });
    }
  };

  // Handle booking review (approve/reject)
  const handleBookingReview = async () => {
    if (!bookingModal.booking) return;
    
    try {
      if (bookingModal.action === 'approve') {
        if (!bookingModal.staffId) {
          setAdminToast({ text: 'Please select a staff member to assign.', type: 'error' });
          return;
        }
        
        await api.put(`/bookings/${bookingModal.booking._id}`, {
          status: 'approved',
          assignedStaffId: bookingModal.staffId,
        });
        
        setAdminToast({ text: 'Booking approved successfully.', type: 'success' });
      } else if (bookingModal.action === 'reject') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        await api.put(`/bookings/${bookingModal.booking._id}`, {
          status: 'rejected',
          rejectionReason: reason,
        });
        
        setAdminToast({ text: 'Booking rejected.', type: 'success' });
      }
      
      // Refresh bookings
      const [pendingResponse, allResponse] = await Promise.all([
        api.get('/bookings/pending'),
        api.get('/bookings'),
      ]);
      
      setPendingBookings(pendingResponse.data.bookings || []);
      setAllBookings(allResponse.data.bookings || []);
      setBookingModal({ open: false, booking: null, staffId: '', action: '' });
      
    } catch (error) {
      console.error('Booking review failed:', error);
      setAdminToast({ text: error?.response?.data?.message || 'Failed to process booking.', type: 'error' });
    }
  };

  const summary = dashboardData?.summary || defaultSummary;
  const recentActivity = dashboardData?.recentActivity || [];
  const userList = dashboardData?.users || [];
  const applicationsQueue = dashboardData?.applications || [];

  const enrolledUserIds = new Set((applicationsQueue || []).filter((a) => a.status === 'enrolled').map((a) => a.user?._id));

  const [activeTab, setActiveTab] = useState('overview');

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

        {adminToast.text && (
          <div className={`toast ${adminToast.type}`}>
            {adminToast.text}
          </div>
        )}

        <div className="dashboard-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Cubicle Bookings</button>
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Settings</button>
        </div>

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
              <div className="metric-card">
                <span>Pending Bookings</span>
                <strong>{pendingBookings.length}</strong>
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

        {activeTab === 'bookings' && (
          <>
            <div className="dashboard-table-card">
              <h3>Pending Cubicle Bookings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Cubicle</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.length > 0 ? pendingBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.user?.name}</td>
                      <td>{booking.cubicle?.name}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.startTime} - {booking.endTime}</td>
                      <td>{booking.purpose}</td>
                      <td>
                        <button 
                          className="secondary-btn small-btn" 
                          style={{ marginRight: '0.5rem' }}
                          onClick={() => setBookingModal({ open: true, booking, staffId: '', action: 'approve' })}
                        >
                          Approve
                        </button>
                        <button 
                          className="ghost-btn small-btn"
                          onClick={() => setBookingModal({ open: true, booking, staffId: '', action: 'reject' })}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6">No pending bookings.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="dashboard-table-card">
              <h3>All Cubicle Bookings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Cubicle</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Assigned Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.length > 0 ? allBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.user?.name}</td>
                      <td>{booking.cubicle?.name}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td><span className={`status-pill ${booking.status}`}>{booking.status}</span></td>
                      <td>{booking.assignedStaff?.name || 'Not assigned'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5">No bookings yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <ProfileSettings user={user} />
        )}

        {bookingModal.open && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <strong>{bookingModal.action === 'approve' ? 'Approve Booking' : 'Reject Booking'}</strong>
                <button className="close-btn" onClick={() => setBookingModal({ open: false, booking: null, staffId: '', action: '' })}>&times;</button>
              </div>
              <div className="modal-body">
                <p><strong>Student:</strong> {bookingModal.booking.user?.name}</p>
                <p><strong>Cubicle:</strong> {bookingModal.booking.cubicle?.name}</p>
                <p><strong>Date:</strong> {new Date(bookingModal.booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {bookingModal.booking.startTime} - {bookingModal.booking.endTime}</p>
                <p><strong>Purpose:</strong> {bookingModal.booking.purpose}</p>
                
                {bookingModal.action === 'approve' && (
                  <label style={{display:'block', marginTop: 15}}>
                    Assign Staff Member
                    <select 
                      value={bookingModal.staffId} 
                      onChange={(e) => setBookingModal({ ...bookingModal, staffId: e.target.value })}
                      required
                    >
                      <option value="">Select staff member</option>
                      {staffList.map(staff => (
                        <option key={staff._id} value={staff._id}>{staff.name}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="modal-footer">
                <button className="ghost-btn" onClick={() => setBookingModal({ open: false, booking: null, staffId: '', action: '' })}>Cancel</button>
                <button 
                  className={bookingModal.action === 'approve' ? 'primary-btn' : 'secondary-btn'} 
                  onClick={handleBookingReview}
                >
                  {bookingModal.action === 'approve' ? 'Approve Booking' : 'Reject Booking'}
                </button>
              </div>
            </div>
          </div>
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

        <div className="dashboard-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Settings</button>
        </div>

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

  // Student Dashboard
  return <StudentDashboardContent 
    user={user}
    programs={programs}
    applications={applications}
    selectedProgramId={selectedProgramId}
    setSelectedProgramId={setSelectedProgramId}
    notes={notes}
    setNotes={setNotes}
    message={message}
    setMessage={setMessage}
    handleApplicationSubmit={handleApplicationSubmit}
  />;
}

// Student Dashboard Content Component (Real MongoDB Integration)
function StudentDashboardContent({ 
  user, 
  programs, 
  applications, 
  selectedProgramId, 
  setSelectedProgramId, 
  notes, 
  setNotes, 
  message, 
  setMessage,
  handleApplicationSubmit 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cubicles, setCubicles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    cubicleId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  // Check if student has active enrollment
  const hasActiveEnrollment = applications.some(app => 
    app.status === 'enrolled' || app.status === 'accepted' || app.status === 'applied'
  );

  // Fetch student data from MongoDB
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled programs from applications
        const enrolled = applications.filter(app => 
          app.status === 'enrolled' || app.status === 'accepted'
        );
        setEnrolledPrograms(enrolled);
        
        // Fetch cubicles
        try {
          const cubiclesResponse = await api.get('/cubicles');
          setCubicles(cubiclesResponse.data.cubicles || []);
        } catch (error) {
          console.warn('Cubicles endpoint not available yet:', error);
          setCubicles([]);
        }
        
        // Fetch student bookings
        try {
          const bookingsResponse = await api.get('/bookings/my-bookings');
          setBookings(bookingsResponse.data.bookings || []);
        } catch (error) {
          console.warn('Bookings endpoint not available yet:', error);
          setBookings([]);
        }
        
        // Fetch student schedules
        try {
          const schedulesResponse = await api.get('/schedules', {
            params: { student: user._id }
          });
          setSchedules(schedulesResponse.data.schedules || []);
        } catch (error) {
          console.warn('Schedules fetch failed:', error);
          setSchedules([]);
        }
        
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [applications, user._id]);

  // Generate calendar events from real data
  const generateCalendarEvents = () => {
    const events = [];
    
    // Add schedule events
    schedules.forEach(schedule => {
      events.push({
        title: `📚 ${schedule.title}`,
        start: new Date(schedule.start),
        end: new Date(schedule.end),
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        extendedProps: {
          type: 'class',
          location: schedule.location || 'TBD',
          description: schedule.description,
          staff: schedule.staff?.name
        }
      });
    });
    
    // Add booking events
    bookings.forEach(booking => {
      if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        events.push({
          title: `🔧 ${booking.cubicle?.name || 'Cubicle Booking'}`,
          start: `${bookingDate}T${booking.startTime}`,
          end: `${bookingDate}T${booking.endTime}`,
          backgroundColor: booking.status === 'approved' ? '#2196F3' : '#FF9800',
          borderColor: booking.status === 'approved' ? '#2196F3' : '#FF9800',
          extendedProps: {
            type: 'booking',
            status: booking.status,
            purpose: booking.purpose
          }
        });
      }
    });
    
    return events;
  };

  // Handle booking submission with real API call
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/bookings', {
        cubicleId: bookingForm.cubicleId,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose: bookingForm.purpose
      });
      
      setBookings([...bookings, response.data.booking]);
      setBookingForm({ cubicleId: '', date: '', startTime: '', endTime: '', purpose: '' });
      setShowBookingModal(false);
      setMessage('Booking requested successfully! Awaiting admin approval.');
      
    } catch (error) {
      console.error('Booking failed:', error);
      setMessage(error?.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.delete(`/bookings/${bookingId}`);
      
      // Refresh bookings
      const bookingsResponse = await api.get('/bookings/my-bookings');
      setBookings(bookingsResponse.data.bookings || []);
      
    } catch (error) {
      console.error('Cancel booking failed:', error);
      alert(error?.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const timeSlots = [
    { start: '08:00', end: '10:00', label: '08:00 - 10:00' },
    { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
    { start: '13:00', end: '15:00', label: '13:00 - 15:00' },
    { start: '15:00', end: '17:00', label: '15:00 - 17:00' },
  ];

  const renderOverviewTab = () => (
    <div className="student-overview">
      <div className="student-stats-grid">
        <div className="student-stat-card">
          <FaUserGraduate className="student-stat-icon" />
          <div>
            <h3>{enrolledPrograms.length}</h3>
            <p>Enrolled Programs</p>
          </div>
        </div>
        <div className="student-stat-card">
          <FaBook className="student-stat-icon" />
          <div>
            <h3>{schedules.length}</h3>
            <p>Scheduled Sessions</p>
          </div>
        </div>
        <div className="student-stat-card">
          <FaCalendarAlt className="student-stat-icon" />
          <div>
            <h3>{bookings.filter(b => b.status === 'approved').length}</h3>
            <p>Approved Bookings</p>
          </div>
        </div>
        <div className="student-stat-card">
          <FaClipboardCheck className="student-stat-icon" />
          <div>
            <h3>{applications.filter(a => a.status === 'applied').length}</h3>
            <p>Pending Applications</p>
          </div>
        </div>
      </div>

      <div className="red-seal-banner">
        <FaCertificate className="red-seal-icon" />
        <div>
          <h3>Red Seal Qualification Candidate</h3>
          <p>Complete your practical hours and assessments to qualify for trade certification.</p>
        </div>
      </div>

      <div className="enrolled-programs-section">
        <h3>My Enrolled Programs</h3>
        {loading ? (
          <p>Loading your programs...</p>
        ) : enrolledPrograms.length > 0 ? (
          enrolledPrograms.map(enrollment => {
            const training = enrollment.training;
            
            return (
              <div key={enrollment._id} className="program-card">
                <div className="program-header">
                  <div className="program-title">
                    <h4>{training?.title || 'Program'}</h4>
                    <span className="program-code">{training?.category || 'Training'}</span>
                  </div>
                  <div className="program-status">
                    <span className={`status-pill ${enrollment.status}`}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>
                
                <div className="program-info-grid">
                  <div><strong>Type:</strong> {training?.type || 'N/A'}</div>
                  <div><strong>Duration:</strong> {training?.duration || 'N/A'}</div>
                  <div><strong>Facilitator:</strong> {training?.facilitator || 'TBD'}</div>
                  <div><strong>Dates:</strong> {training?.startDate ? new Date(training.startDate).toLocaleDateString() : 'N/A'} to {training?.endDate ? new Date(training.endDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                
                {training?.description && (
                  <p className="program-description">{training.description}</p>
                )}
                
                {enrollment.notes && (
                  <div className="enrollment-notes">
                    <strong>Notes:</strong> {enrollment.notes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>You are not enrolled in any programs yet.</p>
            <p>Apply for a program to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendarTab = () => (
    <div className="student-calendar-tab">
      <StudentCalendar events={generateCalendarEvents()} />
    </div>
  );

  const renderScheduleTab = () => (
    <div className="student-schedule-tab">
      <h3>My Schedule</h3>
      {loading ? (
        <p>Loading your schedule...</p>
      ) : schedules.length > 0 ? (
        <div className="schedule-items">
          {schedules.map((schedule, idx) => (
            <div key={idx} className="schedule-item class-item">
              <FaBook className="schedule-icon" />
              <div className="schedule-details">
                <h5>{schedule.title}</h5>
                {schedule.description && <p>{schedule.description}</p>}
                <p>{new Date(schedule.start).toLocaleDateString()} at {new Date(schedule.start).toLocaleTimeString()}</p>
                <p className="schedule-location">
                  <FaMapMarkerAlt /> {schedule.location || 'TBD'}
                </p>
                {schedule.staff && (
                  <p className="schedule-staff">
                    Facilitator: {schedule.staff.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No scheduled sessions for you yet.</p>
      )}
    </div>
  );

  const renderBookingsTab = () => (
    <div className="student-bookings-tab">
      <div className="bookings-header">
        <h3>Practical Cubicle Bookings</h3>
        <button className="primary-btn" onClick={() => setShowBookingModal(true)}>
          <FaCalendarPlus /> New Booking
        </button>
      </div>

      <div className="cubicles-grid">
        {cubicles.length > 0 ? cubicles.map(cubicle => (
          <div key={cubicle._id} className="cubicle-card">
            <div className="cubicle-header">
              <FaTools className="cubicle-icon" />
              <h4>{cubicle.name}</h4>
            </div>
            <p className="cubicle-type">{cubicle.type}</p>
            <p className="cubicle-location">
              <FaMapMarkerAlt /> {cubicle.location}
            </p>
            {cubicle.equipment && cubicle.equipment.length > 0 && (
              <div className="cubicle-equipment">
                {cubicle.equipment.map((item, idx) => (
                  <span key={idx} className="equipment-tag">{item}</span>
                ))}
              </div>
            )}
            <div className={`availability-badge ${cubicle.status === 'available' ? 'available' : 'occupied'}`}>
              {cubicle.status}
            </div>
            <button 
              className={`btn ${cubicle.status === 'available' ? 'btn-primary' : 'btn-disabled'}`}
              disabled={cubicle.status !== 'available'}
              onClick={() => {
                setBookingForm({ ...bookingForm, cubicleId: cubicle._id });
                setShowBookingModal(true);
              }}
            >
              {cubicle.status === 'available' ? 'Book This Cubicle' : 'Not Available'}
            </button>
          </div>
        )) : (
          <p className="empty-state">No cubicles available.</p>
        )}
      </div>

      <div className="my-bookings">
        <h3>My Bookings</h3>
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} className="booking-item">
              <div className="booking-info">
                <FaClock className="booking-icon" />
                <div>
                  <h4>{booking.cubicle?.name || 'Cubicle'}</h4>
                  <p>{new Date(booking.date).toLocaleDateString()} | {booking.startTime} - {booking.endTime}</p>
                  {booking.purpose && <p className="booking-purpose">{booking.purpose}</p>}
                  {booking.assignedStaff && (
                    <p className="booking-staff">
                      Assigned Staff: {booking.assignedStaff.name}
                    </p>
                  )}
                  {booking.rejectionReason && (
                    <p className="booking-rejection">
                      Reason: {booking.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
              <div className="booking-actions">
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
                {(booking.status === 'pending' || booking.status === 'approved') && (
                  <button 
                    className="ghost-btn small-btn"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No bookings yet. Book a cubicle for your practical sessions.</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="dashboard-page student-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Student portal</span>
          <h1>My Learning Dashboard</h1>
        </div>
        <div className="role-badge">{user?.role || 'student'}</div>
      </div>

      <div className="student-dashboard-tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>Calendar</button>
        <button className={`tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
        <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Cubicle Bookings</button>
        <button className={`tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>Course Applications</button>
      </div>

      <div className="student-dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'applications' && (
          <div className="applications-tab">
            {hasActiveEnrollment ? (
              <div className="dashboard-table-card">
                <h3>Active Enrollment</h3>
                <p className="enrollment-notice">
                  You currently have an active course/program enrollment. 
                  You must complete your current program before applying for a new one.
                </p>
              </div>
            ) : (
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
            )}

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
          </div>
        )}
      </div>

      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book a Cubicle</h3>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Select Cubicle</label>
                <select 
                  value={bookingForm.cubicleId}
                  onChange={(e) => setBookingForm({ ...bookingForm, cubicleId: e.target.value })}
                  required
                >
                  <option value="">Choose a cubicle</option>
                  {cubicles.filter(c => c.status === 'available').map(cubicle => (
                    <option key={cubicle._id} value={cubicle._id}>
                      {cubicle.name} - {cubicle.type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select 
                  value={`${bookingForm.startTime}-${bookingForm.endTime}`}
                  onChange={(e) => {
                    const [start, end] = e.target.value.split('-');
                    setBookingForm({ ...bookingForm, startTime: start, endTime: end });
                  }}
                  required
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot, idx) => (
                    <option key={idx} value={`${slot.start}-${slot.end}`}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <textarea 
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                  placeholder="What will you be practicing?"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}