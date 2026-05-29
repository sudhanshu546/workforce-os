import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Search, Filter, Loader2,
  Trash2, Download, Plus, Calendar, IndianRupee
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { ExpandableRowTable } from '../components/ExpandableRowTable';

const Quotations: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [submitting, setSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'OWNER' && role !== 'MANAGER') {
      navigate('/dashboard');
      return;
    }
    fetchQuotations();
  }, [role, navigate, page, statusFilter]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(`/quotations?page=${page}&size=${pageSize}`);
      setQuotations(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (window.confirm('Are you sure you want to approve this quotation? This will automatically create a Work Order.')) {
        setSubmitting(true);
        try {
            await api.patch(`/quotations/${id}/approve`);
            fetchQuotations();
        } catch (err) {
            console.error('Failed to approve quotation:', err);
        } finally {
            setSubmitting(false);
        }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
        try {
            await api.delete(`/quotations/${id}`);
            fetchQuotations();
        } catch (err) {
            console.error('Error deleting quotation', err);
        }
    }
  };

  const filteredQuotes = quotations.filter(q => {
      const matchesSearch = q.lead?.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (s: string) => {
      switch(s) {
          case 'APPROVED': return 'badge-success';
          case 'DRAFT': return 'badge-secondary';
          case 'REJECTED': return 'badge-error';
          default: return 'badge-secondary';
      }
  };

  const columns = [
    { header: 'Reference', accessor: (q: any) => <span className="id-tag">#QT-{q.id + 1000}</span> },
    { header: 'Customer', accessor: (q: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>{q.lead?.customer?.name[0]}</div>
            <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{q.lead?.customer?.name}</div>
        </div>
    )},
    { header: 'Issuance', accessor: (q: any) => <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</span> },
    { header: 'Total Value', accessor: (q: any) => <span style={{ fontWeight: '800', color: 'var(--text-h)' }}>₹{(q.totalAmount || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: (q: any) => <span className={`badge ${getStatusBadge(q.status)}`}>{q.status}</span> }
  ];

  return (
    <Layout>
      <div className="quotations-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Active Estimates</h1>
            <p className="text-muted">Review, authorize and dispatch professional service quotations.</p>
          </div>
          <button onClick={() => navigate('/leads')} className="btn btn-primary">
            <Plus size={20} /> Issue New Quote
          </button>
        </header>

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
                type="text" 
                placeholder="Find customer quote..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Filter size={18} className="text-muted" />
            <select 
                style={{ border: 'none', background: 'transparent', height: '44px', fontWeight: '600', color: 'var(--text-h)', outline: 'none' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Stages</option>
                <option value="DRAFT">Pending Approval</option>
                <option value="APPROVED">Authorized</option>
                <option value="REJECTED">Declined</option>
            </select>
          </div>
        </div>

        <ExpandableRowTable 
            data={filteredQuotes}
            columns={columns}
            loading={loading}
            renderExpanded={(q: any) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                    <div>
                        <div className="stat-label">Project Scope & Details</div>
                        <div style={{ marginTop: '12px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6' }}>{q.lead?.description}</p>
                            
                            <table style={{ width: '100%', marginTop: '24px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>SERVICE ITEM</th>
                                        <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>QTY</th>
                                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {q.items?.map((item: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '14px 0', fontSize: '13px', fontWeight: '600' }}>{item.description}</td>
                                            <td style={{ padding: '14px 0', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                                            <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '13px', fontWeight: '700' }}>₹{item.totalAmount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="financial-summary-card" style={{ background: 'var(--text-h)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.8 }}>
                                <span>Service Subtotal</span>
                                <span>₹{q.subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.8 }}>
                                <span>Tax (GST)</span>
                                <span>+ ₹{q.tax.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '24px', fontWeight: '900' }}>
                                <span>Grand Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{q.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {q.status === 'DRAFT' && (
                                <button onClick={(e) => { e.stopPropagation(); handleApprove(q.id); }} className="btn btn-primary" style={{ flex: 1 }}>
                                    <CheckCircle2 size={18} /> Authorize Quote
                                </button>
                            )}
                            <button className="btn btn-secondary" style={{ flex: 1 }}><Download size={18} /> Export PDF</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="btn btn-secondary text-error" style={{ width: '100%', justifyContent: 'center' }}><Trash2 size={18} /> Delete Record</button>
                        </div>
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

export default Quotations;
