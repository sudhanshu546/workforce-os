import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { 
    Wallet, Clock, CheckCircle2, TrendingUp,
    Calendar, ArrowUpRight, IndianRupee, Loader2,
    ShieldCheck, ClipboardList
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetWorkerPaymentsQuery } from '../redux/financeApi';
import { Pagination } from '../components/Pagination';
import { useWebSocket } from '../hooks/useWebSocket';

const WorkerEarnings: React.FC = () => {
    const workerId = useSelector((state: any) => state.auth.workerId);
    const [page, setPage] = useState(0);

    const { data, isLoading, refetch } = useGetWorkerPaymentsQuery({ 
        workerId: Number(workerId), 
        page, 
        size: 10 
    });

    // Real-time update: Listen for payment verification from Owner
    useWebSocket(`/topic/worker/${workerId}/payments`, () => {
        refetch();
    });

    const payments = data?.content || [];

    const stats = {
        totalCollected: payments.reduce((acc: number, p: any) => acc + p.amount, 0),
        pendingDeposit: payments
            .filter((p: any) => p.paymentStatus === 'PENDING_DEPOSIT')
            .reduce((acc: number, p: any) => acc + p.amount, 0),
        verifiedCash: payments
            .filter((p: any) => p.paymentStatus === 'SUCCESS')
            .reduce((acc: number, p: any) => acc + p.amount, 0)
    };

    return (
        <Layout>
            <div className="earnings-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>My Collections</h1>
                    <p className="text-muted">Tracking your service payments and cash deposits.</p>
                </header>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="card earnings-stat-card">
                        <div className="stat-icon" style={{ background: '#eef2ff', color: 'var(--primary)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Total Handled</div>
                            <div className="stat-value">₹{stats.totalCollected.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="card earnings-stat-card">
                        <div className="stat-icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Cash In-Hand</div>
                            <div className="stat-value text-warning">₹{stats.pendingDeposit.toLocaleString()}</div>
                            <div className="stat-subtext">AWAITING HANDOVER</div>
                        </div>
                    </div>

                    <div className="card earnings-stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Verified by Office</div>
                            <div className="stat-value text-success">₹{stats.verifiedCash.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="section-header-standard">
                        <Calendar size={20} />
                        <h2>Recent Transactions</h2>
                    </div>
                    
                    <div className="txn-list">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 className="animate-spin" /></div>
                        ) : payments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px' }} className="text-muted">
                                <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                                <p>No payment records found.</p>
                            </div>
                        ) : payments.map((p: any) => (
                            <div key={p.id} className="txn-item">
                                <div className="txn-info">
                                    <div className="txn-main">
                                        <span className="txn-id">#TXN-{p.id + 5000}</span>
                                        <span className={`txn-status ${p.paymentStatus.toLowerCase()}`}>
                                            {p.paymentStatus === 'SUCCESS' ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div className="txn-customer">{p.invoice?.customerName}</div>
                                    <div className="txn-date">{new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString()}</div>
                                </div>
                                <div className="txn-amount">
                                    <div className="amount-val">₹{p.amount.toLocaleString()}</div>
                                    <div className="amount-method"><Wallet size={12} /> CASH</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <Pagination 
                        currentPage={page} 
                        totalPages={data?.totalPages || 0} 
                        pageSize={10} 
                        totalElements={data?.totalElements || 0} 
                        onPageChange={setPage} 
                    />
                </div>
            </div>

            <style>{`
                .earnings-container { padding: 20px; }
                .earnings-stat-card { padding: 24px; display: flex; align-items: center; gap: 20px; }
                .stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value { font-size: 24px; font-weight: 900; color: var(--text-h); margin-top: 2px; }
                .stat-subtext { font-size: 10px; font-weight: 800; color: #c2410c; margin-top: 4px; }
                .section-header-standard { display: flex; align-items: center; gap: 12px; padding: 20px 24px; border-bottom: 1px solid var(--border-light); }
                .section-header-standard h2 { font-size: 16px; font-weight: 800; }
                .txn-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-light); }
                .txn-main { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
                .txn-id { font-family: monospace; font-weight: 700; color: var(--primary); font-size: 13px; }
                .txn-status { font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 4px; }
                .txn-status.success { background: #dcfce7; color: #166534; }
                .txn-status.pending_deposit { background: #fff7ed; color: #c2410c; }
                .txn-customer { font-weight: 700; color: var(--text-h); }
                .txn-date { font-size: 12px; color: var(--text-muted); font-weight: 500; }
                .txn-amount { text-align: right; }
                .amount-val { font-size: 18px; font-weight: 900; color: var(--text-h); }
                .amount-method { font-size: 11px; font-weight: 800; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
            `}</style>
        </Layout>
    );
};

export default WorkerEarnings;
