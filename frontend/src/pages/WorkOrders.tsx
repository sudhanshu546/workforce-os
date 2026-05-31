import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, Calendar, Clock, CheckCircle2, AlertCircle, Loader2,
  Filter, Search, UserPlus, MapPin, ChevronRight, MoreVertical,
  Activity, ArrowUpRight, ClipboardCheck, Trash2, Eye,
  IndianRupee, Zap, Navigation, Award, Users, ShieldCheck, Printer
} from 'lucide-react';
import api from '../services/api';
import { Layout } from '../components/Layout';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { useToast } from '../components/ToastProvider';
import DispatchModal from '../components/DispatchModal';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGetWorkOrdersQuery } from '../redux/ordersApi';
import { useGetAllWorkersQuery } from '../redux/workforceApi';
import { useLazyGetProofOfServicePdfQuery } from '../redux/financeApi';

import './WorkOrders.css';

const WorkOrders: React.FC = () => {
  const showToast = useToast();
  const [page, setPage] = useState(0);
  const pageSize = 10;
  
  // RTK Query Hooks
  const { 
    data: woData, 
    isLoading: loading, 
    error: woError,
    isError: isWoError,
    refetch 
  } = useGetWorkOrdersQuery({ page, size: pageSize });
  const { data: workersData = [] } = useGetAllWorkersQuery();
  const [triggerDownloadProof] = useLazyGetProofOfServicePdfQuery();

  const handleDownloadProof = async (woId: number) => {
    try {
        const { data } = await triggerDownloadProof(woId).unwrap() as any;
        if (data) {
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `proof-of-service-${woId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    } catch (err) {
        showToast('Failed to generate proof of service', 'error');
    }
  };

  // Real-time updates
  useWebSocket('/topic/orders', (msg) => {
    refetch();
    showToast(msg, 'info');
  });

  const workOrders = woData?.content || [];
  const totalPages = woData?.totalPages || 0;
  const totalElements = woData?.totalElements || 0;

  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const filteredWOs = workOrders.filter((wo: any) => {
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
    { header: 'Schedule', accessor: (wo: any) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--text-h)' }}>
              <Calendar size={14} className="text-muted" /> {wo.scheduledDate}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Clock size={12} /> {wo.scheduledTime || '09:00 AM'}
          </div>
      </div>
    )},
    { header: 'Technician', accessor: (wo: any) => <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{wo.assignedWorkerName !== 'Unassigned' ? <><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>{wo.assignedWorkerName[0]}</div> <span style={{ fontWeight: '600' }}>{wo.assignedWorkerName}</span></> : <span className="text-muted">Waiting...</span>}</div> },
    { header: 'Current Status', accessor: (wo: any) => <span className={`badge ${getStatusBadge(wo.status)}`}>{statusMap[wo.status]?.label || wo.status}</span> }
  ];

  return (
    <Layout>
      <div className="work-orders-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Fulfillment Control</h1>
            <p className="text-muted">Manage real-time dispatch and field service operations.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
             <div className="mini-stat">
                <span className="stat-label">Pending</span>
                <span className="stat-value" style={{ color: 'var(--error)' }}>{workOrders.filter((w: any) => w.status === 'PENDING_ASSIGNMENT').length}</span>
             </div>
             <div className="mini-stat">
                <span className="stat-label">Live</span>
                <span className="stat-value" style={{ color: 'var(--primary)' }}>{workOrders.filter((w: any) => w.status === 'IN_PROGRESS').length}</span>
             </div>
          </div>
        </header>

        {isWoError && (
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '20px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <AlertCircle color="#ef4444" />
             <div>
                <div style={{ fontWeight: '800', color: '#991b1b' }}>Operational data unavailable</div>
                <div style={{ fontSize: '14px', color: '#b91c1c' }}>{(woError as any)?.data?.message || 'Failed to connect to fulfillment services. Please check your network.'}</div>
             </div>
          </div>
        )}

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
                <div className="expanded-card-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                    <div className="expanded-section">
                        <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Job Specification</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-h)', marginTop: '12px' }}>{wo.serviceName || 'Standard Service Item'}</div>
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', background: 'var(--surface-muted)', padding: '12px', borderRadius: '10px' }}>
                                <MapPin size={18} className="text-primary" /> <span style={{ fontWeight: '600' }}>{wo.customerAddress || 'No address provided'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', background: 'var(--surface-muted)', padding: '12px', borderRadius: '10px' }}>
                                <Calendar size={18} className="text-primary" /> <span style={{ fontWeight: '600' }}>{wo.scheduledDate} at {wo.scheduledTime || '09:00 AM'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="expanded-section">
                        <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Technician Assignment</div>
                        <div style={{ marginTop: '12px' }}>
                            {wo.assignedWorkerName !== 'Unassigned' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--surface-muted)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>{wo.assignedWorkerName[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-h)' }}>{wo.assignedWorkerName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Lead Field Technician</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: '1.5px dashed var(--border)', color: 'var(--text-muted)' }}>
                                    <Users size={24} />
                                    <div style={{ fontWeight: '700' }}>Awaiting Dispatch Assignment</div>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>FINANCIAL SUMMARY</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>₹{wo.totalAmount?.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="expanded-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        {wo.status === 'PENDING_ASSIGNMENT' && (
                            <button onClick={() => { setSelectedWO(wo); setIsAssignModalOpen(true); }} className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px' }}><UserPlus size={18} /> Assign Dispatch</button>
                        )}
                        {wo.status === 'IN_PROGRESS' && (
                            <button 
                                onClick={() => {
                                    const trackingUrl = `${window.location.origin}/track/${wo.id}`;
                                    navigator.clipboard.writeText(trackingUrl);
                                    showToast('Tracking link copied to clipboard!', 'success');
                                }} 
                                className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px' }}>
                                <ArrowUpRight size={18} /> Share Tracking Link
                            </button>
                        )}
                        <button className="btn btn-secondary" style={{ width: '100%', height: '48px', fontSize: '15px' }} onClick={() => showToast('Full audit log is being generated...', 'info')}><Eye size={18} /> Full Work Audit</button>
                        {wo.status === 'COMPLETED' && (
                            <button 
                                onClick={() => handleDownloadProof(wo.id)} 
                                className="btn btn-secondary" style={{ width: '100%', height: '48px', fontSize: '15px' }}>
                                <Printer size={18} /> Proof of Service
                            </button>
                        )}
                    </div>
                </div>
            )}
        />
        <div style={{ marginTop: '24px' }}>
            <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />
        </div>
      </div>

      <DispatchModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        selectedWO={selectedWO} 
        workers={workersData} 
        onAssigned={() => refetch()} 
      />
    </Layout>
  );
};

export default WorkOrders;
