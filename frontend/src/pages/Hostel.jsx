import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllHostelRooms, getAllHostelApplications, getStudentHostelApp, applyForRoom, allocateRoom, vacateRoom } from '../services/firestoreService';

const Hostel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [rooms, setRooms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [application, setApplication] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [allocRooms, setAllocRooms] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        setRooms(await getAllHostelRooms() || []);
        setApplications(await getAllHostelApplications() || []);
      } else {
        const app = await getStudentHostelApp();
        setApplication(app);
      }
    } catch (err) {
      console.error('Failed to load hostel data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin, user]);

  const handleApply = async () => {
    setApplying(true);
    await applyForRoom();
    await load();
    setApplying(false);
  };

  const handleAllocate = async (appId, studentEmail) => {
    const roomNo = allocRooms[appId];
    if (!roomNo) return alert("Enter a room number to allocate");
    await allocateRoom(roomNo, studentEmail);
    setAllocRooms(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
    await load();
  };

  const handleVacate = async (studentEmail) => {
    await vacateRoom(studentEmail);
    await load();
  };

  const canApply = !application || application.status === 'vacated';

  const getBadgeClass = (s) => (s === 'available' ? 'badge-success' : 'badge-danger');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'vacated': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Hostel Facility</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage accommodation and view room allocations</p>
        </div>
        {!isAdmin && canApply && !loading && (
          <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
            {applying ? 'Applying…' : application?.status === 'vacated' ? 'Re-Apply for Room' : 'Apply for Room'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}><p>Loading…</p></div>
      ) : !isAdmin ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Application Status</h2>
          {!application ? (
            <p style={{ color: 'var(--text-secondary)' }}>You have not applied for a hostel room yet.</p>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0 }}>Status:</p>
                <span className={`badge ${getStatusBadge(application.status)}`} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              {application.room_no && (
                <p>Allocated Room: <strong>{application.room_no}</strong></p>
              )}
              {application.status === 'vacated' && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    Your previous room has been vacated. You can re-apply for a new room using the button above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
             <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Student Applications</h2>
             {applications.length === 0 ? <p>No applications.</p> : (
               <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                 <thead>
                   <tr>
                     <th style={{padding: '1rem', borderBottom: '1px solid var(--glass-border)'}}>Student Email</th>
                     <th style={{padding: '1rem', borderBottom: '1px solid var(--glass-border)'}}>Status</th>
                     <th style={{padding: '1rem', borderBottom: '1px solid var(--glass-border)'}}>Room</th>
                     <th style={{padding: '1rem', borderBottom: '1px solid var(--glass-border)'}}>Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {applications.map(app => (
                     <tr key={app.id}>
                        <td style={{padding: '1rem'}}>{app.student_email}</td>
                        <td style={{padding: '1rem'}}>
                          <span className={`badge ${getStatusBadge(app.status)}`}>{app.status}</span>
                        </td>
                        <td style={{padding: '1rem'}}>{app.room_no || 'None'}</td>
                        <td style={{padding: '1rem', display: 'flex', gap: '0.5rem'}}>
                           {(app.status === 'pending' || app.status === 'vacated') && (
                             <>
                               <input 
                                 className="input-field" 
                                 placeholder="Room No" 
                                 value={allocRooms[app.id] || ''} 
                                 onChange={e => setAllocRooms(prev => ({ ...prev, [app.id]: e.target.value }))} 
                                 style={{width: '100px'}} 
                               />
                               <button className="btn btn-primary" onClick={() => handleAllocate(app.id, app.student_email)}>Allocate</button>
                             </>
                           )}
                           {app.status === 'approved' && (
                             <button className="btn badge-danger" onClick={() => handleVacate(app.student_email)}>Vacate</button>
                           )}
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
             <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>All Rooms</h2>
             {rooms.length === 0 ? <p>No rooms.</p> : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {rooms.map(r => (
                    <div key={r.id} className="glass-card" style={{ padding: '1.5rem' }}>
                       <h3>Room {r.room_no}</h3>
                       <span className={`badge ${getBadgeClass(r.status)}`}>{r.status}</span>
                    </div>
                  ))}
               </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Hostel;

