import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiClient';
import ProfileSettings from './ProfileSettings';

const emptyLeave = { employeeId: '', leaveType: 'annual', startDate: '', endDate: '', reason: '' };
const emptyPayroll = { employeeId: '', period: '', grossAmount: '', deductions: '', notes: '' };

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');
const statusClass = (status) => (status === 'approved' || status === 'paid' ? 'ok' : status === 'rejected' ? 'danger' : '');

function SummaryCards({ summary, admin = false }) {
  const cards = [
    ['Staff members', summary.staff || 0],
    ['Students', summary.students || 0],
    ['Pending leave', summary.pendingLeave || 0],
    ['Pending payroll', summary.pendingPayroll || 0],
  ];
  return (
    <div className="metric-grid">
      {cards.map(([label, value]) => (
        <div className="metric-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      {admin && (
        <div className="metric-card">
          <span>HR users</span>
          <strong>{summary.hrUsers || 0}</strong>
        </div>
      )}
    </div>
  );
}

function PeopleTables({ staff, students }) {
  return (
    <div className="dashboard-panels">
      <div className="dashboard-table-card">
        <h3>Staff members</h3>
        <table>
          <thead><tr><th>Name</th><th>Department</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person._id}>
                <td>{person.name}<br /><small>{person.email}</small></td>
                <td>{person.department || '-'}</td>
                <td>{person.phone || '-'}</td>
                <td><span className={`status-pill ${statusClass(person.status)}`}>{person.status}</span></td>
              </tr>
            ))}
            {!staff.length && <tr><td colSpan="4">No staff records found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="dashboard-table-card">
        <h3>Students</h3>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Programme</th><th>Status</th></tr></thead>
          <tbody>
            {students.map((person) => (
              <tr key={person._id}>
                <td>{person.name}</td>
                <td>{person.email}</td>
                <td>{person.desiredProgram || '-'}</td>
                <td><span className={`status-pill ${statusClass(person.status)}`}>{person.status}</span></td>
              </tr>
            ))}
            {!students.length && <tr><td colSpan="4">No student records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaveTable({ leaveRequests, admin, onReview }) {
  return (
    <div className="dashboard-table-card">
      <h3>Staff leave</h3>
      <table>
        <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {leaveRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.employee?.name || '-'}</td>
              <td>{request.leaveType}</td>
              <td>{formatDate(request.startDate)} - {formatDate(request.endDate)}</td>
              <td>{request.reason}</td>
              <td><span className={`status-pill ${statusClass(request.status)}`}>{request.status}</span></td>
              <td>{admin && request.status === 'pending' ? (
                <>
                  <button className="secondary-btn small-btn" onClick={() => onReview('leave', request._id, 'approved')}>Approve</button>{' '}
                  <button className="ghost-btn small-btn" onClick={() => onReview('leave', request._id, 'rejected')}>Reject</button>
                </>
              ) : request.reviewedBy?.name || 'Awaiting Admin'}</td>
            </tr>
          ))}
          {!leaveRequests.length && <tr><td colSpan="6">No leave requests found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function PayrollTable({ payrollRecords, admin, onReview }) {
  return (
    <div className="dashboard-table-card">
      <h3>Staff payroll</h3>
      <table>
        <thead><tr><th>Employee</th><th>Period</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {payrollRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.employee?.name || '-'}</td>
              <td>{record.period}</td>
              <td>R {Number(record.grossAmount).toFixed(2)}</td>
              <td>R {Number(record.deductions).toFixed(2)}</td>
              <td>R {Number(record.netAmount).toFixed(2)}</td>
              <td><span className={`status-pill ${statusClass(record.status)}`}>{record.status}</span></td>
              <td>{admin && record.status === 'submitted' ? (
                <>
                  <button className="secondary-btn small-btn" onClick={() => onReview('payroll', record._id, 'approved')}>Approve</button>{' '}
                  <button className="ghost-btn small-btn" onClick={() => onReview('payroll', record._id, 'rejected')}>Reject</button>
                </>
              ) : record.approvedBy?.name || 'Awaiting Admin'}</td>
            </tr>
          ))}
          {!payrollRecords.length && <tr><td colSpan="7">No payroll records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function HRDashboard({ user }) {
  const [data, setData] = useState({ summary: {}, staff: [], students: [], leaveRequests: [], payrollRecords: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveForm, setLeaveForm] = useState(emptyLeave);
  const [payrollForm, setPayrollForm] = useState(emptyPayroll);
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await api.get('/hr/overview');
    setData(response.data);
  };

  useEffect(() => {
    load().catch((error) => setMessage(error?.response?.data?.message || 'Unable to load HR data.'));
  }, []);

  const submit = async (event, type) => {
    event.preventDefault();
    try {
      if (type === 'leave') await api.post('/hr/leave', leaveForm);
      else await api.post('/hr/payroll', payrollForm);
      setMessage(`${type === 'leave' ? 'Leave request' : 'Payroll record'} submitted for Admin approval.`);
      type === 'leave' ? setLeaveForm(emptyLeave) : setPayrollForm(emptyPayroll);
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to save HR record.');
    }
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-header"><div><span className="eyebrow">People operations</span><h1>HR dashboard</h1></div><div className="role-badge">hr</div></div>
      {message && <div className="toast-message">{message}</div>}
      <div className="dashboard-tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>Staff leave</button>
        <button className={`tab ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>Staff payroll</button>
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile settings</button>
      </div>
      {activeTab === 'overview' && <><SummaryCards summary={data.summary} /><PeopleTables staff={data.staff} students={data.students} /><LeaveTable leaveRequests={data.leaveRequests} /><PayrollTable payrollRecords={data.payrollRecords} /></>}
      {activeTab === 'leave' && (
        <div className="dashboard-panels">
          <form className="dashboard-panel-card auth-form" onSubmit={(event) => submit(event, 'leave')}>
            <h3>Submit staff leave</h3>
            <label>Staff member<select required value={leaveForm.employeeId} onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}><option value="">Select staff</option>{data.staff.filter((person) => person.role === 'staff').map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}</select></label>
            <label>Leave type<select value={leaveForm.leaveType} onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}><option value="annual">Annual</option><option value="sick">Sick</option><option value="family-responsibility">Family responsibility</option><option value="unpaid">Unpaid</option><option value="other">Other</option></select></label>
            <div className="form-grid"><label>Start date<input required type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} /></label><label>End date<input required type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} /></label></div>
            <label>Reason<textarea required value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} /></label>
            <button className="primary-btn" type="submit">Submit for Admin approval</button>
          </form>
          <LeaveTable leaveRequests={data.leaveRequests} />
        </div>
      )}
      {activeTab === 'payroll' && (
        <div className="dashboard-panels">
          <form className="dashboard-panel-card auth-form" onSubmit={(event) => submit(event, 'payroll')}>
            <h3>Create payroll record</h3>
            <label>Staff member<select required value={payrollForm.employeeId} onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}><option value="">Select staff</option>{data.staff.filter((person) => person.role === 'staff').map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}</select></label>
            <label>Payroll period<input required placeholder="September 2026" value={payrollForm.period} onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })} /></label>
            <div className="form-grid"><label>Gross amount<input required type="number" min="0" step="0.01" value={payrollForm.grossAmount} onChange={(e) => setPayrollForm({ ...payrollForm, grossAmount: e.target.value })} /></label><label>Deductions<input type="number" min="0" step="0.01" value={payrollForm.deductions} onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })} /></label></div>
            <label>Notes<textarea value={payrollForm.notes} onChange={(e) => setPayrollForm({ ...payrollForm, notes: e.target.value })} /></label>
            <button className="primary-btn" type="submit">Submit for Admin approval</button>
          </form>
          <PayrollTable payrollRecords={data.payrollRecords} />
        </div>
      )}
      {activeTab === 'profile' && <ProfileSettings user={user} />}
    </section>
  );
}

export function HRAdminOversight() {
  const [data, setData] = useState({ summary: {}, staff: [], students: [], leaveRequests: [], payrollRecords: [] });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const pending = useMemo(() => (data.leaveRequests.filter((request) => request.status === 'pending').length + data.payrollRecords.filter((record) => record.status === 'submitted').length), [data]);

  const load = async () => setData((await api.get('/hr/overview')).data);
  useEffect(() => { load().catch((error) => setMessage(error?.response?.data?.message || 'Unable to load HR oversight.')); }, []);

  const review = async (type, id, status) => {
    try {
      await api.put(`/hr/${type}/${id}/review`, { status });
      setMessage(`${type === 'leave' ? 'Leave' : 'Payroll'} ${status}.`);
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to review HR record.');
    }
  };

  return (
    <div>
      {message && <div className="toast-message">{message}</div>}
      <div className="dashboard-panel-card"><h3>HR approval queue</h3><p>{pending} HR item(s) require Admin review. HR can prepare records, but Admin approval is required before they become approved.</p></div>
      <SummaryCards summary={data.summary} admin />
      <div className="dashboard-tabs">
        <button className={`tab ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>People directory</button>
        <button className={`tab ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>Leave approvals</button>
        <button className={`tab ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>Payroll approvals</button>
      </div>
      {activeTab === 'people' && <PeopleTables staff={data.staff} students={data.students} />}
      {activeTab === 'leave' && <LeaveTable leaveRequests={data.leaveRequests} admin onReview={review} />}
      {activeTab === 'payroll' && <PayrollTable payrollRecords={data.payrollRecords} admin onReview={review} />}
    </div>
  );
}
