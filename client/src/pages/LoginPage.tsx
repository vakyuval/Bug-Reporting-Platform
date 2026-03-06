import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function validateEmail(value: string){ 
  return (value.includes('@') && value.includes('.'));
}

export function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // true while waiting for API
  const [error, setError] = useState<string | null>(null);  // null = no error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // stops the page from refreshing on form submit

    // Basic validation before calling the API
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail){
      setError('no valid email');
      return;
    }
    setIsLoading(true);   // show loading state
    setError(null);       // clear any previous error

    try {
      const result = await apiClient.checkStatus(email);

      if (result.status === 'blacklisted') {
        // Show the reason from the server
        setError(`Access denied: ${result.reason}`);
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
      // This ALWAYS runs — whether success or error
      setIsLoading(false);
    }
  };


  return (
    <div className="page">
      <h1>Login</h1>

      {/* Show error message if there is one */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {/* Change button text while loading */}
          {isLoading ? 'Checking...' : 'Login'}
        </button>
      </form>

      
    </div>
  );
}
