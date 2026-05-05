import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Briefcase, FileText, Trash2, CheckCircle2, 
  User, Phone, Calendar, AlertCircle, Loader2, ArrowRight,
  ChevronDown, X, DollarSign, Percent, Tag, Clock, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Lead Form State
  const [newLeadData, setNewLeadData] = useState({ 
    customerName: '', 
    customerPhone: '', 
    description: '',
    serviceItemId: '',
    priority: 'MEDIUM'
  });

  // Quotation Form State
  const [quoteData, setQuoteData] = useState({
    items: [{ description: '', quantity: 1, unitPrice: 0, serviceId: '' }],
    tax: 0,
    discount: 0
  });

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'OWNER' && role !== 'MANAGER') {
      navigate('/dashboard');
      return;
    }
    fetchLeads(currentPage);
    fetchServices();
  }, [role, navigate, currentPage, priorityFilter]);

  const fetchLeads = async (page: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/leads?page=${page}&size=${pageSize}`);
      setLeads(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/items');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leads', newLeadData);
      setIsLeadModalOpen(false);
      setNewLeadData({ customerName: '', customerPhone: '', description: '', serviceItemId: '', priority: 'MEDIUM' });
      fetchLeads(0);
    } catch (err) {
      console.error('Failed to create lead:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/quotations', {
        leadId: selectedLead.id,
        items: quoteData.items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice
        })),
        tax: quoteData.tax,
        discount: quoteData.discount
      });
      setIsQuotationModalOpen(false);
      setQuoteData({ items: [{ description: '', quantity: 1, unitPrice: 0, serviceId: '' }], tax: 0, discount: 0 });
      fetchLeads(currentPage);
    } catch (err) {
      console.error('Failed to create quotation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
        try {
            await api.delete(`/leads/${id}`);
            fetchLeads(currentPage);
        } catch (err) {
            console.error('Error deleting lead', err);
        }
    }
  };

  const addItem = () => {
    setQuoteData({
      ...quoteData,
      items: [...quoteData.items, { description: '', quantity: 1, unitPrice: 0, serviceId: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...quoteData.items];
    newItems.splice(index, 1);
    setQuoteData({ ...quoteData, items: newItems });
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find(s => String(s.id) === serviceId);
    if (service) {
        const newItems = [...quoteData.items];
        newItems[index] = {
            ...newItems[index],
            serviceId: serviceId,
            description: service.name,
            unitPrice: service.basePrice
        };
        setQuoteData({ ...quoteData, items: newItems });
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...quoteData.items] as any;
    newItems[index][field] = value;
    setQuoteData({ ...quoteData, items: newItems });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lead.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getSubtotal = () => quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const getTotal = () => {
      const sub = getSubtotal();
      return sub + (sub * (quoteData.tax / 100)) - quoteData.discount;
  };

  const getPriorityBadge = (p: string) => {
      switch(p) {
          case 'HIGH': return 'badge-error';
          case 'MEDIUM': return 'badge-warning';
          default: return 'badge-secondary';
      }
  };

  const getStatusBadge = (s: string) => {
      switch(s) {
          case 'CONVERTED': return 'badge-success';
          case 'NEW': return 'badge-primary';
          case 'QUOTED': return 'badge-secondary';
          default: return 'badge-secondary';
      }
  };

  return (
    <Layout>
      <div className="leads-container">
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)', marginBottom: '8px' }}>Sales Pipeline</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage incoming requests and convert them into successful work orders.</p>
          </div>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <Plus size={18} /> New Opportunity
          </button>
        </header>

        <div className="filter-bar card" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
                type="text" 
                placeholder="Search by customer name or service..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-select-wrapper">
            <Filter size={18} className="filter-icon" />
            <select 
                className="input-field" 
                style={{ paddingLeft: '40px', width: '220px' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
            >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Requested Service</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary)' }} /></td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                    <td colSpan={5}>
                        <div className="empty-state" style={{ padding: '80px 0' }}>
                            <AlertCircle size={48} className="empty-state-icon" />
                            <h3>No leads found</h3>
                            <p>Try refining your search or add a new customer request.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="avatar-cell">
                        <div className="avatar">{lead.customer?.name.charAt(0)}</div>
                        <div>
                            <div className="text-main">{lead.customer?.name}</div>
                            <div className="text-sub">{lead.customer?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', background: '#f8fafc', borderRadius: '8px' }}>
                            <Briefcase size={14} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-main" style={{ fontSize: '13px' }}>{lead.requestedService?.name || 'General Inquiry'}</div>
                            <div className="text-sub" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lead.description}
                            </div>
                        </div>
                      </div>
                    </td>
                    <td>
                        <span className={`badge ${getPriorityBadge(lead.priority)}`}>
                            {lead.priority}
                        </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {(lead.status === 'NEW' || lead.status === 'CONTACTED') && (
                          <button 
                            onClick={() => { setSelectedLead(lead); setIsQuotationModalOpen(true); }}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}
                          >
                            <FileText size={14} /> Create Quote
                          </button>
                        )}
                        <button className="nav-icon-btn text-error" onClick={() => handleDeleteLead(lead.id)}>
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
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* New Lead Modal */}
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="New Sales Opportunity">
        <form onSubmit={handleCreateLead}>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name</label>
              <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" className="input-field pl-10" placeholder="Full Name" value={newLeadData.customerName} onChange={e => setNewLeadData({...newLeadData, customerName: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" className="input-field pl-10" placeholder="+1 (555) 000-0000" value={newLeadData.customerPhone} onChange={e => setNewLeadData({...newLeadData, customerPhone: e.target.value})} required />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Requested Service</label>
            <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <select className="input-field pl-10" value={newLeadData.serviceItemId} onChange={e => setNewLeadData({...newLeadData, serviceItemId: e.target.value})}>
                    <option value="">Select from catalog (optional)</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ${s.basePrice}</option>
                    ))}
                </select>
            </div>
          </div>
          <div className="form-group">
            <label>Inquiry Priority</label>
            <div className="input-with-icon">
                <Tag size={18} className="input-icon" />
                <select className="input-field pl-10" value={newLeadData.priority} onChange={e => setNewLeadData({...newLeadData, priority: e.target.value})}>
                    <option value="HIGH">Urgent / High Priority</option>
                    <option value="MEDIUM">Standard / Medium</option>
                    <option value="LOW">Low / Information Only</option>
                </select>
            </div>
          </div>
          <div className="form-group">
            <label>Specific Requirements</label>
            <textarea className="input-field textarea-field" placeholder="Describe what the customer is looking for in detail..." value={newLeadData.description} onChange={e => setNewLeadData({...newLeadData, description: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button type="button" onClick={() => setIsLeadModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 2 }}>
                {submitting ? <Loader2 className="animate-spin" /> : 'Register Opportunity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Smart Quotation Modal */}
      <Modal isOpen={isQuotationModalOpen} onClose={() => setIsQuotationModalOpen(false)} title="Smart Quotation Builder">
        <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', letterSpacing: '0.05em' }}>CLIENT INFORMATION</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-h)' }}>{selectedLead?.customer?.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedLead?.description}</div>
        </div>

        <form onSubmit={handleCreateQuotation}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-h)' }}>BILLABLE ITEMS</h4>
                <button type="button" onClick={addItem} className="add-skill-btn" style={{ fontSize: '12px' }}>
                    <Plus size={14} /> Add Line Item
                </button>
            </div>

            <div className="quote-items-list" style={{ paddingRight: '4px' }}>
                {quoteData.items.map((item, index) => (
                    <div key={index} className="card" style={{ padding: '16px', marginBottom: '12px', background: '#fff', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Service Catalog</label>
                                <select 
                                    className="input-field" 
                                    value={item.serviceId} 
                                    onChange={e => handleServiceSelect(index, e.target.value)}
                                >
                                    <option value="">Choose a service...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (${s.basePrice})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Line Item Description</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Brief description..."
                                    value={item.description} 
                                    onChange={e => updateItem(index, 'description', e.target.value)}
                                    required 
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px 40px', gap: '16px', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Qty</label>
                                <input 
                                    type="number" 
                                    className="input-field" 
                                    min="1"
                                    value={item.quantity} 
                                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                    required 
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Unit Price ($)</label>
                                <div className="input-with-icon">
                                    <DollarSign size={14} className="input-icon" />
                                    <input 
                                        type="number" 
                                        className="input-field pl-10" 
                                        step="0.01"
                                        value={item.unitPrice} 
                                        onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Line Total</label>
                                <div className="input-field" style={{ background: '#f8fafc', fontWeight: '800', color: 'var(--primary)', textAlign: 'right' }}>
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                            </div>
                            <button type="button" onClick={() => removeItem(index)} className="btn-icon text-error" style={{ marginBottom: '6px' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="quote-summary-grid">
            <div className="form-group">
                <label>Tax (%)</label>
                <div className="input-with-icon">
                    <Percent size={16} className="input-icon" />
                    <input type="number" className="input-field pl-10" value={quoteData.tax} onChange={e => setQuoteData({...quoteData, tax: Number(e.target.value)})} />
                </div>
            </div>
            <div className="form-group">
                <label>Discount ($)</label>
                <div className="input-with-icon">
                    <DollarSign size={16} className="input-icon" />
                    <input type="number" className="input-field pl-10" value={quoteData.discount} onChange={e => setQuoteData({...quoteData, discount: Number(e.target.value)})} />
                </div>
            </div>
          </div>

          <div className="final-total-box" style={{ background: 'var(--text-h)', color: '#fff' }}>
             <div className="total-row" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <span>Subtotal</span>
                <span style={{ color: '#fff' }}>${getSubtotal().toFixed(2)}</span>
             </div>
             <div className="total-row" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <span>Tax Breakdown ({quoteData.tax}%)</span>
                <span style={{ color: '#fff' }}>+ ${(getSubtotal() * (quoteData.tax / 100)).toFixed(2)}</span>
             </div>
             <div className="total-row" style={{ color: '#ef4444' }}>
                <span>Applied Discount</span>
                <span>- ${quoteData.discount.toFixed(2)}</span>
             </div>
             <div className="total-row grand-total" style={{ borderTopColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                <span>Final Total Amount</span>
                <span style={{ color: '#818cf8' }}>${getTotal().toFixed(2)}</span>
             </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '32px', height: '56px', fontSize: '16px', fontWeight: '800' }} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : 'Finalize & Issue Quotation'}
          </button>
        </form>
      </Modal>

      <style>{`
        .leads-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-table-container {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
        }

        .quote-items-list {
            max-height: 380px;
            overflow-y: auto;
            padding-right: 8px;
        }

        .quote-summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }

        .final-total-box {
            margin-top: 24px;
            border-radius: 16px;
            padding: 24px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 500;
        }

        .total-row.grand-total {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            font-size: 24px;
            font-weight: 800;
        }

        @media (max-width: 1024px) {
            .form-grid, .quote-summary-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </Layout>
  );
};

export default Leads;
