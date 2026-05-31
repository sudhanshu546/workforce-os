import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Play, 
  Square, 
  Coffee, 
  CheckCircle2,
  Calendar,
  Navigation
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import { 
  useGetAttendanceQuery, 
  useGetWorkerAttendanceQuery, 
  useGetAttendanceStatusQuery, 
  useClockInMutation, 
  useClockOutMutation 
} from '../redux/attendanceApi';
import { useGetAllWorkersQuery } from '../redux/workforceApi';
import { Pagination } from '../components/Pagination';
import { ExpandableRowTable } from '../components/ExpandableRowTable';
import { useSelector } from 'react-redux';

const AttendanceTracker: React.FC = () => {
  const showToast = useToast();
  const { workerId, role } = useSelector((state: any) => state.auth);
  const [page, setPage] = useState(0);

  // Queries
  const { data: ownerAttData, isLoading: ownerLoading } = useGetAttendanceQuery({ page, size: 100 }, { skip: role !== 'OWNER' });
  const { data: workerAttData, isLoading: workerLoading } = useGetWorkerAttendanceQuery({ workerId: Number(workerId), page, size: 10 }, { skip: role !== 'WORKER' || !workerId });
  const { data: isClockedIn, isLoading: statusLoading } = useGetAttendanceStatusQuery(Number(workerId), { skip: !workerId });
  const { data: workers = [], isLoading: workersLoading } = useGetAllWorkersQuery(undefined, { skip: role !== 'OWNER' });

  // Mutations
  const [clockIn] = useClockInMutation();
  const [clockOut] = useClockOutMutation();

  const handleClockIn = async (id?: number) => {
    const targetId = id || Number(workerId);
    
    const proceedClockIn = async (lat = 0, lon = 0) => {
      try {
        await clockIn({ 
          workerId: targetId,
          status: 'ON_FIELD',
          latitude: lat,
          longitude: lon 
        }).unwrap();
        showToast('Clocked in successfully', 'success');
      } catch (err: any) {
        showToast(err.data?.message || 'Error clocking in', 'error');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => proceedClockIn(pos.coords.latitude, pos.coords.longitude),
        () => {
          showToast('Location access denied. Clocking in with default coordinates.', 'info');
          proceedClockIn();
        }
      );
    } else {
      proceedClockIn();
    }
  };

  const handleClockOut = async (id?: number) => {
    const targetId = id || Number(workerId);
    
    const proceedClockOut = async (lat = 0, lon = 0) => {
      try {
        await clockOut({ 
          workerId: targetId,
          latitude: lat,
          longitude: lon 
        }).unwrap();
        showToast('Clocked out successfully', 'success');
      } catch (err: any) {
        showToast(err.data?.message || 'Failed to clock out', 'error');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => proceedClockOut(pos.coords.latitude, pos.coords.longitude),
        () => proceedClockOut()
      );
    } else {
      proceedClockOut();
    }
  };

  const allAttendance = role === 'OWNER' ? (ownerAttData?.content || []) : (workerAttData?.content || []);
  const loading = role === 'OWNER' ? (ownerLoading || workersLoading) : (workerLoading || statusLoading);

  const columns = [
    { header: 'Technician', accessor: (log: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{log.workerName?.[0] || 'W'}</div>
            <span style={{ fontWeight: '600' }}>{log.workerName}</span>
        </div>
    )},
    { header: 'Shift Date', accessor: (log: any) => <span style={{ fontWeight: '600' }}>{new Date(log.clockIn).toLocaleDateString()}</span> },
    { header: 'Logged In', accessor: (log: any) => <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: '700' }}><Play size={14} /> {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div> },
    { header: 'Logged Out', accessor: (log: any) => log.clockOut ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: '700' }}><Square size={14} /> {new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div> : <span className="badge badge-primary">Active Session</span> },
    { header: 'Duration', accessor: (log: any) => <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{log.totalHours ? `${log.totalHours.toFixed(2)} hrs` : '--'}</span> }
  ];

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  if (role === 'OWNER') {
    return (
      <Layout>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Staff Presence Ledger</h1>
          <p className="text-muted">Real-time oversight of field workforce availability and shift compliance.</p>
        </header>

        <div style={{ display: 'grid', gap: '40px' }}>
          <section>
            <div className="stat-label" style={{ marginBottom: '16px' }}>Current Workforce Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {workers.map((worker: any) => {
                const activeSession = allAttendance.find((a: any) => a.workerId === worker.id && !a.clockOut);
                const workerIsClockedIn = !!activeSession;
                
                return (
                  <div key={worker.id} className="card" style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px',
                    borderLeft: workerIsClockedIn ? '4px solid var(--success)' : '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: workerIsClockedIn ? 'var(--success)' : 'var(--surface-muted)', color: workerIsClockedIn ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                        {worker.name?.charAt(0) || worker.user?.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-h)' }}>{worker.name || worker.user?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{worker.designation || 'Field Technician'}</div>
                      </div>
                      <span className={`badge ${workerIsClockedIn ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '10px' }}>
                        {workerIsClockedIn ? 'On Shift' : 'Off Duty'}
                      </span>
                    </div>

                    {workerIsClockedIn ? (
                        <div style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span className="text-muted">Clocked in at</span>
                            <span style={{ fontWeight: '800', color: 'var(--success)' }}>{new Date(activeSession.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ) : (
                        <div style={{ padding: '12px', background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: '10px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Awaiting deployment
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {workerIsClockedIn ? (
                        <button onClick={() => handleClockOut(worker.id)} className="btn btn-secondary text-error" style={{ flex: 1 }}><Square size={16} /> Force Clock Out</button>
                      ) : (
                        <button onClick={() => handleClockIn(worker.id)} className="btn btn-primary" style={{ flex: 1 }}><Play size={16} /> Manual Clock In</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="stat-label" style={{ marginBottom: '16px' }}>Verified Attendance Logs</div>
            <ExpandableRowTable 
                data={allAttendance} 
                columns={columns}
                renderExpanded={(log: any) => (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div>
                            <div className="stat-label">Deployment Metadata</div>
                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                    <Navigation size={16} className="text-primary" /> 
                                    <span style={{ fontWeight: '600' }}>
                                        Location: {log.latitude && log.longitude ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)} (GPS Verified)` : 'Manual Entry'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                    <Clock size={16} className="text-muted" /> <span style={{ fontWeight: '600' }}>Shift Type: {log.totalHours > 8 ? 'Overtime' : 'Standard'}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {log.latitude && log.longitude && (
                                <a 
                                    href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn btn-secondary"
                                >
                                    <MapPin size={18} /> View on Map
                                </a>
                            )}
                        </div>
                    </div>
                )}
            />
          </section>
        </div>
      </Layout>
    );
  }

  const status = isClockedIn ? 'CLOCKED_IN' : 'CLOCKED_OUT';

  return (
    <Layout>
      <div className="attendance-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Attendance Tracker</h1>
            <p className="text-muted">Log your daily work cycles and verify site presence.</p>
          </header>

          <div className="card-premium" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '30px', 
                backgroundColor: status === 'CLOCKED_IN' ? 'var(--primary-light)' : 'var(--surface-muted)',
                color: status === 'CLOCKED_IN' ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                boxShadow: status === 'CLOCKED_IN' ? '0 10px 25px -5px rgba(99, 102, 241, 0.2)' : 'none'
              }}>
                <Clock size={48} />
              </div>
              
              <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-h)' }}>
                {status === 'CLOCKED_IN' ? 'You are On-Duty' : 'Shift Not Started'}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}>
                <MapPin size={18} className="text-primary" /> GPS Location Detection Enabled
              </p>

              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                {status === 'CLOCKED_OUT' ? (
                  <button onClick={() => handleClockIn()} className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '16px' }}>
                    <Play size={22} /> Start My Shift
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => handleClockOut()} className="btn btn-secondary text-error" style={{ flex: 1, height: '56px', border: '1.5px solid var(--error)' }}>
                        <Square size={20} /> End Shift
                    </button>
                  </div>
                )}
              </div>
          </div>

          <div style={{ marginTop: '40px' }}>
              <div className="stat-label" style={{ marginBottom: '16px' }}>Recent Shift Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allAttendance.slice(0, 5).map((log: any, i: number) => (
                    <div key={i} className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                {log.clockOut ? <CheckCircle2 size={18} /> : <Play size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', color: 'var(--text-h)', fontSize: '15px' }}>{log.clockOut ? 'Completed Duty Cycle' : 'Active Duty Session'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(log.clockIn).toLocaleDateString()} • {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        {log.totalHours && <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>{log.totalHours.toFixed(2)} hrs</span>}
                    </div>
                ))}
                {allAttendance.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--surface-muted)', borderRadius: '16px', border: '1.5px dashed var(--border)' }}>No activity records found for this period.</div>}
              </div>
          </div>
      </div>
    </Layout>
  );
};

export default AttendanceTracker;
