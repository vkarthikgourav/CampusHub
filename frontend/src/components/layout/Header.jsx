import { Bell, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Dashboard';
    if (path === 'admin' && location.pathname.includes('results')) return 'Results Management';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="header glass-panel">
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      
      <div className="header-right">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <UserCircle size={32} color="var(--accent-primary)" />
          <div className="user-info">
            <span className="user-name">
              {user?.name || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest')}
            </span>
            {user?.name && <span className="user-role" style={{textTransform: 'capitalize'}}>{user.role}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
