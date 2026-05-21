import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Briefcase, Building2, ArrowRight, Loader2, HardHat } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    businessType: 'ELECTRICAL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register-organization', formData);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('role', response.data.role || 'OWNER');
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Business Name</label>
              <div className="input-wrapper">
                <Building2 className="input-icon" size={18} />
                <input
                  name="businessName"
                  type="text"
                  placeholder="AC Experts Ltd"
                  className="has-icon"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Business Type</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" size={18} />
                <select
                  name="businessType"
                  className="has-icon"
                  onChange={handleChange}
                >
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="HVAC">AC/HVAC</option>
                  <option value="CARPENTRY">Carpentry</option>
                  <option value="CLEANING">Cleaning Services</option>
                </select>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Owner Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                className="has-icon"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                name="email"
                type="email"
                placeholder="john@company.com"
                className="has-icon"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="has-icon"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Create Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="has-icon"
                onChange={handleChange}
                required
              />
            </div>
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
