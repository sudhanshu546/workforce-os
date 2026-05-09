import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, Search, Edit3, Loader2, 
  Layers, Tag, IndianRupee, AlertCircle, Filter, 
  ChevronRight, ArrowUpRight, BarChart2
} from 'lucide-react';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';

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
    sku: '',
    quantity: 0,
    unit: 'PCS',
    price: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/materials');
      setMaterials(response.data);
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
        sku: material.sku,
        quantity: material.quantity,
        unit: material.unit,
        price: material.price
      });
    } else {
      setEditingMaterial(null);
      setFormData({ name: '', sku: '', quantity: 0, unit: 'PCS', price: 0 });
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
    m.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
  const lowStockItems = materials.filter(m => m.quantity < 10).length;

  return (
    <Layout>
      <div className="inventory-container">
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>Master Inventory</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Manage supplies, parts, and stock levels across your organization.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ gap: '10px', padding: '14px 28px', borderRadius: '16px' }}>
            <Plus size={20} /> Add New Supply
          </button>
        </header>

        <div className="stats-grid" style={{ marginBottom: '40px' }}>
            <div className="stat-card-premium">
                <div className="icon-box" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                    <Package size={24} />
                </div>
                <span className="label">Total Items</span>
                <div className="value">{materials.length}</div>
                <div className="trend trend-up">SKUs Managed</div>
            </div>
            <div className="stat-card-premium">
                <div className="icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}>
                    <AlertCircle size={24} />
                </div>
                <span className="label">Low Stock</span>
                <div className="value" style={{ color: lowStockItems > 0 ? '#ef4444' : 'inherit' }}>{lowStockItems}</div>
                <div className="trend">Requires Attention</div>
            </div>
            <div className="stat-card-premium">
                <div className="icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <IndianRupee size={24} />
                </div>
                <span className="label">Inventory Value</span>
                <div className="value">₹{totalValue.toLocaleString()}</div>
                <div className="trend">Total Asset Worth</div>
            </div>
        </div>

        <div className="premium-table-container">
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ maxWidth: '400px', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', marginLeft: '14px', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..." 
                        className="input-field" 
                        style={{ paddingLeft: '44px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-icon"><Filter size={20}/></button>
                    <button className="btn-icon"><BarChart2 size={20}/></button>
                </div>
            </div>
            <table className="premium-table">
                <thead>
                    <tr>
                        <th>Item Details</th>
                        <th>SKU / ID</th>
                        <th>Stock Level</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} /></td></tr>
                    ) : filteredMaterials.map(m => (
                        <tr key={m.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="cat-icon-thumb" style={{ width: '40px', height: '40px' }}><Package size={20}/></div>
                                    <span style={{ fontWeight: '750', fontSize: '15px' }}>{m.name}</span>
                                </div>
                            </td>
                            <td><span className="id-tag">{m.sku}</span></td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '800', color: m.quantity < 10 ? '#ef4444' : 'var(--text-h)' }}>{m.quantity} {m.unit}</span>
                                    {m.quantity < 10 && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>CRITICAL LOW</span>}
                                </div>
                            </td>
                            <td><span style={{ fontWeight: '800' }}>₹{m.price.toFixed(2)}</span></td>
                            <td>
                                <span className={`badge ${m.quantity > 0 ? 'badge-success' : 'badge-secondary'}`}>
                                    {m.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleOpenModal(m)} className="btn-icon"><Edit3 size={18} /></button>
                                    <button onClick={() => handleDelete(m.id)} className="btn-icon text-error"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMaterial ? "Edit Inventory Item" : "Add New Supply Item"} width="900px">
        <form onSubmit={handleSubmit} className="premium-form-layout">
          <div className="form-grid-standard">
            <div className="form-group">
                <label className="form-label">Item Name</label>
                <div className="input-with-icon">
                    <Package size={18} className="input-icon" />
                    <input type="text" className="input-field pl-10" placeholder="e.g. Copper Pipe 1/2 inch" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">SKU / Part Number</label>
                <div className="input-with-icon">
                    <Tag size={18} className="input-icon" />
                    <input type="text" className="input-field pl-10" placeholder="e.g. CP-12-STD" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
                </div>
            </div>
          </div>

          <div className="form-grid-standard" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
                <label className="form-label">Initial Quantity</label>
                <input type="number" className="input-field" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} required />
            </div>
            <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <select className="input-field" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="MTRS">Meters (MTRS)</option>
                    <option value="KG">Kilograms (KG)</option>
                    <option value="PKT">Packets (PKT)</option>
                    <option value="LTR">Liters (LTR)</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Unit Price (₹)</label>
                <div className="input-with-icon">
                    <IndianRupee size={18} className="input-icon" />
                    <input type="number" step="0.01" className="input-field pl-10" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
            </div>
          </div>

          <div className="modal-footer-actions">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Discard</button>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '220px' }}>
                  {submitting ? <Loader2 className="animate-spin" /> : editingMaterial ? "Update Supply Info" : "Add to Master Stock"}
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
