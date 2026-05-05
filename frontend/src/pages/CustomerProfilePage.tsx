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
      const response = await api.get('/auth/profile');
      setProfile(response.data);
      setFormData({ name: response.data.name, phone: response.data.number || '' });
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
      const response = await api.put('/customers/me', formData);
      // Backend returns CustomerProfileResponse which might not have phone if not updated there.
      // But our service updates both. Let's re-fetch to be sure or merge.
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700' }}>My Profile</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage your personal information</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </header>

        <div className="card" style={{ padding: '32px' }}>
          {editing ? (
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn" style={{ background: '#f1f5f9' }}>
                  <X size={18} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{profile?.name}</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Customer</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                    <Mail size={16} color="var(--primary)" /> {profile?.email}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                    <Phone size={16} color="var(--primary)" /> {profile?.number}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerProfilePage;
