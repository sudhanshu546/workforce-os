import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Search, Filter, Eye, Loader2,
  IndianRupee, User, Phone, Trash2, Printer, Mail, Download, 
  Clock, Plus, CreditCard, Receipt, Building, Calendar, ArrowUpRight, X, Tag,
  Briefcase
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import Modal from '../components/Modal';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { Pagination } from '../components/Pagination';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
      amount: 0,
      method: 'CASH',
      reference: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data: any = await api.get('/finance/invoices');
      setInvoices(data || []);
    } catch (err) {
      console.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/finance/invoices/${selectedInvoice.id}/payments`, paymentData);
      setIsPaymentModalOpen(false);
      fetchInvoices();
      alert('Payment recorded successfully!');
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         inv.workOrder?.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = invoices.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + i.total, 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return 'badge-success';
      case 'ISSUED': return 'badge-primary';
      case 'CANCELLED': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const columns = [
    { header: 'Reference', accessor: (inv: any) => <span className="id-tag">{inv.invoiceNumber}</span> },
    { header: 'Client', accessor: (inv: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>{inv.workOrder?.customer?.name[0]}</div>
            <div>
                <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{inv.workOrder?.customer?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Job ID: #WO-{inv.workOrder?.id + 1000}</div>
            </div>
        </div>
    )},
    { header: 'Date', accessor: (inv: any) => <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{new Date(inv.createdAt).toLocaleDateString()}</span> },
    { header: 'Amount', accessor: (inv: any) => <span style={{ fontWeight: '800', color: 'var(--text-h)' }}>₹{inv.total.toLocaleString()}</span> },
    { header: 'Status', accessor: (inv: any) => <span className={`badge ${getStatusBadge(inv.status)}`}>{inv.status}</span> }
  ];

  return (
    <Layout>
      <div className="invoices-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Financial Ledger</h1>
            <p className="text-muted">Monitor accounts receivable and collection status across all service contracts.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
             <div className="mini-stat">
                <span className="stat-label">Realized Revenue</span>
                <span className="stat-value text-success">₹{totalRevenue.toLocaleString()}</span>
             </div>
             <div className="mini-stat">
                <span className="stat-label">Receivables</span>
                <span className="stat-value text-error">₹{totalOutstanding.toLocaleString()}</span>
             </div>
          </div>
        </header>

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
                type="text" 
                placeholder="Find invoice or client..." 
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
                <option value="ALL">All Payments</option>
                <option value="ISSUED">Awaiting Settlement</option>
                <option value="PAID">Paid in Full</option>
                <option value="CANCELLED">Voided</option>
            </select>
          </div>
        </div>

        <ExpandableRowTable 
            data={filteredInvoices}
            columns={columns}
            loading={loading}
            renderExpanded={(inv: any) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                    <div>
                        <div className="stat-label">Itemized Specification</div>
                        <div style={{ marginTop: '12px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>DESCRIPTION</th>
                                        <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>QTY</th>
                                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(inv.items && inv.items.length > 0 ? inv.items : inv.workOrder?.quotation?.items || [])?.map((item: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '14px 0' }}>
                                                <div style={{ fontWeight: '700', fontSize: '13px' }}>{item.description}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.type || 'Professional Service'}</div>
                                            </td>
                                            <td style={{ padding: '14px 0', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                                            <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '13px', fontWeight: '700' }}>₹{item.totalAmount?.toLocaleString() || (item.quantity * item.unitPrice).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'var(--text-h)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.8 }}>
                                <span>Subtotal</span>
                                <span>₹{inv.subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.8 }}>
                                <span>Tax (GST)</span>
                                <span>+ ₹{inv.tax.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '24px', fontWeight: '900' }}>
                                <span>Grand Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{inv.total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {inv.status === 'ISSUED' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); setPaymentData({...paymentData, amount: inv.total}); setIsPaymentModalOpen(true); }}
                                    className="btn btn-primary"
                                    style={{ flex: '1 1 100%' }}
                                >
                                    <CreditCard size={18} /> Record Collection
                                </button>
                            )}
                            <button className="btn btn-secondary" style={{ flex: 1 }}><Download size={18} /> Export</button>
                            <button className="btn btn-secondary" style={{ flex: 1 }}><Printer size={18} /> Print</button>
                        </div>
                    </div>
                </div>
            )}
        />
        
        <div style={{ marginTop: '24px' }}>
            <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
        </div>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Secure Payment" width="600px">
        <form onSubmit={handleRecordPayment} className="premium-form-layout">
            <div className="form-group">
                <label className="form-label">Amount Collected (₹)</label>
                <div className="input-with-icon">
                    <IndianRupee size={18} className="input-icon" />
                    <input type="number" className="input-field pl-10" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Settlement Method</label>
                <select className="input-field" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                    <option value="CASH">Direct Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI / Digital</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Reference / UTR Number</label>
                <input type="text" className="input-field" placeholder="Receipt or Transaction ID" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} required />
            </div>

            <div className="modal-footer-actions">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Authorize Payment</button>
            </div>
        </form>
      </Modal>

      <style>{`
        .invoices-container { max-width: 1400px; margin: 0 auto; }
        .premium-form-layout { display: flex; flex-direction: column; gap: 24px; padding: 8px 4px; }
        .form-label { display: block; font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
      `}</style>
    </Layout>
  );
};

export default InvoicesPage;
