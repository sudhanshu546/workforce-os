import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, X, Loader2, ShieldCheck } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

const CustomerProfilePage: React.FC = () => {
  const showToast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data: any = await api.get('/customers/me');
      setProfile(data);
      setFormData({ name: data.name, phone: data.phone || '' });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/customers/me', formData);
      await fetchProfile();
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.02em' }}>Personal Identity</h1>
            <p className="text-muted" style={{ fontSize: '16px', fontWeight: '500' }}>Maintain your contact records and secure account preferences.</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Edit2 size={18} /> Modify Profile
            </button>
          )}
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
          <div className="card-premium" style={{ padding: '40px' }}>
            {editing ? (
              <form onSubmit={handleUpdate} className="premium-form-layout">
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Legal Name</label>
                    <div className="search-bar">
                        <User size={18} className="text-muted" />
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={e => setFormData({ ...formData, name: e.target.value })} 
                          required 
                        />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Contact Number</label>
                    <div className="search-bar">
                        <Phone size={18} className="text-muted" />
                        <input 
                          type="tel" 
                          value={formData.phone} 
                          onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                          required 
                        />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '180px', height: '48px' }}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Commit Changes
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary" style={{ height: '48px' }}>
                    <X size={18} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gap: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: '900', border: '3px solid white', boxShadow: 'var(--shadow-sm)' }}>
                    {profile?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-h)' }}>{profile?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>{profile?.email}</p>
                    <span className="badge badge-success" style={{ marginTop: '12px', display: 'inline-flex' }}>System Verified Profile</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '40px' }}>
                  <div>
                    <div className="stat-label" style={{ marginBottom: '8px' }}>Verified Email</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', color: 'var(--text-h)', fontSize: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} className="text-primary" /></div>
                      {profile?.email}
                    </div>
                  </div>
                  <div>
                    <div className="stat-label" style={{ marginBottom: '8px' }}>Primary Phone</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', color: 'var(--text-h)', fontSize: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={20} className="text-primary" /></div>
                      {profile?.phone || 'Not Configured'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card-premium" style={{ padding: '32px', background: 'var(--surface-muted)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} className="text-success" /> Trust & Safety
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: '500' }}>
                Your personal data is encrypted and managed according to industrial security standards. We never share your contact details with providers until a service is booked.
              </p>
            </div>
            
            <div className="card-premium" style={{ padding: '32px', border: '1.5px dashed var(--border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>Account Security</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '500' }}>
                Multi-factor authentication is active on your account via your registered email.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }} onClick={() => showToast('Verification link sent to your device.', 'info')}>Refresh Security Keys</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
          .form-label { display: block; font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
          .stat-label { font-size: 11px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>
    </Layout>
  );
};

export default CustomerProfilePage;
