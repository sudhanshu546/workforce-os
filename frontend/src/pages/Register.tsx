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
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px' }}>
            <HardHat size={32} color="#2563eb" />
          </div>
          <h1>Register Organization</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Start managing your workforce today</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Business Name</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  name="businessName"
                  type="text"
                  placeholder="AC Experts Ltd"
                  style={{ paddingLeft: '40px' }}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Business Type</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  name="businessType"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px 12px 40px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    fontSize: '16px',
                    appearance: 'none',
                    background: 'white'
                  }}
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
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                style={{ paddingLeft: '40px' }}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                name="email"
                type="email"
                placeholder="john@company.com"
                style={{ paddingLeft: '40px' }}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                style={{ paddingLeft: '40px' }}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Create Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
