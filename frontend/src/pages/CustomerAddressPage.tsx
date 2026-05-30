import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, X, Navigation, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

const CustomerAddressPage: React.FC = () => {
  const showToast = useToast();
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
        showToast('Site coordinates captured from GPS.', 'success');
      },
      () => {
        setGeolocating(false);
        showToast('GPS signal restricted or unavailable.', 'error');
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
      showToast('Address registered successfully', 'success');
    } catch (err) { showToast('Failed to register address', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Decommission this site address?')) return;
    await api.delete(`/customers/me/addresses/${id}`);
    fetchAddresses();
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.02em' }}>Service Sites</h1>
              <p className="text-muted" style={{ fontSize: '16px', fontWeight: '500' }}>Manage your primary locations and technical dispatch points.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Plus size={20} /> Register New Site
            </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '32px' }}>
            {addresses.map((addr) => (
            <div key={addr.id} className="card-premium" style={{ padding: '32px', borderTop: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '20px', color: 'var(--text-h)', marginBottom: '6px' }}>{addr.street}</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '16px' }}>{addr.city}, {addr.state} {addr.zipCode}</div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                            <button onClick={() => handleDelete(addr.id)} className="btn btn-secondary text-error" style={{ padding: '8px 16px', fontSize: '12px', border: 'none', background: '#fff1f2' }}>
                                <Trash2 size={16} /> Decommission
                            </button>
                            {addr.latitude !== 0 ? (
                                <div className="badge badge-success" style={{ fontSize: '11px', fontWeight: '800', background: '#dcfce7', color: '#166534', border: 'none' }}><CheckCircle2 size={14} /> GPS Verified</div>
                            ) : (
                                <div className="badge" style={{ fontSize: '11px', fontWeight: '800', background: '#f1f5f9', color: '#64748b' }}><Navigation size={14} /> Coordinates Missing</div>
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
