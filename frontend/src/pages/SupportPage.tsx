import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import api from '../services/api';
import { Plus, MessageSquare, AlertCircle, Camera, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import { SupportConversation } from '../components/SupportConversation';
import { useToast } from '../components/ToastProvider';
import { Pagination } from '../components/Pagination';

const SupportPage: React.FC = () => {
    const showToast = useToast();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', workOrderId: '' });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    useEffect(() => { fetchTickets(page); }, [page]);

    const fetchTickets = async (pageNumber: number) => {
        setLoading(true);
        try {
            const res: any = await api.get(`/support/tickets?page=${pageNumber}&size=${pageSize}`);
            setTickets(res.content || []);
            setTotalPages(res.totalPages || 0);
            setTotalElements(res.totalElements || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/support/tickets', formData);
            showToast('Ticket submitted successfully', 'success');
            setIsModalOpen(false);
            fetchTickets(page);
        } catch (e) { showToast('Failed to submit', 'error'); }
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
                        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Request Details</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--text-h)', lineHeight: '1.6', marginBottom: '16px' }}>{t.description}</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                            <Clock size={14} className="text-muted" /> 
                                            <span style={{ color: 'var(--text-muted)' }}>Created:</span>
                                            <span style={{ fontWeight: '700' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {t.workOrder && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                <AlertCircle size={14} className="text-muted" /> 
                                                <span style={{ color: 'var(--text-muted)' }}>Linked Job:</span>
                                                <span style={{ fontWeight: '700' }}>#WO-{t.workOrder.id + 1000}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        <MessageSquare size={14} /> Conversation Thread
                                    </div>
                                    <SupportConversation ticketId={t.id} />
                                </div>
                            </div>
                        </div>
                    )}
                />

                <div style={{ marginTop: '24px' }}>
                    <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />
                </div>
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
