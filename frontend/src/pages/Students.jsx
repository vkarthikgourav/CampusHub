import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { UserPlus, Pencil, Search, AlertCircle, CheckCircle2, User, X, BookOpen } from 'lucide-react';

const Students = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', roll_number: '', department: '', password: 'Password@123' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [enrollments, setEnrollments] = useState({});
  const [enrollClassId, setEnrollClassId] = useState('');

  const fetchStudents = async () => {
    try {
      const data = await fetchWithAuth('/admin/users/student');
      setStudents(data);
      try {
        const classData = await fetchWithAuth('/classes');
        setClasses(classData);
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const refreshEnrollments = async (studentId, currentClasses) => {
    try {
      const data = await fetchWithAuth(`/enrollments/${studentId}`);
      const enriched = data.map(e => {
        const cls = currentClasses.find(c => c.id === e.class_id);
        return { ...e, className: cls?.name || `Class #${e.class_id}`, department: cls?.department || '' };
      });
      setEnrollments(prev => ({ ...prev, [studentId]: enriched }));
    } catch (err) { console.error(err); }
  };

  const fetchEnrollments = async (studentId) => {
    if (enrollments[studentId] && expandedStudent === studentId) {
      setExpandedStudent(null);
      return;
    }
    
    let currentClasses = classes;
    if (currentClasses.length === 0) {
      try {
        currentClasses = await fetchWithAuth('/classes');
        setClasses(currentClasses);
      } catch (e) { /* ignore */ }
    }
    
    await refreshEnrollments(studentId, currentClasses);
    setExpandedStudent(studentId);
    setEnrollClassId('');
  };

  const handleEnroll = async (studentId) => {
    if (!enrollClassId) return;
    try {
      await fetchWithAuth('/enroll', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, class_id: parseInt(enrollClassId) })
      });
      setMessage({ type: 'success', text: 'Enrolled successfully!' });
      setEnrollClassId('');
      await refreshEnrollments(studentId, classes);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert(err.message || "Failed to enroll");
    }
  };

  const handleUnenroll = async (studentId, classId) => {
    if (!confirm('Are you sure you want to unenroll this student from the class?')) return;
    try {
      await fetchWithAuth('/unenroll', {
        method: 'DELETE',
        body: JSON.stringify({ student_id: studentId, class_id: parseInt(classId) })
      });
      setMessage({ type: 'success', text: 'Unenrolled successfully!' });
      await refreshEnrollments(studentId, classes);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert(err.message || "Failed to unenroll");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify({ ...newStudent, role: 'student' })
      });
      setMessage({ type: 'success', text: 'Student added successfully!' });
      setShowAddModal(false);
      setNewStudent({ name: '', email: '', roll_number: '', department: '', password: 'Password@123' });
      fetchStudents();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient">Students Directory</h1>
          <p className="text-secondary">View and manage enrolled students</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={18} /> Add Student
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert-message ${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Roll Number</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Department</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Classes</th>
                {isAdmin && <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <Fragment key={s.id}>
                  <tr style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>{s.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-info">{s.roll_number || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>{s.email}</td>
                    <td style={{ padding: '1rem' }}>{s.department || 'General'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => fetchEnrollments(s.id)}>
                        <BookOpen size={14} /> {expandedStudent === s.id ? 'Hide' : 'Manage'}
                      </button>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><Pencil size={16} /></button>
                      </td>
                    )}
                  </tr>
                  {expandedStudent === s.id && enrollments[s.id] && (
                    <tr>
                      <td colSpan="6" style={{ padding: '1rem', background: 'rgba(20,184,166,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Enrolled Classes
                          </h4>
                          
                          {enrollments[s.id].length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                              {enrollments[s.id].map(e => (
                                <div key={e.id} className="badge badge-info" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span>{e.className} {e.department && `(${e.department})`}</span>
                                  {isAdmin && (
                                    <button 
                                      onClick={() => handleUnenroll(s.id, e.class_id)} 
                                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                                      title="Unenroll"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Student is not enrolled in any classes.</p>
                          )}

                          {isAdmin && classes.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                              <select 
                                className="input-field" 
                                style={{ width: 'auto', minWidth: '250px' }}
                                value={enrollClassId}
                                onChange={e => setEnrollClassId(e.target.value)}
                              >
                                <option value="">-- Select Class --</option>
                                {classes
                                  .filter(c => !enrollments[s.id].find(e => e.class_id === c.id))
                                  .map(c => (
                                    <option key={c.id} value={c.id}>{c.name} — {c.department} (Semester {c.semester})</option>
                                  ))
                                }
                              </select>
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleEnroll(s.id)}
                                disabled={!enrollClassId}
                                style={{ padding: '0.5rem 1rem' }}
                              >
                                Enroll Student
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateStudent} className="upload-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="input-field" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="input-field" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input type="text" className="input-field" required value={newStudent.roll_number} onChange={e => setNewStudent({...newStudent, roll_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" className="input-field" required value={newStudent.department} onChange={e => setNewStudent({...newStudent, department: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input type="text" className="input-field" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Student Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
