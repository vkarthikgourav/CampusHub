import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllFees, getStudentFee, updateFee, getAllStudents } from '../services/firestoreService';

const Fees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [feeData, setFeeData] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', status: 'Due' });

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [feesData, usersData] = await Promise.all([
          getAllFees(),
          getAllStudents(),
        ]);
        setAllFees(feesData || []);
        setStudents(usersData || []);
      } else {
        const data = await getStudentFee();
        setFeeData(data || null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load fee data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin, user]);

  const handleUpdateStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Due' : 'Paid';
    await updateFee(studentId, { status: newStatus });
    await load();
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!formData.student_id) return;
    await updateFee(parseInt(formData.student_id), { status: formData.status });
    setShowForm(false);
    setFormData({ student_id: '', status: 'Due' });
    await load();
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Fee Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administer and track institutional fee payments</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Manage Fee Record'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAddFee} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Select Student</label>
            <select className="input-field" required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})}>
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Payment Status</label>
            <select className="input-field" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Due">Due</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn btn-primary">Save Record</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading fee data…</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--accent-danger, #f87171)' }}>{error}</p>
        </div>
      ) : !isAdmin ? (
        /* ── STUDENT VIEW ── */
        <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>My Fee Details</h2>
          {!feeData ? (
            <p style={{ color: 'var(--text-secondary)' }}>No fee record found for your account.</p>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Name</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user?.name || user?.email}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roll Number</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user?.roll_number || '—'}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user?.department || '—'}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Status</span>
                  <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{feeData.status === 'Paid' ? '✅' : '⚠️'}</span>
                    <span className={`badge ${feeData.status === 'Paid' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.3rem 0.75rem' }}>
                      {feeData.status}
                    </span>
                  </div>
                </div>
              </div>
              {feeData.status !== 'Paid' && (
                <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    ⚠️ Your fee payment is pending. Please contact the administration office for payment details.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── ADMIN VIEW ── */
        <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Student Payment Status</h2>
          {allFees.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No fee records found in the database.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr>
                  {['Student ID', 'Student Info', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFees.map((s) => {
                  const studentInfo = students.find(u => u.id === s.student_id);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>#{s.student_id}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {studentInfo ? `${studentInfo.name} (${studentInfo.email})` : 'Unknown User'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${s.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                          <button className="btn" onClick={() => handleUpdateStatus(s.student_id, s.status)}>
                              Toggle Status
                          </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Fees;