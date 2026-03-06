import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppLayout() {
  const { isAdmin, userStatus } = useAuth();


  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">🐛 Bug Reporter</div>
        <ul className="nav-links">
          <li>
          <NavLink to="/login">Login</NavLink>
          </li>
          {/* Only show these links if logged in */}
          {userStatus && (
            <li>
              <NavLink to="/report">Report Bug</NavLink>
            </li>
          )}
          {/* Only show Reports List to admins */}
          {isAdmin && (
            <li>
              <NavLink to="/reports">Reports List</NavLink>
            </li>
          )}
        </ul>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    // AuthProvider wraps everything so all pages can access auth
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
