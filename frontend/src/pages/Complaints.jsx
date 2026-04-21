import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllComplaints,
  getUserComplaints,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint
} from '../services/firestoreService';

const Complaints = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Hostel / Accommodation');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const load = async () => {
    try {
      const data = isAdmin
        ? await getAllComplaints()
        : await getUserComplaints(user?.id || user?.uid);
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin, user]);

  const getStatusBadge = (status) => {
    const map = {
      'Submitted': 'badge-info',
      'Review': 'badge-warning',
      'Resolved': 'badge-success',
      'Closed': 'badge-secondary'
    };
    return map[status] || 'badge-secondary';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    
    try {
      await addComplaint({
        userId: user?.id || user?.uid,
        userName: user?.name || 'Student',
        category,
        subject: description.slice(0, 60),
        description,
      });
      setDescription('');
      setSubmitMessage({ type: 'success', text: 'Complaint submitted successfully!' });
      setTimeout(() => setSubmitMessage({ type: '', text: '' }), 5000);
      await load();
    } catch (err) {
      console.error('Failed to submit complaint', err);
      setSubmitMessage({ type: 'error', text: 'Failed to submit complaint. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await deleteComplaint(complaintId);
      setComplaints((prev) => prev.filter((c) => c.id !== complaintId));
    } catch (err) {
      console.error('Failed to delete complaint', err);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Complaints & Feedback</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Report non-academic issues or view institutional grievances</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr' : '1fr 1fr', gap: '2rem' }}>

        {!isAdmin && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Submit a Complaint</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                <select
                  className="input-field"
                  style={{ appearance: 'none', backgroundColor: 'rgba(18,18,18,0.6)' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Hostel / Accommodation</option>
                  <option>Facilities / Maintenance</option>
                  <option>Academic Staff</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
              {submitMessage.text && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginTop: '0.5rem',
                  backgroundColor: submitMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: submitMessage.type === 'success' ? '#4ade80' : '#f87171',
                  border: `1px solid ${submitMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {submitMessage.text}
                </div>
              )}
            </form>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {isAdmin ? 'All Active Complaints' : 'Your Previous Tickets'}
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
          ) : complaints.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No complaints found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', transition: 'background 0.2s' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>#{c.id}</span>
                      <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>{c.subject || c.description?.slice(0, 60)}</h4>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {isAdmin && c.userName ? `By ${c.userName} · ` : ''}Filed on {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          className="input-field"
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', backgroundColor: 'rgba(18,18,18,0.6)' }}
                          value={c.status}
                          onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                        >
                          <option>Submitted</option>
                          <option>Review</option>
                          <option>Resolved</option>
                          <option>Closed</option>
                        </select>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn"
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                          title="Delete Complaint"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Complaints;
