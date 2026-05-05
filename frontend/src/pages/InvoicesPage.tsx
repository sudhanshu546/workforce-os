import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Search, Filter, Eye, Loader2,
  DollarSign, User, Phone, Trash2, Printer, Mail, Download, 
  Clock, Plus, CreditCard, Receipt, Building, Calendar, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
      amount: 0,
      method: 'CASH',
      reference: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'OWNER' && role !== 'MANAGER') {
      navigate('/dashboard');
      return;
    }
    fetchInvoices();
  }, [role, navigate]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/invoices');
      setInvoices(response.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.post('/finance/payments', {
              invoiceId: selectedInvoice.id,
              ...paymentData,
              transactionReference: paymentData.reference
          });
          setIsPaymentModalOpen(false);
          fetchInvoices();
      } catch (err) {
          console.error('Failed to record payment');
      }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'PAID': return 'badge-success';
          case 'ISSUED': return 'badge-primary';
          case 'CANCELLED': return 'badge-error';
          default: return 'badge-secondary';
      }
  };

  const filteredInvoices = invoices.filter(inv => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           inv.workOrder?.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  const totalOutstanding = invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.total, 0);
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);

  return (
    <Layout>
      <div className="invoices-container">
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>Financial Ledger</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Manage billing, track payments, and monitor revenue.</p>
          </div>
          <div className="stats-mini-row" style={{ display: 'flex', gap: '32px' }}>
             <div className="mini-stat">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value text-success">${totalRevenue.toLocaleString()}</span>
             </div>
             <div className="mini-stat">
                <span className="stat-label">Outstanding</span>
                <span className="stat-value text-error">${totalOutstanding.toLocaleString()}</span>
             </div>
          </div>
        </header>

        <div className="filter-bar card" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
                type="text" 
                placeholder="Search invoice # or customer..." 
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
                <option value="ALL">All Invoices</option>
                <option value="ISSUED">Unpaid / Issued</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary)' }} /></td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="id-tag">{inv.invoiceNumber}</span></td>
                    <td>
                        <div className="text-main">{inv.workOrder?.customer?.name}</div>
                        <div className="text-sub">Ref: #WO-{inv.workOrder?.id + 1000}</div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} className="text-muted" />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>
                    </td>
                    <td>
                        <span style={{ fontWeight: '800', color: 'var(--text-h)', fontSize: '15px' }}>
                            ${inv.total.toFixed(2)}
                        </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            {inv.status !== 'PAID' && (
                                <button 
                                    onClick={() => { setSelectedInvoice(inv); setPaymentData({...paymentData, amount: inv.total}); setIsPaymentModalOpen(true); }}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', gap: '6px' }}
                                >
                                    <CreditCard size={14} /> Pay
                                </button>
                            )}
                            <button 
                                onClick={() => { setSelectedInvoice(inv); setIsViewModalOpen(true); }}
                                className="nav-icon-btn"
                                style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}
                            >
                                <Eye size={18} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Invoice Details">
        {selectedInvoice && (
          <div className="invoice-document" style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div>
                    <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '16px' }}>
                        <Receipt size={32} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900' }}>{selectedInvoice.invoiceNumber}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Issued on {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${getStatusBadge(selectedInvoice.status)}`} style={{ fontSize: '14px', padding: '8px 24px', borderRadius: '12px' }}>
                        {selectedInvoice.status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '48px' }}>
                <div>
                    <h4 className="section-title">BILL TO</h4>
                    <div className="text-main" style={{ fontSize: '18px', marginBottom: '4px' }}>{selectedInvoice.workOrder?.customer?.name}</div>
                    <div className="text-sub">{selectedInvoice.workOrder?.customer?.phone}</div>
                    <div className="text-sub">{selectedInvoice.workOrder?.customer?.address || 'Site Address'}</div>
                </div>
                <div>
                    <h4 className="section-title">PAYMENT DETAILS</h4>
                    <div className="text-sub">Work Order: #WO-{selectedInvoice.workOrder?.id + 1000}</div>
                    <div className="text-sub">Due Date: Net 30</div>
                </div>
            </div>

            <table className="quote-table" style={{ marginBottom: '40px' }}>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '24px 0' }}>
                            <div style={{ fontWeight: '700' }}>Professional Services Rendered</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>As per Work Order completion on {selectedInvoice.workOrder?.scheduledDate}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800' }}>${selectedInvoice.subtotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
                    <h4 className="section-title">Notes</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Please make all checks payable to the organization. For bank transfers, include the invoice number as reference. Thank you for your business!
                    </p>
                </div>
                <div style={{ background: 'var(--text-h)', color: '#fff', padding: '32px', borderRadius: '20px' }}>
                    <div className="sum-row" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>Subtotal</span>
                        <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="sum-row" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span>Tax (Calculated)</span>
                        <span>${selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="sum-row total" style={{ borderTopColor: 'rgba(255,255,255,0.1)', marginTop: '24px', paddingTop: '24px', fontSize: '28px' }}>
                        <span>Total</span>
                        <span style={{ color: '#818cf8' }}>${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="quote-actions-bar" style={{ marginTop: '40px', paddingTop: '32px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, gap: '8px' }}><Printer size={18}/> Print Invoice</button>
                    <button className="btn btn-secondary" style={{ flex: 1, gap: '8px' }}><Download size={18}/> Download PDF</button>
                </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment}>
            <div className="form-group">
                <label>Amount Received ($)</label>
                <div className="input-with-icon">
                    <DollarSign size={18} className="input-icon" />
                    <input 
                        type="number" 
                        className="input-field pl-10" 
                        value={paymentData.amount} 
                        onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} 
                        required 
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Payment Method</label>
                <select className="input-field" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="UPI">UPI / Digital Wallet</option>
                </select>
            </div>
            <div className="form-group">
                <label>Transaction Reference</label>
                <div className="input-with-icon">
                    <Receipt size={18} className="input-icon" />
                    <input 
                        type="text" 
                        className="input-field pl-10" 
                        placeholder="e.g. TXN12345678"
                        value={paymentData.reference} 
                        onChange={e => setPaymentData({...paymentData, reference: e.target.value})} 
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '48px', fontWeight: '800' }}>Verify & Record Payment</button>
            </div>
        </form>
      </Modal>

      <style>{`
        .mini-stat {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
      `}</style>
    </Layout>
  );
};

export default InvoicesPage;
