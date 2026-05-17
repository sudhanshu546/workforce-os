import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, Calendar, Clock, CheckCircle2, AlertCircle, Loader2,
  Filter, Search, UserPlus, MapPin, ChevronRight, MoreVertical,
  Activity, ArrowUpRight, ClipboardCheck, Trash2, Eye,
  IndianRupee
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { ExpandableRowTable } from '../components/ExpandableRowTable';

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData(page);
  }, [page, statusFilter]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const [woData, workersData]: any = await Promise.all([
        api.get(`/work-orders?page=${page}&size=10`),
        api.get('/workers/all')
      ]);
      setWorkOrders(woData?.content || []);
      setTotalPages(woData?.totalPages || 0);
      setWorkers(Array.isArray(workersData) ? workersData : []);
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

  const statusMap: Record<string, { label: string, color: string }> = {
    'PENDING_ASSIGNMENT': { label: 'Dispatch Pending', color: 'var(--error)' },
    'ASSIGNED': { label: 'Assigned', color: 'var(--warning)' },
    'IN_PROGRESS': { label: 'In Progress', color: 'var(--primary)' },
    'COMPLETED': { label: 'Completed', color: 'var(--success)' },
    'CANCELLED': { label: 'Cancelled', color: 'var(--text-muted)' }
  };

  const filteredWOs = workOrders.filter(wo => {
      const matchesSearch = wo.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(wo.id).includes(searchQuery);
      const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Order ID', accessor: (wo: any) => <span className="id-tag">#WO-{wo.id + 1000}</span> },
    { header: 'Customer', accessor: (wo: any) => <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{wo.customer?.name}</div> },
    { header: 'Service Type', accessor: (wo: any) => <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{wo.serviceName || 'Standard Service'}</span> },
    { header: 'Amount', accessor: (wo: any) => <span style={{ fontWeight: '800', color: 'var(--text-h)' }}>₹{wo.totalAmount?.toLocaleString()}</span> },
    { header: 'Technician', accessor: (wo: any) => <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{wo.assignedWorkerName !== 'Unassigned' ? <><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>{wo.assignedWorkerName[0]}</div> <span style={{ fontWeight: '600' }}>{wo.assignedWorkerName}</span></> : <span className="text-muted">Waiting...</span>}</div> },
    { header: 'Current Status', accessor: (wo: any) => <span className={`badge ${getStatusBadge(wo.status)}`}>{statusMap[wo.status]?.label || wo.status}</span> }
  ];

  return (
    <Layout>
      <div className="work-orders-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Fulfillment Control</h1>
            <p className="text-muted">Manage real-time dispatch and field service operations.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
             <div className="mini-stat">
                <span className="stat-label">Pending</span>
                <span className="stat-value" style={{ color: 'var(--error)' }}>{workOrders.filter(w => w.status === 'PENDING_ASSIGNMENT').length}</span>
             </div>
             <div className="mini-stat">
                <span className="stat-label">Live</span>
                <span className="stat-value" style={{ color: 'var(--primary)' }}>{workOrders.filter(w => w.status === 'IN_PROGRESS').length}</span>
             </div>
          </div>
        </header>

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
                type="text" 
                placeholder="Search orders, customers..." 
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
                <option value="ALL">All Status</option>
                <option value="PENDING_ASSIGNMENT">Dispatch Pending</option>
                <option value="ASSIGNED">Technician Assigned</option>
                <option value="IN_PROGRESS">Live Operations</option>
                <option value="COMPLETED">Fulfilled</option>
            </select>
          </div>
        </div>
        
        <ExpandableRowTable 
            data={filteredWOs} 
            columns={columns}
            loading={loading}
            renderExpanded={(wo: any) => (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                    <div>
                        <div className="stat-label">Job Specification</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-h)', marginTop: '8px' }}>{wo.serviceName || 'Standard Service Item'}</div>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <MapPin size={16} className="text-muted" /> <span style={{ fontWeight: '600' }}>{wo.customerAddress}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <Calendar size={16} className="text-muted" /> <span style={{ fontWeight: '600' }}>{wo.scheduledDate}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="stat-label">Financial Overview</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '8px' }}>₹{wo.totalAmount?.toLocaleString()}</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Includes materials and service labor</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        {wo.status === 'PENDING_ASSIGNMENT' && (
                            <button onClick={() => { setSelectedWO(wo); setIsAssignModalOpen(true); }} className="btn btn-primary" style={{ width: '100%' }}><UserPlus size={18} /> Assign Dispatch</button>
                        )}
                        <button className="btn btn-secondary" style={{ width: '100%' }}><Eye size={18} /> Full Work Audit</button>
                    </div>
                </div>
            )}
        />
        <div style={{ marginTop: '24px' }}>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Select Technician for Dispatch" width="900px">
        <div className="premium-form-layout">
            <div style={{ marginBottom: '8px', padding: '20px', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                <div>
                    <div className="stat-label" style={{ marginBottom: '4px' }}>WORK ORDER</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-h)' }}>#WO-{selectedWO?.id + 1000}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="stat-label" style={{ marginBottom: '4px' }}>CUSTOMER</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>{selectedWO?.customer?.name}</div>
                </div>
            </div>

            <div className="worker-selection-grid-standard">
            {workers.map(worker => (
                <button 
                key={worker.id}
                onClick={() => handleAssign(worker.id)}
                disabled={assigning}
                className="worker-assign-card-standard"
                >
                <div className="avatar-box-standard">
                    {worker.user?.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-h)', fontSize: '15px' }}>{worker.user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>{worker.designation}</span>
                        <span>•</span>
                        <span className="text-success">Ready for Dispatch</span>
                    </div>
                </div>
                <div className="assign-action-standard">
                    {assigning && selectedWO?.id === worker.id ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                </div>
                </button>
            ))}
            {workers.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                    <UserPlus size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No available workers found in your organization.</p>
                </div>
            )}
            </div>
        </div>
      </Modal>

      <style>{`
        .work-orders-container { max-width: 1400px; margin: 0 auto; }
        .premium-form-layout { display: flex; flex-direction: column; gap: 24px; padding: 8px 4px; }
        .worker-selection-grid-standard { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .worker-assign-card-standard { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px solid var(--border); border-radius: 16px; background: white; cursor: pointer; text-align: left; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; }
        .worker-assign-card-standard:hover:not(:disabled) { border-color: var(--primary); background: #f8faff; transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .avatar-box-standard { width: 52px; height: 52px; border-radius: 14px; background: #eef2ff; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; }
        .assign-action-standard { color: var(--border); transition: all 0.2s; }
        .worker-assign-card-standard:hover .assign-action-standard { color: var(--primary); transform: translateX(4px); }
        @media (max-width: 768px) { .stats-mini-row { width: 100%; justify-content: space-between; } }
      `}</style>
    </Layout>
  );
};

export default WorkOrders;
