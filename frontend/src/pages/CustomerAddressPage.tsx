import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Loader2, X, Navigation } from 'lucide-react';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';

const CustomerAddressPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    street: '', city: '', state: '', zipCode: '', country: 'USA', isDefault: false,
    latitude: 0, longitude: 0
  });
  const [saving, setSaving] = useState(false);
  const [geolocating, setGeolocating] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response: any = await api.get('/customers/me/addresses');
      setAddresses(response || []);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  const captureLocation = () => {
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeolocating(false);
        alert('Site coordinates captured from GPS.');
      },
      () => {
        setGeolocating(false);
        alert('GPS signal restricted or unavailable.');
      }
    );
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers/me/addresses', formData);
      setIsModalOpen(false);
      setFormData({ street: '', city: '', state: '', zipCode: '', country: 'USA', isDefault: false, latitude: 0, longitude: 0 });
      fetchAddresses();
    } catch (err) { alert('Failed to register address'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Decommission this site address?')) return;
    await api.delete(`/customers/me/addresses/${id}`);
    fetchAddresses();
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Service Sites</h1>
              <p className="text-muted">Manage your primary locations and technical dispatch points.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={20} /> Register New Site
            </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {addresses.map((addr) => (
            <div key={addr.id} className="card-premium" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-h)', marginBottom: '4px' }}>{addr.street}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>{addr.city}, {addr.state} {addr.zipCode}</div>
                        
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleDelete(addr.id)} className="btn btn-secondary text-error" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                <Trash2 size={16} /> Decommission
                            </button>
                            {addr.latitude !== 0 && (
                                <div className="badge badge-success" style={{ fontSize: '10px' }}><CheckCircle2 size={12} /> GPS Verified</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            ))}

            {addresses.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '100px', textAlign: 'center', background: 'var(--surface-muted)', borderRadius: '24px', border: '1.5px dashed var(--border)' }}>
                    <MapPin size={64} className="text-muted" strokeWidth={1} style={{ marginBottom: '20px', opacity: 0.5 }} />
                    <h3 style={{ fontWeight: '800' }}>No addresses found</h3>
                    <p className="text-muted">Please register a site address to enable technical dispatch.</p>
                </div>
            )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Service Site" width="800px">
        <form onSubmit={handleAddAddress} className="premium-form-layout">
          <div className="form-group">
            <label className="form-label">Complete Street Address</label>
            <div className="search-bar">
                <MapPin size={18} className="text-muted" />
                <input type="text" placeholder="e.g. 123 Business Parkway" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} required />
            </div>
          </div>
          <div className="form-grid-standard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Locality / City</label>
              <div className="search-bar">
                <input type="text" placeholder="San Francisco" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Province / State</label>
              <div className="search-bar">
                <input type="text" placeholder="California" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Zip / Postal Code</label>
            <div className="search-bar" style={{ maxWidth: '300px' }}>
                <input type="text" placeholder="94103" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} required />
            </div>
          </div>

          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h4 className="stat-label" style={{ marginBottom: '12px' }}>Precision Dispatch (Optional)</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Capture your exact GPS coordinates to help technicians locate the site precisely.</p>
            <button type="button" onClick={captureLocation} className="btn btn-secondary" style={{ width: '100%' }} disabled={geolocating}>
                {geolocating ? <Loader2 className="animate-spin" /> : <><Navigation size={18} /> Synchronize Current Location</>}
            </button>
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Discard</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '180px' }}>
                {saving ? <Loader2 className="animate-spin" /> : 'Authorize Site'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
          .form-label { display: block; font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
          .stat-label { font-size: 11px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
          .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--border); }
          .premium-form-layout { display: flex; flex-direction: column; gap: 24px; padding: 8px 4px; }
      `}</style>
    </Layout>
  );
};

export default CustomerAddressPage;
