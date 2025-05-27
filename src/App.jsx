import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SchedulePage from './pages/SchedulePage';
import AnalysisPage from './pages/AnalysisPage';
import PomodoroPage from './pages/PomodoroPage';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.valid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token validation failed:', error.message);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    validateToken();
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    validateToken();
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register onRegister={handleRegister} />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/schedule"
          element={isAuthenticated ? <SchedulePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/analysis"
          element={isAuthenticated ? <AnalysisPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/pomodoro"
          element={isAuthenticated ? <PomodoroPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}