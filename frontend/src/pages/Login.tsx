import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, HardHat, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setCredentials } from '../redux/authSlice';
import api from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const data: any = await api.post('/auth/login', values);
      
      dispatch(setCredentials({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          role: data.role,
          user: data.user || { name: 'User', phone: '', email: values.email },
          workerId: data.workerId,
          customerId: data.customerId
      }));

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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="name@company.com"
                className={`has-icon ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                {...register('password')}
                type="password"
                id="password"
                placeholder="••••••••"
                className={`has-icon ${errors.password ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
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
