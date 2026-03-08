import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from './LoginPage';

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [touched, setTouched]         = useState<Record<string, boolean>>({});

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  // Inline validation — only shows after field is touched
  const nameError     = touched.name     && name.trim().length < 2          ? 'Name must be at least 2 characters.'     : '';
  const emailError    = touched.email    && !validateEmail(email)            ? 'Please enter a valid email.'             : '';
  const passwordError = touched.password && password.length < 6             ? 'Password must be at least 6 characters.' : '';
  const confirmError  = touched.confirm  && confirm !== password             ? 'Passwords do not match.'                 : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields so all errors show at once
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (
      name.trim().length < 2 ||
      !validateEmail(email)  ||
      password.length < 6    ||
      confirm !== password
    ) return;

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.register(name.trim(), email, password);

      // Auto-login after successful registration
      const result = await apiClient.checkStatus(email, password);
      login(email, result.status);
      navigate('/my-reports');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <h1>Create Account</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => touch('name')}
            disabled={isLoading}
            autoComplete="name"
          />
          {nameError && <span className="validation-hint" style={{ color: 'var(--danger)' }}>{nameError}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => touch('email')}
            disabled={isLoading}
            autoComplete="email"
          />
          {emailError && <span className="validation-hint" style={{ color: 'var(--danger)' }}>{emailError}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              disabled={isLoading}
              autoComplete="new-password"
              style={{ paddingRight: '3rem', width: '100%' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.85rem', padding: 0,
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordError && <span className="validation-hint" style={{ color: 'var(--danger)' }}>{passwordError}</span>}
        </div>

        {/* Confirm password */}
        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onBlur={() => touch('confirm')}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {confirmError && <span className="validation-hint" style={{ color: 'var(--danger)' }}>{confirmError}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
          Log in
        </Link>
      </p>
    </div>
  );
}