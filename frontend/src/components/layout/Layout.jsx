import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIBot from '../common/AIBot';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      <AIBot />
    </div>
  );
};

export default Layout;
