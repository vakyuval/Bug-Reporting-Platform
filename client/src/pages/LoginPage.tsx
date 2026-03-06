import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/report');
  };

  return (
    <div className="page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}
