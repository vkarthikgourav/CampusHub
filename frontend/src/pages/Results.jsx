import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { FileText, Download, Clock } from 'lucide-react';
import './Results.css';

const Results = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await fetchWithAuth('/results/my');
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchResults();
  }, [user]);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="results-container fade-in">
      <div className="page-header">
        <h1 className="text-gradient">Academic Results</h1>
        <p className="text-secondary">View and download your semester results</p>
      </div>
      <div className="results-grid">
        {results.length > 0 ? (
          results.map((result) => (
            <div key={result.id} className="glass-card result-card">
              <div className="result-icon"><FileText size={32} color="var(--accent-primary)" /></div>
              <div className="result-info">
                <h3>{result.title}</h3>
                <div className="result-meta">
                  <span className="badge badge-info">{result.semester}</span>
                  <span className="result-date"><Clock size={14} /> {new Date(result.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <a href={`http://localhost:8000/${result.pdf_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary download-btn"><Download size={18} /> Download PDF</a>
            </div>
          ))
        ) : (
          <div className="no-results glass-panel">
            <FileText size={48} className="text-secondary" />
            <h3>No results found</h3>
            <p>Your examination results will appear here once uploaded by the administration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Results;
