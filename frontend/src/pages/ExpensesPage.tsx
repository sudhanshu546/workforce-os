import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { 
    IndianRupee, Tag, User, Calendar, CheckCircle2, XCircle, 
    Clock, Eye, Loader2, Search, Filter, AlertCircle, ExternalLink,
    Briefcase, Image as ImageIcon
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useGetExpensesQuery, useUpdateExpenseStatusMutation } from '../redux/financeApi';
import { Pagination } from '../components/Pagination';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { EXPENSE_STATUS, EXPENSE_CATEGORIES } from '../utils/constants';

const ExpensesPage: React.FC = () => {
    const showToast = useToast();
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const { data, isLoading } = useGetExpensesQuery({ page, size: pageSize });
    const [updateStatus] = useUpdateExpenseStatusMutation();

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await updateStatus({ id, status }).unwrap();
            showToast(`Expense ${status.toLowerCase()} successfully`, 'success');
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'badge-success';
            case 'REJECTED': return 'badge-error';
            case 'REIMBURSED': return 'badge-primary';
            default: return 'badge-secondary';
        }
    };

    const getCategoryLabel = (value: string) => {
        return EXPENSE_CATEGORIES.find(c => c.value === value)?.label || value;
    };

    const expenses = data?.content || [];
    const totalPages = data?.totalPages || 0;
    const totalElements = data?.totalElements || 0;

    const columns = [
        { header: 'Category', accessor: (ex: any) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={16} />
                </div>
                <span style={{ fontWeight: '700' }}>{getCategoryLabel(ex.category)}</span>
            </div>
        )},
        { header: 'Technician', accessor: (ex: any) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px', borderRadius: '50%', background: '#e0e7ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{ex.worker?.user?.name[0]}</div>
                <span style={{ fontWeight: '600' }}>{ex.workerName}</span>
            </div>
        )},
        { header: 'Related Job', accessor: (ex: any) => <span className="id-tag">#WO-{ex.workOrderId + 1000}</span> },
        { header: 'Amount', accessor: (ex: any) => <span style={{ fontWeight: '800', color: 'var(--text-h)' }}>₹{ex.amount.toFixed(2)}</span> },
        { header: 'Status', accessor: (ex: any) => <span className={`badge ${getStatusBadge(ex.status)}`}>{ex.status}</span> }
    ];

    return (
        <Layout>
            <div className="expenses-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Field Expenditures</h1>
                    <p className="text-muted">Audit and authorize reimbursement requests from field operations.</p>
                </header>

                <ExpandableRowTable 
                    data={expenses}
                    columns={columns}
                    loading={isLoading}
                    renderExpanded={(ex: any) => (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
                            <div className="detail-section">
                                <div className="stat-label">Worker Narrative</div>
                                <p style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', marginTop: '12px', fontStyle: 'italic', color: 'var(--text-main)' }}>
                                    "{ex.description || 'No description provided'}"
                                </p>
                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                                    <Calendar size={14} /> Submitted: {new Date(ex.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="stat-label">Validation Data</div>
                                {ex.receiptImageUrl ? (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'white', position: 'relative' }}>
                                            <img src={ex.receiptImageUrl} alt="Receipt" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                            <a href={ex.receiptImageUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', color: 'white', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                                <ExternalLink size={20} />
                                            </a>
                                        </div>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Click to view full receipt</span>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '12px', height: '120px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <ImageIcon size={24} style={{ opacity: 0.5 }} />
                                        <span style={{ fontSize: '12px', marginTop: '8px' }}>No receipt attached</span>
                                    </div>
                                )}
                            </div>

                            <div className="detail-section" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                                <div className="stat-label">Authorization</div>
                                {ex.status === 'PENDING' ? (
                                    <>
                                        <button onClick={() => handleUpdateStatus(ex.id, 'APPROVED')} className="btn btn-primary" style={{ width: '100%' }}>
                                            <CheckCircle2 size={18} /> Approve Requisition
                                        </button>
                                        <button onClick={() => handleUpdateStatus(ex.id, 'REJECTED')} className="btn btn-secondary text-error" style={{ width: '100%' }}>
                                            <XCircle size={18} /> Decline Request
                                        </button>
                                    </>
                                ) : ex.status === 'APPROVED' ? (
                                    <button onClick={() => handleUpdateStatus(ex.id, 'REIMBURSED')} className="btn btn-primary" style={{ width: '100%' }}>
                                        Finalize Reimbursement (Paid)
                                    </button>
                                ) : (
                                    <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: 'var(--text-muted)' }}>
                                        Transaction Closed
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                />

                <div style={{ marginTop: '24px' }}>
                    <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />
                </div>
            </div>
        </Layout>
    );
};

export default ExpensesPage;
