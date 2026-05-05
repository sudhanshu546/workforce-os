import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Loader2, X, Save } from 'lucide-react';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';

const CustomerAddressPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/customers/me/addresses');
      setAddresses(response.data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers/me/addresses', formData);
      setIsModalOpen(false);
      setFormData({ street: '', city: '', state: '', zipCode: '', country: 'USA', isDefault: false });
      fetchAddresses();
    } catch (err) {
      alert('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/customers/me/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div></Layout>;

  return (
    <Layout>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Manage Addresses</h1>
          <p style={{ color: 'var(--text-muted)' }}>Set your service locations</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add New Address
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {addresses.map((address) => (
          <div key={address.id} className="card" style={{ padding: '24px', position: 'relative', border: address.isDefault ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
            {address.isDefault && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>
                <CheckCircle2 size={14} /> Default
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', height: 'fit-content' }}>
                <MapPin size={20} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{address.street}</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{address.city}, {address.state} {address.zipCode}</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{address.country}</p>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button onClick={() => handleDelete(address.id)} className="text-error" style={{ border: 'none', background: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '2px dashed var(--border)' }}>
            <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No addresses found. Add one to get started.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Address">
        <form onSubmit={handleAddAddress}>
          <div className="input-group">
            <label>Street Address</label>
            <input 
              type="text" 
              placeholder="123 Main St" 
              value={formData.street} 
              onChange={e => setFormData({...formData, street: e.target.value})} 
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Zip Code</label>
              <input type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Country</label>
              <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <input 
              type="checkbox" 
              id="isDefault" 
              checked={formData.isDefault} 
              onChange={e => setFormData({...formData, isDefault: e.target.checked})} 
            />
            <label htmlFor="isDefault" style={{ fontSize: '14px', cursor: 'pointer' }}>Set as default address</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : 'Save Address'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default CustomerAddressPage;
