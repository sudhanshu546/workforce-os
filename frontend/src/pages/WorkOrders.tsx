import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, Calendar, Clock, CheckCircle2, AlertCircle, Loader2,
  Filter, Search, UserPlus, MapPin, ChevronRight, MoreVertical,
  Activity, ArrowUpRight, ClipboardCheck, Trash2, Eye
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData(page);
  }, [page, statusFilter]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const [woRes, workersRes] = await Promise.all([
        api.get(`/work-orders?page=${page}&size=10`),
        api.get('/workers/all')
      ]);
      setWorkOrders(woRes.data.content || []);
      setTotalPages(woRes.data.totalPages || 0);
      setWorkers(Array.isArray(workersRes.data) ? workersRes.data : []);
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (workerId: number) => {
    setAssigning(true);
    try {
      await api.patch(`/work-orders/${selectedWO.id}/assign`, { workerId });
      setIsAssignModalOpen(false);
      fetchData(page);
    } catch (err) {
      console.error('Failed to assign worker:', err);
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-primary';
      case 'ASSIGNED': return 'badge-warning';
      case 'PENDING_ASSIGNMENT': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const filteredWOs = workOrders.filter(wo => {
      const matchesSearch = wo.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(wo.id).includes(searchQuery);
      const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="work-orders-container">
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)', marginBottom: '8px' }}>Fulfillment Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Monitor live work orders and manage field dispatch operations.</p>
          </div>
          <div className="stats-mini-row" style={{ display: 'flex', gap: '24px' }}>
             <div className="mini-stat">
                <span className="stat-label">Pending Dispatch</span>
                <span className="stat-value text-error">{workOrders.filter(w => w.status === 'PENDING_ASSIGNMENT').length}</span>
             </div>
             <div className="mini-stat">
                <span className="stat-label">In Progress</span>
                <span className="stat-value text-primary">{workOrders.filter(w => w.status === 'IN_PROGRESS').length}</span>
             </div>
          </div>
        </header>

        <div className="filter-bar card" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
                type="text" 
                placeholder="Search by Order ID or Customer name..." 
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
                <option value="ALL">All Orders</option>
                <option value="PENDING_ASSIGNMENT">Pending Assignment</option>
                <option value="ASSIGNED">Assigned / Ready</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Order Reference</th>
                <th>Customer</th>
                <th>Technician</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary)' }} /></td></tr>
              ) : filteredWOs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No work orders matching your criteria.</td></tr>
              ) : (
                filteredWOs.map((wo) => (
                  <tr key={wo.id}>
                    <td><span className="id-tag">#WO-{wo.id + 1000}</span></td>
                    <td>
                        <div className="text-main">{wo.customer?.name}</div>
                        <div className="text-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={10} /> {wo.customer?.address || 'Site address pending'}
                        </div>
                    </td>
                    <td>
                      {wo.assignedWorker ? (
                        <div className="avatar-cell">
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {wo.assignedWorker.user?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-main" style={{ fontSize: '13px' }}>{wo.assignedWorker.user?.name}</div>
                            <div className="text-sub" style={{ fontSize: '11px' }}>{wo.assignedWorker.designation}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontWeight: '700', fontSize: '12px' }}>
                            <Activity size={14} /> Unassigned
                        </div>
                      )}
                    </td>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} className="text-muted" />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{wo.scheduledDate}</span>
                        </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(wo.status)}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="actions-cell">
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            {wo.status === 'PENDING_ASSIGNMENT' && (
                                <button 
                                    onClick={() => { setSelectedWO(wo); setIsAssignModalOpen(true); }}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', gap: '6px' }}
                                >
                                    <UserPlus size={14} /> Assign
                                </button>
                            )}
                            <button className="nav-icon-btn" style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Assign Worker Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Select Technician for Dispatch">
        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>WORK ORDER</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-h)' }}>#WO-{selectedWO?.id + 1000}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CUSTOMER</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{selectedWO?.customer?.name}</div>
            </div>
        </div>

        <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
          {workers.map(worker => (
            <button 
              key={worker.id}
              onClick={() => handleAssign(worker.id)}
              disabled={assigning}
              className="worker-assign-card"
            >
              <div className="avatar-large">
                {worker.user?.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: 'var(--text-h)', fontSize: '15px' }}>{worker.user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{worker.designation}</span>
                    <span>•</span>
                    <span className="text-success">Available</span>
                </div>
              </div>
              <div className="assign-action">
                {assigning && selectedWO?.id === worker.id ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpRight size={20} />}
              </div>
            </button>
          ))}
          {workers.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No available workers found in your organization.
              </div>
          )}
        </div>
      </Modal>

      <style>{`
        .work-orders-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .mini-stat {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 900;
        }

        .worker-assign-card {
            display: flex; 
            align-items: center; 
            gap: 16px; 
            padding: 16px; 
            border: 1px solid var(--border); 
            border-radius: 12px; 
            background: white;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
            width: 100%;
        }

        .worker-assign-card:hover {
            border-color: var(--primary);
            background: #f8faff;
            transform: translateX(4px);
        }

        .avatar-large {
            width: 48px; 
            height: 48px; 
            border-radius: 12px; 
            background: #eef2ff; 
            color: var(--primary); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 800;
            font-size: 20px;
        }

        .assign-action {
            color: var(--border);
            transition: color 0.2s;
        }

        .worker-assign-card:hover .assign-action {
            color: var(--primary);
        }

        @media (max-width: 768px) {
            .stats-mini-row {
                width: 100%;
                justify-content: space-between;
            }
        }
      `}</style>
    </Layout>
  );
};

export default WorkOrders;
