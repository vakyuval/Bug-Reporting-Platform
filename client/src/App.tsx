import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { ReportsPage } from './pages/ReportsPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import './App.css';

function AppLayout() {
  const { userStatus, logout, userEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  // Landing page has its own nav
  if (location.pathname === '/') return null;

  return (
    <nav className={`nav${menuOpen ? ' open' : ''}`}>
      <div className="nav-brand">🐛 Bug Reporter</div>

      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
        </li>

        {!userStatus && (
          <li>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Login
            </NavLink>
          </li>
        )}

        {userStatus && (
          <>
            <li>
              <NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                Report Bug
              </NavLink>
            </li>
            {userStatus === 'allowed' && (
              <li>
                <NavLink to="/my-reports" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  My Reports
                </NavLink>
              </li>
            )}
            {userStatus === 'admin' && (
              <li>
                <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                  Admin Reports
                </NavLink>
              </li>
            )}
          </>
        )}
      </ul>

      
      <div style={{ flex: 1 }} />

      <div className="nav-actions">
        <button
          className="dark-toggle"
          onClick={() => setDarkMode(d => !d)}
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {userEmail && (
        <button onClick={handleLogout} className="btn btn-secondary logout-btn">
          Logout
        </button>
      )}
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userEmail } = useAuth();
  return userEmail ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppLayout />
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
          <main className="main">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              <Route path="/my-reports" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/reports/:id" element={<ProtectedRoute><ReportDetailsPage /></ProtectedRoute>} />
              <Route path="/my-reports/:id" element={<ProtectedRoute><ReportDetailsPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;