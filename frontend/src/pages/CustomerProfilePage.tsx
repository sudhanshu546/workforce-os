import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, X, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';

const CustomerProfilePage: React.FC = () => {
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
      setFormData({ name: data.name, phone: data.number || '' });
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
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Personal Identity</h1>
            <p className="text-muted">Maintain your contact records and secure account preferences.</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary">
              <Edit2 size={18} /> Modify Profile
            </button>
          )}
        </header>

        <div className="card-premium" style={{ padding: '40px' }}>
          {editing ? (
            <form onSubmit={handleUpdate} className="premium-form-layout">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '180px' }}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Commit Changes
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  <X size={18} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                  {profile?.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-h)' }}>{profile?.name}</h2>
                  <span className="badge badge-primary" style={{ marginTop: '4px' }}>Registered Client</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '40px' }}>
                <div>
                  <div className="stat-label" style={{ marginBottom: '8px' }}>Verified Email</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', color: 'var(--text-h)', fontSize: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} className="text-muted" /></div>
                    {profile?.email}
                  </div>
                </div>
                <div>
                  <div className="stat-label" style={{ marginBottom: '8px' }}>Phone Line</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', color: 'var(--text-h)', fontSize: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} className="text-muted" /></div>
                    {profile?.number}
                  </div>
                </div>
              </div>
            </div>
          )}
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
