import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserPlus, HardHat, Loader2, User, Phone } from 'lucide-react'; // Added User and Phone icons
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api'; // Your configured Axios instance
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice'; // Your auth slice actions

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }), // Basic length, consider regex for E.164
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Associate error with confirmPassword field
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const CustomerRegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for API errors
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      // Use the dedicated customer registration endpoint
      const response = await api.post('/customers/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        // Add other fields if your backend CustomerRegisterRequest DTO requires them,
        // e.g., tenantId if it's not managed automatically.
      });
      
      // The backend returns access_token and refresh_token
      dispatch(setCredentials({ 
        accessToken: response.data.access_token, 
        refreshToken: response.data.refresh_token, 
        role: response.data.role, // e.g., "CUSTOMER"
        customerId: response.data.customerId 
      }));
      
      // Redirect to dashboard or a confirmation page
      navigate('/dashboard', { replace: true }); 
    } catch (err: any) {
      // Handle errors, e.g., display a message
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      alert(`Registration failed: ${err.response?.data?.message || 'Please check your details and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(109, 40, 217, 0.1)', borderRadius: '12px' }}> {/* Style for customer */}
            <UserPlus size={32} color="#7c3aed" />
          </div>
          <h1>Create Your Account</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Join our platform as a customer</p>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="name"
                placeholder="Your Full Name"
                style={{ paddingLeft: '40px' }}
                {...register('name')}
                required
                disabled={loading}
              />
            </div>
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="phone"
                placeholder="+1 (555) 123-4567"
                style={{ paddingLeft: '40px' }}
                {...register('phone')}
                required
                disabled={loading}
              />
            </div>
            {errors.phone && <p className="error-message">{errors.phone.message}</p>}
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

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                {...register('confirmPassword')}
                required
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account? <a href="/customer/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login Here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;
