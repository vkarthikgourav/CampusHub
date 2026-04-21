import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { Upload, FileText, AlertCircle, CheckCircle2, Trash2, Clock, User } from 'lucide-react';
import './Results.css';

const AdminResults = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedResults, setPublishedResults] = useState([]);
  const [tab, setTab] = useState('upload'); // 'upload' or 'published'

  const fetchStudents = async () => {
    try {
      const data = await fetchWithAuth('/admin/users/student');
      setStudents(data);
    } catch (err) { console.error(err); }
  };

  const fetchPublished = async () => {
    try {
      const data = await fetchWithAuth('/results/all');
      setPublishedResults(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStudents();
    fetchPublished();
  }, []);

  // Check if a student already has results
  const getStudentResults = (studentId) => publishedResults.filter(r => r.student_id === studentId);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !file || !title || !semester) {
      setMessage({ type: 'error', text: 'Please fill all fields and select a student' });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('student_id', selectedStudent.id);
    formData.append('title', title);
    formData.append('semester', semester);
    formData.append('file', file);

    try {
      await fetchWithAuth('/results/upload', { method: 'POST', body: formData });
      setMessage({ type: 'success', text: `Result uploaded for ${selectedStudent.name} (${selectedStudent.roll_number})!` });
      setTitle(''); setSemester(''); setFile(null); setSelectedStudent(null);
      fetchPublished();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setUploading(false); }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.roll_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-results-container fade-in">
      <div className="page-header">
        <h1 className="text-gradient">Manage Student Results</h1>
        <p className="text-secondary">Upload and track examination results</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`pill ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')} style={{ padding: '0.5rem 1.25rem', borderRadius: '20px', border: '1px solid var(--glass-border)', background: tab === 'upload' ? 'var(--accent-primary)' : 'transparent', color: tab === 'upload' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
          <Upload size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Upload Result
        </button>
        <button className={`pill ${tab === 'published' ? 'active' : ''}`} onClick={() => setTab('published')} style={{ padding: '0.5rem 1.25rem', borderRadius: '20px', border: '1px solid var(--glass-border)', background: tab === 'published' ? 'var(--accent-primary)' : 'transparent', color: tab === 'published' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
          <FileText size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Published ({publishedResults.length})
        </button>
      </div>

      {message.text && (
        <div className={`alert-message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {tab === 'upload' && (
        <div className="admin-grid">
          <div className="glass-panel upload-section">
            <h2><Upload size={20} /> Upload Result</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Select Student</label>
                {selectedStudent ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>{selectedStudent.name}</strong> — {selectedStudent.roll_number || 'No Roll No'}
                      {getStudentResults(selectedStudent.id).length > 0 && (
                        <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                          ⚠ {getStudentResults(selectedStudent.id).length} result(s) already published
                        </span>
                      )}
                    </div>
                    <button type="button" onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>✕ Change</button>
                  </div>
                ) : (
                  <div className="search-select">
                    <input type="text" placeholder="Search by name or roll number..." className="input-field" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                      {filteredStudents.length > 0 ? filteredStudents.map(s => {
                        const existing = getStudentResults(s.id);
                        return (
                          <div key={s.id} onClick={() => { setSelectedStudent(s); setSearchTerm(''); }}
                            style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div>
                              <strong>{s.name}</strong>
                              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{s.roll_number || 'No Roll No'}</span>
                            </div>
                            {existing.length > 0 && (
                              <span style={{ fontSize: '0.7rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                                ✓ {existing.length} published
                              </span>
                            )}
                          </div>
                        );
                      }) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Result Title</label>
                  <input type="text" placeholder="e.g. End Semester Exam April 2024" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select className="input-field" value={semester} onChange={(e) => setSemester(e.target.value)}>
                    <option value="">Select Semester</option>
                    {Array.from({ length: 8 }, (_, i) => <option key={i} value={`Semester ${i+1}`}>Semester {i+1}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>PDF File</label>
                <div className="file-upload">
                  <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} id="file-input" />
                  <label htmlFor="file-input" className="file-label"><FileText size={20} /> {file ? file.name : 'Choose PDF file'}</label>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Result'}</button>
            </form>
          </div>
          <div className="glass-panel help-info">
            <h3>Quick Help</h3>
            <ul>
              <li>Students with a <span style={{ color: '#4ade80' }}>✓ published</span> badge already have results uploaded.</li>
              <li>You can upload multiple results per student (e.g. per semester).</li>
              <li>Results are stored permanently and accessible to students anytime.</li>
              <li>Ensure the file is in PDF format before uploading.</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'published' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Student</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Roll No</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Result Title</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Semester</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Published On</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {publishedResults.length > 0 ? publishedResults.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}><User size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />{r.student_name}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-info">{r.roll_number}</span></td>
                  <td style={{ padding: '1rem' }}>{r.title}</td>
                  <td style={{ padding: '1rem' }}>{r.semester}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Clock size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <a href={`http://localhost:8000/${r.pdf_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>View</a>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No results published yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminResults;
