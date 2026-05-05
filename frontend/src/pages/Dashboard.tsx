import React, { useState, useEffect } from 'react';
import { 
  Briefcase, TrendingUp, Clock, Users, Loader2, Search, MapPin, 
  Star, ChevronRight, ShieldCheck, Building2, Activity,
  ArrowUpRight, ArrowDownRight, Package, DollarSign,
  FileText, CheckCircle, Bell, Zap, Calendar, Play, X
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ leads: 0, workOrders: 0, workers: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const role = localStorage.getItem('role') || 'WORKER';
  const workerId = localStorage.getItem('worker_id');
  const customerId = localStorage.getItem('customerId');

  const [attendanceStatus, setAttendanceStatus] = useState<'CLOCKED_IN' | 'CLOCKED_OUT'>('CLOCKED_OUT');

  // Customer specific state
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerRequests, setCustomerRequests] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [orgServices, setOrgServices] = useState<any[]>([]);
  const [orgWorkers, setOrgWorkers] = useState<any[]>([]);
  const [preferredWorkerId, setPreferredWorkerId] = useState<number | null>(null);
  const [requirementNotes, setRequirementNotes] = useState('');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    if (role === 'WORKER') fetchAttendanceStatus();
    if (role === 'CUSTOMER') fetchCustomerDashboardData();
  }, [role, workerId, customerId]);

  const fetchDashboardData = async () => {
    try {
      if (role === 'OWNER') {
        const [leadsRes, woRes, workersRes, quotRes] = await Promise.all([
          api.get('/leads'),
          api.get('/work-orders'),
          api.get('/workers/all'),
          api.get('/quotations')
        ]);
        
        const totalRev = quotRes.data.content?.filter((q: any) => q.status === 'APPROVED')
                                       .reduce((sum: number, q: any) => sum + q.totalAmount, 0) || 0;

        setStats({
          leads: leadsRes.data.content?.length || 0,
          workOrders: woRes.data.content?.length || 0,
          workers: workersRes.data?.length || 0,
          revenue: totalRev
        });
        setRecentOrders(woRes.data.content?.slice(0, 5) || []);
        
        // Simulated activity feed from data
        const logs = [
            ...(woRes.data.content || []).map((w: any) => ({ title: `Order #WO-${w.id+1000} updated to ${w.status}`, time: 'Recent', icon: <Package size={14}/> })),
            ...(leadsRes.data.content || []).map((l: any) => ({ title: `New Opportunity: ${l.customer?.name}`, time: 'Today', icon: <Zap size={14}/> }))
        ].slice(0, 6);
        setActivities(logs);

      } else if (role === 'WORKER') {
        const tasksRes = await api.get(`/work-orders/worker/${workerId}?page=0&size=10`);
        setStats({
          leads: 0,
          workOrders: tasksRes.data.content.filter((t: any) => t.status !== 'COMPLETED').length,
          workers: 0,
          revenue: 0
        });
        setRecentOrders(tasksRes.data.content.slice(0, 5));
        setActivities([
            { title: 'Shift started', time: '8:30 AM', icon: <Play size={14}/> },
            { title: 'Job WO-1022 assigned', time: 'Yesterday', icon: <Briefcase size={14}/> }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      if (role !== 'CUSTOMER') setLoading(false);
    }
  };

  const fetchCustomerDashboardData = async () => {
    try {
      const [orgsRes, requestsRes] = await Promise.all([
        api.get('/public/organizations'),
        api.get(`/leads/customer/${customerId}`)
      ]);
      setOrganizations(orgsRes.data);
      setCustomerRequests(requestsRes.data);
    } catch (err) {
      console.error('Failed to fetch customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await api.get(`/attendance/status?workerId=${workerId}`);
      setAttendanceStatus(response.data ? 'CLOCKED_IN' : 'CLOCKED_OUT');
    } catch (err) {
      console.error('Failed to fetch attendance status');
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = async (org: any) => {
    setSelectedOrg(org);
    setIsOrgModalOpen(true);
    setPreferredWorkerId(null);
    setRequirementNotes('');
    try {
      const [servicesRes, workersRes] = await Promise.all([
        api.get(`/public/services/organization/${org.tenantId}`),
        api.get(`/public/workers/organization/${org.tenantId}`)
      ]);
      setOrgServices(servicesRes.data);
      setOrgWorkers(workersRes.data);
    } catch (err) {
      console.error('Failed to fetch org details');
    }
  };

  const handleRequestService = async (service: any) => {
    try {
      await api.post('/leads', {
        customerName: 'Customer', 
        customerPhone: '0000000000',
        organizationId: selectedOrg.id,
        serviceItemId: service.id,
        description: `${requirementNotes || 'Request for ' + service.name}. ${preferredWorkerId ? 'Preferred Worker ID: ' + preferredWorkerId : ''}`,
        priority: 'MEDIUM'
      });
      alert('Service request sent successfully!');
      setIsOrgModalOpen(false);
      fetchCustomerDashboardData();
    } catch (err) {
      alert('Failed to send request');
    }
  };

  const toggleAttendance = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        setLoading(true);
        if (attendanceStatus === 'CLOCKED_OUT') {
          await api.post('/attendance/clock-in', { 
            workerId: Number(workerId), 
            latitude, 
            longitude, 
            status: 'ON_FIELD' 
          });
          setAttendanceStatus('CLOCKED_IN');
        } else {
          await api.post('/attendance/clock-out', { 
            workerId: Number(workerId), 
            latitude, 
            longitude 
          });
          setAttendanceStatus('CLOCKED_OUT');
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to update attendance');
        fetchAttendanceStatus();
      } finally {
        setLoading(false);
      }
    }, (error) => {
      alert('Location access denied. Please enable location to clock in.');
    });
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin text-primary" size={48} /></div></Layout>;

  // --- CUSTOMER VIEW ---
  if (role === 'CUSTOMER') {
    return (
      <Layout>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)' }}>Marketplace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '4px' }}>Discover verified local service providers and book instantly.</p>
        </header>

        <div className="search-bar card" style={{ maxWidth: '800px', marginBottom: '48px', position: 'relative', padding: '8px' }}>
          <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search for AC repair, plumbing, home cleaning..." 
            style={{ width: '100%', padding: '16px 16px 16px 60px', borderRadius: '14px', border: 'none', background: '#f8fafc', fontSize: '16px', outline: 'none' }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={24} className="text-primary" /> {searchTerm ? 'Matching Providers' : 'Premium Partners'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filteredOrgs.map((org, idx) => (
              <div key={org.id} className="card" style={{ padding: '28px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative' }} 
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                   onClick={() => handleOrgClick(org)}>
                {idx === 0 && !searchTerm && (
                  <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}>
                    TOP RATED
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="cat-icon-thumb" style={{ width: '56px', height: '56px', borderRadius: '16px' }}>
                    <Building2 size={28} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '800', color: '#f59e0b', background: '#fffbeb', padding: '6px 10px', borderRadius: '10px' }}>
                    <Star size={16} fill="#f59e0b" /> 4.9
                  </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '20px', marginBottom: '6px', color: 'var(--text-h)' }}>{org.businessName}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '500' }}>{org.businessType}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--success)', fontWeight: '700', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <ShieldCheck size={18} /> Instant Booking Verified
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Active Service Requests</h2>
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Requested Service</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {customerRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                        <div className="text-main">{req.requestedService?.name || 'General Inquiry'}</div>
                        <div className="text-sub">Ref ID: #SR-{req.id+500}</div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>{req.organization?.businessName[0]}</div>
                            <span style={{ fontWeight: '600' }}>{req.organization?.businessName}</span>
                        </div>
                    </td>
                    <td>
                      <span className={`badge ${req.status === 'NEW' ? 'badge-primary' : req.status === 'QUOTED' ? 'badge-success' : 'badge-secondary'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td><span className="text-sub">{new Date(req.createdAt).toLocaleDateString()}</span></td>
                  </tr>
                ))}
                {customerRequests.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>You haven't made any requests yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Org Details Modal */}
        <Modal isOpen={isOrgModalOpen} onClose={() => setIsOrgModalOpen(false)} title={selectedOrg?.businessName}>
            {/* ... Modal content remains similar but styled with premium classes ... */}
            <div style={{ padding: '10px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'block' }}>1. Select Preferred Specialist (Optional)</label>
                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                        <div onClick={() => setPreferredWorkerId(null)} className={`worker-assign-card ${preferredWorkerId === null ? 'active' : ''}`} style={{ minWidth: '120px', padding: '16px', border: preferredWorkerId === null ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                            <div className="avatar-large" style={{ margin: '0 auto 12px' }}><Users size={20} /></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>Best Available</p>
                        </div>
                        {orgWorkers.map((worker) => (
                            <div key={worker.id} onClick={() => setPreferredWorkerId(worker.id)} className="worker-assign-card" style={{ minWidth: '120px', padding: '16px', border: preferredWorkerId === worker.id ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                                <div className="avatar-large" style={{ margin: '0 auto 12px' }}>{worker.user?.name?.[0]}</div>
                                <p style={{ fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>{worker.user?.name?.split(' ')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', display: 'block' }}>2. Service Requirements</label>
                    <textarea 
                        className="input-field textarea-field"
                        placeholder="Please describe the issue or specific job requirements..."
                        value={requirementNotes}
                        onChange={(e) => setRequirementNotes(e.target.value)}
                    />
                </div>

                <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'block' }}>3. Catalog Services</label>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {orgServices.map((service) => (
                        <div key={service.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid var(--border)' }}>
                            <div>
                                <h4 style={{ fontWeight: '800', color: 'var(--text-h)' }}>{service.name}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{service.description}</p>
                            </div>
                            <button 
                                onClick={() => handleRequestService(service)} 
                                className="btn btn-primary" 
                                style={{ width: 'auto', padding: '10px 20px', fontWeight: '800' }}
                                disabled={!requirementNotes.trim()}
                            >
                                Book
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
      </Layout>
    );
  }

  // --- OWNER & WORKER VIEW ---
  return (
    <Layout>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Operational intelligence for your {role === 'OWNER' ? 'organization' : 'assignments'}.</p>
        </div>
        {role === 'WORKER' && (
          <button onClick={toggleAttendance} className="btn" 
                  style={{ background: attendanceStatus === 'CLOCKED_OUT' ? 'var(--success)' : 'var(--error)', 
                          color: 'white', padding: '12px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: '800',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            {attendanceStatus === 'CLOCKED_OUT' ? <><Play size={18} fill="currentColor" style={{marginRight: '8px'}}/> Clock In</> : <><X size={18} style={{marginRight: '8px'}}/> Clock Out</>}
          </button>
        )}
      </header>

      <div className="stats-grid">
        <div className="stat-card-premium">
          <div className="icon-box" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <span className="label">{role === 'OWNER' ? 'Sales Pipeline' : 'Active Duty'}</span>
          <div className="value">{role === 'OWNER' ? stats.leads : stats.workOrders}</div>
          <div className="trend trend-up">
             <ArrowUpRight size={14} /> 12% Growth
          </div>
        </div>
        
        <div className="stat-card-premium">
          <div className="icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
          <span className="label">{role === 'OWNER' ? 'Fullfillment' : 'Jobs Finished'}</span>
          <div className="value">{role === 'OWNER' ? stats.workOrders : '0'}</div>
          <div className="trend trend-up">
             <ArrowUpRight size={14} /> 4.2h Avg Time
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}>
            <Users size={24} />
          </div>
          <span className="label">{role === 'OWNER' ? 'Workforce' : 'Team Rank'}</span>
          <div className="value">{role === 'OWNER' ? stats.workers : '#12'}</div>
          <div className="trend trend-up">
             <Star size={12} fill="var(--accent)"/> Top Tier
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="icon-box" style={{ backgroundColor: 'var(--text-h)', color: '#fff' }}>
            <DollarSign size={24} />
          </div>
          <span className="label">Total Volume</span>
          <div className="value">${stats.revenue.toLocaleString()}</div>
          <div className="trend" style={{color: 'rgba(0,0,0,0.4)'}}>
             Estimated Revenue
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Main Content: Recent Orders */}
        <div className="premium-table-container">
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Recent Operations</h2>
                <button onClick={() => navigate(role === 'OWNER' ? '/work-orders' : '/tasks')} className="btn-icon"><ChevronRight size={20}/></button>
            </div>
            <table className="premium-table">
            <thead>
                <tr>
                <th>Reference</th>
                <th>Client</th>
                {role === 'OWNER' && <th>Dispatcher</th>}
                <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {recentOrders.map((row, i) => (
                <tr key={i}>
                    <td><span className="id-tag">#WO-{row.id + 1000}</span></td>
                    <td>
                        <div className="text-main">{row.customer?.name}</div>
                        <div className="text-sub">{row.scheduledDate}</div>
                    </td>
                    {role === 'OWNER' && (
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{row.assignedWorker?.user?.name[0] || '?'}</div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{row.assignedWorker?.user?.name.split(' ')[0] || 'Pending'}</span>
                        </div>
                    </td>
                    )}
                    <td>
                    <span className={`badge ${row.status === 'COMPLETED' ? 'badge-success' : row.status === 'IN_PROGRESS' ? 'badge-primary' : 'badge-warning'}`}>
                        {row.status.replace('_', ' ')}
                    </span>
                    </td>
                </tr>
                ))}
                {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity to display.</td></tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Sidebar: Activity Feed & Insights */}
        <div style={{ display: 'grid', gap: '32px' }}>
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={18} className="text-primary"/> Live Activity
                </h3>
                <div className="activity-feed">
                    {activities.map((act, i) => (
                        <div key={i} className="activity-item">
                            <div className="activity-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                                {act.icon}
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">{act.title}</div>
                                <div className="activity-time">{act.time}</div>
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No live updates.</p>}
                </div>
            </div>

            <div className="card" style={{ padding: '24px', background: 'var(--primary)', color: '#fff' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>Productivity Insights</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>Your team is performing 15% better than last week.</p>
                <div className="chart-placeholder" style={{ background: 'rgba(0,0,0,0.1)', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '12px' }}>
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="chart-bar" style={{ height: `${h}%`, flex: 1, background: '#fff', opacity: 0.3 + (h/200) }}></div>
                    ))}
                </div>
                <button className="btn" style={{ width: '100%', marginTop: '20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '13px' }}>View Full Report</button>
            </div>
        </div>
      </div>

      <style>{`
        .mini-stat {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        
        .worker-assign-card.active {
            background: #eef2ff;
            border-color: var(--primary) !important;
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;
