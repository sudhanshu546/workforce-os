import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Clock, CheckCircle2, ChevronRight, 
    Search, Filter, Loader2, MapPin
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';

const CustomerOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const customerId = localStorage.getItem('customerId');
            if (!customerId) return;
            const response: any = await api.get(`/work-orders/customer/${customerId}`);
            setOrders(response.content || []);
        } catch (err) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return { badge: 'badge-success', icon: <CheckCircle2 size={14} /> };
            case 'AWAITING_VERIFICATION': return { badge: 'badge-warning', icon: <Clock size={14} /> };
            case 'IN_PROGRESS': return { badge: 'badge-primary', icon: <Loader2 className="animate-spin" size={14} /> };
            case 'AWAITING_PAYMENT': return { badge: 'badge-error', icon: <Package size={14} /> };
            default: return { badge: 'badge-secondary', icon: <Clock size={14} /> };
        }
    };

    const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter);

    if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div></Layout>;

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>My Service History</h1>
                        <p className="text-muted">Track live technician deployments and manage your service records.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                        <Filter size={18} className="text-muted" />
                        <select 
                            style={{ border: 'none', background: 'transparent', width: '200px', fontWeight: '600', outline: 'none', color: 'var(--text-h)' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Appointments</option>
                            <option value="PENDING_ASSIGNMENT">Dispatch Pending</option>
                            <option value="ASSIGNED">Tech Assigned</option>
                            <option value="IN_PROGRESS">Live Deployment</option>
                            <option value="AWAITING_VERIFICATION">Action Required</option>
                            <option value="AWAITING_PAYMENT">Payment Due</option>
                            <option value="COMPLETED">Fulfilled</option>
                        </select>
                    </div>
                </header>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {filteredOrders.map(order => {
                        const style = getStatusStyle(order.status);
                        return (
                            <div 
                                key={order.id} 
                                className="card-premium" 
                                style={{ 
                                    padding: '32px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate(`/customer/orders/${order.id}/verify`)}
                            >
                                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '64px', 
                                        height: '64px', 
                                        borderRadius: '18px', 
                                        background: 'var(--primary-light)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        flexShrink: 0
                                    }}>
                                        <Package size={32} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '900', fontSize: '20px', color: 'var(--text-h)' }}>#WO-{order.id + 1000}</span>
                                            <span className={`badge ${style.badge}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {style.icon} {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '24px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}><Clock size={16} /> {order.scheduledDate}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}><MapPin size={16} /> {order.customer?.address || 'Site mapping in progress'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    {order.status === 'AWAITING_VERIFICATION' && (
                                        <span style={{ 
                                            background: 'var(--error)', 
                                            color: 'white', 
                                            padding: '8px 20px', 
                                            borderRadius: '12px', 
                                            fontSize: '13px', 
                                            fontWeight: '800',
                                            animation: 'pulse 2s infinite',
                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                        }}>
                                            Review Deployment
                                        </span>
                                    )}
                                    {order.status === 'AWAITING_PAYMENT' && (
                                        <button className="btn btn-primary" style={{ padding: '8px 20px' }}>Pay Now</button>
                                    )}
                                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div style={{ padding: '100px', textAlign: 'center', background: 'var(--surface-muted)', borderRadius: '24px', border: '1.5px dashed var(--border)' }}>
                            <Package size={64} className="text-muted" strokeWidth={1.5} style={{ marginBottom: '20px', opacity: 0.5 }} />
                            <h3 style={{ fontWeight: '800', fontSize: '20px' }}>Appointment Queue Empty</h3>
                            <p className="text-muted">You don't have any active or past service orders matching this filter.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </Layout>
    );
};

export default CustomerOrdersPage;
