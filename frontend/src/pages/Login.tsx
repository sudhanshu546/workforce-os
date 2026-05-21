import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, HardHat, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data: any = await api.post('/auth/login', { email, password });
      
      dispatch(setCredentials({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          role: data.role,
          user: data.user || { name: 'User', phone: '', email: email },
          customerId: data.customerId
      }));

      if (data.workerId) {
        localStorage.setItem('worker_id', data.workerId.toString());
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <HardHat size={32} color="#2563eb" />
          </div>
          <h1>Workforce OS</h1>
          <p className="auth-subtitle">Sign in to manage your operations</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                className="has-icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="has-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Are you a Customer? <a href="/customer/login">Login Here</a> or <a href="/customer/register">Register as Customer</a>
          </p>
          <p className="footer-secondary">
            Don't have an organization account? <a href="/register">Register Organization</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
