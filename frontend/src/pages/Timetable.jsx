import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTimetableEntries, getMyTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, getAllClasses, getAllProfessors } from '../services/firestoreService';

const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isProfessor = user?.role === 'professor' || user?.role === 'teacher';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

  const [entries, setEntries] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [classes, setClasses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ subject: '', day: 'Monday', time_slot: '09:00 AM', teacher_name: '', class_id: '', professor_id: '', room: '' });

  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  const loadData = async () => {
    setLoading(true);

    let data;
    if (isAdmin || isProfessor) {
      // Professors and Admins see everything (simple requirement)
      const classId = (isAdmin && selectedClassId !== 'all') ? parseInt(selectedClassId) : null;
      data = await getTimetableEntries(classId);
      
      if (isAdmin) {
        setClasses(await getAllClasses() || []);
        setProfessors(await getAllProfessors() || []);
      }
    } else {
      data = await getMyTimetable();
    }

    const allEntries = data || [];
    setEntries(allEntries);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [isAdmin, isProfessor, selectedClassId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      class_id: parseInt(formData.class_id),
      professor_id: formData.professor_id ? parseInt(formData.professor_id) : null 
    };
    if (!payload.room) delete payload.room;

    if (editingId) {
      await updateTimetableEntry(editingId, payload);
    } else {
      await addTimetableEntry(payload);
    }
    setFormData({ subject: '', day: 'Monday', time_slot: '09:00 AM', teacher_name: '', class_id: '', professor_id: '', room: '' });
    setShowForm(false);
    setEditingId(null);
    loadData();
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      subject: entry.subject,
      day: entry.day,
      time_slot: entry.time_slot,
      teacher_name: entry.teacher_name,
      class_id: String(entry.class_id),
      professor_id: entry.professor_id ? String(entry.professor_id) : '',
      room: entry.room || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    await deleteTimetableEntry(id);
    loadData();
  };

  // Group entries by class
  const groupedEntries = entries.reduce((acc, entry) => {
    const classId = entry.class_id;
    if (!acc[classId]) {
      acc[classId] = {
        name: entry.academic_class?.name || 'Academic Class',
        entries: []
      };
    }
    acc[classId].entries.push(entry);
    return acc;
  }, {});

  const renderTimetableGrid = (classEntries, className) => {
    const schedMap = {};
    classEntries.forEach(entry => {
      const key = `${entry.day}-${entry.time_slot}`;
      if (!schedMap[key]) schedMap[key] = [];
      schedMap[key].push(entry);
    });

    return (
      <div key={className} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', fontSize: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem' }}>
          {className}
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Time</th>
              {days.map(day => (
                <th key={day} style={{
                  padding: '1rem',
                  borderBottom: '2px solid var(--glass-border)',
                  textAlign: 'center',
                  color: day === todayName ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: day === todayName ? 700 : 500
                }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time, i) => (
              <tr key={time} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{time}</td>
                {days.map(day => {
                  const cellEntries = schedMap[`${day}-${time}`] || [];
                  return (
                    <td key={`${day}-${time}`} style={{ padding: '0.35rem', borderBottom: '1px solid var(--glass-border)', verticalAlign: 'top' }}>
                      {cellEntries.length > 0 ? cellEntries.map(entry => {
                        const isMine = entry.professor_id === user?.user_id;
                        return (
                          <div key={entry.id} className="timetable-cell" style={isMine ? { border: '1px solid var(--accent-secondary)', background: 'rgba(212, 175, 55, 0.08)' } : {}}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{entry.subject}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.teacher_name}</div>
                            {entry.room && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>📍 {entry.room}</div>}
                            {isMine && <div style={{ fontSize: '0.65rem', color: 'var(--accent-secondary)', fontWeight: 700, marginTop: '0.3rem' }}>★ TEACHING</div>}
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem' }}>
                                <button onClick={() => handleEdit(entry)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-secondary)' }}>✏️</button>
                                <button onClick={() => handleDelete(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)' }}>🗑️</button>
                              </div>
                            )}
                          </div>
                        );
                      }) : <div style={{ textAlign: 'center', color: 'var(--glass-border)', padding: '0.75rem' }}>—</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ subject: '', day: 'Monday', time_slot: '09:00 AM', teacher_name: '', class_id: '', professor_id: '', room: '' });
  };

  // Today's classes for student/professor
  const todayEntries = entries.filter(e => e.day === todayName);

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Weekly Timetable</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Manage timetable entries per class' : isProfessor ? 'Teaching schedules (All Classes)' : 'Your personalized schedule'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.department}</option>)}
            </select>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => showForm ? cancelForm() : setShowForm(true)}>
              {showForm ? 'Cancel' : '+ Add Entry'}
            </button>
          )}
        </div>
      </div>

      {/* Today's Classes */}
      {!isAdmin && todayEntries.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📅</span> Today's Classes ({todayName})
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {todayEntries.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(e => {
              const isMine = e.professor_id === user?.user_id;
              return (
                <div key={e.id} className="today-class-chip" style={isMine ? { border: '1px solid var(--accent-secondary)', background: 'rgba(212, 175, 55, 0.08)' } : {}}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.subject}</span>
                  <div style={{ fontSize: '0.8rem', color: isMine ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>{e.time_slot}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.academic_class?.name}</div>
                  {e.room && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>📍 {e.room}</span>}
                  {isMine && <span style={{ fontSize: '0.65rem', color: 'var(--accent-secondary)', fontWeight: 600, marginTop: '2px' }}>★ YOUR CLASS</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Entry' : 'New Timetable Entry'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subject</label>
              <input className="input-field" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Teacher Name</label>
              <input className="input-field" required value={formData.teacher_name} onChange={e => setFormData({...formData, teacher_name: e.target.value})} />
            </div>
           {/* <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Assign Professor</label>
              <select className="input-field" value={formData.professor_id} onChange={e => setFormData({...formData, professor_id: e.target.value})}>
                <option value="">Link to User...</option>
                {professors.map(p => <option key={p.id} value={p.id}>{p.name} ({p.department})</option>)}
              </select>
            </div> */}
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Day</label>
              <select className="input-field" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Time Slot</label>
              <select className="input-field" value={formData.time_slot} onChange={e => setFormData({...formData, time_slot: e.target.value})}>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Class</label>
              <select className="input-field" required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})}>
                <option value="">Select...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Room</label>
              <input className="input-field" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="e.g. A-101" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={cancelForm}>Cancel</button>}
            </div>
          </div>
        </form>
      )}

      {/* Timetable Grids */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading timetable...</p>
        </div>
      ) : Object.keys(groupedEntries).length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {isAdmin ? 'No timetable entries found. Select a class and add entries.' : 'No timetable entries found for your classes.'}
          </p>
        </div>
      ) : (
        <div className="timetables-container">
          {Object.entries(groupedEntries).map(([classId, group]) => 
            renderTimetableGrid(group.entries, group.name)
          )}
        </div>
      )}
    </div>
  );
};

export default Timetable;
