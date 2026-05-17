import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, Search, Edit3, Loader2, 
  Layers, Tag, IndianRupee, AlertCircle, Filter, 
  ChevronRight, ArrowUpRight, BarChart2
} from 'lucide-react';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { Pagination } from '../components/Pagination';

const Inventory: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    quantity: 0,
    unit: 'PCS',
    unitPrice: 0,
    minQuantity: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data: any = await api.get('/inventory/materials');
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (material: any = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        description: material.description || '',
        sku: material.sku || '',
        quantity: material.quantity,
        unit: material.unit,
        unitPrice: material.unitPrice,
        minQuantity: material.minQuantity || 0
      });
    } else {
      setEditingMaterial(null);
      setFormData({ name: '', description: '', sku: '', quantity: 0, unit: 'PCS', unitPrice: 0, minQuantity: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMaterial) {
        await api.put(`/inventory/materials/${editingMaterial.id}`, formData);
      } else {
        await api.post('/inventory/materials', formData);
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert('Failed to save material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this item from inventory?')) return;
    try {
      await api.delete(`/inventory/materials/${id}`);
      fetchInventory();
    } catch (err) {
      alert('Failed to delete material');
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.sku && m.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalValue = materials.reduce((sum, m) => sum + (m.totalValue || 0), 0);
  const lowStockItems = materials.filter(m => m.quantity <= (m.minQuantity || 0)).length;

  const columns = [
    { header: 'Asset Item', accessor: (m: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--surface-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} className="text-muted"/></div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-h)' }}>{m.name}</div>
        </div>
    )},
    { header: 'Reference', accessor: (m: any) => <span className="id-tag">{m.sku}</span> },
    { header: 'Current Stock', accessor: (m: any) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '800', color: m.quantity <= (m.minQuantity || 0) ? 'var(--error)' : 'var(--text-h)' }}>{m.quantity} {m.unit}</span>
            {m.quantity <= (m.minQuantity || 0) && <span style={{ fontSize: '10px', color: 'var(--error)', fontWeight: '800', textTransform: 'uppercase' }}>Alert</span>}
        </div>
    )},
    { header: 'Unit Rate', accessor: (m: any) => <span style={{ fontWeight: '700' }}>₹{(m.unitPrice || 0).toFixed(2)}</span> },
    { header: 'Inventory Value', accessor: (m: any) => <span style={{ fontWeight: '800', color: 'var(--primary)' }}>₹{(m.totalValue || 0).toFixed(2)}</span> }
  ];

  return (
    <Layout>
      <div className="inventory-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Asset Inventory</h1>
            <p className="text-muted">Manage service parts, equipment, and consumables across all field teams.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={20} /> Provision Item
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="mini-stat">
                <span className="stat-label">Total Managed SKUs</span>
                <span className="stat-value">{materials.length}</span>
            </div>
            <div className="mini-stat">
                <span className="stat-label">Estimated Stock Worth</span>
                <span className="stat-value text-success">₹{totalValue.toLocaleString()}</span>
            </div>
            <div className="mini-stat">
                <span className="stat-label">Critical Shortages</span>
                <span className="stat-value" style={{ color: lowStockItems > 0 ? 'var(--error)' : 'inherit' }}>{lowStockItems} Items</span>
            </div>
        </div>

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
                type="text" 
                placeholder="Search inventory..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ExpandableRowTable 
            data={filteredMaterials}
            columns={columns}
            loading={loading}
            renderExpanded={(m: any) => (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                    <div>
                        <div className="stat-label">Material Specifications</div>
                        <div style={{ marginTop: '12px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</span>
                                <p style={{ fontSize: '15px', color: 'var(--text-main)', marginTop: '4px', lineHeight: '1.6' }}>{m.description || 'No additional specifications provided for this item.'}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SKU Code</span>
                                    <div style={{ fontWeight: '700', color: 'var(--primary)', marginTop: '2px' }}>{m.sku}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min. Level</span>
                                    <div style={{ fontWeight: '700', color: 'var(--text-h)', marginTop: '2px' }}>{m.minQuantity} {m.unit}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        <div className="stat-label">Asset Control</div>
                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(m); }} className="btn btn-primary" style={{ width: '100%' }}>
                            <Edit3 size={18} /> Modify Definition
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="btn btn-secondary text-error" style={{ width: '100%' }}>
                            <Trash2 size={18} /> Decommission Item
                        </button>
                    </div>
                </div>
            )}
        />
        
        <div style={{ marginTop: '24px' }}>
            <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMaterial ? "Refine Supply Specification" : "Provision New Stock Item"} width="900px">
        <form onSubmit={handleSubmit} className="premium-form-layout">
          <div className="form-grid-standard">
            <div className="form-group">
                <label className="form-label">Material Identity</label>
                <div className="search-bar">
                    <Package size={18} className="text-muted" />
                    <input type="text" placeholder="e.g. Industrial Copper Grade A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Usage Notes / Description</label>
                <div className="search-bar">
                    <input type="text" placeholder="Brief application details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
            </div>
          </div>

          <div className="form-grid-standard" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
                <label className="form-label">SKU / Tracking Code</label>
                <div className="search-bar">
                    <Tag size={18} className="text-muted" />
                    <input type="text" placeholder="Auto-generated if empty" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                    <Layers size={18} className="text-muted" style={{ marginRight: '12px' }} />
                    <select style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '600', outline: 'none' }} value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                        <option value="PCS">Individual Pieces (PCS)</option>
                        <option value="MTRS">Linear Meters (MTRS)</option>
                        <option value="KG">Weight in Kilograms (KG)</option>
                        <option value="PKT">Standard Packets (PKT)</option>
                        <option value="LTR">Volume in Liters (LTR)</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="form-grid-standard" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
                <label className="form-label">Opening Stock</label>
                <div className="search-bar">
                    <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Restock Alert Level</label>
                <div className="search-bar">
                    <AlertCircle size={18} className="text-muted" />
                    <input type="number" value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Purchase Rate (₹)</label>
                <div className="search-bar">
                    <IndianRupee size={18} className="text-muted" />
                    <input type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} required />
                </div>
            </div>
          </div>

          <div className="modal-footer-actions">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Discard</button>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '220px' }}>
                  {submitting ? <Loader2 className="animate-spin" /> : editingMaterial ? "Save Specifications" : "Register Stock"}
              </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .inventory-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-form-layout {
            display: flex;
            flex-direction: column;
            gap: 32px;
            padding: 8px 4px;
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

        .modal-footer-actions {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 12px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }
      `}</style>
    </Layout>
  );
};

export default Inventory;
