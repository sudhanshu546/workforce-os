import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, XCircle, Search, Filter, Eye, Loader2,
  DollarSign, User, Phone, Trash2, Printer, Mail, Download, Clock, Plus,
  Calendar, ChevronRight, AlertCircle, ArrowRight
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

const Quotations: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
      const response = await api.get(`/quotations?page=${page}&size=10`);
      setQuotations(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (window.confirm('Are you sure you want to approve this quotation? This will automatically create a Work Order and schedule the job.')) {
        setSubmitting(true);
        try {
            await api.patch(`/quotations/${id}/approve`);
            setIsViewModalOpen(false);
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

  return (
    <Layout>
      <div className="quotations-container">
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)', marginBottom: '8px' }}>Quotations</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage, approve, and send professional quotes to customers.</p>
          </div>
          <button onClick={() => navigate('/leads')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
            <Plus size={18} /> New from Lead
          </button>
        </header>

        <div className="filter-bar card" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
                type="text" 
                placeholder="Search by customer name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-select-wrapper">
            <Filter size={18} className="filter-icon" />
            <select 
                className="input-field" 
                style={{ paddingLeft: '40px', width: '220px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Issuance Date</th>
                <th>Total Value</th>
                <th>Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary)' }} /></td></tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                    <td colSpan={6}>
                        <div className="empty-state" style={{ padding: '80px 0' }}>
                            <AlertCircle size={48} className="empty-state-icon" />
                            <h3>No quotations found</h3>
                            <p>Try refining your search or issue a new quote from the Sales Pipeline.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td><span className="id-tag">#QT-{quote.id + 1000}</span></td>
                    <td>
                        <div className="avatar-cell">
                            <div className="avatar">{quote.lead?.customer?.name.charAt(0)}</div>
                            <div>
                                <div className="text-main">{quote.lead?.customer?.name}</div>
                                <div className="text-sub">{quote.lead?.customer?.phone}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} className="text-muted" />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{new Date(quote.createdAt).toLocaleDateString()}</span>
                        </div>
                    </td>
                    <td>
                        <span style={{ fontWeight: '800', color: 'var(--text-h)', fontSize: '15px' }}>
                            ${quote.totalAmount.toFixed(2)}
                        </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => { setSelectedQuote(quote); setIsViewModalOpen(true); }}
                                className="nav-icon-btn"
                                style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}
                            >
                                <Eye size={18} />
                            </button>
                            <button 
                                className="nav-icon-btn text-error" 
                                onClick={() => handleDelete(quote.id)}
                                style={{ background: '#fef2f2', padding: '8px', borderRadius: '8px' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* View Quotation Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Document Preview: Quotation">
        {selectedQuote && (
          <div className="quote-detail-view">
            <div className="quote-header-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <span className="quote-badge">OFFICIAL QUOTE</span>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '12px', letterSpacing: '-0.02em' }}>#QT-{selectedQuote.id + 1000}</h2>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                            <div className="info-item">
                                <Calendar size={14} className="text-primary" /> Issued: {new Date(selectedQuote.createdAt).toLocaleDateString()}
                            </div>
                            <div className="info-item">
                                <Clock size={14} className="text-primary" /> Valid for 30 days
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${getStatusBadge(selectedQuote.status)}`} style={{ fontSize: '14px', padding: '8px 20px', borderRadius: '12px' }}>
                            {selectedQuote.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="quote-address-section">
                <div className="address-card">
                    <h4 className="section-title">CLIENT DETAILS</h4>
                    <div className="address-content">
                        <User size={16} className="text-primary" /> <strong>{selectedQuote.lead?.customer?.name}</strong>
                    </div>
                    <div className="address-content">
                        <Phone size={16} className="text-primary" /> {selectedQuote.lead?.customer?.phone}
                    </div>
                    <div className="address-content">
                        <Mail size={16} className="text-primary" /> {selectedQuote.lead?.customer?.email || 'No email provided'}
                    </div>
                </div>
                <div className="address-card">
                    <h4 className="section-title">PROJECT SCOPE</h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {selectedQuote.lead?.description}
                    </p>
                </div>
            </div>

            <div className="quote-items-section">
                <table className="quote-table">
                  <thead>
                    <tr>
                      <th>Service Description</th>
                      <th style={{ textAlign: 'center' }}>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.items?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>
                            <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{item.description}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Standard catalog rate applied</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>${item.unitPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-h)' }}><strong>${item.totalAmount.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            <div className="quote-footer-grid">
                <div className="quote-notes" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                    <h4 className="section-title">BUSINESS TERMS</h4>
                    <ul style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '16px', marginTop: '8px', lineHeight: '1.8' }}>
                        <li>This quote is valid for a period of 30 days from the issuance date.</li>
                        <li>Execution of work order requires approval through the portal.</li>
                        <li>Final invoice will be generated upon completion of services.</li>
                    </ul>
                </div>
                <div className="quote-summary-box" style={{ background: 'var(--text-h)', color: '#fff' }}>
                    <div className="sum-row" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>Subtotal</span>
                        <span style={{ color: '#fff' }}>${selectedQuote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="sum-row" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>Tax (Calculated)</span>
                        <span style={{ color: '#fff' }}>${selectedQuote.tax.toFixed(2)}</span>
                    </div>
                    <div className="sum-row discount" style={{ color: '#fb7185' }}>
                        <span>Promotional Discount</span>
                        <span>-${selectedQuote.discount.toFixed(2)}</span>
                    </div>
                    <div className="sum-row total" style={{ borderTopColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                        <span>Total Payable</span>
                        <span style={{ color: '#818cf8' }}>${selectedQuote.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="quote-actions-bar" style={{ paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, gap: '10px', height: '48px', fontWeight: '700' }}><Printer size={20} /> Print Quote</button>
                    <button className="btn btn-secondary" style={{ flex: 1, gap: '10px', height: '48px', fontWeight: '700' }}><Mail size={20} /> Send via Email</button>
                </div>
                {selectedQuote.status === 'DRAFT' && (
                    <button 
                        onClick={() => handleApprove(selectedQuote.id)}
                        disabled={submitting}
                        className="btn btn-primary" 
                        style={{ flex: 2, height: '56px', fontSize: '16px', fontWeight: '800', gap: '12px' }}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={24} /> Confirm & Schedule Job</>}
                    </button>
                )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .quotations-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-table-container {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
        }

        .quote-detail-view {
            padding: 0px;
        }

        .quote-header-box {
            background: #f8fafc;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            border-left: 6px solid var(--primary);
        }

        .quote-badge {
            background: #eef2ff;
            color: var(--primary);
            font-size: 12px;
            font-weight: 800;
            padding: 6px 12px;
            border-radius: 8px;
            letter-spacing: 0.07em;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-muted);
            font-weight: 600;
        }

        .quote-address-section {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 32px;
            margin-bottom: 32px;
        }

        .address-card {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
        }

        .section-title {
            font-size: 11px;
            font-weight: 900;
            color: var(--text-muted);
            margin-bottom: 20px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .address-content {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            margin-bottom: 12px;
            color: var(--text-h);
        }

        .quote-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        .quote-table th {
            text-align: left;
            padding: 16px 0;
            border-bottom: 2px solid var(--border);
            font-size: 12px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .quote-table td {
            padding: 20px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 15px;
        }

        .quote-footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
            align-items: start;
        }

        .quote-summary-box {
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .sum-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 500;
        }

        .sum-row.total {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 28px;
            font-weight: 900;
        }

        .quote-actions-bar {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding-top: 40px;
            border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
            .quote-address-section, .quote-footer-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </Layout>
  );
};

export default Quotations;
