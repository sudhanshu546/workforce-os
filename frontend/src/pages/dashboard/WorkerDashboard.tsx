import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle2, Timer, Wallet, 
  Play, X, Navigation, ChevronRight,
  Clock, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../components/ToastProvider';
import './Dashboard.css';

import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';

const WorkerDashboard: React.FC = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { user, workerId } = useSelector((state: any) => state.auth);

  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<'CLOCKED_IN' | 'CLOCKED_OUT'>('CLOCKED_OUT');

  useEffect(() => {
    fetchWorkerData();
  }, [workerId]);

  const fetchWorkerData = async () => {
    try {
      const [statsData, tasksData]: any = await Promise.all([
        api.get(`${API_ENDPOINTS.DASHBOARD.WORKER}?workerId=${workerId}`),
        api.get(`${API_ENDPOINTS.OPERATIONS.WORK_ORDERS}/worker/${workerId}?page=0&size=5`)
      ]);
      setStats(statsData);
      setRecentOrders(tasksData?.content || []);
      setAttendanceStatus(statsData?.clockedIn ? 'CLOCKED_IN' : 'CLOCKED_OUT');
    } catch (err) {
      console.error('Failed to fetch worker dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        setLoading(true);
        if (attendanceStatus === 'CLOCKED_OUT') {
          await api.post(API_ENDPOINTS.ATTENDANCE.CLOCK_IN, { workerId: Number(workerId), latitude, longitude, status: 'ON_FIELD' });
          setAttendanceStatus('CLOCKED_IN');
          showToast('Shift started successfully', 'success');
        } else {
          await api.post(API_ENDPOINTS.ATTENDANCE.CLOCK_OUT, { workerId: Number(workerId), latitude, longitude });
          setAttendanceStatus('CLOCKED_OUT');
          showToast('Shift ended successfully', 'success');
        }
        fetchWorkerData();
      } catch (err: any) {
        showToast(err.message || 'Failed to update attendance', 'error');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      showToast('Location access denied. Please enable location to clock in.', 'error');
    });
  };

  if (loading) return (
    <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-hero worker-hero">
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>Hello, {user?.name || 'Worker'}!</h1>
          <p style={{ opacity: 0.9, fontSize: '18px' }}>Ready for your next mission? Stay safe and efficient today.</p>
        </div>
        <button 
          onClick={toggleAttendance} 
          className={`btn-attendance ${attendanceStatus === 'CLOCKED_IN' ? 'in' : 'out'}`}
        >
          {attendanceStatus === 'CLOCKED_IN' ? <X size={24} /> : <Play size={24} />}
          {attendanceStatus === 'CLOCKED_IN' ? 'Clock Out' : 'Start Shift'}
        </button>
      </header>

      <div className="premium-stats-grid">
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#4f46e5' }}><ClipboardList size={24} /></div>
          <div className="stat-label-modern">Pending Jobs</div>
          <div className="stat-value-large">{stats?.pendingTasks || 0} Assignments</div>
          <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Tasks to be completed</div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle2 size={24} /></div>
          <div className="stat-label-modern">Completed Today</div>
          <div className="stat-value-large">{stats?.completedTasksToday || 0} Finished</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700' }}>Great job on today's goals!</div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}><Timer size={24} /></div>
          <div className="stat-label-modern">Shift Status</div>
          <div className="stat-value-large">{attendanceStatus === 'CLOCKED_IN' ? 'Active' : 'Off-duty'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Tracking started at {stats?.clockInTime || '--:--'}</div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Wallet size={24} /></div>
          <div className="stat-label-modern">Monthly Earnings</div>
          <div className="stat-value-large">₹{stats?.earningsThisMonth?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Based on verified work</div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="content-card">
          <div className="card-header-flex">
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Active Assignments</h2>
            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => navigate('/tasks')}>
              View All Tasks <ChevronRight size={16} />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <ClipboardList size={64} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No active jobs assigned to you yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentOrders.map(order => (
                <div key={order.id} className="job-card-compact" onClick={() => navigate('/tasks')}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div className="stat-icon-wrapper" style={{ background: 'white', border: '1px solid var(--border)', width: '48px', height: '48px' }}>
                      <Navigation size={22} className="text-primary" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '18px' }}>{order.customer?.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>{order.customer?.address}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-primary" style={{ padding: '6px 14px' }}>{order.status}</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '700' }}>#WO-{order.id+1000}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-card" style={{ background: '#f8fafc' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Quick Toolkit</h2>
          <div className="toolkit-grid">
            <button onClick={() => navigate('/tasks')} className="btn toolkit-btn">
              <ClipboardList size={22} /> 
              <div>
                <div style={{ fontWeight: '800' }}>Field Checklist</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Report task progress</div>
              </div>
            </button>
            <button onClick={() => navigate('/attendance')} className="btn toolkit-btn">
              <Clock size={22} /> 
              <div>
                <div style={{ fontWeight: '800' }}>Attendance Logs</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>View clock-in history</div>
              </div>
            </button>
            <button className="btn toolkit-btn">
              <BarChart3 size={22} /> 
              <div>
                <div style={{ fontWeight: '800' }}>Earnings Report</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Payout breakdowns</div>
              </div>
            </button>
            <button className="btn toolkit-btn" onClick={() => navigate('/settings')}>
              <X size={22} /> 
              <div>
                <div style={{ fontWeight: '800' }}>Profile & Security</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Manage account</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
