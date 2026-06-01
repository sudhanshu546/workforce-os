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
import { useGetWorkerStatsQuery } from '../../redux/gamificationApi';
import { Trophy, Star, Target, ShieldCheck, Zap } from 'lucide-react';

import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';

const WorkerDashboard: React.FC = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { user, workerId } = useSelector((state: any) => state.auth);
  const { data: gamificationData } = useGetWorkerStatsQuery(Number(workerId), { skip: !workerId });
  const gameStats = gamificationData?.data || gamificationData;

  const getBadgeIcon = (key: string) => {
    switch (key) {
        case 'MILESTONE_10': return <Target size={20} className="text-primary" />;
        case 'FIVE_STAR_PRO': return <Star size={20} className="text-warning" />;
        case 'ELITE_WORKER': return <ShieldCheck size={20} className="text-success" />;
        default: return <Zap size={20} />;
    }
  };

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
          <div className="stat-icon-wrapper" style={{ background: '#fefce8', color: '#eab308' }}><Star size={24} fill="#eab308" /></div>
          <div className="stat-label-modern">Avg. Rating</div>
          <div className="stat-value-large">{gameStats?.averageRating?.toFixed(1) || '0.0'} / 5.0</div>
          <div style={{ fontSize: '12px', color: '#eab308', fontWeight: '700' }}>Based on client reviews</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Performance Badges</h2>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => navigate('/leaderboard')}>
              Leaderboard <Trophy size={14} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
             {gameStats?.badges?.length > 0 ? gameStats.badges.map((b: string) => (
                <div key={b} className="badge-showcase-item" style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    {getBadgeIcon(b)}
                </div>
             )) : (
                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '20px', background: 'white', borderRadius: '16px', opacity: 0.5 }}>
                    <p style={{ fontSize: '12px', fontWeight: '700' }}>Complete jobs to earn badges!</p>
                </div>
             )}
          </div>

          <div className="level-box" style={{ background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '20px', marginBottom: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px' }}>LEVEL {gameStats?.level || 1}</span>
                <span style={{ fontWeight: '800', fontSize: '13px' }}>{gameStats?.totalPoints || 0} PTS</span>
             </div>
             <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${((gameStats?.totalPoints || 0) % 500) / 5}%`, height: '100%', background: 'white' }} />
             </div>
          </div>

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
