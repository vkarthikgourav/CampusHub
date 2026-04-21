import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI/ML', 'BioTech'];

const Register = () => {
  const navigate = useNavigate();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [role, setRole]               = useState('student');
  const [rollNumber, setRollNumber]   = useState('');
  const [department, setDepartment]   = useState('');

  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          roll_number: role === 'student' ? rollNumber : null,
          department: role === 'student' ? department : null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed. Please try again.');
      }

      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Create an Account
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Join Campus Management System
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Select your role
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '12px' }}>
            {['student', 'teacher', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: role === r ? 'var(--accent-primary)' : 'transparent',
                  color: role === r ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {role === 'student' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Roll Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Department
                </label>
                <select
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
