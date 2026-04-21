import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { Calendar, MapPin, Clock, Plus, Trash2, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Events.css';

const CATEGORIES = [
  { value: 'general', label: 'General', color: '#6366f1' },
  { value: 'academic', label: 'Academic', color: '#14b8a6' },
  { value: 'cultural', label: 'Cultural', color: '#f59e0b' },
  { value: 'sports', label: 'Sports', color: '#ef4444' },
];

const Events = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', event_date: '', event_time: '', location: '', category: 'general' });

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:8000/events/');
      const data = await res.json();
      setEvents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/events/', { method: 'POST', body: JSON.stringify(form) });
      setMessage({ type: 'success', text: 'Event created!' });
      setShowForm(false);
      setForm({ title: '', description: '', event_date: '', event_time: '', location: '', category: 'general' });
      fetchEvents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetchWithAuth(`/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const getCategoryInfo = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient">Campus Events</h1>
          <p className="text-secondary">What's happening around campus</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-pills">
            <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            {CATEGORIES.map(c => (
              <button key={c.value} className={`pill ${filter === c.value ? 'active' : ''}`} onClick={() => setFilter(c.value)} style={{ '--pill-color': c.color }}>{c.label}</button>
            ))}
          </div>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={18} /> {showForm ? 'Cancel' : 'Add Event'}</button>}
        </div>
      </div>

      {message.text && (
        <div className={`alert-message ${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create New Event</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>Title</label>
              <input className="input-field" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" className="input-field" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>Time</label>
              <input type="time" className="input-field" value={form.event_time} onChange={e => setForm({...form, event_time: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>Location</label>
              <input className="input-field" placeholder="e.g. Main Auditorium" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 130px' }}>
              <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="input-field" rows={3} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Publish Event</button>
        </form>
      )}

      {loading ? <div className="loading-spinner"></div> : (
        <div className="events-grid">
          {filtered.length > 0 ? filtered.map(ev => {
            const cat = getCategoryInfo(ev.category);
            return (
              <div key={ev.id} className="glass-card event-card">
                <div className="event-category-bar" style={{ background: cat.color }}></div>
                <div className="event-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3>{ev.title}</h3>
                    {isAdmin && <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Trash2 size={16} /></button>}
                  </div>
                  <p className="event-desc">{ev.description}</p>
                  <div className="event-meta">
                    <span><Calendar size={14} /> {ev.event_date}</span>
                    {ev.event_time && <span><Clock size={14} /> {ev.event_time}</span>}
                    {ev.location && <span><MapPin size={14} /> {ev.location}</span>}
                    <span className="event-tag" style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}><Tag size={12} /> {cat.label}</span>
                  </div>
                  <div className="event-footer">Posted by {ev.created_by} · {new Date(ev.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            );
          }) : (
            <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
              <Calendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <h3>No events yet</h3>
              <p className="text-secondary">Campus events will be posted here by the administration.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
