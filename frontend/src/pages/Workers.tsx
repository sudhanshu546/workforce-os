import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, ShieldCheck, Mail, Phone, Briefcase, Plus, Star, X, 
  Loader2, Edit3, Trash2, Filter, CheckCircle, AlertCircle, Award,
  Calendar, IndianRupee, User, MapPin
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { 
  useGetWorkersQuery, 
  useOnboardWorkerMutation, 
  useUpdateWorkerMutation, 
  useDeleteWorkerMutation,
  useAssignServiceToWorkerMutation,
  useRemoveServiceFromWorkerMutation
} from '../redux/workforceApi';
import { useGetServiceItemsQuery } from '../redux/servicesApi';

const Workers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  
  // RTK Query Hooks
  const { 
    data: workerData, 
    isLoading: loadingWorkers, 
    error: workerError,
    isError: isWorkerError 
  } = useGetWorkersQuery({ page: currentPage, size: pageSize });
  const { data: serviceData } = useGetServiceItemsQuery();
  
  const [onboardWorker] = useOnboardWorkerMutation();
  const [updateWorker] = useUpdateWorkerMutation();
  const [deleteWorker] = useDeleteWorkerMutation();
  const [assignService] = useAssignServiceToWorkerMutation();
  const [removeService] = useRemoveServiceFromWorkerMutation();

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form States
  const [onboardData, setOnboardData] = useState({
    name: '', email: '', phone: '', password: '',
    designation: '', joiningDate: new Date().toISOString().split('T')[0],
    salaryType: 'MONTHLY', salaryAmount: 0
  });

  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'OWNER' && role !== 'MANAGER') {
      navigate('/dashboard');
    }
  }, [role, navigate]);

  const handleToggleService = async (workerId: number, service: any, worker: any) => {
    try {
        const isAssigned = worker.supportedServices.some((s: any) => s.id === service.id);
        if (isAssigned) {
            await removeService({ workerId, serviceId: service.id }).unwrap();
        } else {
            await assignService({ workerId, serviceId: service.id }).unwrap();
        }
    } catch (err) {
        console.error('Service assignment failed:', err);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onboardWorker(onboardData).unwrap();
      setIsOnboardModalOpen(false);
      setOnboardData({
        name: '', email: '', phone: '', password: '',
        designation: '', joiningDate: new Date().toISOString().split('T')[0],
        salaryType: 'MONTHLY', salaryAmount: 0
      });
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        await updateWorker({ id: selectedWorker.id, body: editData }).unwrap();
        setIsEditModalOpen(false);
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        setSubmitting(false);
    }
  };

  const handleDeleteWorker = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this worker from the organization? This action cannot be undone.')) {
        try {
            await deleteWorker(id).unwrap();
        } catch (err) {
            console.error('Deletion failed:', err);
        }
    }
  };

  const openEditModal = (worker: any) => {
    setSelectedWorker(worker);
    setEditData({
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        designation: worker.designation,
        salaryAmount: worker.salaryAmount,
        status: worker.status
    });
    setIsEditModalOpen(true);
  };

  const workers = workerData?.content || [];
  const services = serviceData?.content || serviceData || [];

  const filteredWorkers = workers.filter((worker: any) => {
    const matchesSearch = 
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || worker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Expert Identity', accessor: (worker: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>{worker.name[0]}</div>
            <div>
                <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{worker.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{worker.designation}</div>
            </div>
        </div>
    )},
    { header: 'Direct Contact', accessor: (worker: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}><Phone size={14} className="text-muted" /> {worker.phone}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><Mail size={14} /> {worker.email}</div>
        </div>
    )},
    { header: 'Operational Status', accessor: (worker: any) => <span className={`badge ${worker.status === 'ACTIVE' ? 'badge-success' : 'badge-primary'}`}>{worker.status}</span> },
    { header: 'Staff Since', accessor: (worker: any) => <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{new Date(worker.joiningDate || Date.now()).toLocaleDateString()}</span> }
  ];

  return (
    <Layout>
      <div className="workforce-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Expert Workforce</h1>
            <p className="text-muted">Direct oversight of field technicians, skill matrices, and employment records.</p>
          </div>
          <button onClick={() => setIsOnboardModalOpen(true)} className="btn btn-primary">
            <UserPlus size={20} /> Onboard New Expert
          </button>
        </header>

        {isWorkerError && (
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '20px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <AlertCircle color="#ef4444" />
             <div>
                <div style={{ fontWeight: '800', color: '#991b1b' }}>Failed to load field staff</div>
                <div style={{ fontSize: '14px', color: '#b91c1c' }}>{(workerError as any)?.data?.message || 'The server returned an unexpected response. Please verify your connection.'}</div>
             </div>
          </div>
        )}

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
                type="text" 
                placeholder="Search by name, role or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Filter size={18} className="text-muted" />
            <select 
                style={{ border: 'none', background: 'transparent', height: '44px', fontWeight: '600', color: 'var(--text-h)', outline: 'none', minWidth: '160px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Staff</option>
                <option value="INACTIVE">Former Staff</option>
            </select>
          </div>
        </div>

        <div className="stable-table-container">
          <div className="table-content-area">
            <ExpandableRowTable 
                data={filteredWorkers}
                columns={columns}
                loading={loadingWorkers}
                renderExpanded={(worker: any) => (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                        <div>
                            <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Service Specialization</div>
                            <div className="services-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '16px' }}>
                                {services.map((service: any) => {
                                    const isChecked = worker.supportedServices?.some((s: any) => s.id === service.id);
                                    return (
                                        <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', background: isChecked ? 'var(--primary-light)' : 'white', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid', borderColor: isChecked ? 'var(--primary)' : 'var(--border)', transition: 'all 0.2s' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                style={{ width: '18px', height: '18px' }}
                                                onChange={() => handleToggleService(worker.id, service, worker)}
                                            />
                                            <span style={{ fontWeight: isChecked ? '800' : '500', color: isChecked ? 'var(--primary)' : 'var(--text-main)' }}>{service.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Payroll Information</div>
                            <div className="card" style={{ marginTop: '16px', padding: '24px', background: '#1e293b', color: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', fontWeight: '700' }}>CURRENT SALARY ({worker.salaryType})</div>
                                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>₹{worker.salaryAmount?.toLocaleString()}</div>
                                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                                    <ShieldCheck size={16} className="text-success" /> System Verified Profile
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                            <div className="stat-label-modern" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Actions</div>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(worker); }} className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
                                <Edit3 size={18} /> Modify Employment
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteWorker(worker.id); }} className="btn btn-secondary text-error" style={{ width: '100%', height: '48px' }}>
                                <Trash2 size={18} /> Terminate Contract
                            </button>
                        </div>
                    </div>
                )}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
              <Pagination currentPage={currentPage} totalPages={workerData?.totalPages || 0} pageSize={pageSize} totalElements={workerData?.totalElements || 0} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <Modal isOpen={isOnboardModalOpen} onClose={() => setIsOnboardModalOpen(false)} title="Onboard New Team Member" width="900px">
        <form onSubmit={handleOnboard} className="premium-form-layout">
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="search-bar">
                  <User size={18} className="text-muted" />
                  <input type="text" placeholder="John Doe" value={onboardData.name} onChange={e => setOnboardData({...onboardData, name: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="search-bar">
                  <Mail size={18} className="text-muted" />
                  <input type="email" placeholder="john@example.com" value={onboardData.email} onChange={e => setOnboardData({...onboardData, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="search-bar">
                  <Phone size={18} className="text-muted" />
                  <input type="tel" placeholder="+91 00000 00000" value={onboardData.phone} onChange={e => setOnboardData({...onboardData, phone: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <div className="search-bar">
                  <Briefcase size={18} className="text-muted" />
                  <input type="text" placeholder="AC Technician" value={onboardData.designation} onChange={e => setOnboardData({...onboardData, designation: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Access Password</label>
              <div className="search-bar">
                  <ShieldCheck size={18} className="text-muted" />
                  <input type="password" placeholder="••••••••" value={onboardData.password} onChange={e => setOnboardData({...onboardData, password: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <div className="search-bar">
                  <Calendar size={18} className="text-muted" />
                  <input type="date" value={onboardData.joiningDate} onChange={e => setOnboardData({...onboardData, joiningDate: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Salary Type</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                <select style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '600', outline: 'none' }} value={onboardData.salaryType} onChange={e => setOnboardData({...onboardData, salaryType: e.target.value})}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="HOURLY">Hourly</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Salary Amount (₹)</label>
              <div className="search-bar">
                  <IndianRupee size={18} className="text-muted" />
                  <input type="number" placeholder="0.00" value={onboardData.salaryAmount} onChange={e => setOnboardData({...onboardData, salaryAmount: Number(e.target.value)})} required />
              </div>
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="btn btn-secondary">Discard</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '220px' }}>
                {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Onboarding'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Team Member Info" width="900px">
          <form onSubmit={handleUpdateWorker} className="premium-form-layout">
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="search-bar"><input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></div>
                </div>
                <div className="form-group">
                    <label className="form-label">Designation</label>
                    <div className="search-bar"><input type="text" value={editData.designation} onChange={e => setEditData({...editData, designation: e.target.value})} /></div>
                </div>
                <div className="form-group">
                    <label className="form-label">Salary Amount (₹)</label>
                    <div className="search-bar">
                        <IndianRupee size={18} className="text-muted" />
                        <input type="number" value={editData.salaryAmount} onChange={e => setEditData({...editData, salaryAmount: Number(e.target.value)})} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Active Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', height: '48px' }}>
                        <select style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '600', outline: 'none' }} value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="modal-footer-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '200px' }}>
                    {submitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
            </div>
          </form>
      </Modal>

      <style>{`
        .workforce-container { max-width: 1400px; margin: 0 auto; }
        .premium-form-layout { display: flex; flex-direction: column; gap: 32px; padding: 8px 4px; }
        .form-label { display: block; font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px; padding-top: 24px; border-top: 1px solid var(--border); }
        .stat-label { font-size: 11px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>
    </Layout>
  );
};

export default Workers;
