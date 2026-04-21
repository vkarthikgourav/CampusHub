import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllContacts, addContact, deleteContact } from '../services/firestoreService';

const Contacts = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', department: '', email: '', phone: '' });

  const fetchContacts = async () => {
    setLoading(true);
    const data = await getAllContacts();
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await addContact(formData);
    setFormData({ name: '', role: '', department: '', email: '', phone: '' });
    setShowForm(false);
    fetchContacts();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      await deleteContact(id);
      fetchContacts();
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.department && c.department.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'All') return matchesSearch;
    if (filter === 'Faculty') return matchesSearch && (c.role.includes('Professor') || c.role.includes('Head'));
    if (filter === 'Admin') return matchesSearch && c.role === 'Administrator';
    return matchesSearch;
  });

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find faculty and administration contacts</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
            {['All', 'Faculty', 'Admin'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1rem', background: filter === f ? 'var(--accent-primary)' : 'transparent', color: filter === f ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="Search name or dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '250px' }}
          />
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Add Contact'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Name</label>
            <input className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Role</label>
            <input className="input-field" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Department</label>
            <input className="input-field" required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Email</label>
            <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Phone</label>
            <input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">Save Contact</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading directory...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No contacts found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredContacts.map(contact => (
            <div key={contact.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'relative' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                {contact.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</h3>
                <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{contact.role} • {contact.department}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>✉️ {contact.email}</span>
                  <span>📞 {contact.phone}</span>
                </div>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(contact.id)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem'}}
                >×</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
