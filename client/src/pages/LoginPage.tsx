import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function validateEmail(value: string): boolean {

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // true while waiting for API
  const [error, setError] = useState<string | null>(null);  // null = no error
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Inline validation errors (only shown after user touches the field)
  const emailError   = touched.email    && !validateEmail(email)       ? 'Please enter a valid email.'       : '';
  const passwordError = touched.password && password.trim().length < 6  ? 'Password must be at least 6 characters.' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // stops the page from refreshing on form submit

    // Mark all fields as touched so errors show
    setTouched({ email: true, password: true });

    if (!validateEmail(email) || password.trim().length < 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.checkStatus(email, password);

      if (result.status === 'blacklisted') {
        // Show the reason from the server
        setError(`Access denied - Your account has been blocked: ${result.reason}`);
        return;
      }

      // Save the user's email + status globally (in AuthContext)
      login(email, result.status);

      // Redirect based on role
      if (result.status === 'admin') {
        navigate('/reports');
      } else {
        navigate('/my-reports');
      }

    } catch (err) {
      // This runs if the server is down or returns an error
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="login-shell">
      <div className="login-wrapper">
        <div className='login-card'> 
          <h1>Login</h1>

          {/* Show error message if there is one */}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                disabled={isLoading}
                required
              />
              {emailError && (
                <span className="validation-hint" style={{ color: 'var(--danger)' }}>
                  {emailError}
                </span>
              )}
            </div>
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  disabled={isLoading}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem', width: '100%' }}
                />
                {/* Show / hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.85rem', padding: 0,
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {passwordError && (
                <span className="validation-hint" style={{ color: 'var(--danger)' }}>
                  {passwordError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </div>
        <p style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
      
    </div>
    
    );
  }