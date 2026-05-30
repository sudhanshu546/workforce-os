import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Briefcase, FileText, Trash2, CheckCircle2, 
  User, Phone, Calendar, AlertCircle, Loader2, ArrowRight,
  ChevronDown, X, IndianRupee, Percent, Tag, Clock, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { Layout } from '../components/Layout';
import { useToast } from '../components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { ExpandableRowTable } from '../components/ExpandableRowTable';

const Leads: React.FC = () => {
  const showToast = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
      const data: any = await api.get(`/leads?page=${page}&size=${pageSize}`);
      setLeads(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data: any = await api.get('/services/items/all');
      setServices(Array.isArray(data) ? data : []);
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

  const columns = [
    { header: 'Opportunity Source', accessor: (lead: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>{lead.customer?.name[0]}</div>
            <div>
                <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{lead.customer?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{lead.customer?.phone}</div>
            </div>
        </div>
    )},
    { header: 'Interest Area', accessor: (lead: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={14} className="text-muted" />
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{lead.requestedService?.name || 'General Inquiry'}</span>
        </div>
    )},
    { header: 'Priority', accessor: (lead: any) => <span className={`badge ${getPriorityBadge(lead.priority)}`}>{lead.priority}</span> },
    { header: 'Created On', accessor: (lead: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Calendar size={14} /> {new Date(lead.createdAt).toLocaleDateString()}
        </div>
    )},
    { header: 'Stage', accessor: (lead: any) => <span className={`badge ${getStatusBadge(lead.status)}`}>{lead.status.replace('_', ' ')}</span> }
  ];

  return (
    <Layout>
      <div className="leads-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Revenue Pipeline</h1>
            <p className="text-muted">Qualified opportunities waiting for service estimation and dispatch.</p>
          </div>
          <button onClick={() => setIsLeadModalOpen(true)} className="btn btn-primary">
            <Plus size={20} /> Capture Opportunity
          </button>
        </header>

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
                type="text" 
                placeholder="Search pipeline..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Filter size={18} className="text-muted" />
            <select 
                style={{ border: 'none', background: 'transparent', height: '44px', fontWeight: '600', color: 'var(--text-h)', outline: 'none' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
            >
                <option value="ALL">All Levels</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Standard</option>
                <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="stable-table-container">
          <div className="table-content-area">
            <ExpandableRowTable 
                data={filteredLeads}
                columns={columns}
                loading={loading}
                renderExpanded={(lead: any) => (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <div>
                            <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Inquiry Requirements</div>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '15px', color: 'var(--text-main)', marginTop: '12px', lineHeight: '1.6', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--primary)', color: 'white', padding: '2px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>CLIENT BRIEF</div>
                                {lead.description || 'No specific requirements mentioned. Standard service inquiry.'}
                            </div>
                            <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--surface-muted)', padding: '8px 16px', borderRadius: '10px' }}>
                                    <Phone size={14} className="text-primary" /> {lead.customer?.phone}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--surface-muted)', padding: '8px 16px', borderRadius: '10px' }}>
                                    <Clock size={14} className="text-primary" /> ID: #LD-{lead.id + 1000}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                            <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pipeline Actions</div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {(lead.status === 'NEW' || lead.status === 'CONTACTED') && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsQuotationModalOpen(true); }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', height: '48px' }}
                                    >
                                        <FileText size={18} /> Construct Estimate
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}
                                    className="btn btn-secondary text-error" 
                                    style={{ width: '100%', height: '48px' }}
                                >
                                    <Trash2 size={18} /> Archive Opportunity
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            />
          </div>
          
          <div style={{ marginTop: '24px' }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="Capture New Sales Opportunity" width="800px">
        <form onSubmit={handleCreateLead} className="premium-form-layout">
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <div className="search-bar">
                  <User size={18} className="text-muted" />
                  <input type="text" placeholder="Full legal name" value={newLeadData.customerName} onChange={e => setNewLeadData({...newLeadData, customerName: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <div className="search-bar">
                  <Phone size={18} className="text-muted" />
                  <input type="tel" placeholder="+91 00000 00000" value={newLeadData.customerPhone} onChange={e => setNewLeadData({...newLeadData, customerPhone: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Interest Category</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                <Briefcase size={18} className="text-muted" style={{ marginRight: '12px' }} />
                <select style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '600', outline: 'none' }} value={newLeadData.serviceItemId} onChange={e => setNewLeadData({...newLeadData, serviceItemId: e.target.value})}>
                    <option value="">General Service Inquiry</option>
                    {Array.isArray(services) && services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Engagement Priority</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                <Tag size={18} className="text-muted" style={{ marginRight: '12px' }} />
                <select style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '600', outline: 'none' }} value={newLeadData.priority} onChange={e => setNewLeadData({...newLeadData, priority: e.target.value})}>
                    <option value="HIGH">High Priority / Urgent</option>
                    <option value="MEDIUM">Standard Engagement</option>
                    <option value="LOW">Low / Backlog</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Requirements & Scope</label>
            <textarea 
                style={{ width: '100%', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface-muted)', fontSize: '15px', fontWeight: '500', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-muted)'; }}
                placeholder="Detail the customer's specific needs, site conditions, or deadlines..." 
                value={newLeadData.description} 
                onChange={e => setNewLeadData({...newLeadData, description: e.target.value})} 
                required 
                rows={4}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsLeadModalOpen(false)} className="btn btn-secondary">Discard</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '220px' }}>
                {submitting ? <Loader2 className="animate-spin" /> : 'Register Opportunity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Smart Quotation Builder */}
      <Modal isOpen={isQuotationModalOpen} onClose={() => setIsQuotationModalOpen(false)} title="Issue Professional Quotation" width="900px">
        <div className="quotation-builder-layout">
            <div className="quote-header-info">
                <div className="client-badge-card">
                    <div className="card-icon"><User size={20} /></div>
                    <div className="card-data">
                        <span className="data-label">Client Name</span>
                        <span className="data-value">{selectedLead?.customer?.name}</span>
                    </div>
                </div>
                <div className="client-badge-card">
                    <div className="card-icon"><Briefcase size={20} /></div>
                    <div className="card-data">
                        <span className="data-label">Service Request</span>
                        <span className="data-value">{selectedLead?.requestedService?.name || 'General Inquiry'}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCreateQuotation} className="quote-form-body">
                <div className="line-items-section">
                    <div className="section-title-bar">
                        <h4>BILLABLE LINE ITEMS</h4>
                        <button type="button" onClick={addItem} className="btn-add-item">
                            <Plus size={14} /> Add Line
                        </button>
                    </div>

                    <div className="quote-table-wrapper">
                        <table className="compact-quote-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '220px' }}>Service Catalog</th>
                                    <th>Description</th>
                                    <th style={{ width: '80px' }}>Qty</th>
                                    <th style={{ width: '130px' }}>Unit Price</th>
                                    <th style={{ width: '120px', textAlign: 'right' }}>Total</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {quoteData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select 
                                                className="table-input" 
                                                value={item.serviceId} 
                                                onChange={e => handleServiceSelect(index, e.target.value)}
                                            >
                                                <option value="">Select Service...</option>
                                                {services.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                className="table-input" 
                                                placeholder="Custom description..."
                                                value={item.description} 
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                required 
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="number" 
                                                className="table-input" 
                                                min="1"
                                                value={item.quantity} 
                                                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                                required 
                                            />
                                        </td>
                                        <td>
                                            <div className="price-input-box">
                                                <span className="currency">₹</span>
                                                <input 
                                                    type="number" 
                                                    className="table-input" 
                                                    step="0.01"
                                                    value={item.unitPrice} 
                                                    onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                    required 
                                                />
                                            </div>
                                        </td>
                                        <td className="row-total">
                                            ₹{(item.quantity * item.unitPrice).toFixed(2)}
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => removeItem(index)} className="btn-remove-row">
                                                <X size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="quote-footer-summary">
                    <div className="adjustments-panel">
                        <div className="adj-group">
                            <label>Tax Rate (%)</label>
                            <div className="adj-input-wrapper">
                                <Percent size={14} />
                                <input 
                                    type="number" 
                                    min="0"
                                    value={quoteData.tax} 
                                    onChange={e => setQuoteData({...quoteData, tax: Math.max(0, Number(e.target.value))})} 
                                />
                            </div>
                        </div>
                        <div className="adj-group">
                            <label>Flat Discount (₹)</label>
                            <div className="adj-input-wrapper">
                                <Tag size={14} />
                                <input 
                                    type="number" 
                                    min="0"
                                    value={quoteData.discount} 
                                    onChange={e => setQuoteData({...quoteData, discount: Math.max(0, Number(e.target.value))})} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="totals-display-box">
                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span>₹{getSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax ({quoteData.tax}%)</span>
                            <span>+ ₹{(getSubtotal() * (quoteData.tax / 100)).toFixed(2)}</span>
                        </div>
                        {quoteData.discount > 0 && (
                            <div className="summary-line discount">
                                <span>Discount</span>
                                <span>- ₹{quoteData.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-line grand-total">
                            <span>Grand Total</span>
                            <span>₹{getTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="quote-actions">
                    <button type="button" onClick={() => setIsQuotationModalOpen(false)} className="btn btn-secondary">Discard</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" /> : 'Finalize & Send Quote'}
                    </button>
                </div>
            </form>
        </div>
      </Modal>

      <style>{`
        .leads-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-table-container {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
        }

        /* Quotation Builder Styles */
        .quotation-builder-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .quote-header-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .client-badge-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid var(--primary);
        }

        .client-badge-card .card-icon {
            width: 40px;
            height: 40px;
            background: #e0e7ff;
            color: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card-data {
            display: flex;
            flex-direction: column;
        }

        .data-label {
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .data-value {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-h);
        }

        .section-title-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .section-title-bar h4 {
            font-size: 13px;
            font-weight: 800;
            color: var(--text-h);
            letter-spacing: 0.02em;
        }

        .btn-add-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bcf0da;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-add-item:hover {
            background: #dcfce7;
            transform: translateY(-1px);
        }

        .quote-table-wrapper {
            background: white;
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
        }

        .compact-quote-table {
            width: 100%;
            border-collapse: collapse;
        }

        .compact-quote-table th {
            background: #f8fafc;
            padding: 12px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            border-bottom: 1px solid var(--border);
        }

        .compact-quote-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #f1f5f9;
        }

        .table-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid transparent;
            border-radius: 6px;
            font-size: 13px;
            transition: all 0.2s;
            background: transparent;
        }

        .table-input:hover {
            border-color: #e2e8f0;
            background: #f8fafc;
        }

        .table-input:focus {
            outline: none;
            border-color: var(--primary);
            background: white;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .price-input-box {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #f8fafc;
            border-radius: 6px;
            padding: 0 8px;
        }

        .price-input-box .currency {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .row-total {
            text-align: right;
            font-weight: 800;
            color: var(--primary);
            font-size: 14px;
        }

        .btn-remove-row {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ef4444;
            border: none;
            background: transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-remove-row:hover {
            background: #fef2f2;
        }

        .quote-footer-summary {
            display: flex;
            justify-content: space-between;
            gap: 32px;
            padding-top: 24px;
            border-top: 2px dashed var(--border);
            flex-wrap: wrap;
        }

        .adjustments-panel {
            display: flex;
            gap: 24px;
            flex: 1;
            min-width: 300px;
        }

        .adj-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .adj-group label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .adj-input-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 10px;
            width: 140px;
        }

        .adj-input-wrapper input {
            background: transparent;
            border: none;
            outline: none;
            width: 100%;
            font-weight: 700;
            color: var(--text-h);
        }

        .totals-display-box {
            background: #1e293b;
            padding: 24px;
            border-radius: 16px;
            color: white;
            width: 340px;
            flex-shrink: 0;
        }

        .summary-line {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 12px;
            color: #94a3b8;
        }

        .summary-line.discount {
            color: #f87171;
        }

        .summary-line.grand-total {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #334155;
            font-size: 24px;
            font-weight: 800;
            color: white;
            margin-bottom: 0;
        }

        .quote-actions {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }

        .quote-actions button {
            height: 52px;
            font-weight: 800;
        }

        @media (max-width: 1024px) {
            .quote-header-info, .quote-footer-summary {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </Layout>
  );
};

export default Leads;
