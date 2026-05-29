import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { Pagination } from '../components/Pagination';
import { 
  Plus, Trash2, Loader2, Tag, Layers, 
  Search, Edit3, Package, AlertCircle, Filter, 
  ArrowRight, Info, IndianRupee
} from 'lucide-react';

const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  
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
    fetchData(page);
  }, [filterCategory, page]);

  const fetchData = async (pageNumber: number) => {
    try {
      setLoading(true);
      const categories: any = await api.get('/services/categories');
      setCategories(categories || []);

      const itemUrl = filterCategory === 'all' 
        ? `/services/items?page=${pageNumber}&size=${pageSize}` 
        : `/services/items?categoryId=${filterCategory}&page=${pageNumber}&size=${pageSize}`;
      
      const pageData: any = await api.get(itemUrl);
      setItems(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch services', err);
      setCategories([]);
      setItems([]);
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
      fetchData(page);
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
            fetchData(page);
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
      fetchData(page);
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
            fetchData(page);
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

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter(item => 
    (item?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item?.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColumns = [
    { header: 'Domain Name', accessor: (cat: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={18} />
            </div>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{cat.name}</span>
        </div>
    )},
    { header: 'Issuance Tag', accessor: (cat: any) => <span className="id-tag">CAT-{cat.id + 100}</span> },
    { header: 'Operational Status', accessor: () => <span className="badge badge-success">ACTIVE</span> }
  ];

  return (
    <Layout>
      <div className="services-container">
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Service Catalog</h1>
              <p className="text-muted">Maintain your master list of service offerings and department categories.</p>
            </div>
            <button 
                onClick={() => {
                  if (activeTab === 'categories') setIsCategoryModalOpen(true);
                  else setIsItemModalOpen(true);
                }} 
                className="btn btn-primary" 
            >
                <Plus size={20} /> {activeTab === 'categories' ? 'Establish Category' : 'Publish Service'}
            </button>
        </header>

        <div className="tab-navigation" style={{ marginBottom: '32px' }}>
             <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                <Package size={18} /> Catalog Offerings
             </button>
             <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                <Layers size={18} /> Business Categories
             </button>
        </div>

        {activeTab === 'services' && (
          <div className="tab-content">
            <div className="filter-bar" style={{ marginBottom: '32px' }}>
                <div className="search-bar">
                    <Search size={18} className="text-muted" />
                    <input 
                        type="text" 
                        placeholder="Search services..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <Filter size={18} className="text-muted" />
                    <select 
                        style={{ border: 'none', background: 'transparent', height: '44px', fontWeight: '600', color: 'var(--text-h)', outline: 'none', minWidth: '180px' }}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">All Groups</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
            ) : filteredItems.length > 0 ? (
                <div className="service-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                  {filteredItems.map(item => (
                    <div key={item.id} className="card" style={{ padding: '24px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '24px', right: '24px', fontWeight: '900', fontSize: '20px', color: 'var(--primary)' }}>₹{item.basePrice.toFixed(2)}</div>
                        <span className="badge badge-primary" style={{ marginBottom: '12px', fontSize: '10px' }}>{item.category?.name}</span>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{item.name}</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '24px' }}>{item.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => startEditItem(item)}><Edit3 size={16} /> Edit</button>
                            <button className="btn btn-secondary text-error" style={{ padding: '8px 16px' }} onClick={() => handleDeleteItem(item.id)}><Trash2 size={16} /> Remove</button>
                        </div>
                    </div>
                  ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px', background: 'var(--surface-muted)', borderRadius: '20px', border: '1.5px dashed var(--border)' }}>
                    <Package size={48} className="text-muted" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontWeight: '800' }}>Catalog Empty</h3>
                    <p className="text-muted">No services found matching your criteria.</p>
                </div>
            )}
            
            <div style={{ marginTop: '32px' }}>
                <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
           <div className="tab-content">
              <div className="stable-table-container">
                <div className="table-content-area">
                  <ExpandableRowTable
                   data={categories}
                   columns={categoryColumns}
                   loading={loading}
                   renderExpanded={(cat: any) => (
                       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                           <div>
                               <div className="stat-label">Category Scope</div>
                               <p style={{ marginTop: '12px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                   {cat.description}
                               </p>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                               <div className="stat-label">Management Actions</div>
                               <button onClick={(e) => { e.stopPropagation(); startEditCategory(cat); }} className="btn btn-primary" style={{ width: '100%' }}><Edit3 size={18} /> Modify Classification</button>
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="btn btn-secondary text-error" style={{ width: '100%' }}><Trash2 size={18} /> Purge Category</button>
                           </div>
                       </div>
                   )}
                 />
                </div>

                <div style={{ marginTop: '32px' }}>
                    <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />
                </div>
              </div>           </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={resetCategoryForm} title={editingCategory ? "Refine Business Category" : "Establish New Service Domain"} width="800px">
        <form onSubmit={handleCreateOrUpdateCategory} className="premium-form-layout">
          <div className="form-grid-2">
            <div className="form-group">
                <label className="form-label">Category Name</label>
                <div className="search-bar">
                    <Tag size={18} className="text-muted" />
                    <input 
                        type="text" 
                        placeholder="e.g. Mechanical, Electrical" 
                        value={categoryName} 
                        onChange={e => setCategoryName(e.target.value)} 
                        required 
                    />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Internal Classification</label>
                <div className="search-bar" style={{ background: 'var(--surface-muted)' }}>
                    <Info size={18} className="text-muted" />
                    <input type="text" disabled value={editingCategory ? `CAT-${editingCategory.id+100}` : 'To be generated'} />
                </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Domain Description</label>
            <textarea 
                style={{ width: '100%', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface-muted)', fontSize: '15px', fontWeight: '500', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-muted)'; }}
                placeholder="Detail the scope of services covered under this category..." 
                value={categoryDescription} 
                onChange={e => setCategoryDescription(e.target.value)}
                rows={4}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={resetCategoryForm} className="btn btn-secondary">Discard</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '220px' }}>
                {editingCategory ? "Update Classification" : "Confirm Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Service Modal */}
      <Modal isOpen={isItemModalOpen} onClose={resetItemForm} title={editingItem ? "Refine Service Specification" : "Publish New Catalog Offering"} width="900px">
        <form onSubmit={handleCreateOrUpdateItem} className="premium-form-layout">
          <div className="form-grid-2">
              {!editingItem && (
                <div className="form-group">
                    <label className="form-label">Master Classification</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                        <Layers size={18} className="text-muted" style={{ marginRight: '12px' }} />
                        <select 
                            style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '600', outline: 'none' }}
                            value={newItem.categoryId} 
                            onChange={e => setNewItem({...newItem, categoryId: e.target.value})}
                            required
                        >
                            <option value="">Choose service domain...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Service Title</label>
                <div className="search-bar">
                    <Package size={18} className="text-muted" />
                    <input 
                        type="text" 
                        placeholder="e.g. Standard Inspection, Premium Repair" 
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
                style={{ width: '100%', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface-muted)', fontSize: '15px', fontWeight: '500', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-muted)'; }}
                placeholder="Provide a detailed breakdown of what this service offering entails..." 
                value={newItem.description} 
                onChange={e => setNewItem({...newItem, description: e.target.value})} 
                required 
                rows={4}
            />
          </div>

          <div className="form-group" style={{ maxWidth: '320px' }}>
            <label className="form-label">Standard Base Rate (₹)</label>
            <div className="search-bar">
                <IndianRupee size={18} className="text-muted" />
                <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    value={newItem.basePrice} 
                    onChange={e => setNewItem({...newItem, basePrice: Math.max(0, Number(e.target.value))})} 
                    required 
                />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={resetItemForm} className="btn btn-secondary">Discard</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '220px' }}>
                {editingItem ? "Save Modifications" : "Publish to Catalog"}
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
