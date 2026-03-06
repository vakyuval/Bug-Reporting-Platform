import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { ReportsPage } from './pages/ReportsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">🐛 Bug Reporter</div>
          <ul className="nav-links">
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>
                Report Bug
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                Reports List
              </NavLink>
            </li>
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
    </BrowserRouter>
  );
}

export default App;
