import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { Briefcase, User, Calendar as CalendarIcon, Clock, ChevronRight, Phone, MapPin } from 'lucide-react';
import { toastNotifier } from '../utils/toast-notifier';

const localizer = momentLocalizer(moment);

const SchedulingCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  
  // Controlled Calendar States using strings to avoid import issues
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<any>('month');

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const data: any = await api.get('/work-orders');
      const formattedEvents = (data?.content || data || []).map((wo: any) => ({
        id: wo.id,
        title: `${wo.customer?.name} - ${wo.status.replace('_', ' ')}`,
        start: new Date(wo.scheduledDate),
        end: new Date(wo.scheduledDate),
        allDay: true,
        status: wo.status,
        worker: wo.assignedWorkerName || 'Unassigned',
        customer: wo.customer?.name,
        phone: wo.customer?.phone,
        address: wo.customer?.address || 'On-Site'
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Failed to fetch calendar data', err);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#4f46e5'; // Default Primary
    if (event.status === 'COMPLETED') backgroundColor = '#10b981'; // Success Green
    if (event.status === 'IN_PROGRESS') backgroundColor = '#3b82f6'; // Info Blue
    if (event.status === 'AWAITING_VERIFICATION') backgroundColor = '#f59e0b'; // Warning Orange
    if (event.status === 'PENDING_ASSIGNMENT') backgroundColor = '#6b7280'; // Muted Gray

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        fontWeight: '600'
      }
    };
  };

  const onNavigate = (newDate: Date) => setDate(newDate);
  const onView = (newView: any) => setView(newView);

  const handleSelectEvent = async (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    
    // Fetch available workers
    try {
        const res: any = await api.get('/workers/available');
        setAvailableWorkers(res || []);
    } catch (e) {
        console.error('Failed to fetch available workers');
    }
  };

  const handleAssign = async (workerId: number) => {
      try {
          // Using the specific assignment endpoint from WorkOrderController: PATCH /api/v1/work-orders/{id}/assign
          await api.patch(`/work-orders/${selectedEvent.id}/assign`, { workerId });
          toastNotifier.show('Worker assigned successfully', 'success');
          setIsModalOpen(false);
          fetchWorkOrders();
      } catch (e) {
          toastNotifier.show('Failed to assign worker', 'error');
      }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-h)', marginBottom: '4px' }}>Operational Command Tower</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Real-time visualization of workforce assignments and capacity.</p>
            </div>
            <div className="calendar-legend">
                <span className="legend-item"><span className="dot" style={{ background: '#6b7280' }}></span> Pending</span>
                <span className="legend-item"><span className="dot" style={{ background: '#4f46e5' }}></span> Assigned</span>
                <span className="legend-item"><span className="dot" style={{ background: '#3b82f6' }}></span> Active</span>
                <span className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span> Done</span>
            </div>
        </header>
        
        {loading ? (
            <div className="loading-container"><LoadingSpinner /></div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                <div className="calendar-card card">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '75vh' }}
                        date={date}
                        onNavigate={onNavigate}
                        view={view}
                        onView={onView}
                        views={['month', 'week', 'day']}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                    />
                </div>
                
                <div className="card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Dispatch Panel</h2>
                    {selectedEvent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'var(--surface-muted)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Job</div>
                                <div style={{ fontWeight: '800', fontSize: '16px', marginTop: '4px' }}>{selectedEvent.customer}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedEvent.address}</div>
                            </div>
                            
                            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>Available Technicians</h3>
                            {availableWorkers.length > 0 ? (
                                availableWorkers.map(w => (
                                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{w.name[0]}</div>
                                            <div style={{ fontWeight: '700' }}>{w.name}</div>
                                        </div>
                                        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => handleAssign(w.id)}>Dispatch</button>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No technicians available at this time.</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', border: '2px dashed var(--border)', borderRadius: '16px' }}>
                            Select a job from the calendar to see dispatch suggestions.
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Order Details" width="500px">
        {selectedEvent && (
            <div className="event-detail-modal">
                <div className="order-header">
                    <span className="order-id">#WO-{selectedEvent.id + 1000}</span>
                    <span className={`status-pill ${selectedEvent.status.toLowerCase()}`}>
                        {selectedEvent.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="info-list">
                    <div className="info-item">
                        <User size={18} />
                        <div>
                            <label>Customer</label>
                            <p>{selectedEvent.customer}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <Phone size={18} />
                        <div>
                            <label>Phone</label>
                            <p>{selectedEvent.phone}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <MapPin size={18} />
                        <div>
                            <label>Job Location</label>
                            <p>{selectedEvent.address}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <Briefcase size={18} />
                        <div>
                            <label>Technician Assigned</label>
                            <p>{selectedEvent.worker}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <CalendarIcon size={18} />
                        <div>
                            <label>Scheduled Date</label>
                            <p>{moment(selectedEvent.start).format('MMMM Do YYYY')}</p>
                        </div>
                    </div>
                </div>

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => navigate('/work-orders')}
                >
                    Manage Work Order <ChevronRight size={18} />
                </button>
            </div>
        )}
      </Modal>

      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-toolbar button { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: white; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .rbc-toolbar button:hover { background: #f8fafc; color: var(--primary); border-color: var(--primary); }
        .rbc-toolbar button.rbc-active { background: var(--primary) !important; color: white !important; border-color: var(--primary) !important; box-shadow: var(--shadow-sm); }
        .rbc-month-view { border-radius: 16px; overflow: hidden; border: 1px solid var(--border); background: white; }
        
        .calendar-legend { display: flex; gap: 16px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--text-muted); }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        .event-detail-modal { padding: 4px; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .order-id { font-size: 20px; font-weight: 800; color: var(--primary); }
        
        .info-list { display: grid; gap: 20px; }
        .info-item { display: flex; gap: 16px; color: var(--text-muted); }
        .info-item label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 2px; }
        .info-item p { font-size: 15px; font-weight: 700; color: var(--text-h); }
        
        .status-pill { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .status-pill.completed { background: #dcfce7; color: #166534; }
        .status-pill.in_progress { background: #dbeafe; color: #1e40af; }
        .status-pill.awaiting_verification { background: #fef3c7; color: #92400e; }
        .status-pill.pending_assignment { background: #f3f4f6; color: #374151; }
        
        .calendar-card { padding: 0; border: none; box-shadow: var(--shadow); border-radius: 20px; overflow: hidden; }
        .loading-container { height: 70vh; display: flex; align-items: center; justify-content: center; }

        /* Fix for toolbar visibility and interaction */
        .rbc-toolbar { margin-bottom: 20px; padding: 0 4px; }
        .rbc-btn-group { display: flex; gap: 4px; }
      `}</style>
    </Layout>
  );
};

export default SchedulingCalendar;
