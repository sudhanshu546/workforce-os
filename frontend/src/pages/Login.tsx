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
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px' }}>
            <HardHat size={32} color="#2563eb" />
          </div>
          <h1>Workforce OS</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Sign in to manage your operations</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--error)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Are you a Customer? <a href="/customer/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login Here</a> or <a href="/customer/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register as Customer</a>
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '16px' }}>
            Don't have an organization account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register Organization</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
