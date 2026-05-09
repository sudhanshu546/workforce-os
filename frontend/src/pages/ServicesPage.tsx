import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Loader2, Tag, Layers, 
  Search, Edit3, Package, AlertCircle, Filter, 
  ArrowRight, Info, IndianRupee
} from 'lucide-react';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';

const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  // State for Edit/Create
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [newItem, setNewItem] = useState({ name: '', description: '', basePrice: 0, categoryId: '' });
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([
        api.get('/services/categories'),
        api.get(filterCategory === 'all' ? '/services/items' : `/services/items?categoryId=${filterCategory}`)
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: categoryName, description: categoryDescription || 'No description provided' };
      if (editingCategory) {
        await api.put(`/services/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/services/categories', payload);
      }
      resetCategoryForm();
      fetchData();
    } catch (err) {
      console.error('Error saving category', err);
    }
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? All services inside will also be deleted.')) {
        try {
            await api.delete(`/services/categories/${id}`);
            if (filterCategory === String(id)) setFilterCategory('all');
            fetchData();
        } catch (err) {
            console.error('Error deleting category', err);
        }
    }
  };

  const handleCreateOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/services/items/${editingItem.id}`, {
            name: newItem.name,
            description: newItem.description,
            basePrice: newItem.basePrice
        });
      } else {
        await api.post(`/services/items?categoryId=${newItem.categoryId}`, newItem);
      }
      resetItemForm();
      fetchData();
    } catch (err) {
      console.error('Error saving item', err);
    }
  };

  const resetItemForm = () => {
    setNewItem({ name: '', description: '', basePrice: 0, categoryId: '' });
    setEditingItem(null);
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
        try {
            await api.delete(`/services/items/${id}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting item', err);
        }
    }
  };

  const startEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description);
    setIsCategoryModalOpen(true);
  };

  const startEditItem = (item: any) => {
    setEditingItem(item);
    setNewItem({ 
        name: item.name, 
        description: item.description, 
        basePrice: item.basePrice,
        categoryId: item.category?.id || '' 
    });
    setIsItemModalOpen(true);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="services-container">
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)', marginBottom: '8px' }}>Service Management</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Configure your service catalog and organizational structure.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  if (activeTab === 'categories') setIsCategoryModalOpen(true);
                  else setIsItemModalOpen(true);
                }} 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> {activeTab === 'categories' ? 'New Category' : 'New Service'}
              </button>
            </div>
          </div>

          <div className="tab-navigation">
             <button 
                className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
             >
                <Package size={18} /> Service Catalog
             </button>
             <button 
                className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
             >
                <Layers size={18} /> Categories
             </button>
          </div>
        </header>

        {activeTab === 'services' && (
          <div className="tab-content animate-in">
            <div className="filter-bar card">
                <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div className="search-bar" style={{ flex: 1 }}>
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search services by name or description..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-select-wrapper">
                        <Filter size={18} className="filter-icon" />
                        <select 
                            className="input-field" 
                            style={{ paddingLeft: '40px', width: '220px' }}
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <Loader2 className="animate-spin empty-state-icon" size={48} />
                    <p>Updating catalog view...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="service-grid">
                  {filteredItems.map(item => (
                    <div key={item.id} className="card service-card">
                      <div>
                        <div className="service-header">
                          <div>
                            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{item.category?.name}</span>
                            <h4 className="service-title">{item.name}</h4>
                          </div>
                          <span className="service-price">₹{item.basePrice.toFixed(2)}</span>
                        </div>
                        <p className="service-desc">{item.description}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <Info size={14} /> Basic Rate
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="nav-icon-btn" onClick={() => startEditItem(item)}><Edit3 size={16} /></button>
                            <button className="nav-icon-btn text-error" onClick={() => handleDeleteItem(item.id)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <Package className="empty-state-icon" size={48} />
                    <h3>No services found</h3>
                    <p>Adjust your filters or add a new service to this category.</p>
                </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
           <div className="tab-content animate-in">
              <div className="card" style={{ overflow: 'hidden' }}>
                 <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="cat-icon-thumb">
                                            <Tag size={16} />
                                        </div>
                                        <span style={{ fontWeight: '600' }}>{cat.name}</span>
                                    </div>
                                </td>
                                <td><span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{cat.description}</span></td>
                                <td><span className="badge badge-success">Active</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button className="btn-icon" onClick={() => startEditCategory(cat)}><Edit3 size={16} /></button>
                                        <button className="btn-icon text-error" onClick={() => handleDeleteCategory(cat.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No categories defined yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={resetCategoryForm} title={editingCategory ? "Edit Category" : "Create New Category"} width="900px">
        <form onSubmit={handleCreateOrUpdateCategory} className="premium-form-layout">
          <div className="form-grid-2">
            <div className="form-group">
                <label className="form-label">Category Name</label>
                <div className="input-with-icon">
                    <Tag size={18} className="input-icon" />
                    <input 
                        type="text" 
                        className="input-field pl-10" 
                        placeholder="e.g., Plumbing, Electrical" 
                        value={categoryName} 
                        onChange={e => setCategoryName(e.target.value)} 
                        required 
                    />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Internal Identifier</label>
                <input type="text" className="input-field" disabled value={editingCategory ? `CAT-${editingCategory.id+100}` : 'Auto-generated'} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Professional Description</label>
            <textarea 
                className="input-field textarea-field" 
                placeholder="Briefly describe what this category covers..." 
                value={categoryDescription} 
                onChange={e => setCategoryDescription(e.target.value)}
                rows={4}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={resetCategoryForm} className="btn btn-secondary">Discard Changes</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }}>
                {editingCategory ? "Update Category Details" : "Create Master Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Service Modal */}
      <Modal isOpen={isItemModalOpen} onClose={resetItemForm} title={editingItem ? "Refine Service Details" : "Add Catalog Service"} width="900px">
        <form onSubmit={handleCreateOrUpdateItem} className="premium-form-layout">
          <div className="form-grid-2">
              {!editingItem && (
                <div className="form-group">
                    <label className="form-label">Target Category</label>
                    <div className="input-with-icon">
                        <Layers size={18} className="input-icon" />
                        <select 
                            className="input-field pl-10" 
                            value={newItem.categoryId} 
                            onChange={e => setNewItem({...newItem, categoryId: e.target.value})}
                            required
                        >
                            <option value="">Select a category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <div className="input-with-icon">
                    <Package size={18} className="input-icon" />
                    <input 
                        type="text" 
                        className="input-field pl-10" 
                        placeholder="e.g., Industrial Pipe Repair" 
                        value={newItem.name} 
                        onChange={e => setNewItem({...newItem, name: e.target.value})} 
                        required 
                    />
                </div>
              </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Scope & Description</label>
            <textarea 
                className="input-field textarea-field" 
                placeholder="Detail what is included in this service..." 
                value={newItem.description} 
                onChange={e => setNewItem({...newItem, description: e.target.value})} 
                required 
                rows={4}
            />
          </div>

          <div className="form-group" style={{ maxWidth: '300px' }}>
            <label className="form-label">Base Rate (₹)</label>
            <div className="input-with-icon">
                <IndianRupee size={18} className="input-icon" />
                <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="input-field pl-10" 
                    placeholder="0.00" 
                    value={newItem.basePrice} 
                    onChange={e => setNewItem({...newItem, basePrice: Math.max(0, Number(e.target.value))})} 
                    required 
                />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={resetItemForm} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }}>
                {editingItem ? "Save Modifications" : "Add to Catalog"}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .services-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-form-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 8px 4px;
        }

        .form-grid-2 {
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
            margin-top: 16px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }

        .service-card {
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border);
            background: white;
        }

        .service-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: var(--shadow-lg);
        }

        .service-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }

        .service-title {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-h);
            line-height: 1.2;
        }

        .service-price {
            font-size: 20px;
            font-weight: 900;
            color: var(--primary);
        }

        .service-desc {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.5;
            margin-bottom: 24px;
        }

        .tab-navigation {
            display: flex;
            gap: 4px;
            background: #f1f5f9;
            padding: 6px;
            border-radius: 14px;
            width: fit-content;
            margin-bottom: 32px;
        }

        .tab-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            color: #64748b;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s;
            background: transparent;
        }

        .tab-btn:hover {
            color: var(--text-h);
        }

        .tab-btn.active {
            background: white;
            color: var(--primary);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .admin-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .admin-table th {
            background: #f8fafc;
            padding: 16px 24px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--text-muted);
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
        }

        .admin-table td {
            padding: 20px 24px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
        }

        .cat-icon-thumb {
            width: 40px;
            height: 40px;
            background: #eef2ff;
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
        }

        .badge-success {
            background: #ecfdf5;
            color: #059669;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
        }

        .btn-icon {
            background: none;
            border: none;
            cursor: pointer;
            padding: 10px;
            color: #64748b;
            border-radius: 10px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-icon:hover {
            background: #f1f5f9;
            color: var(--text-h);
        }

        .btn-icon.text-error:hover {
            color: #ef4444;
            background: #fef2f2;
        }

        .animate-in {
            animation: fadeIn 0.3s ease-out;
        }

        @media (max-width: 768px) {
            .form-grid-2 {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </Layout>
  );
};

export default ServicesPage;
