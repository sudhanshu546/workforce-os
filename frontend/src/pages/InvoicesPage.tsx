import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Search, Filter, Eye, Loader2,
  IndianRupee, User, Phone, Trash2, Printer, Mail, Download, 
  Clock, Plus, CreditCard, Receipt, Building, Calendar, ArrowUpRight, X, Tag,
  Briefcase, TrendingUp, AlertTriangle
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import Modal from '../components/Modal';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/ToastProvider';

import { UI_CONSTANTS } from '../utils/ui-constants';

const InvoicesPage: React.FC = () => {
  const showToast = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [paymentData, setPaymentData] = useState({
      amount: 0,
      method: 'CASH',
      reference: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices(page);
  }, [page]);

  const fetchInvoices = async (pageNumber: number) => {
    try {
      setLoading(true);
      const data: any = await api.get(`/finance/invoices?page=${pageNumber}&size=${pageSize}`);
      setInvoices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch invoices');
      showToast('Error connecting to financial services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (invoice: any) => {
    setDownloadingId(invoice.id);
    try {
      const response = await api.get(`/finance/invoices/${invoice.id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Invoice PDF generated successfully', 'success');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/finance/invoices/${selectedInvoice.id}/payments`, paymentData);
      setIsPaymentModalOpen(false);
      fetchInvoices(page);
      showToast('Payment recorded and ledger updated!', 'success');
    } catch (err) {
      showToast('Critical: Failed to record payment', 'error');
    }
  };

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const filteredInvoices = safeInvoices.filter(inv => {
    const matchesSearch = (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (inv.workOrder?.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = safeInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.total || 0), 0);
  const totalOutstanding = safeInvoices.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + (i.total || 0), 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return { class: 'badge-success', icon: <CheckCircle2 size={12} /> };
      case 'ISSUED': return { class: 'badge-primary', icon: <Clock size={12} /> };
      case 'CANCELLED': return { class: 'badge-error', icon: <X size={12} /> };
      default: return { class: 'badge-secondary', icon: <Clock size={12} /> };
    }
  };

  const columns = [
    { header: 'Reference', accessor: (inv: any) => <span className="id-tag">{inv.invoiceNumber}</span> },
    { header: 'Client Entity', accessor: (inv: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>
              {inv.workOrder?.customer?.name?.[0] || 'C'}
            </div>
            <div>
                <div style={{ fontWeight: '800', color: 'var(--text-h)', fontSize: '15px' }}>{inv.workOrder?.customer?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Service Ref: #WO-{inv.workOrder?.id + 1000}</div>
            </div>
        </div>
    )},
    { header: 'Billing Date', accessor: (inv: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
        <Calendar size={14} />
        {new Date(inv.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    )},
    { header: 'Final Settlement', accessor: (inv: any) => <span style={{ fontWeight: '900', color: 'var(--text-h)', fontSize: '16px' }}>₹{inv.total.toLocaleString()}</span> },
    { header: 'Status', accessor: (inv: any) => {
      const badge = getStatusBadge(inv.status);
      return (
        <span className={`badge ${badge.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {badge.icon} {inv.status}
        </span>
      );
    }}
  ];

  return (
    <Layout>
      <div className="invoices-container">
        <header style={{ marginBottom: UI_CONSTANTS.header.marginBottom, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.02em' }}>Financial Ledger</h1>
            <p className="text-muted" style={{ fontWeight: '500' }}>Real-time monitoring of accounts receivable and collection status.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
             <div className="mini-stat" style={{ borderLeft: '4px solid var(--success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={14} className="text-success" />
                  <span className="stat-label">Realized Revenue</span>
                </div>
                <span className="stat-value text-success">₹{totalRevenue.toLocaleString()}</span>
             </div>
             <div className="mini-stat" style={{ borderLeft: '4px solid var(--error)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={14} className="text-error" />
                  <span className="stat-label">Total Receivables</span>
                </div>
                <span className="stat-value text-error">₹{totalOutstanding.toLocaleString()}</span>
             </div>
          </div>
        </header>

        <div className="filter-bar" style={{ marginBottom: '32px', gap: '20px' }}>
          <div className="search-bar" style={{ flex: 2 }}>
            <Search size={20} className="text-muted" />
            <input 
                type="text" 
                placeholder="Search by Invoice #, Client Name or Job ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '0 16px', borderRadius: '14px', border: '1.5px solid var(--border)', flex: 1 }}>
            <Filter size={18} className="text-muted" />
            <select 
                style={{ border: 'none', background: 'transparent', height: '52px', fontWeight: '700', color: 'var(--text-h)', outline: 'none', width: '100%', cursor: 'pointer' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Payment Statuses</option>
                <option value="ISSUED">Awaiting Settlement</option>
                <option value="PAID">Paid in Full</option>
                <option value="CANCELLED">Voided / Cancelled</option>
            </select>
          </div>
        </div>

        <div className="stable-table-container">
          <div className="table-content-area">
            <ExpandableRowTable 
                data={filteredInvoices}
                columns={columns}
                loading={loading}
                renderExpanded={(inv: any) => (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px', padding: '12px' }}>
                        <div>
                            <div className="stat-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Receipt size={14} /> Itemized Specification
                            </div>
                            <div style={{ background: 'var(--surface-muted)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>Service Description</th>
                                            <th style={{ textAlign: 'center', paddingBottom: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>Qty</th>
                                            <th style={{ textAlign: 'right', paddingBottom: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(inv.items && inv.items.length > 0 ? inv.items : inv.workOrder?.quotation?.items || [])?.map((item: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '16px 0' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-h)' }}>{item.description}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>{item.type || 'Professional Service'}</div>
                                                </td>
                                                <td style={{ padding: '16px 0', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>{item.quantity}</td>
                                                <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '14px', fontWeight: '900', color: 'var(--text-h)' }}>₹{item.totalAmount?.toLocaleString() || (item.quantity * item.unitPrice).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'var(--text-h)', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                  <Briefcase size={120} />
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '15px', fontWeight: '600', opacity: 0.7 }}>
                                      <span>Subtotal</span>
                                      <span>₹{inv.subtotal.toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '15px', fontWeight: '600', opacity: 0.7 }}>
                                      <span>Tax (GST 18%)</span>
                                      <span>+ ₹{inv.tax.toLocaleString()}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)', alignItems: 'flex-end' }}>
                                      <div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Settlement</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>₹{inv.total.toLocaleString()}</div>
                                      </div>
                                      <div className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '8px' }}>
                                        {inv.status}
                                      </div>
                                  </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {inv.status === 'ISSUED' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); setPaymentData({...paymentData, amount: inv.total}); setIsPaymentModalOpen(true); }}
                                        className="btn btn-primary"
                                        style={{ height: '56px', fontSize: '16px' }}
                                    >
                                        <CreditCard size={20} /> Record Payment Collection
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDownloadPdf(inv)} 
                                    className="btn btn-secondary" 
                                    style={{ height: '56px', fontSize: '15px' }}
                                    disabled={downloadingId === inv.id}
                                >
                                    {downloadingId === inv.id ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                    {downloadingId === inv.id ? 'Generating Secure PDF...' : 'Download Official Invoice'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            />
          </div>
          
          <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Authorize Financial Settlement" width="600px">
        <form onSubmit={handleRecordPayment} className="premium-form-layout">
            <div className="form-group">
                <label className="form-label">Total Amount Collected (INR)</label>
                <div className="input-with-icon">
                    <IndianRupee size={20} className="input-icon" />
                    <input type="number" className="input-field pl-10" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Payment Instrument / Channel</label>
                <div className="input-with-icon">
                  <CreditCard size={20} className="input-icon" />
                  <select className="input-field pl-10" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                      <option value="CASH">Direct Physical Cash</option>
                      <option value="BANK_TRANSFER">Direct Bank Deposit (NEFT/RTGS)</option>
                      <option value="UPI">UPI / Digital Wallet</option>
                  </select>
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Transaction Reference / UTR</label>
                <div className="input-with-icon">
                  <Tag size={20} className="input-icon" />
                  <input type="text" className="input-field pl-10" placeholder="Enter bank reference or receipt #" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} required />
                </div>
            </div>

            <div className="modal-footer-actions">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">Discard Changes</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }}>Finalize Settlement</button>
            </div>
        </form>
      </Modal>

      <style>{`
        .invoices-container { max-width: 1400px; margin: 0 auto; padding-bottom: 40px; }
        .premium-form-layout { display: flex; flex-direction: column; gap: 28px; padding: 12px 4px; }
        .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
        
        @media (max-width: 1024px) {
          header { flex-direction: column; align-items: flex-start !important; gap: 24px; }
          .mini-stat { width: 100%; }
        }
      `}</style>
    </Layout>
  );
};

export default InvoicesPage;
