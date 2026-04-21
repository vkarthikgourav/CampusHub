import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Hostel from './pages/Hostel';
import Timetable from './pages/Timetable';
import Contacts from './pages/Contacts';
import Fees from './pages/Fees';
import Complaints from './pages/Complaints';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Results from './pages/Results';
import AdminResults from './pages/AdminResults';
import Events from './pages/Events';

// Guard: redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // wait for Firebase to resolve
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/hostel"     element={<Hostel />} />
            <Route path="/timetable"  element={<Timetable />} />
            <Route path="/contacts"   element={<Contacts />} />
            <Route path="/students"   element={<Students />} />
            <Route path="/classes"    element={<Classes />} />
            <Route path="/fees"       element={<Fees />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/results"    element={<Results />} />
            <Route path="/admin/results" element={<AdminResults />} />
            <Route path="/events"    element={<Events />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;