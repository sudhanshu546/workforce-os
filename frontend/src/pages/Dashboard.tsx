import React, { useState, useEffect } from 'react';
import { 
  Briefcase, TrendingUp, Clock, Users, Loader2, Search, MapPin, 
  Star, ChevronRight, ShieldCheck, Building2, Activity,
  ArrowUpRight, ArrowDownRight, Package, IndianRupee,
  FileText, CheckCircle, Bell, Zap, Calendar, Play, X, Receipt, CheckCircle2,
  BarChart3, Wallet, ClipboardList, Timer, Navigation, Phone, Download, Printer, Send, Camera
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { requestNotificationPermission } from '../services/notifications';
import { STORAGE_KEYS, ROLES } from '../utils/constants';
import { ExpandableRowTable } from '../components/ExpandableRowTable';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  
  const role = localStorage.getItem(STORAGE_KEYS.ROLE) || ROLES.WORKER;
  const workerId = localStorage.getItem(STORAGE_KEYS.WORKER_ID);
  const customerId = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ID);

  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  // Modal States
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  // Selected Data States
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchDashboardData();
    if (role === ROLES.WORKER) fetchAttendanceStatus();
    
    if (role === ROLES.CUSTOMER) {
      fetchCustomerDashboardData();
      
      const socket = new SockJS(import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws-workforce');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/order/${customerId}`, () => {
          fetchCustomerDashboardData();
        });
      });

      return () => {
        if (stompClient.connected) {
          stompClient.disconnect(() => {});
        }
      };
    }
  }, [role, workerId, customerId]);

  const fetchDashboardData = async () => {
    try {
      if (role === ROLES.OWNER) {
        const [statsData, woData, lowStockData]: any = await Promise.all([
          api.get('/dashboard/owner'),
          api.get('/work-orders?page=0&size=5'),
          api.get('/inventory/materials/low-stock')
        ]);
        setStats(statsData);
        setRecentOrders(woData?.content || []);
        setActivities(statsData?.recentActivities || []);
        setLowStockMaterials(lowStockData || []);
      } else if (role === ROLES.WORKER) {
        const [statsData, tasksData]: any = await Promise.all([
          api.get(`/dashboard/worker?workerId=${workerId}`),
          api.get(`/work-orders/worker/${workerId}?page=0&size=5`)
        ]);
        setStats(statsData);
        setRecentOrders(tasksData?.content || []);
        setAttendanceStatus(statsData?.clockedIn ? 'CLOCKED_IN' : 'CLOCKED_OUT');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      if (role !== ROLES.CUSTOMER) setLoading(false);
    }
  };

  const fetchCustomerDashboardData = async () => {
    try {
      const [orgsData, requestsData, addrData]: any = await Promise.all([
        api.get('/public/organizations'),
        api.get(`/leads/customer/${customerId}`),
        api.get(`/customers/me/addresses`)
      ]);
      setOrganizations(orgsData || []);
      setCustomerRequests(requestsData || []);
      setAddresses(addrData || []);
      if (addrData && addrData.length > 0) setSelectedAddressId(addrData[0].id);
    } catch (err) {
      console.error('Failed to fetch customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const data: any = await api.get(`/attendance/status?workerId=${workerId}`);
      setAttendanceStatus(data ? 'CLOCKED_IN' : 'CLOCKED_OUT');
    } catch (err) {
      console.error('Failed to fetch attendance status');
    }
  };

  const handleViewQuote = async (leadId: number) => {
    try {
        const data: any = await api.get(`/quotations/lead/${leadId}`);
        setSelectedQuote(data);
        setIsQuoteModalOpen(true);
    } catch (err) {
        alert('Could not retrieve quotation details');
    }
  };

  const handleApproveQuote = async (quoteId: number) => {
    // Note: Replacing confirm with native logic for brevity, or we can use a custom modal
    if (!window.confirm('Do you want to approve this quotation and proceed with the service?')) return;
    try {
        await api.patch(`/quotations/${quoteId}/approve`);
        (window as any).showToast('Quotation approved! A work order has been generated.', 'success');
        setIsQuoteModalOpen(false);
        fetchCustomerDashboardData();
    } catch (err) {
        (window as any).showToast('Failed to approve quotation', 'error');
    }
  };

  const handleVerifyWork = async (workOrderId: number) => {
    try {
        const data: any = await api.get(`/work-orders/${workOrderId}`);
        setSelectedWorkOrder(data);
        setIsVerificationModalOpen(true);
    } catch (err) {
        (window as any).showToast('Could not retrieve work details for verification', 'error');
    }
  };

  const handleFinalVerify = async () => {
    try {
        await api.patch(`/work-orders/${selectedWorkOrder.id}/verify`);
        (window as any).showToast('Work verified successfully! Your invoice is now ready.', 'success');
        setIsVerificationModalOpen(false);
        fetchCustomerDashboardData();
    } catch (err) {
        (window as any).showToast('Verification failed. Please try again.', 'error');
    }
  };

  const handleViewInvoice = async (invoiceId: number) => {
    try {
        const data: any = await api.get(`/finance/invoices/${invoiceId}`);
        setSelectedInvoice(data);
        setIsInvoiceModalOpen(true);
    } catch (err) {
        (window as any).showToast('Could not retrieve invoice details', 'error');
    }
  };

  const handlePayInvoice = async (invoiceId: number, amount: number) => {
    try {
        const data: any = await api.post(`/finance/invoices/${invoiceId}/payment-order`);
        const { orderId } = data;

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: amount * 100,
            currency: 'INR',
            name: 'Workforce OS',
            description: `Payment for Invoice ${invoiceId}`,
            order_id: orderId,
            handler: async (response: any) => {
                try {
                    await api.post('/finance/payments/verify', {
                        invoiceId,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        paymentMethod: 'ONLINE'
                    });
                    (window as any).showToast('Payment successful!', 'success');
                    fetchCustomerDashboardData();
                } catch (err) {
                    (window as any).showToast('Payment verification failed', 'error');
                }
            },
            prefill: {
                name: user?.name,
                email: user?.email
            },
            theme: { color: '#4f46e5' }
        };

        const razor = new (window as any).Razorpay(options);
        razor.open();

    } catch (err) {
        (window as any).showToast('Could not initiate payment', 'error');
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/feedback', {
            workOrderId: selectedWorkOrder.id,
            customerId: customerId,
            rating,
            comments
        });
        (window as any).showToast('Thank you for your feedback!', 'success');
        setIsFeedbackModalOpen(false);
        fetchCustomerDashboardData();
    } catch(err) {
        (window as any).showToast('Failed to submit feedback', 'error');
    }
  };

  const handleOrgClick = async (org: any) => {
    setSelectedOrg(org);
    setIsOrgModalOpen(true);
    setPreferredWorkerId(null);
    setRequirementNotes('');
    try {
      const [servicesData, workersData]: any = await Promise.all([
        api.get(`/public/services/organization/${org.tenantId}`),
        api.get(`/public/workers/organization/${org.tenantId}`)
      ]);
      setOrgServices(servicesData || []);
      setOrgWorkers(workersData || []);
    } catch (err) {
      console.error('Failed to fetch org details');
    }
  };

  const handleRequestService = async (service: any) => {
    if (!selectedAddressId) { alert('Please select an address'); return; }
    try {
      await api.post('/leads', {
        customerName: user?.name || 'Customer', 
        customerPhone: user?.number || '0000000000',
        customerEmail: user?.email || '',
        organizationId: selectedOrg.id,
        serviceItemId: service.id,
        customerAddressId: selectedAddressId,
        description: `${requirementNotes || 'Request for ' + service.name}. ${preferredWorkerId ? 'Preferred Worker ID: ' + preferredWorkerId : ''}`,
        priority: 'MEDIUM'
      });
      alert('Service request sent successfully!');
      setIsOrgModalOpen(false);
      fetchCustomerDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const toggleAttendance = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        setLoading(true);
        if (attendanceStatus === 'CLOCKED_OUT') {
          await api.post('/attendance/clock-in', { workerId: Number(workerId), latitude, longitude, status: 'ON_FIELD' });
          setAttendanceStatus('CLOCKED_IN');
        } else {
          await api.post('/attendance/clock-out', { workerId: Number(workerId), latitude, longitude });
          setAttendanceStatus('CLOCKED_OUT');
        }
        fetchDashboardData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to update attendance');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      alert('Location access denied. Please enable location to clock in.');
    });
  };

  const filteredOrgs = Array.isArray(organizations) ? organizations.filter(org => 
    (org?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org?.businessType || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin text-primary" size={48} /></div></Layout>;

  const dashboardStyles = (
    <style>{`
        .dashboard-container { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .marketplace-header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 48px 32px; border-radius: 24px; color: white; margin-bottom: 40px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .org-card-premium {
            background: white; border: 1px solid var(--border); border-radius: 20px;
            padding: 24px; transition: all 0.3s ease; cursor: pointer; position: relative; overflow: hidden;
        }
        .org-card-premium:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }

        .premium-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }

        .stat-card-modern {
            background: white;
            padding: 24px;
            border-radius: 20px;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.3s ease;
        }

        .stat-card-modern:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            border-color: var(--primary);
        }

        .stat-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
        }

        .stat-value-large {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-h);
            letter-spacing: -0.02em;
        }

        .stat-label-modern {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .dashboard-main-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 32px;
        }

        @media (max-width: 1024px) {
            .dashboard-main-grid { grid-template-columns: 1fr; }
        }

        .content-card {
            background: white;
            border-radius: 24px;
            border: 1px solid var(--border);
            padding: 32px;
            height: 100%;
        }

        .card-header-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .activity-item {
            display: flex;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .activity-item:last-child { border-bottom: none; }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .btn-attendance {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            border-radius: 16px;
            font-weight: 800;
            font-size: 15px;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .btn-attendance.in { background: var(--error); color: white; }
        .btn-attendance.out { background: var(--success); color: white; }

        .worker-hero {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px;
            border-radius: 24px;
            color: white;
            margin-bottom: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .job-card-compact {
            padding: 20px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px solid var(--border);
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .job-card-compact:hover {
            border-color: var(--primary);
            background: white;
            transform: translateX(4px);
        }

        .premium-form-layout { display: flex; flex-direction: column; gap: 32px; padding: 8px 4px; }
        .job-overview-card-standard { padding: 24px; background: #f8fafc; border: 1px solid var(--border); border-radius: 16px; }
        .stat-label { font-size: 11px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .job-section-standard { margin-bottom: 24px; }
        .section-title-standard { font-size: 13px; font-weight: 900; color: var(--text-h); letter-spacing: 0.05em; text-transform: uppercase; }
        
        .booking-modal-content { display: flex; flex-direction: column; gap: 32px; padding: 8px 4px; }
        .booking-step-card { display: flex; gap: 24px; position: relative; }
        .step-badge { width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); z-index: 2; }
        .booking-step-card:not(:last-child)::after { content: ''; position: absolute; left: 18px; top: 48px; bottom: -24px; width: 2px; background: var(--border); z-index: 1; }
        
        .worker-selection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        .worker-item-card { padding: 16px; border: 1px solid var(--border); border-radius: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; position: relative; background: #fff; }
        .worker-item-card.selected { border-color: var(--primary); background: #eef2ff; }
        .worker-avatar-box { width: 44px; height: 44px; background: #e0e7ff; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
        
        .service-booking-list { display: grid; gap: 16px; }
        .service-row-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; border: 1px solid var(--border); border-radius: 16px; background: #fff; transition: all 0.2s; }
        .btn-book-now { display: flex; align-items: center; gap: 10px; padding: 12px 24px; background: var(--primary); color: white; border-radius: 12px; font-weight: 750; font-size: 14px; border: none; cursor: pointer; }
        
        .mini-stat { display: flex; flex-direction: column; align-items: flex-end; }
        .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--border); }
    `}</style>
  );

  if (role === ROLES.OWNER) {
    return (
      <Layout>
        {dashboardStyles}
        <div className="dashboard-container">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-h)' }}>Executive Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Real-time performance metrics for your organization.</p>
            </header>

            <div className="premium-stats-grid">
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#4f46e5' }}><TrendingUp size={24} /></div>
                    <div className="stat-label-modern">Total Pipeline</div>
                    <div className="stat-value-large">{stats?.totalLeads || 0} Leads</div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Briefcase size={24} /></div>
                    <div className="stat-label-modern">Active Operations</div>
                    <div className="stat-value-large">{stats?.activeWorkOrders || 0} Jobs</div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}><Users size={24} /></div>
                    <div className="stat-label-modern">Workforce Size</div>
                    <div className="stat-value-large">{stats?.totalWorkers || 0} Experts</div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}><IndianRupee size={24} /></div>
                    <div className="stat-label-modern">Net Revenue</div>
                    <div className="stat-value-large">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                
                <div className="content-card">
                    <div className="card-header-flex">
                        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Recent Dispatch Activities</h2>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => navigate('/work-orders')}>Full Control <ChevronRight size={14} /></button>
                    </div>
                    <ExpandableRowTable 
                        data={recentOrders} 
                        columns={[
                            { header: 'Order Ref', accessor: (order: any) => <span className="id-tag">#WO-{order.id+1000}</span> },
                            { header: 'Service Client', accessor: (order: any) => <div style={{ fontWeight: '700' }}>{order.customer?.name}</div> },
                            { header: 'Deployment', accessor: (order: any) => <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '10px' }}>{order.status}</span> },
                            { header: 'Scheduled', accessor: (order: any) => <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{order.scheduledDate}</span> }
                        ]}
                        renderExpanded={(order: any) => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="stat-label">Site Location</div>
                                    <div style={{ marginTop: '4px', fontWeight: '600' }}>{order.customer?.address || 'Site mapping pending'}</div>
                                </div>
                                <button onClick={() => navigate('/work-orders')} className="btn btn-primary"><Navigation size={16} /> Open in Fulfillment</button>
                            </div>
                        )}
                    />
                </div>
                <div className="content-card">
                    <div className="card-header-flex">
                        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Inventory Alerts</h2>
                        <Package size={20} className="text-error" />
                    </div>
                    {lowStockMaterials.length === 0 ? (
                        <div style={{ padding: '24px', color: 'var(--text-muted)' }}>All stock levels healthy.</div>
                    ) : (
                        lowStockMaterials.map(mat => (
                            <div key={mat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ fontWeight: '700' }}>{mat.name}</div>
                                <div style={{ color: 'var(--error)', fontWeight: '800' }}>{mat.quantity} {mat.unit} left</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </Layout>
    );
  }

  if (role === ROLES.WORKER) {
    return (
      <Layout>
        {dashboardStyles}
        <div className="dashboard-container">
            <div className="worker-hero">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Hello, {user?.name || 'Worker'}!</h1>
                    <p style={{ opacity: 0.9, fontSize: '16px' }}>Ready for your next mission? Stay safe and efficient today.</p>
                </div>
                <button 
                    onClick={toggleAttendance} 
                    className={`btn-attendance ${attendanceStatus === 'CLOCKED_IN' ? 'in' : 'out'}`}
                >
                    {attendanceStatus === 'CLOCKED_IN' ? <X size={20} /> : <Play size={20} />}
                    {attendanceStatus === 'CLOCKED_IN' ? 'Clock Out' : 'Start Shift'}
                </button>
            </div>

            <div className="premium-stats-grid">
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#4f46e5' }}><ClipboardList size={24} /></div>
                    <div className="stat-label-modern">Pending Jobs</div>
                    <div className="stat-value-large">{stats?.pendingTasks || 0} Assignments</div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle2 size={24} /></div>
                    <div className="stat-label-modern">Completed Today</div>
                    <div className="stat-value-large">{stats?.completedTasksToday || 0} Finished</div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}><Timer size={24} /></div>
                    <div className="stat-label-modern">Shift Timer</div>
                    <div className="stat-value-large">{attendanceStatus === 'CLOCKED_IN' ? 'Active' : 'Off-duty'}</div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Wallet size={24} /></div>
                    <div className="stat-label-modern">Monthly Earnings</div>
                    <div className="stat-value-large">₹{stats?.earningsThisMonth?.toLocaleString() || 0}</div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="content-card">
                    <div className="card-header-flex">
                        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Active Assignments</h2>
                        <button className="btn-text" onClick={() => navigate('/tasks')}>My Tasks <ChevronRight size={16} /></button>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Package size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No active jobs assigned to you yet.</p>
                        </div>
                    ) : (
                        recentOrders.map(order => (
                            <div key={order.id} className="job-card-compact" onClick={() => navigate('/tasks')}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div className="activity-icon"><Navigation size={20} className="text-primary" /></div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{order.customer?.name}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.customer?.address}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="badge badge-primary">{order.status}</span>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>#WO-{order.id+1000}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="content-card" style={{ background: '#f8fafc' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Quick Toolkit</h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <button onClick={() => navigate('/tasks')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', padding: '16px' }}>
                            <ClipboardList size={20} /> Field Checklist
                        </button>
                        <button onClick={() => navigate('/attendance')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', padding: '16px' }}>
                            <Clock size={20} /> History Log
                        </button>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', padding: '16px' }}>
                            <BarChart3 size={20} /> Earnings Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </Layout>
    );
  }

  if (role === ROLES.CUSTOMER) {
    return (
      <Layout>
        {dashboardStyles}
        <div className="dashboard-container">
            <header className="marketplace-header">
                <h1 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '12px' }}>Professional Network</h1>
                <p style={{ fontSize: '18px', opacity: 0.8, fontWeight: '500' }}>Access verified industrial and domestic service providers instantly.</p>
                <div className="search-bar" style={{ maxWidth: '700px', marginTop: '32px', position: 'relative' }}>
                    <Search size={24} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" placeholder="What service do you need today?" style={{ width: '100%', padding: '20px 24px 20px 64px', borderRadius: '18px', border: 'none', background: 'white', color: '#1e293b', fontSize: '17px', outline: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </header>

            <section style={{ marginBottom: '64px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}><Building2 size={28} className="text-primary" /> Verified Partners</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
                    {filteredOrgs.map((org) => (
                    <div key={org.id} className="org-card-premium" onClick={() => handleOrgClick(org)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className="cat-icon-thumb" style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={32} className="text-primary" /></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '800', color: '#f59e0b', background: '#fffbeb', padding: '8px 12px', borderRadius: '12px' }}><Star size={16} fill="#f59e0b" /> 4.9</div>
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '24px', marginBottom: '8px' }}>{org.businessName}</h3>
                        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>{org.businessType}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--success)', fontWeight: '700', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}><ShieldCheck size={20} /> Booking Guarantee Protected</div>
                    </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="card-header-flex" style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity size={28} className="text-primary" /> Service History
                    </h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/customer/orders')}>
                        View All Records <ChevronRight size={16} />
                    </button>
                </div>

                <ExpandableRowTable 
                    data={customerRequests}
                    columns={[
                        { 
                            header: 'Service Detail', 
                            accessor: (req: any) => (
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-h)' }}>{req.requestedService?.name || 'Service Inquiry'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Ref: SR-{req.id+500}</div>
                                </div>
                            ) 
                        },
                        { 
                            header: 'Provider', 
                            accessor: (req: any) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: '#e0e7ff', color: 'var(--primary)' }}>
                                        {req.organization?.businessName?.[0] || 'O'}
                                    </div>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{req.organization?.businessName || 'N/A'}</span>
                                </div>
                            ) 
                        },
                        { 
                            header: 'Status', 
                            accessor: (req: any) => (
                                <span className={`badge ${
                                    req.status === 'NEW' ? 'badge-primary' : 
                                    req.status === 'QUOTED' ? 'badge-warning' : 
                                    req.status === 'CONVERTED' ? 'badge-success' : 
                                    'badge-secondary'
                                }`} style={{ fontSize: '11px' }}>
                                    {req.status}
                                </span>
                            ) 
                        },
                        { 
                            header: 'Requested On', 
                            accessor: (req: any) => (
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                    {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            ) 
                        }
                    ]}
                    renderExpanded={(req: any) => (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                <div>
                                    <div className="stat-label">Description</div>
                                    <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px' }}>{req.description || 'No additional notes provided.'}</div>
                                </div>
                                {req.priority && (
                                    <div>
                                        <div className="stat-label">Priority</div>
                                        <div style={{ marginTop: '4px', fontWeight: '700' }} className={req.priority === 'HIGH' ? 'text-error' : 'text-primary'}>{req.priority}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {req.status === 'QUOTED' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleViewQuote(req.id); }} className="btn btn-primary">
                                        <FileText size={16} /> Review Quote
                                    </button>
                                )}
                                {req.workOrderStatus === 'AWAITING_VERIFICATION' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleVerifyWork(req.workOrderId); }} className="btn btn-success">
                                        <CheckCircle size={16} /> Verify Work
                                    </button>
                                )}
                                {req.status === 'CONVERTED' && req.invoiceId && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleViewInvoice(req.invoiceId); }} className="btn btn-secondary">
                                            <Receipt size={16} /> Invoice
                                        </button>
                                        {req.invoiceStatus === 'UNPAID' && (
                                            <button onClick={(e) => { e.stopPropagation(); handlePayInvoice(req.invoiceId, req.invoiceAmount); }} className="btn btn-primary">
                                                <IndianRupee size={16} /> Pay Now
                                            </button>
                                        )}
                                    </>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/customer/orders/${req.workOrderId || ''}`); }} className="btn btn-secondary">
                                    Full Details
                                </button>
                            </div>
                        </div>
                    )}
                />
            </section>
        </div>

        {/* Organization Detail Modal */}
        <Modal isOpen={isOrgModalOpen} onClose={() => setIsOrgModalOpen(false)} title="Organization Specification" width="900px">
            {selectedOrg && (
                <div className="booking-modal-content">
                    <div className="booking-step-card">
                        <div className="step-badge">1</div>
                        <div style={{ flex: 1 }}>
                            <h4 className="section-title-standard">Service Selection</h4>
                            <div className="service-booking-list" style={{ marginTop: '16px' }}>
                                {orgServices.map(service => (
                                    <div key={service.id} className="service-row-item">
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '16px' }}>{service.name}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{service.description}</div>
                                        </div>
                                        <button onClick={() => handleRequestService(service)} className="btn-book-now">
                                            Request Service <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="booking-step-card">
                        <div className="step-badge">2</div>
                        <div style={{ flex: 1 }}>
                            <h4 className="section-title-standard">Select Address</h4>
                            <div style={{ marginTop: '16px' }}>
                                {addresses.map(addr => (
                                    <div key={addr.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: selectedAddressId === addr.id ? '1px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px' }} onClick={() => setSelectedAddressId(addr.id)}>
                                        <input type="radio" checked={selectedAddressId === addr.id} readOnly />
                                        <span>{addr.street}, {addr.city}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="booking-step-card">
                        <div className="step-badge">3</div>
                        <div style={{ flex: 1 }}>
                            <h4 className="section-title-standard">Personalize Request (Optional)</h4>
                            <div style={{ marginTop: '16px' }}>
                                <label className="form-label">Preferred Technician</label>
                                <div className="worker-selection-grid">
                                    {orgWorkers.map(worker => (
                                        <div 
                                            key={worker.id} 
                                            className={`worker-item-card ${preferredWorkerId === worker.id ? 'selected' : ''}`}
                                            onClick={() => setPreferredWorkerId(worker.id)}
                                        >
                                            <div className="worker-avatar-box">{worker.user?.name?.[0] || 'W'}</div>
                                            <div style={{ fontWeight: '700', fontSize: '13px' }}>{worker.user?.name || 'Unknown Worker'}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '24px' }}>
                                    <label className="form-label">Requirement Details</label>
                                    <textarea 
                                        className="input-field" 
                                        rows={3} 
                                        placeholder="Add any specific instructions or requirements..."
                                        value={requirementNotes}
                                        onChange={e => setRequirementNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>

        {/* Verification Modal */}
        <Modal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} title="Job Completion Review" width="900px">
            {selectedWorkOrder && (
                <div className="premium-form-layout">
                    <div className="job-overview-card-standard">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div className="stat-label">TECHNICIAN</div>
                                <div style={{ fontSize: '18px', fontWeight: '800' }}>{selectedWorkOrder.assignedWorker?.user?.name}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="stat-label">REFERENCE</div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>#WO-{selectedWorkOrder.id + 1000}</div>
                            </div>
                        </div>
                    </div>
                    <div className="job-section-standard">
                        <h4 className="section-title-standard">FULFILLED CHECKLIST</h4>
                        {selectedWorkOrder.tasks?.map((t: any) => (
                            <div key={t.id} className="checklist-item-standard completed" style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle2 size={20} className="text-success" />
                                    <span>{t.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer-actions">
                        <button onClick={() => setIsVerificationModalOpen(false)} className="btn btn-secondary">Close</button>
                        <button onClick={handleFinalVerify} className="btn btn-primary" style={{ height: '54px', minWidth: '240px' }}>Confirm Work & Close Job</button>
                    </div>
                </div>
            )}
        </Modal>

        {/* Invoice Modal */}
        <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Final Service Invoice" width="900px">
            {selectedInvoice && (
                <div className="premium-form-layout">
                    <div className="invoice-detail-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div><div className="stat-label">INVOICE #</div><div style={{ fontSize: '20px', fontWeight: '900' }}>{selectedInvoice.invoiceNumber}</div></div>
                        <div style={{ textAlign: 'right' }}><div className="stat-label">STATUS</div><span className={`badge ${selectedInvoice.status === 'PAID' ? 'badge-success' : 'badge-primary'}`}>{selectedInvoice.status}</span></div>
                    </div>
                    <table className="premium-table">
                        <thead><tr><th>Item Description</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                        <tbody>
                            {selectedInvoice.workOrder?.quotation?.items?.map((item: any, idx: number) => (
                                <tr key={`q-${idx}`}><td><div style={{ fontWeight: '700' }}>{item.description}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Professional Service</div></td><td style={{ textAlign: 'center' }}>{item.quantity}</td><td style={{ textAlign: 'right' }}>₹{(item.quantity * item.unitPrice).toFixed(2)}</td></tr>
                            ))}
                            <tr style={{ borderTop: '2px solid var(--border)' }}><td colSpan={2} style={{ padding: '20px', fontWeight: '900', fontSize: '18px' }}>Total Amount</td><td style={{ textAlign: 'right', fontWeight: '900', fontSize: '22px', color: 'var(--primary)' }}>₹{selectedInvoice.total.toFixed(2)}</td></tr>
                        </tbody>
                    </table>
                    <div className="modal-footer-actions">
                        <button onClick={() => setIsInvoiceModalOpen(false)} className="btn btn-secondary">Close</button>
                        <a href={`${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}/finance/invoices/${selectedInvoice.id}/pdf`} className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Download PDF
                        </a>
                        {selectedInvoice.status !== 'PAID' && <button onClick={() => { setIsInvoiceModalOpen(false); handlePayInvoice(selectedInvoice.id, selectedInvoice.total); }} className="btn btn-primary" style={{ minWidth: '200px' }}>Pay Now</button>}
                    </div>
                </div>
            )}
        </Modal>

        {/* Quote View Modal */}
        <Modal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} title="Service Quotation" width="900px">
            {selectedQuote && (
                <div className="premium-form-layout">
                    <div className="job-overview-card-standard">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div className="stat-label">QUOTATION #</div>
                                <div style={{ fontSize: '20px', fontWeight: '900' }}>QT-{selectedQuote.id + 5000}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="stat-label">VALID UNTIL</div>
                                <div style={{ fontSize: '16px', fontWeight: '700' }}>{selectedQuote.expiryDate ? new Date(selectedQuote.expiryDate).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    <table className="premium-table">
                        <thead><tr><th>Item Description</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                        <tbody>
                            {selectedQuote.items?.map((item: any, idx: number) => (
                                <tr key={idx}><td>{item.description}</td><td style={{ textAlign: 'center' }}>{item.quantity}</td><td style={{ textAlign: 'right' }}>₹{(item.unitPrice || 0).toFixed(2)}</td><td style={{ textAlign: 'right' }}>₹{((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</td></tr>
                            ))}
                            <tr style={{ borderTop: '2px solid var(--border)' }}>
                                <td colSpan={3} style={{ textAlign: 'right', fontWeight: '800' }}>Grand Total</td>
                                <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '18px', color: 'var(--primary)' }}>₹{(selectedQuote.total || 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="modal-footer-actions">
                        <button onClick={() => setIsQuoteModalOpen(false)} className="btn btn-secondary">Close</button>
                        {['PENDING', 'DRAFT'].includes(selectedQuote.status?.toString().toUpperCase()) && (
                            <button onClick={() => handleApproveQuote(selectedQuote.id)} className="btn btn-primary" style={{ minWidth: '200px' }}>Approve & Start Work</button>
                        )}
                    </div>
                </div>
            )}
        </Modal>

        {/* Feedback Modal */}
        <Modal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} title="Rate Our Service" width="600px">
            <form onSubmit={submitFeedback} className="premium-form-layout">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>How was your experience with our technician?</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button 
                                key={star} 
                                type="button" 
                                onClick={() => setRating(star)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: rating >= star ? '#f59e0b' : '#e2e8f0' }}
                            >
                                <Star size={40} fill={rating >= star ? '#f59e0b' : 'none'} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Comments</label>
                    <textarea 
                        className="input-field" 
                        rows={4} 
                        placeholder="Tell us what you liked or what we can improve..."
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="modal-footer-actions">
                    <button type="button" onClick={() => setIsFeedbackModalOpen(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>Submit Feedback</button>
                </div>
            </form>
        </Modal>
      </Layout>
    );
  }

  return null;
};

export default Dashboard;
