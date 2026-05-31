import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { 
    IndianRupee, Clock, CheckCircle2, AlertCircle, 
    Filter, Search, User, FileText, ArrowUpRight,
    TrendingUp, Wallet, ShieldCheck, Loader2, Download, ExternalLink, Printer
} from 'lucide-react';
import { 
    useGetPaymentsQuery, 
    useGetInvoicesQuery,
    useVerifyCashDepositMutation,
    useLazyGetInvoicePdfQuery,
    useLazyGetProofOfServicePdfQuery
} from '../redux/financeApi';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/ToastProvider';

const InvoicesPage: React.FC = () => {
    const showToast = useToast();
    const [viewMode, setViewMode] = useState<'PAYMENTS' | 'INVOICES'>('PAYMENTS');
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [methodFilter, setMethodFilter] = useState('ALL');

    const { data: paymentData, isLoading: paymentsLoading } = useGetPaymentsQuery({ 
        page, 
        size: 10,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        method: methodFilter === 'ALL' ? undefined : methodFilter
    }, { skip: viewMode !== 'PAYMENTS' });

    const { data: invoiceData, isLoading: invoicesLoading } = useGetInvoicesQuery({
        page,
        size: 10
    }, { skip: viewMode !== 'INVOICES' });

    const [verifyDeposit, { isLoading: isVerifying }] = useVerifyCashDepositMutation();
    const [triggerDownloadInvoice] = useLazyGetInvoicePdfQuery();
    const [triggerDownloadProof] = useLazyGetProofOfServicePdfQuery();

    const handleDownloadPdf = async (id: number, type: 'INVOICE' | 'PROOF', ref: string) => {
        try {
            const query = type === 'INVOICE' ? triggerDownloadInvoice(id) : triggerDownloadProof(id);
            const { data } = await query.unwrap() as any;
            if (data) {
                const url = window.URL.createObjectURL(data);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${type.toLowerCase()}-${ref}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            showToast('Failed to generate document', 'error');
        }
    };

    const handleVerify = async (paymentId: number) => {
        try {
            await verifyDeposit(paymentId).unwrap();
            showToast('Cash deposit verified and ledger updated', 'success');
        } catch (err) {
            showToast('Verification failed', 'error');
        }
    };

    const payments = paymentData?.content || [];
    const invoices = invoiceData?.content || [];

    const stats = {
        totalRevenue: payments.reduce((acc: number, p: any) => acc + p.amount, 0),
        pendingCash: payments
            .filter((p: any) => p.paymentMethod === 'CASH' && p.paymentStatus === 'PENDING_DEPOSIT')
            .reduce((acc: number, p: any) => acc + p.amount, 0),
        onlineRevenue: payments
            .filter((p: any) => p.paymentMethod === 'ONLINE')
            .reduce((acc: number, p: any) => acc + p.amount, 0)
    };

    return (
        <Layout>
            <div className="finance-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Financial Ledger</h1>
                        <p className="text-muted">Real-time oversight of all revenue streams and technician cash collections.</p>
                    </div>
                    <div className="tab-switcher">
                        <button 
                            className={`tab-btn ${viewMode === 'PAYMENTS' ? 'active' : ''}`}
                            onClick={() => { setViewMode('PAYMENTS'); setPage(0); }}
                        >
                            <TrendingUp size={16} /> Payments Ledger
                        </button>
                        <button 
                            className={`tab-btn ${viewMode === 'INVOICES' ? 'active' : ''}`}
                            onClick={() => { setViewMode('INVOICES'); setPage(0); }}
                        >
                            <FileText size={16} /> Invoice Summary
                        </button>
                    </div>
                </header>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="card stat-card-premium">
                        <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="card stat-card-premium">
                        <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#92400e' }}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Cash with Technicians</div>
                            <div className="stat-value text-warning">₹{stats.pendingCash.toLocaleString()}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '4px', opacity: 0.7 }}>AWAITING DEPOSIT</div>
                        </div>
                    </div>

                    <div className="card stat-card-premium">
                        <div className="stat-icon-box" style={{ background: '#dcfce7', color: '#166534' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Settled Online</div>
                            <div className="stat-value text-success">₹{stats.onlineRevenue.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {viewMode === 'PAYMENTS' && (
                    <div className="filter-bar" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                        <div className="filter-group">
                            <Filter size={18} className="text-muted" />
                            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                                <option value="ALL">All Methods</option>
                                <option value="CASH">Cash Only</option>
                                <option value="ONLINE">Online Only</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="ALL">All Status</option>
                                <option value="SUCCESS">Settled</option>
                                <option value="PENDING_DEPOSIT">Pending Deposit</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="card overflow-hidden">
                    {viewMode === 'PAYMENTS' ? (
                        <table className="standard-table">
                            <thead>
                                <tr>
                                    <th>Transaction Ref</th>
                                    <th>Client / Invoice</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Collected By</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentsLoading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}><Loader2 className="animate-spin" /></td></tr>
                                ) : payments.map((p: any) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px' }}>
                                                {p.transactionReference || `#TXN-${p.id + 5000}`}
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(p.createdAt).toLocaleString()}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>{p.customerName || 'N/A'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>{p.invoiceId}</div>
                                        </td>
                                        <td style={{ fontWeight: '800' }}>₹{p.amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`method-tag ${p.paymentMethod.toLowerCase()}`}>
                                                {p.paymentMethod === 'ONLINE' ? <ArrowUpRight size={12} /> : <Wallet size={12} />}
                                                {p.paymentMethod}
                                            </span>
                                        </td>
                                        <td>
                                            {p.collectedByWorkerName ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                                    <div className="avatar-xs">{p.collectedByWorkerName[0]}</div>
                                                    {p.collectedByWorkerName}
                                                </div>
                                            ) : <span className="text-muted">—</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${p.paymentStatus === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
                                                {p.paymentStatus === 'SUCCESS' ? 'SETTLED' : 'PENDING DEPOSIT'}
                                            </span>
                                        </td>
                                        <td>
                                            {p.paymentMethod === 'CASH' && p.paymentStatus === 'PENDING_DEPOSIT' && (
                                                <button 
                                                    onClick={() => handleVerify(p.id)}
                                                    className="btn btn-primary btn-sm"
                                                    disabled={isVerifying}
                                                >
                                                    Verify Deposit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="standard-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Client Entity</th>
                                    <th>Generated At</th>
                                    <th>Taxable Subtotal</th>
                                    <th>Final Total</th>
                                    <th>Status</th>
                                    <th>Exports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoicesLoading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}><Loader2 className="animate-spin" /></td></tr>
                                ) : invoices.map((inv: any) => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{inv.invoiceNumber}</td>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>{inv.customerName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{inv.id + 5000}</div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td>₹{inv.subtotal?.toLocaleString()}</td>
                                        <td style={{ fontWeight: '900', fontSize: '15px' }}>₹{inv.total?.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-primary'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => handleDownloadPdf(inv.id, 'INVOICE', inv.invoiceNumber)}
                                                    className="btn btn-secondary btn-sm" 
                                                    title="Download Invoice"
                                                >
                                                    <Download size={14} /> Invoice
                                                </button>
                                                {inv.workOrderId && (
                                                    <button 
                                                        onClick={() => handleDownloadPdf(inv.workOrderId, 'PROOF', inv.id)}
                                                        className="btn btn-secondary btn-sm" 
                                                        title="Download Proof of Service"
                                                    >
                                                        <Printer size={14} /> Proof
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ marginTop: '24px' }}>
                    <Pagination 
                        currentPage={page} 
                        totalPages={(viewMode === 'PAYMENTS' ? paymentData : invoiceData)?.totalPages || 0} 
                        pageSize={10} 
                        totalElements={(viewMode === 'PAYMENTS' ? paymentData : invoiceData)?.totalElements || 0} 
                        onPageChange={setPage} 
                    />
                </div>
            </div>

            <style>{`
                .finance-container { padding: 20px; }
                .tab-switcher { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
                .tab-btn { display: flex; alignItems: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 800; border: none; cursor: pointer; color: var(--text-muted); background: transparent; transition: all 0.2s; }
                .tab-btn.active { background: white; color: var(--primary); box-shadow: var(--shadow-sm); }
                .stat-card-premium { padding: 24px; display: flex; align-items: center; gap: 20px; }
                .stat-icon-box { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                .stat-value { font-size: 24px; font-weight: 900; color: var(--text-h); margin-top: 4px; }
                .filter-group { display: flex; align-items: center; gap: 12px; background: white; padding: 0 16px; border-radius: 12px; border: 1px solid var(--border); }
                .filter-group select { border: none; height: 44px; outline: none; font-weight: 600; color: var(--text-h); min-width: 140px; }
                .method-tag { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; width: fit-content; }
                .method-tag.online { background: #eef2ff; color: var(--primary); }
                .method-tag.cash { background: #fff7ed; color: #c2410c; }
                .avatar-xs { width: 24px; height: 24px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; }
                .standard-table { width: 100%; border-collapse: collapse; text-align: left; }
                .standard-table th { padding: 16px 24px; background: #f8fafc; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
                .standard-table td { padding: 20px 24px; border-bottom: 1px solid var(--border-light); font-size: 14px; }
                .btn-sm { padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
            `}</style>
        </Layout>
    );
};

export default InvoicesPage;
