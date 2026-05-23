import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import api from '../services/api';
import { Plus, MessageSquare, AlertCircle, Camera } from 'lucide-react';
import Modal from '../components/Modal';

const SupportPage: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', workOrderId: '' });

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res: any = await api.get('/support/tickets');
            setTickets(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/support/tickets', formData);
            (window as any).showToast('Ticket submitted successfully', 'success');
            setIsModalOpen(false);
            fetchTickets();
        } catch (e) { (window as any).showToast('Failed to submit', 'error'); }
    };

    if (loading) return <Layout><LoadingSpinner /></Layout>;

    return (
        <Layout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900' }}>Support Center</h1>
                        <p className="text-muted">Need help? Submit a ticket and our team will get back to you.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18}/> New Ticket</button>
                </header>

                <ExpandableRowTable 
                    data={tickets}
                    columns={[
                        { header: 'Ticket', accessor: (t: any) => <div><div style={{ fontWeight: 800 }}>{t.title}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{t.id + 5000}</div></div> },
                        { header: 'Status', accessor: (t: any) => <span className={`badge ${t.status === 'OPEN' ? 'badge-primary' : 'badge-success'}`}>{t.status}</span> },
                        { header: 'Priority', accessor: (t: any) => <span style={{ fontWeight: 700, color: t.priority === 'URGENT' ? 'var(--error)' : 'var(--text-main)' }}>{t.priority}</span> }
                    ]}
                    renderExpanded={(t: any) => (
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <p style={{ marginBottom: '16px' }}>{t.description}</p>
                            <button className="btn btn-secondary">View Conversation</button>
                        </div>
                    )}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Support Request">
                <form onSubmit={handleSubmit} className="premium-form-layout">
                    <input className="input-field" placeholder="Brief subject..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <textarea className="input-field" rows={4} placeholder="Describe the issue..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    <button type="submit" className="btn btn-primary">Submit Ticket</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default SupportPage;
