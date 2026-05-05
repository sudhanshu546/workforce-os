import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Play, 
  Square, 
  Coffee, 
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { Pagination } from '../components/Pagination';

const AttendanceTracker: React.FC = () => {
  const [status, setStatus] = useState<'CLOCKED_OUT' | 'CLOCKED_IN' | 'ON_BREAK'>('CLOCKED_OUT');
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const workerId = localStorage.getItem('worker_id');
  const role = localStorage.getItem('role') || 'WORKER';

  useEffect(() => {
    if (role === 'OWNER') {
      fetchOwnerData();
    } else if (workerId) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [workerId, role]);

  const fetchOwnerData = async () => {
    try {
      const [attRes, workersRes] = await Promise.all([
        api.get('/attendance?size=100'), // Get enough recent logs
        api.get('/workers/all')
      ]);
      // Handle Spring Data Page object
      const attendanceData = attRes.data.content || (Array.isArray(attRes.data) ? attRes.data : []);
      setAllAttendance(attendanceData);
      setWorkers(Array.isArray(workersRes.data) ? workersRes.data : []);
    } catch (err) {
      console.error('Failed to fetch owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/attendance/status?workerId=${workerId}`);
      setStatus(response.data ? 'CLOCKED_IN' : 'CLOCKED_OUT');
    } catch (err) {
      console.error('Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (id?: string) => {
    const targetId = id || workerId;
    try {
      await api.post('/attendance/clock-in', { 
        workerId: targetId,
        status: 'ON_FIELD',
        latitude: 0,
        longitude: 0 
      });
      if (role === 'OWNER') fetchOwnerData();
      else setStatus('CLOCKED_IN');
    } catch (err) {
      alert('Failed to clock in');
    }
  };

  const handleClockOut = async (id?: string) => {
    const targetId = id || workerId;
    try {
      await api.post('/attendance/clock-out', { 
        workerId: targetId,
        latitude: 0,
        longitude: 0 
      });
      if (role === 'OWNER') fetchOwnerData();
      else setStatus('CLOCKED_OUT');
    } catch (err) {
      alert('Failed to clock out');
    }
  };

  const handleBreak = () => {
    setStatus(status === 'ON_BREAK' ? 'CLOCKED_IN' : 'ON_BREAK');
  };

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div></Layout>;

  if (role === 'OWNER') {
    return (
      <Layout>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Workforce Attendance</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and manage team presence</p>
        </header>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Active Workforce Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {workers.map(worker => {
                const activeSession = allAttendance.find(a => a.worker?.id === worker.id && !a.clockOut);
                const isClockedIn = !!activeSession;
                
                return (
                  <div key={worker.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px', 
                    padding: '20px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px',
                    backgroundColor: isClockedIn ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                    boxShadow: isClockedIn ? '0 4px 12px rgba(16, 185, 129, 0.08)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '12px', 
                        background: isClockedIn ? 'var(--success)' : '#f1f5f9', 
                        color: isClockedIn ? 'white' : 'var(--text-muted)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: '700',
                        fontSize: '18px'
                      }}>
                        {worker.user?.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{worker.user?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{worker.designation || 'Staff'}</div>
                      </div>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '10px', 
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        backgroundColor: isClockedIn ? '#dcfce7' : '#f1f5f9',
                        color: isClockedIn ? '#166534' : '#64748b'
                      }}>
                        {isClockedIn ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div style={{ 
                      padding: '12px', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}>
                      {isClockedIn ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Clocked in:</span>
                          <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                            {new Date(activeSession.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Currently not on shift
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isClockedIn ? (
                        <button 
                          onClick={() => handleClockOut(worker.id)} 
                          className="btn text-error"
                          style={{ flex: 1, padding: '8px', background: '#fee2e2', fontSize: '13px', fontWeight: '600', border: 'none' }}
                        >
                          Clock Out
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleClockIn(worker.id)} 
                          className="btn"
                          style={{ flex: 1, padding: '8px', background: '#dcfce7', color: '#166534', fontSize: '13px', fontWeight: '600', border: 'none' }}
                        >
                          Clock In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Recent Attendance Logs</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px' }}>WORKER</th>
                  <th style={{ padding: '12px' }}>DATE</th>
                  <th style={{ padding: '12px' }}>CLOCK IN</th>
                  <th style={{ padding: '12px' }}>CLOCK OUT</th>
                  <th style={{ padding: '12px' }}>HOURS</th>
                </tr>
              </thead>
              <tbody>
                {allAttendance.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{log.worker?.user?.name}</td>
                    <td style={{ padding: '12px' }}>{new Date(log.clockIn).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{new Date(log.clockIn).toLocaleTimeString()}</td>
                    <td style={{ padding: '12px' }}>{log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : '--'}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: 'var(--primary)' }}>{log.totalHours ? log.totalHours.toFixed(2) : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Attendance Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Log your daily work hours and breaks</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '32px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: status === 'CLOCKED_IN' ? 'rgba(16, 185, 129, 0.1)' : status === 'ON_BREAK' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            color: status === 'CLOCKED_IN' ? 'var(--success)' : status === 'ON_BREAK' ? 'var(--accent)' : 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Clock size={40} />
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            {status === 'CLOCKED_IN' ? 'You are Clocked In' : status === 'ON_BREAK' ? 'You are on Break' : 'You are Clocked Out'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <MapPin size={16} /> 123 Business Ave, New York, NY
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {status === 'CLOCKED_OUT' ? (
              <button onClick={() => handleClockIn()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Play size={20} /> Clock In Now
              </button>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleBreak} className="btn" style={{ flex: 1, backgroundColor: status === 'ON_BREAK' ? 'var(--primary)' : '#f1f5f9', color: status === 'ON_BREAK' ? 'white' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                    <Coffee size={20} /> {status === 'ON_BREAK' ? 'End Break' : 'Take Break'}
                  </button>
                  <button onClick={() => handleClockOut()} className="btn" style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                    <Square size={20} /> Clock Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '32px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" /> Recent Activity
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {allAttendance.slice(0, 3).map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  {activity.clockOut ? <CheckCircle2 size={18} /> : <Play size={18} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{activity.clockOut ? 'Completed Shift' : 'Started Shift'}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(activity.clockIn).toLocaleDateString()} • {new Date(activity.clockIn).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {allAttendance.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recent activity found.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceTracker;