import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CompanySetup from './components/CompanySetup';
import CompanySelector from './components/CompanySelector';
import CompanyManagement from './components/CompanyManagement';
import History from './components/History';
import Login from './components/Login';
import supabase from './supabaseClient';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user session:', error);
        }
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (username, password) => {
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {isAuthenticated && <Sidebar onLogout={handleLogout} />}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/" element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="/setup" element={
              isAuthenticated ? <CompanySetup /> : <Navigate to="/login" />
            } />
            <Route path="/select" element={
              isAuthenticated ? <CompanySelector /> : <Navigate to="/login" />
            } />
            <Route path="/company/:id" element={
              isAuthenticated ? <CompanyManagement /> : <Navigate to="/login" />
            } />
            <Route path="/history" element={
              isAuthenticated ? <History /> : <Navigate to="/login" />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;