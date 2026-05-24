import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Palette, Upload, Loader2, Save, Building, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const Settings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [branding, setBranding] = useState({
        logoUrl: '',
        primaryColor: '#4f46e5',
        secondaryColor: '#4338ca'
    });

    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            const res: any = await api.get('/organization/branding');
            if (res) {
                setBranding({
                    logoUrl: res.logoUrl || '',
                    primaryColor: res.primaryColor || '#4f46e5',
                    secondaryColor: res.secondaryColor || '#4338ca'
                });
            }
        } catch (e) {
            console.error('Failed to fetch branding');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/organization/branding', branding);
            if ((window as any).showToast) (window as any).showToast('Branding updated successfully', 'success');
            
            // Apply colors immediately
            document.documentElement.style.setProperty('--primary', branding.primaryColor);
            document.documentElement.style.setProperty('--primary-hover', branding.secondaryColor);
            
        } catch (e) {
            if ((window as any).showToast) (window as any).showToast('Failed to update branding', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res: any = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Construct full URL if needed, assuming backend returns filename
            const url = `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}/uploads/${res.fileName || res}`;
            setBranding({ ...branding, logoUrl: url });
        } catch (err) {
            console.error('Upload failed');
        }
    };

    if (loading) return <Layout><div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin text-primary" /></div></Layout>;

    return (
        <Layout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900' }}>System Settings</h1>
                    <p className="text-muted">Personalize your organization's presence and dashboard visuals.</p>
                </header>

                <form onSubmit={handleSave} className="premium-form-layout">
                    <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        <div className="settings-section">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Building className="text-primary" size={20} />
                                <h3 style={{ fontWeight: '800' }}>Organization Branding</h3>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
                                <div>
                                    <label className="form-label">Company Logo</label>
                                    <div className="logo-preview-container">
                                        {branding.logoUrl ? (
                                            <img src={branding.logoUrl} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '120px', background: 'var(--surface-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)' }}>
                                                <ImageIcon size={32} className="text-muted" />
                                            </div>
                                        )}
                                        <div style={{ marginTop: '12px' }}>
                                            <input type="file" id="logo-upload" hidden onChange={handleLogoUpload} accept="image/*" />
                                            <label htmlFor="logo-upload" className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
                                                <Upload size={16} /> {branding.logoUrl ? 'Change Logo' : 'Upload Logo'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label className="form-label">Primary Brand Color</label>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <input 
                                                type="color" 
                                                value={branding.primaryColor} 
                                                onChange={e => setBranding({...branding, primaryColor: e.target.value})}
                                                style={{ width: '60px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                            />
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={branding.primaryColor} 
                                                onChange={e => setBranding({...branding, primaryColor: e.target.value})}
                                                style={{ flex: 1, fontFamily: 'monospace' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>This color will be used for buttons, links, and active states.</p>
                                    </div>

                                    <div>
                                        <label className="form-label">Secondary / Hover Color</label>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <input 
                                                type="color" 
                                                value={branding.secondaryColor} 
                                                onChange={e => setBranding({...branding, secondaryColor: e.target.value})}
                                                style={{ width: '60px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                            />
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={branding.secondaryColor} 
                                                onChange={e => setBranding({...branding, secondaryColor: e.target.value})}
                                                style={{ flex: 1, fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '24px', background: 'var(--primary-light)', borderRadius: '16px', border: '1px solid rgba(79,70,229,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                                <Palette className="text-primary" style={{ marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ fontWeight: '800', color: 'var(--text-h)', marginBottom: '4px' }}>Live Preview</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Changes applied here will be visible to all members of your organization and will appear on generated Invoices and Reports.</p>
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                        <button type="button" className="btn btn-primary" style={{ background: branding.primaryColor, borderColor: branding.primaryColor }}>Sample Button</button>
                                        <div className="badge" style={{ background: branding.primaryColor, color: 'white' }}>Sample Badge</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px', fontSize: '16px' }}>
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {saving ? 'Saving Changes...' : 'Save Branding Settings'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .logo-preview-container { background: white; border-radius: 12px; }
                .form-label { display: block; font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
            `}</style>
        </Layout>
    );
};

export default Settings;
