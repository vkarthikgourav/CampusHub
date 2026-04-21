import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllClasses, getMyClasses, addClass, updateClass, deleteClass } from '../services/firestoreService';

const Classes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: '', semester: '' });
  const [filterDept, setFilterDept] = useState('all');

  const fetchClasses = async () => {
    setLoading(true);
    const data = isAdmin ? await getAllClasses() : await getMyClasses();
    setClasses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  const departments = [...new Set((classes || []).map(c => c.department))];

  const filteredClasses = filterDept === 'all'
    ? classes
    : classes.filter(c => c.department === filterDept);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, semester: parseInt(formData.semester) };
    if (editingId) {
      await updateClass(editingId, payload);
    } else {
      await addClass(payload);
    }
    setFormData({ name: '', department: '', semester: '' });
    setShowForm(false);
    setEditingId(null);
    fetchClasses();
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({ name: c.name, department: c.department, semester: String(c.semester) });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class and all related enrollments?')) return;
    await deleteClass(id);
    fetchClasses();
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', department: '', semester: '' });
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {isAdmin ? 'Manage Classes' : 'My Classes'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Create and manage academic classes across departments' : 'Classes you are enrolled in'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {departments.length > 1 && (
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '160px' }}
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => showForm ? cancelForm() : setShowForm(true)}>
              {showForm ? 'Cancel' : '+ Create Class'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Class' : 'New Class'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Class Name</label>
              <input className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Data Structures" />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Department</label>
              <input className="input-field" required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. CSE" />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Semester</label>
              <input type="number" min="1" max="8" className="input-field" required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
              )}
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {isAdmin ? 'No classes created yet. Click "+ Create Class" to get started.' : 'You are not enrolled in any classes yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredClasses.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.department}</span>
                </div>
                <span className="badge badge-warning">Sem {c.semester}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>📖 {c.department}</span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Semester {c.semester}</span>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEdit(c)}>✏️ Edit</button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-danger)' }} onClick={() => handleDelete(c.id)}>🗑️ Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;
