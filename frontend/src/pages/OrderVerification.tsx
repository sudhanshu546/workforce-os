import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, Clock, MapPin, Camera, ClipboardList, 
    Loader2, AlertCircle, ShieldCheck, IndianRupee, FileText,
    Star, MessageCircle, ChevronRight, Navigation
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';

const OrderVerification: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (order?.status === 'AWAITING_PAYMENT' || order?.status === 'COMPLETED') {
            fetchInvoice();
        }
    }, [order?.status]);

    const fetchOrder = async () => {
        try {
            const response: any = await api.get(`/work-orders/${orderId}`);
            setOrder(response);
            if (response.status === 'COMPLETED' || response.status === 'AWAITING_PAYMENT') {
                fetchInvoice();
            }
        } catch (err) {
            setError('Failed to fetch order details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoice = async (retries = 3) => {
        try {
            console.log(`Fetching invoices for customerId: ${order.customer.id}...`);
            const res: any = await api.get(`/finance/invoices/customer/${order.customer.id}`);
            console.log('Invoices retrieved:', res);
            const inv = res.find((i: any) => i.workOrderId === Number(orderId));
            console.log('Filtered invoice:', inv);
            if (inv) {
                setInvoice(inv);
                setIsGeneratingInvoice(false);
            } else if (retries > 0 && (order?.status === 'AWAITING_PAYMENT' || order?.status === 'COMPLETED')) {
                // Retry after 2 seconds if not found but status implies it should exist
                console.log(`Invoice not found, retrying... (${retries} attempts left)`);
                setTimeout(() => fetchInvoice(retries - 1), 2000);
            } else {
                console.warn('Invoice not found after all retries');
            }
        } catch (e) { 
            console.error('Failed to fetch invoice', e); 
        }
    };

    const handleVerify = async () => {
        setVerifying(true);
        try {
            await api.patch(`/work-orders/${orderId}/verify`);
            setIsGeneratingInvoice(true);
            setOrder((prevOrder: any) => ({ ...prevOrder, status: 'AWAITING_PAYMENT' }));
        } catch (err) {
            alert('Verification failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handlePayment = async () => {
        if (!invoice) return;
        try {
            const orderRes: any = await api.post(`/finance/invoices/${invoice.id}/payment-order`);
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: invoice.total * 100,
                currency: "INR",
                name: "Workforce OS",
                description: `Payment for Order #WO-${order.id + 1000}`,
                order_id: orderRes.orderId,
                handler: async (response: any) => {
                    await api.post(`/finance/payments/verify`, {
                        invoiceId: invoice.id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        paymentMethod: 'ONLINE'
                    });
                    alert('Payment successful!');
                    fetchOrder();
                },
                prefill: {
                    name: order.customer?.name,
                    email: "",
                    contact: order.customer?.phone
                },
                theme: { color: "#4f46e5" }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (e) { alert('Payment initiation failed'); }
    };

    if (loading) return <Layout><LoadingSpinner /></Layout>;
    if (error) return <Layout><div className="error-card"><AlertCircle size={48} /><h3>{error}</h3></div></Layout>;

    return (
        <Layout>
            <div className="verification-container">
                <header className="verification-header">
                    <div className="header-main">
                        <span className="order-tag">#WO-{order.id + 1000}</span>
                        <h1>Job Completion Review</h1>
                        <p>Technician {order.assignedWorker?.user?.name} has completed the requested services.</p>
                    </div>
                    <div className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status === 'COMPLETED' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        {order.status.replace('_', ' ')}
                    </div>
                </header>

                <div className="verification-grid">
                    <div className="verification-main">
                        {/* Evidence Section */}
                        <section className="verification-section card">
                            <div className="section-header">
                                <Camera size={20} />
                                <h2>Work Site Evidence</h2>
                            </div>
                            <div className="evidence-grid">
                                {order.evidence?.map((ev: any) => (
                                    <div key={ev.id} className="evidence-card">
                                        <img src={ev.imageUrl} alt="Evidence" />
                                        <div className="evidence-note">
                                            <p>{ev.notes}</p>
                                            <span className="timestamp">{new Date(ev.uploadedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {order.evidence?.length === 0 && (
                                    <div className="empty-evidence">
                                        <Camera size={32} />
                                        <p>No photos provided for this job.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Checklist Section */}
                        <section className="verification-section card">
                            <div className="section-header">
                                <ClipboardList size={20} />
                                <h2>Service Checklist</h2>
                            </div>
                            <div className="checklist-items">
                                {order.tasks?.map((task: any) => (
                                    <div key={task.id} className="checklist-item">
                                        <div className={`check-box ${task.completed ? 'checked' : ''}`}>
                                            {task.completed && <CheckCircle2 size={16} />}
                                        </div>
                                        <span>{task.description}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {/* Detailed Breakdown */}
                        <div className="breakdown-card card">
                            <h3>Service & Material Breakdown</h3>
                            
                            <div className="breakdown-section">
                                <h4 className="section-subtitle">Quoted Services</h4>
                                {order.quotation?.items?.map((item: any) => (
                                    <div key={item.id} className="breakdown-row">
                                        <div className="item-info">
                                            <span className="item-desc">{item.description}</span>
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <div className="item-price">
                                            <IndianRupee size={12} /> {item.totalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {order.materials?.length > 0 && (
                                <div className="breakdown-section extra">
                                    <h4 className="section-subtitle">On-Site Materials (Added)</h4>
                                    {order.materials.map((m: any) => (
                                        <div key={m.id} className="breakdown-row">
                                            <div className="item-info">
                                                <span className="item-desc">{m.materialName || 'Unknown Material'}</span>
                                                <span className="item-qty">Qty: {m.quantityUsed} {m.unit || ''}</span>
                                            </div>
                                            <div className="item-price">
                                                <IndianRupee size={12} /> {(m.unitPriceAtUse * m.quantityUsed).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="running-total-bar">
                                <span>Estimated Total (Excl. Tax)</span>
                                <span><IndianRupee size={16} /> {((order.quotation?.subtotal || 0) + (order.materials?.reduce((acc: number, m: any) => acc + ((m.unitPriceAtUse || 0) * (m.quantityUsed || 0)), 0) || 0)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="verification-sidebar">
                        {/* Summary Card */}
                        <div className="summary-card card">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span className="label">Client</span>
                                <span className="value">{order.customer?.name}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Date</span>
                                <span className="value">{order.scheduledDate}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Technician</span>
                                <span className="value">{order.assignedWorker?.user?.name}</span>
                            </div>
                            
                            {order.status === 'AWAITING_VERIFICATION' && (
                                <div className="action-area">
                                    <div className="verification-guarantee">
                                        <ShieldCheck size={20} />
                                        <p>By verifying, you confirm that the service was performed to your satisfaction.</p>
                                    </div>
                                    <button 
                                        onClick={handleVerify} 
                                        className="btn btn-primary verify-btn"
                                        disabled={verifying}
                                    >
                                        {verifying ? <Loader2 className="animate-spin" /> : 'Confirm & Generate Invoice'}
                                    </button>
                                </div>
                            )}

                            {order.status === 'AWAITING_PAYMENT' && (
                                <div className="invoice-area">
                                    <div className="invoice-preview">
                                        <div className="price-row total">
                                            <span>Total Payable</span>
                                            <span><IndianRupee size={16} />{invoice ? invoice.total.toFixed(2) : (order.quotation?.subtotal + (order.materials?.reduce((acc: number, m: any) => acc + (m.unitPriceAtUse * m.quantityUsed), 0) || 0)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <button onClick={handlePayment} className="btn btn-primary pay-btn" style={{ background: 'var(--primary)' }}>
                                            Pay Online Now
                                        </button>
                                        <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>— OR —</div>
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    await api.post(`/finance/payments/cash`, {
                                                        invoiceId: invoice.id,
                                                        amount: invoice.total
                                                    });
                                                    alert('Cash payment confirmed!');
                                                    fetchOrder();
                                                } catch (e) {
                                                    alert('Failed to record cash payment');
                                                }
                                            }} 
                                            className="btn btn-secondary pay-btn"
                                            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-h)' }}
                                        >
                                            Pay Cash to Technician
                                        </button>
                                    </div>
                                </div>
                            )}

                            {order.status === 'PAYMENT_PENDING_WORKER' && (
                                <div className="action-area" style={{ textAlign: 'center', padding: '32px 16px' }}>
                                    <div style={{ background: '#fef3c7', color: '#92400e', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                                        <Clock size={32} style={{ margin: '0 auto 12px' }} />
                                        <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>Hand Cash to Technician</h4>
                                        <p style={{ fontSize: '13px', fontWeight: '500' }}>Please hand the cash to {order.assignedWorker?.user?.name}. They will confirm receipt on their device.</p>
                                    </div>
                                    <button onClick={fetchOrder} className="btn btn-primary" style={{ width: '100%' }}>Check Confirmation Status</button>
                                </div>
                            )}

                            {order.status === 'COMPLETED' && invoice && (
                                <div className="invoice-area">
                                    <div className="invoice-preview">
                                        <div className="invoice-header">
                                            <FileText size={20} />
                                            <span>Invoice {invoice.invoiceNumber}</span>
                                        </div>
                                        <div className="price-row total">
                                            <span>Total Paid</span>
                                            <span><IndianRupee size={16} />{invoice.total.toFixed(2)}</span>
                                        </div>
                                        <span className={`payment-status paid`}>
                                            PAID
                                        </span>
                                    </div>
                                    <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--success)', marginTop: '16px' }}>Thank you for your business!</p>
                                </div>
                            )}
                        </div>

                        {/* Materials Card */}
                        {order.materials?.length > 0 && (
                            <div className="materials-card card">
                                <h3>Materials Used</h3>
                                <div className="material-list">
                                    {order.materials.map((m: any) => (
                                        <div key={m.id} className="material-item">
                                            <div className="m-info">
                                                <span className="m-name">{m.materialName || 'Unknown Material'}</span>
                                                <span className="m-qty">{m.quantityUsed} {m.unit || ''}</span>
                                            </div>
                                            <div className="m-price">
                                                <IndianRupee size={12} /> {(m.unitPriceAtUse * m.quantityUsed).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .verification-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                .verification-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
                .order-tag { background: #eef2ff; color: var(--primary); padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 13px; margin-bottom: 12px; display: inline-block; }
                .verification-header h1 { font-size: 32px; font-weight: 800; color: var(--text-h); }
                .status-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
                .status-pill.awaiting_verification { background: #fef3c7; color: #92400e; }
                .status-pill.awaiting_payment { background: #fee2e2; color: #991b1b; }
                .status-pill.completed { background: #dcfce7; color: #166534; }
                
                .verification-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
                .verification-section { padding: 24px; margin-bottom: 32px; }
                .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: var(--primary); }
                .section-header h2 { font-size: 18px; font-weight: 700; color: var(--text-h); }

                .evidence-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
                .evidence-card { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
                .evidence-card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
                .evidence-note { padding: 12px; background: #f8fafc; }
                .evidence-note p { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
                .timestamp { font-size: 11px; color: var(--text-muted); }

                .checklist-items { display: grid; gap: 12px; }
                .checklist-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8fafc; border-radius: 12px; font-weight: 600; }
                .check-box { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; }
                .check-box.checked { background: var(--success); border-color: var(--success); color: white; }

                .summary-card h3, .materials-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 20px; }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
                .summary-row .label { color: var(--text-muted); }
                .summary-row .value { font-weight: 700; }

                .action-area { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
                .verification-guarantee { display: flex; gap: 12px; background: #f0fdf4; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
                .verification-guarantee p { font-size: 12px; color: #166534; font-weight: 500; }
                .verify-btn { width: 100%; height: 56px; font-weight: 800; }

                .invoice-area { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
                .invoice-preview { background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 16px; }
                .invoice-header { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; margin-bottom: 16px; }
                .price-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; margin-bottom: 12px; }
                .payment-status { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; background: #fee2e2; color: #991b1b; }
                .payment-status.paid { background: #dcfce7; color: #166534; }
                .pay-btn { width: 100%; height: 56px; font-weight: 800; }

                .material-list { display: grid; gap: 12px; }
                .material-item { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
                .m-info { display: flex; flex-direction: column; }
                .m-qty { font-size: 11px; color: var(--text-muted); }
                .m-price { font-weight: 700; }

                .breakdown-card { padding: 24px; margin-top: 32px; border: 1px solid var(--border); }
                .breakdown-section { margin-bottom: 24px; }
                .breakdown-section.extra { border-top: 1px dashed var(--border); padding-top: 20px; }
                .section-subtitle { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
                .breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 12px; margin-bottom: 8px; }
                .item-desc { font-weight: 700; font-size: 14px; color: var(--text-h); display: block; }
                .item-qty { font-size: 11px; color: var(--text-muted); font-weight: 600; }
                .item-price { font-weight: 800; color: var(--primary); font-size: 15px; }
                .running-total-bar { margin-top: 24px; padding: 20px; background: #eef2ff; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 16px; color: var(--primary); }

                @media (max-width: 900px) {
                    .verification-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </Layout>
    );
};

export default OrderVerification;
