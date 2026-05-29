import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Briefcase, Building2, ArrowRight, Loader2, HardHat } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

const registerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Please select a business type'),
  name: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessType: 'ELECTRICAL'
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register-organization', values);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('role', response.data.role || 'OWNER');
      showToast('Organization registered successfully!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <HardHat size={32} color="#2563eb" />
          </div>
          <h1>Register Organization</h1>
          <p className="auth-subtitle">Start managing your workforce today</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Business Name</label>
              <div className="input-wrapper">
                <Building2 className="input-icon" size={18} />
                <input
                  {...register('businessName')}
                  type="text"
                  placeholder="AC Experts Ltd"
                  className={`has-icon ${errors.businessName ? 'input-error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.businessName && <span className="error-text">{errors.businessName.message}</span>}
            </div>

            <div className="input-group">
              <label>Business Type</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" size={18} />
                <select
                  {...register('businessType')}
                  className={`has-icon ${errors.businessType ? 'input-error' : ''}`}
                  disabled={loading}
                >
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="HVAC">AC/HVAC</option>
                  <option value="CARPENTRY">Carpentry</option>
                  <option value="CLEANING">Cleaning Services</option>
                </select>
              </div>
              {errors.businessType && <span className="error-text">{errors.businessType.message}</span>}
            </div>
          </div>

          <div className="input-group">
            <label>Owner Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                {...register('name')}
                type="text"
                placeholder="John Doe"
                className={`has-icon ${errors.name ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="input-group">
            <label>Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                {...register('email')}
                type="email"
                placeholder="john@company.com"
                className={`has-icon ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1 (555) 000-0000"
                className={`has-icon ${errors.phone ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.phone && <span className="error-text">{errors.phone.message}</span>}
          </div>

          <div className="input-group">
            <label>Create Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                {...register('password')}
                type="password"
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
