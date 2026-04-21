import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, ShieldCheck, ArrowRight, Shield, Database, Globe } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Background Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Navbar */}
      <nav className="landing-nav glass-panel">
        <div className="landing-logo">
          <img src="/au.png" alt="University Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <span className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>CampusHub</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#stats" className="nav-link">Stats</a>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ borderRadius: '12px' }}>Join Now</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge badge-info fade-in" style={{ animationDelay: '0.1s', marginBottom: '1.5rem', padding: '0.5rem 1.2rem', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            <Globe size={16} style={{ marginRight: '8px' }} />
            NEXT-GEN CAMPUS MANAGEMENT
          </div>
          <h1 className="hero-title fade-in" style={{ animationDelay: '0.2s' }}>
            Integrated <br />
            <span className="text-gradient">Intelligence</span> <br />
            For Modern <span style={{ color: 'white' }}>Campus</span>
          </h1>
          <p className="hero-subtitle fade-in" style={{ animationDelay: '0.3s' }}>
            Seamlessly coordinate classes, housing, and grievances with a high-fidelity platform designed for peak institutional efficiency.
          </p>
          <div className="hero-actions fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '14px' }}>
              Launch Dashboard <ArrowRight size={20} />
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '14px' }}>
              Learn More
            </a>
          </div>
        </div>

        <div className="hero-visual-wrapper fade-in" style={{ animationDelay: '0.5s' }}>
           <img src="/project_assets/campus_hub_hero_3d.png" alt="Campus 3D" className="hero-main-image" />
           {/* Decorative elements */}
           <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', border: '2px solid var(--accent-primary)', borderRadius: '20px', opacity: 0.2, zIndex: -1 }}></div>
           <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '150px', height: '150px', border: '2px solid var(--accent-secondary)', borderRadius: '50%', opacity: 0.2, zIndex: -1 }}></div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="stats-grid">
            <div className="stat-item">
                <div className="stat-value text-gradient">2.5K+</div>
                <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
                <div className="stat-value text-gradient">98%</div>
                <div className="stat-label">Issue Resolution</div>
            </div>
            <div className="stat-item">
                <div className="stat-value text-gradient">150+</div>
                <div className="stat-label">Verified Faculty</div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Engineered for <span className="text-gradient">Precision</span></h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', lineHeight: 1.8 }}>
            A comprehensive suite of tools built on a high-performance REST architecture to handle the complex needs of your modern institution.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon" style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-primary)' }}>
              <Database size={32} />
            </div>
            <h3>Dynamic Academics</h3>
            <p>Smart enrollment systems that auto-map students to their departmental curriculum with real-time timetable synchronization.</p>
          </div>
          
          <div className="feature-card glass-panel">
             <div className="feature-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-secondary)' }}>
              <ShieldCheck size={32} />
            </div>
            <h3>Grievance Oversight</h3>
            <p>A transparent redressal system allowing students to report issues with full visibility into the resolution lifecycle.</p>
          </div>

          <div className="feature-card glass-panel">
             <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
              <Users size={32} />
            </div>
            <h3>Unified Directory</h3>
            <p>Instant access to peers, teachers, and administrators through a secure, permission-controlled campus directory.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{ padding: '8rem 8%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '5rem', borderRadius: '40px', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(14, 165, 233, 0.1))' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Ready to transform your campus?</h2>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem', borderRadius: '16px' }}>
                Create Your Account Now
            </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-logo">
          <img src="/au.png" alt="Logo" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontWeight: 700, color: 'white' }}>CampusHub</span>
        </div>
        <p>© 2026 CampusHub. Built for Excellence.</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" className="nav-link">Privacy</a>
            <a href="#" className="nav-link">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
