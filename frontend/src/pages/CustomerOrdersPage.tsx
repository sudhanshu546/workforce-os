import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Clock, CheckCircle2, ChevronRight, 
    Search, Filter, Loader2, MapPin, FileText, Receipt, IndianRupee, CheckCircle, Activity, Star
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import Modal from '../components/Modal';
import { ReviewModal } from '../components/ReviewModal';

const CustomerOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const navigate = useNavigate();

    // Review Modal State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

    const handleReviewSuccess = () => {
        if ((window as any).showToast) {
            (window as any).showToast('Thank you! Your review has been submitted.', 'success');
        }
        fetchOrders();
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

                <ExpandableRowTable 
                    data={filteredOrders}
                    columns={[
                        { 
                            header: 'Work Order', 
                            accessor: (order: any) => (
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-h)' }}>#WO-{order.id + 1000}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Deployment ID: {order.id}</div>
                                </div>
                            ) 
                        },
                        { 
                            header: 'Status', 
                            accessor: (order: any) => {
                                const style = getStatusStyle(order.status);
                                return (
                                    <span className={`badge ${style.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                                        {style.icon} {order.status.replace('_', ' ')}
                                    </span>
                                );
                            } 
                        },
                        { 
                            header: 'Schedule', 
                            accessor: (order: any) => (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)' }}>{order.scheduledDate}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Confirmed</span>
                                </div>
                            ) 
                        },
                        { 
                            header: 'Service Address', 
                            accessor: (order: any) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px' }}>
                                    <MapPin size={16} className="text-muted" />
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {order.customer?.address || 'Site mapping in progress'}
                                    </span>
                                </div>
                            ) 
                        }
                    ]}
                    renderExpanded={(order: any) => (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                <div>
                                    <div className="stat-label">Description</div>
                                    <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px' }}>
                                        {order.description || 'Request for AC Repair. Standard service deployment.'}
                                    </div>
                                </div>
                                <div>
                                    <div className="stat-label">Technician</div>
                                    <div style={{ marginTop: '4px', fontWeight: '700' }}>
                                        {order.assignedWorker?.user?.name || 'Assigning Expert...'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {order.status === 'AWAITING_VERIFICATION' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/customer/orders/${order.id}/verify`); }} 
                                        className="btn btn-primary"
                                        style={{ animation: 'pulse 2s infinite' }}
                                    >
                                        <CheckCircle size={16} /> Review Deployment
                                    </button>
                                )}
                                {order.status === 'AWAITING_PAYMENT' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); /* Payment logic can be added here or navigation */ }} 
                                        className="btn btn-primary"
                                    >
                                        <IndianRupee size={16} /> Pay Now
                                    </button>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedOrder(order);
                                            setIsReviewModalOpen(true);
                                        }} 
                                        className="btn btn-primary"
                                        style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                                    >
                                        <Star size={16} /> Rate Service
                                    </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/customer/orders/${order.id}/verify`); }} className="btn btn-secondary">
                                    Full Details
                                </button>
                            </div>
                        </div>
                    )}
                />

                {isReviewModalOpen && selectedOrder && (
                    <ReviewModal 
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        workOrderId={selectedOrder.id}
                        workerName={selectedOrder.assignedWorker?.user?.name || 'Technician'}
                        onSuccess={handleReviewSuccess}
                    />
                )}

                {filteredOrders.length === 0 && (
                        <div style={{ padding: '100px', textAlign: 'center', background: 'var(--surface-muted)', borderRadius: '24px', border: '1.5px dashed var(--border)' }}>
                            <Package size={64} className="text-muted" strokeWidth={1.5} style={{ marginBottom: '20px', opacity: 0.5 }} />
                            <h3 style={{ fontWeight: '800', fontSize: '20px' }}>Appointment Queue Empty</h3>
                            <p className="text-muted">You don't have any active or past service orders matching this filter.</p>
                        </div>
                    )}
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
