import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllStudents,
  getAllComplaints,
  getAllHostelRooms,
  getAllClasses,
  getMyClasses,
  getStudentFee,
  getStudentHostelApp,
  getTimetableEntries,
  getMyTimetable,
  getAllContacts
} from '../services/firestoreService';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const [stats, setStats] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        if (isAdmin) {
          const [students, complaints, rooms, classes, timetable] = await Promise.all([
            getAllStudents(),
            getAllComplaints(),
            getAllHostelRooms(),
            getAllClasses(),
            getTimetableEntries()
          ]);
          setStats({
            box1: { title: "Total Students", value: students?.length || 0, color: "var(--accent-primary)", icon: "👥" },
            box2: { title: "Active Complaints", value: (complaints || []).filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length, color: "var(--accent-warning)", icon: "📝" },
            box3: { title: "Hostel Rooms", value: rooms?.length || 0, color: "var(--accent-secondary)", icon: "🏢" },
            box4: { title: "Total Classes", value: classes?.length || 0, color: "var(--accent-success)", icon: "📚" },
            box5: { title: "Timetable Entries", value: timetable?.length || 0, color: "var(--accent-primary)", icon: "📅" },
          });
        }
        else if (isTeacher) {
          const [classes, students, timetable, contacts] = await Promise.all([
            getAllClasses(),
            getAllStudents(),
            getTimetableEntries(),
            getAllContacts()
          ]);

          let mySlots = 0;
          if (timetable && user?.name) {
            mySlots = timetable.filter(t => t.teacher_name.toLowerCase().includes(user.name.toLowerCase().split(' ')[0])).length;
          }

          setStats({
            box1: { title: "My Weekly Classes", value: mySlots > 0 ? mySlots : '—', color: "var(--accent-primary)", icon: "📅" },
            box2: { title: "Total Students", value: students?.length || 0, color: "var(--accent-secondary)", icon: "👥" },
            box3: { title: "Curriculum Modules", value: classes?.length || 0, color: "var(--accent-success)", icon: "📚" },
            box4: { title: "Faculty Members", value: contacts?.filter(c => c.role?.toLowerCase().includes('prof') || c.role?.toLowerCase().includes('teach')).length || 0, color: "var(--accent-warning)", icon: "📞" },
          });
        }
        else {
          // Student View
          const [fee, hostel, myClasses, timetable] = await Promise.all([
            getStudentFee(),
            getStudentHostelApp(),
            getMyClasses(),
            getMyTimetable()
          ]);

          const todayEntries = (timetable || []).filter(t => t.day === todayName);
          setTodayClasses(todayEntries);

          setStats({
            box1: { title: "Fee Status", value: fee?.status || 'N/A', color: fee?.status === 'Paid' ? 'var(--accent-success)' : 'var(--accent-danger)', icon: "💳" },
            box2: { title: "My Classes", value: myClasses?.length || 0, color: "var(--accent-primary)", icon: "📚" },
            box3: { title: "Hostel Status", value: hostel?.status || 'N/A', color: "var(--accent-warning)", icon: "🏢" },
            box4: { title: "Today's Lectures", value: todayEntries.length, color: "var(--accent-secondary)", icon: "📅" },
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setStats({
          box1: { title: "Data Unavailable", value: "-", color: "var(--text-secondary)", icon: "⚠️" },
          box2: { title: "Data Unavailable", value: "-", color: "var(--text-secondary)", icon: "⚠️" },
          box3: { title: "Data Unavailable", value: "-", color: "var(--text-secondary)", icon: "⚠️" },
          box4: { title: "Data Unavailable", value: "-", color: "var(--text-secondary)", icon: "⚠️" },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardDetails();
  }, [isAdmin, isTeacher, user]);

  const statBoxes = stats ? Object.values(stats) : [];

  let quickLinks = [];
  if (isAdmin) {
    quickLinks = [
      { title: 'Manage Users', path: '/students', icon: '👥' },
      { title: 'Review Complaints', path: '/complaints', icon: '📝' },
      { title: 'Manage Hostels', path: '/hostel', icon: '🏢' },
      { title: 'Manage Classes', path: '/classes', icon: '📚' },
      { title: 'Manage Timetable', path: '/timetable', icon: '📅' },
      { title: 'Update Fees', path: '/fees', icon: '💳' }
    ];
  } else if (isTeacher) {
    quickLinks = [
      { title: 'My Timetable', path: '/timetable', icon: '📅' },
      { title: 'Academic Classes', path: '/classes', icon: '📚' },
      { title: 'Student Directory', path: '/students', icon: '👥' },
      { title: 'Campus Contacts', path: '/contacts', icon: '📞' }
    ];
  } else {
    quickLinks = [
      { title: 'My Classes', path: '/classes', icon: '📚' },
      { title: 'My Timetable', path: '/timetable', icon: '📅' },
      { title: 'Pay Fees', path: '/fees', icon: '💳' },
      { title: 'Hostel Application', path: '/hostel', icon: '🏢' },
      { title: 'Report Issue', path: '/complaints', icon: '🎫' }
    ];
  }

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Welcome, {user?.name || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Here is your personalized overview. System Role: <span className="badge badge-info">{user?.role || 'Guest'}</span>
          {user?.department && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{user.department}</span>}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statBoxes.map((box, idx) => (
          <div key={idx} className="glass-card stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{box?.title || 'Loading'}</h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: box?.color || 'var(--text-primary)' }}>
                  {loading ? '...' : box?.value}
                </div>
              </div>
              <span style={{ fontSize: '2rem', opacity: 0.6 }}>{box?.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* My Profile — Student only */}
      {!isAdmin && !isTeacher && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👤</span> My Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || '—'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email || '—'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roll Number</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.roll_number || '—'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.department || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule — Student only */}
      {!isAdmin && !isTeacher && todayClasses.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📅</span> Today's Schedule ({todayName})
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {todayClasses.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(e => (
              <div key={e.id} className="today-class-chip">
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.subject}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{e.time_slot}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.teacher_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-panel" style={{ padding: '2rem', minHeight: '200px' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.path}
              className="quick-action-card"
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{link.icon}</div>
              <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>{link.title}</h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
