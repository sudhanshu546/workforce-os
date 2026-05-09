import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Search, Filter, Eye, Loader2,
  IndianRupee, User, Phone, Trash2, Printer, Mail, Download, 
  Clock, Plus, CreditCard, Receipt, Building, Calendar, ArrowUpRight, X, Tag
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import Modal from '../components/Modal';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
      const response = await api.get('/finance/invoices');
      setInvoices(response.data);
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

  return (
    <Layout>
      <div className="invoices-container">
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>Financial Ledger</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Track billing, issued invoices, and revenue collection.</p>
          </div>
          <div className="stats-mini-row" style={{ display: 'flex', gap: '32px' }}>
             <div className="mini-stat">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value text-success">₹{totalRevenue.toLocaleString()}</span>
             </div>
             <div className="mini-stat">
                <span className="stat-label">Outstanding</span>
                <span className="stat-value text-error">₹{totalOutstanding.toLocaleString()}</span>
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
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                    <td><span className="text-sub">{new Date(inv.createdAt).toLocaleDateString()}</span></td>
                    <td>
                        <span style={{ fontWeight: '800', color: 'var(--text-h)', fontSize: '15px' }}>
                            ₹{inv.total.toFixed(2)}
                        </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {inv.status === 'ISSUED' && (
                                <button 
                                    onClick={() => { setSelectedInvoice(inv); setPaymentData({...paymentData, amount: inv.total}); setIsPaymentModalOpen(true); }}
                                    className="btn btn-primary"
                                    style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', height: 'auto' }}
                                >
                                    Record Payment
                                </button>
                            )}
                            <button 
                                onClick={() => { setSelectedInvoice(inv); setIsViewModalOpen(true); }}
                                className="btn-icon"
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

      {/* Invoice Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Invoice Specification" width="900px">
        {selectedInvoice && (
          <div className="premium-form-layout">
            <div className="invoice-detail-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div>
                <div className="stat-label" style={{ marginBottom: '4px' }}>INVOICE NUMBER</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-h)' }}>{selectedInvoice.invoiceNumber}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <span className={`badge ${selectedInvoice.status === 'PAID' ? 'badge-success' : 'badge-primary'}`}>
                        Payment {selectedInvoice.status}
                    </span>
                    <span className="badge badge-secondary">#WO-{selectedInvoice.workOrder?.id + 1000}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-label" style={{ marginBottom: '4px' }}>BILLING FOR</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{selectedInvoice.workOrder?.customer?.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedInvoice.workOrder?.customer?.email}</div>
              </div>
            </div>

            <table className="compact-quote-table" style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '16px 24px' }}>Item Description</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '16px 24px' }}>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Professional Services from Quotation */}
                    {selectedInvoice.workOrder?.quotation?.items?.map((item: any, idx: number) => (
                        <tr key={`quote-${idx}`}>
                            <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: '700' }}>{item.description}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Professional Service</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', padding: '16px 24px', fontWeight: '700' }}>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                    ))}
                    
                    {/* Field Materials Used */}
                    {selectedInvoice.workOrder?.materials?.map((m: any, idx: number) => (
                        <tr key={`material-${idx}`}>
                            <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: '700' }}>{m.material.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inventory Part Used</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>{m.quantityUsed} {m.material.unit}</td>
                            <td style={{ textAlign: 'right', padding: '16px 24px', fontWeight: '700' }}>₹{(m.quantityUsed * m.unitPriceAtUse).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h4 className="section-title-standard" style={{ marginBottom: '12px' }}>Official Notes</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        This is a computer-generated document. For bank transfers, please use the Invoice Number as the reference. Payment is due within 7 days of service completion.
                    </p>
                </div>
                <div style={{ background: '#1e293b', color: '#fff', padding: '32px', borderRadius: '20px' }}>
                    <div className="sum-row-standard">
                        <span>Subtotal</span>
                        <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="sum-row-standard">
                        <span>GST / Service Tax</span>
                        <span>₹{selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="sum-row-standard grand-total-standard">
                        <span>Grand Total</span>
                        <span style={{ color: '#818cf8' }}>₹{selectedInvoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="modal-footer-actions">
                <button className="btn btn-secondary" style={{ gap: '8px' }}><Download size={18} /> Export PDF</button>
                <button className="btn btn-primary" style={{ gap: '8px' }}><Printer size={18} /> Print Invoice</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Secure Payment Recording" width="900px">
        <form onSubmit={handleRecordPayment} className="premium-form-layout">
            <div className="form-grid-standard">
                <div className="form-group">
                    <label className="form-label">Transaction Amount (₹)</label>
                    <div className="input-with-icon">
                        <IndianRupee size={18} className="input-icon" />
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
                    <label className="form-label">Payment Gateway / Method</label>
                    <select className="input-field" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                        <option value="CASH">Direct Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                        <option value="UPI">UPI Payment</option>
                        <option value="CHECK">Business Check</option>
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label className="form-label">Transaction Reference #</label>
                <div className="input-with-icon">
                    <Receipt size={18} className="input-icon" />
                    <input 
                        type="text" 
                        className="input-field pl-10" 
                        placeholder="UTR Number, Check ID, or Cash Receipt Ref"
                        value={paymentData.reference} 
                        onChange={e => setPaymentData({...paymentData, reference: e.target.value})} 
                        required 
                    />
                </div>
            </div>

            <div className="modal-footer-actions">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '220px' }}>Finalize Payment</button>
            </div>
        </form>
      </Modal>

      <style>{`
        .invoices-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-form-layout {
            display: flex;
            flex-direction: column;
            gap: 32px;
            padding: 8px 4px;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 900;
            color: var(--text-muted);
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .section-title-standard {
            font-size: 13px;
            font-weight: 900;
            color: var(--text-h);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .sum-row-standard {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 12px;
            color: #94a3b8;
            font-weight: 600;
        }

        .grand-total-standard {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #334155;
            font-size: 26px;
            font-weight: 900;
            color: white;
            margin-bottom: 0;
        }

        .modal-footer-actions {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 12px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }

        .form-grid-standard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .form-label {
            display: block;
            font-size: 13px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }

        .mini-stat {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .section-title {
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
        }
      `}</style>
    </Layout>
  );
};

export default InvoicesPage;
