import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserPlus, HardHat, Loader2, User, Phone } from 'lucide-react'; // Added User and Phone icons
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api'; // Your configured Axios instance
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice'; // Your auth slice actions
import { useToast } from '../components/ToastProvider';

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
  const showToast = useToast();
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
      const responseData: any = await api.post('/customers/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        // Add other fields if your backend CustomerRegisterRequest DTO requires them,
        // e.g., tenantId if it's not managed automatically.
      });
      
      // The backend returns access_token and refresh_token
      dispatch(setCredentials({ 
        accessToken: responseData.access_token, 
        refreshToken: responseData.refresh_token, 
        role: responseData.role, // e.g., "CUSTOMER"
        user: responseData.user || { name: responseData.name, phone: '', email: data.email },
        customerId: responseData.customerId ,
      }));
      
      // Redirect to dashboard or a confirmation page
      navigate('/dashboard', { replace: true }); 
    } catch (err: any) {
      // Handle errors, e.g., display a message
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      showToast(`Registration failed: ${err.response?.data?.message || 'Please check your details and try again.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper" style={{ background: 'rgba(109, 40, 217, 0.1)' }}>
            <UserPlus size={32} color="#7c3aed" />
          </div>
          <h1>Create Your Account</h1>
          <p className="auth-subtitle">Join our platform as a customer</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="name"
                placeholder="Your Full Name"
                className="has-icon"
                {...register('name')}
                required
                disabled={loading}
              />
            </div>
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                placeholder="your.email@example.com"
                className="has-icon"
                {...register('email')}
                required
                disabled={loading}
              />
            </div>
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                id="phone"
                placeholder="+1 (555) 123-4567"
                className="has-icon"
                {...register('phone')}
                required
                disabled={loading}
              />
            </div>
            {errors.phone && <p className="error-message">{errors.phone.message}</p>}
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
                {...register('password')}
                required
                disabled={loading}
              />
            </div>
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                className="has-icon"
                {...register('confirmPassword')}
                required
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/customer/login">Login Here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;

