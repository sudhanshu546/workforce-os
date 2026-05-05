import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api'; // Your configured Axios instance
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const CustomerLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    if (token && role) {
      // Decide where to redirect based on role if necessary, or just to a default authenticated page
      navigate('/dashboard', { replace: true }); 
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      // Use the dedicated customer auth endpoint
      const response = await api.post('/customers/auth/login', data); 
      
      // The backend returns access_token and refresh_token
      dispatch(setCredentials({ 
        accessToken: response.data.access_token, 
        refreshToken: response.data.refresh_token, 
        role: response.data.role,
        customerId: response.data.customerId 
      }));
      
      // Redirect to a customer-specific dashboard or default page
      navigate('/dashboard', { replace: true }); 
    } catch (err: any) {
      // Handle errors, e.g., display a message
      alert(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(109, 40, 217, 0.1)', borderRadius: '12px' }}> {/* Style for customer */}
            <User size={32} color="#7c3aed" />
          </div>
          <h1>Customer Portal</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Sign in to manage your services</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="email"
                placeholder="your.email@example.com"
                style={{ paddingLeft: '40px' }}
                {...register('email')}
                required
                disabled={loading}
              />
            </div>
            {errors.email && <p className="error-message">{errors.email.message}</p>}
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
                {...register('password')}
                required
                disabled={loading}
              />
            </div>
            {errors.password && <p className="error-message">{errors.password.message}</p>}
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
            Don't have an account? <a href="/customer/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register Now</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
