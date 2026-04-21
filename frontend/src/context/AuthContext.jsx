import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const parseToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub,
        role: payload.role || 'student',
        name: payload.name || '',
        department: payload.department || '',
        user_id: payload.user_id || null,
        roll_number: payload.roll_number || '',
      };
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
      } else {
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('access_token', token);
    const parsed = parseToken(token);
    if (parsed) setUser(parsed);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
