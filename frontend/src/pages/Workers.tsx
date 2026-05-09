import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, ShieldCheck, Mail, Phone, Briefcase, Plus, Star, X, 
  Loader2, Edit3, Trash2, Filter, CheckCircle, AlertCircle, Award,
  Calendar, IndianRupee, User
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
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
  const [newSkill, setNewSkill] = useState({ skillName: '', proficiencyLevel: 'INTERMEDIATE' });

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (role !== 'OWNER' && role !== 'MANAGER') {
      navigate('/dashboard');
      return;
    }
    fetchWorkers(currentPage);
    fetchServices();
  }, [role, navigate, currentPage, statusFilter]);

  const fetchServices = async () => {
    try {
        const response = await api.get('/services'); // Assumed endpoint
        setServices(response.data);
    } catch (err) {
        console.error('Error fetching services:', err);
    }
  };

  const handleToggleService = async (workerId: number, service: any) => {
    try {
        const isAssigned = selectedWorker.supportedServices.some((s: any) => s.id === service.id);
        if (isAssigned) {
            await api.delete(`/workers/${workerId}/services/${service.id}`);
        } else {
            await api.post(`/workers/${workerId}/services/${service.id}`);
        }
        fetchWorkers(currentPage);
    } catch (err) {
        console.error('Service assignment failed:', err);
    }
  };

  const fetchWorkers = async (page: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/workers?page=${page}&size=${pageSize}`);
      const { content, totalPages } = response.data;
      
      // Fetch skills for each worker
      const workersWithSkills = await Promise.all(content.map(async (worker: any) => {
        try {
            const skillsResponse = await api.get(`/workers/${worker.id}/skills`);
            return { ...worker, skills: skillsResponse.data };
        } catch (e) {
            return { ...worker, skills: [] };
        }
      }));
      setWorkers(workersWithSkills);
      setTotalPages(totalPages);
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/workers/onboard', onboardData);
      setIsOnboardModalOpen(false);
      setOnboardData({
        name: '', email: '', phone: '', password: '',
        designation: '', joiningDate: new Date().toISOString().split('T')[0],
        salaryType: 'MONTHLY', salaryAmount: 0
      });
      fetchWorkers(0);
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
        await api.put(`/workers/${selectedWorker.id}`, editData);
        setIsEditModalOpen(false);
        fetchWorkers(currentPage);
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        setSubmitting(false);
    }
  };

  const handleDeleteWorker = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this worker from the organization? This action cannot be undone.')) {
        try {
            await api.delete(`/workers/${id}`);
            fetchWorkers(currentPage);
        } catch (err) {
            console.error('Deletion failed:', err);
        }
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/workers/${selectedWorker.id}/skills`, newSkill);
      setNewSkill({ skillName: '', proficiencyLevel: 'INTERMEDIATE' });
      setIsSkillModalOpen(false);
      fetchWorkers(currentPage);
    } catch (err) {
      console.error('Adding skill failed:', err);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await api.delete(`/workers/skills/${skillId}`);
      fetchWorkers(currentPage);
    } catch (err) {
      console.error('Removing skill failed:', err);
    }
  };

  const openEditModal = (worker: any) => {
    setSelectedWorker(worker);
    setEditData({
        name: worker.user?.name,
        email: worker.user?.email,
        phone: worker.user?.phone,
        designation: worker.designation,
        salaryAmount: worker.salaryAmount,
        status: worker.status
    });
    setIsEditModalOpen(true);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
        worker.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || worker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="workforce-container">
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)', marginBottom: '8px' }}>Workforce Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage your team, skills, and assignments.</p>
          </div>
          <button 
            onClick={() => setIsOnboardModalOpen(true)}
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={18} /> Onboard Worker
          </button>
        </header>

        <div className="filter-bar card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
                type="text" 
                placeholder="Search workers by name or designation..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-select-wrapper">
            <Filter size={18} className="filter-icon" />
            <select 
                className="input-field" 
                style={{ paddingLeft: '40px', width: '200px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
            <div className="empty-state">
                <Loader2 className="animate-spin empty-state-icon" size={48} />
                <p>Loading your team...</p>
            </div>
        ) : filteredWorkers.length > 0 ? (
            <div className="worker-grid">
                {filteredWorkers.map((worker) => (
                    <div key={worker.id} className="card worker-card">
                        <div className="worker-card-header">
                            <div className="worker-avatar-large">
                                {worker.user?.name.charAt(0)}
                            </div>
                            <div className="worker-status-badge">
                                <span className={`badge ${worker.status === 'ACTIVE' ? 'badge-success' : 'badge-primary'}`}>
                                    {worker.status}
                                </span>
                            </div>
                        </div>

                        <div className="worker-details">
                            <h3 className="worker-name">{worker.user?.name}</h3>
                            <p className="worker-designation">{worker.designation}</p>
                            
                            <div className="worker-contact-info">
                                <div className="contact-item">
                                    <Mail size={14} /> <span>{worker.user?.email}</span>
                                </div>
                                <div className="contact-item">
                                    <Phone size={14} /> <span>{worker.user?.phone}</span>
                                </div>
                            </div>

                            <div className="worker-services-section">
                                <div className="section-header">
                                    <span>Supported Services</span>
                                </div>
                                <div className="services-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                                    {services.map(service => {
                                        const isChecked = worker.supportedServices?.some((s: any) => s.id === service.id);
                                        return (
                                            <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        setSelectedWorker(worker);
                                                        handleToggleService(worker.id, service);
                                                    }}
                                                />
                                                {service.name}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="worker-card-footer">
                            <div className="verification-status">
                                <ShieldCheck size={16} className="text-success" />
                                <span>Verified Team Member</span>
                            </div>
                            <div className="worker-actions">
                                <button className="nav-icon-btn" onClick={() => openEditModal(worker)}><Edit3 size={16} /></button>
                                <button className="nav-icon-btn text-error" onClick={() => handleDeleteWorker(worker.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="empty-state card">
                <UserPlus className="empty-state-icon" size={48} />
                <h3>No Workers Found</h3>
                <p>Start building your team by onboarding your first worker.</p>
                <button onClick={() => setIsOnboardModalOpen(true)} className="btn btn-primary" style={{ marginTop: '20px' }}>
                    <Plus size={18} /> Onboard Now
                </button>
            </div>
        )}

        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>

      {/* Onboarding Modal */}
      <Modal isOpen={isOnboardModalOpen} onClose={() => setIsOnboardModalOpen(false)} title="Onboard New Team Member" width="900px">
        <form onSubmit={handleOnboard} className="premium-form-layout">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" className="input-field pl-10" placeholder="John Doe" value={onboardData.name} onChange={e => setOnboardData({...onboardData, name: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input type="email" className="input-field pl-10" placeholder="john@example.com" value={onboardData.email} onChange={e => setOnboardData({...onboardData, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" className="input-field pl-10" placeholder="+91 00000 00000" value={onboardData.phone} onChange={e => setOnboardData({...onboardData, phone: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon" />
                  <input type="text" className="input-field pl-10" placeholder="AC Technician" value={onboardData.designation} onChange={e => setOnboardData({...onboardData, designation: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Access Password</label>
              <input type="password" className="input-field" placeholder="••••••••" value={onboardData.password} onChange={e => setOnboardData({...onboardData, password: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input type="date" className="input-field pl-10" value={onboardData.joiningDate} onChange={e => setOnboardData({...onboardData, joiningDate: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Salary Type</label>
              <select className="input-field" value={onboardData.salaryType} onChange={e => setOnboardData({...onboardData, salaryType: e.target.value})}>
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="HOURLY">Hourly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Salary Amount (₹)</label>
              <div className="input-with-icon">
                  <IndianRupee size={18} className="input-icon" />
                  <input type="number" className="input-field pl-10" placeholder="0.00" value={onboardData.salaryAmount} onChange={e => setOnboardData({...onboardData, salaryAmount: Number(e.target.value)})} required />
              </div>
            </div>
          </div>
          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '200px' }}>
                {submitting ? <Loader2 className="animate-spin" /> : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Team Member Info" width="900px">
          <form onSubmit={handleUpdateWorker} className="premium-form-layout">
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="input-field" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input type="text" className="input-field" value={editData.designation} onChange={e => setEditData({...editData, designation: e.target.value})} />
                </div>
                <div className="form-group">
                    <label className="form-label">Salary Amount (₹)</label>
                    <div className="input-with-icon">
                        <IndianRupee size={18} className="input-icon" />
                        <input type="number" className="input-field pl-10" value={editData.salaryAmount} onChange={e => setEditData({...editData, salaryAmount: Number(e.target.value)})} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="input-field" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="modal-footer-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '200px' }}>
                    {submitting ? <Loader2 className="animate-spin" /> : 'Update Member'}
                </button>
            </div>
          </form>
      </Modal>

      {/* Skill Modal */}
      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title={`Manage Skills for ${selectedWorker?.user?.name}`} width="900px">
        <form onSubmit={handleAddSkill} className="premium-form-layout">
          <div className="form-grid">
            <div className="form-group">
                <label className="form-label">Skill Name</label>
                <div className="input-with-icon">
                    <Award size={18} className="input-icon" />
                    <input type="text" className="input-field pl-10" placeholder="e.g. AC Repair, Plumbing" value={newSkill.skillName} onChange={e => setNewSkill({...newSkill, skillName: e.target.value})} required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Proficiency Level</label>
                <select className="input-field" value={newSkill.proficiencyLevel} onChange={e => setNewSkill({...newSkill, proficiencyLevel: e.target.value})}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
                </select>
            </div>
          </div>
          <div className="modal-footer-actions">
              <button type="button" onClick={() => setIsSkillModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }}>Add Skill & Endorse</button>
          </div>
        </form>
      </Modal>

      <style>{`
        .workforce-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .premium-form-layout {
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 8px 4px;
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

        .worker-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 24px;
        }

        .worker-card {
            padding: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .worker-card-header {
            background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
            height: 80px;
            position: relative;
            margin-bottom: 40px;
        }

        .worker-avatar-large {
            width: 72px;
            height: 72px;
            background: white;
            border: 4px solid white;
            border-radius: 16px;
            position: absolute;
            bottom: -36px;
            left: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
            color: var(--primary);
            box-shadow: var(--shadow);
        }

        .worker-status-badge {
            position: absolute;
            bottom: -20px;
            right: 24px;
        }

        .worker-details {
            padding: 0 24px 24px;
            flex: 1;
        }

        .worker-name {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-h);
            margin-bottom: 4px;
        }

        .worker-designation {
            color: var(--text-muted);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .worker-contact-info {
            display: grid;
            gap: 8px;
            margin-bottom: 24px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: var(--text-muted);
        }

        .worker-skills-section {
            margin-bottom: 8px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .add-skill-btn {
            background: none;
            border: none;
            color: var(--primary);
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
        }

        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .skill-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .remove-skill-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 2px;
            display: flex;
            margin-left: 4px;
        }

        .remove-skill-btn:hover {
            color: var(--error);
        }

        .no-skills {
            font-style: italic;
            color: var(--text-muted);
            font-size: 13px;
        }

        .worker-card-footer {
            padding: 16px 24px;
            background: #f8fafc;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .verification-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .worker-actions {
            display: flex;
            gap: 8px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .input-with-icon {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }

        .pl-10 {
            padding-left: 40px !important;
        }

        @media (max-width: 768px) {
            .worker-grid {
                grid-template-columns: 1fr;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </Layout>
  );
};

export default Workers;
