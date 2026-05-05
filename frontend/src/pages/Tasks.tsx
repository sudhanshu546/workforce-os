import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { 
  CheckCircle2, Circle, Clock, MapPin, Phone, Loader2, ChevronRight, 
  Camera, Save, X, AlertCircle, PlayCircle, ClipboardList, Image as ImageIcon,
  CheckSquare, ArrowLeft, Send
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState<boolean | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerId = localStorage.getItem('worker_id');

  useEffect(() => {
    if (workerId) {
      fetchTasks(page);
      fetchAttendanceStatus();
    } else {
      setLoading(false);
    }
  }, [workerId, page]);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await api.get(`/attendance/status?workerId=${workerId}`);
      setIsClockedIn(response.data);
    } catch (err) {
      console.error('Failed to fetch attendance status');
    }
  };

  const fetchTasks = async (page: number) => {
    try {
      const response = await api.get(`/work-orders/worker/${workerId}?page=${page}&size=10`);
      setTasks(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      if (selectedTask) {
        const updated = response.data.content.find((t: any) => t.id === selectedTask.id);
        setSelectedTask(updated);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId: number, action: 'start' | 'complete') => {
    setError(null);
    if (action === 'start' && !isClockedIn) {
      setError('Operational requirement: You must clock in for your shift before starting any job.');
      return;
    }

    try {
      await api.patch(`/work-orders/${taskId}/${action}`);
      fetchTasks(page);
    } catch (err: any) {
      setError(err.response?.data?.message || `Technical error: Failed to ${action} task. Please try again.`);
    }
  };

  const toggleSubTask = async (taskId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/work-orders/tasks/${taskId}`, { isCompleted: !currentStatus });
      fetchTasks(page);
    } catch (err) {
      console.error('Failed to update subtask:', err);
    }
  };

  const handleUploadEvidence = async () => {
    if (!evidenceNote.trim()) return;
    setUploading(true);
    try {
      await api.post(`/work-orders/${selectedTask.id}/evidence`, {
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400',
        notes: evidenceNote
      });
      setEvidenceNote('');
      fetchTasks(page);
    } catch (err) {
      console.error('Failed to upload evidence:', err);
    } finally {
      setUploading(false);
    }
  };

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'IN_PROGRESS': return { color: 'var(--primary)', bg: '#eef2ff', icon: <PlayCircle size={14} /> };
          case 'COMPLETED': return { color: 'var(--success)', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> };
          default: return { color: 'var(--text-muted)', bg: '#f1f5f9', icon: <Clock size={14} /> };
      }
  };

  return (
    <Layout>
      <div className="worker-tasks-container">
        <header style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-h)' }}>Job Assignments</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>Welcome back! You have {tasks.filter(t => t.status !== 'COMPLETED').length} active jobs today.</p>
        </header>

        {error && (
            <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="close-alert"><X size={16} /></button>
            </div>
        )}

        {loading ? (
            <div className="loading-center">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p>Syncing your schedule...</p>
            </div>
        ) : tasks.length === 0 ? (
            <div className="empty-state-card">
                <ClipboardList size={64} className="text-muted" strokeWidth={1} />
                <h3>No assigned jobs</h3>
                <p>Your schedule is currently clear. New assignments will appear here automatically.</p>
            </div>
        ) : (
            <div className="tasks-mobile-grid">
                {tasks.map(task => {
                    const style = getStatusStyle(task.status);
                    return (
                        <div key={task.id} className="task-card" onClick={() => { setSelectedTask(task); setIsDetailModalOpen(true); }}>
                            <div className="task-card-header">
                                <span className="task-id">#WO-{task.id + 1000}</span>
                                <div className="task-status-pill" style={{ color: style.color, background: style.bg }}>
                                    {style.icon}
                                    <span>{task.status.replace('_', ' ')}</span>
                                </div>
                            </div>
                            
                            <h3 className="customer-name">{task.customer?.name}</h3>
                            
                            <div className="task-info-chips">
                                <div className="info-chip">
                                    <Clock size={14} />
                                    <span>{task.scheduledDate}</span>
                                </div>
                                <div className="info-chip">
                                    <MapPin size={14} />
                                    <span className="truncate">{task.customer?.address || 'Site location pending'}</span>
                                </div>
                            </div>

                            <div className="task-card-footer">
                                <div className="checklist-preview">
                                    <CheckSquare size={14} className="text-muted" />
                                    <span>{task.tasks?.filter((t: any) => t.completed).length} / {task.tasks?.length} steps done</span>
                                </div>
                                <ChevronRight size={20} className="text-muted" />
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Full Screen Task Detail (Custom Modal Look) */}
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Job Execution Center">
            {selectedTask && (
                <div className="job-center">
                    <div className="job-overview card">
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="customer-avatar-large">
                                {selectedTask.customer?.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{selectedTask.customer?.name}</h2>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                    <a href={`tel:${selectedTask.customer?.phone}`} className="contact-link"><Phone size={14} /> Call Client</a>
                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedTask.customer?.address || '')}`} target="_blank" rel="noreferrer" className="contact-link"><MapPin size={14} /> Directions</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="job-section">
                        <h4 className="section-title">SERVICE CHECKLIST</h4>
                        <div className="checklist-group">
                            {selectedTask.tasks?.map((t: any) => (
                                <div key={t.id} className={`checklist-item ${t.completed ? 'completed' : ''}`}>
                                    <label className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            checked={t.completed} 
                                            onChange={() => toggleSubTask(t.id, t.completed)}
                                        />
                                        <span className="checkmark"></span>
                                        <span className="task-text">{t.description}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="job-section">
                        <h4 className="section-title">FIELD EVIDENCE & NOTES</h4>
                        <div className="evidence-gallery">
                            {selectedTask.evidence?.map((ev: any) => (
                                <div key={ev.id} className="evidence-thumb">
                                    <img src={ev.imageUrl} alt="Field site" />
                                    <div className="evidence-overlay">
                                        <span className="evidence-note">{ev.notes}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="upload-placeholder">
                                <Camera size={24} />
                                <span>Add Photo</span>
                            </div>
                        </div>
                        <div className="evidence-input-bar">
                            <input 
                                type="text" 
                                placeholder="Add a field note or observation..." 
                                value={evidenceNote} 
                                onChange={e => setEvidenceNote(e.target.value)}
                            />
                            <button onClick={handleUploadEvidence} disabled={uploading || !evidenceNote} className="btn-send">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="job-actions-sticky">
                        {selectedTask.status === 'ASSIGNED' && (
                            <button 
                                onClick={() => updateStatus(selectedTask.id, 'start')}
                                className="btn btn-primary btn-lg"
                            >
                                <PlayCircle size={24} /> Start Execution
                            </button>
                        )}
                        {selectedTask.status === 'IN_PROGRESS' && (
                            <button 
                                onClick={() => { updateStatus(selectedTask.id, 'complete'); setIsDetailModalOpen(false); }}
                                className="btn btn-success btn-lg"
                                disabled={selectedTask.tasks?.some((t: any) => !t.completed)}
                                style={{ opacity: selectedTask.tasks?.some((t: any) => !t.completed) ? 0.6 : 1 }}
                            >
                                <CheckCircle2 size={24} /> Finalize & Complete Job
                            </button>
                        )}
                        {selectedTask.status === 'COMPLETED' && (
                            <div className="completed-banner">
                                <CheckCircle2 size={20} /> Job Successfully Completed
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
      </div>

      <style>{`
        .worker-tasks-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .tasks-mobile-grid {
            display: grid;
            gap: 16px;
        }

        .task-card {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            cursor: pointer;
            transition: all 0.2s;
        }

        .task-card:active {
            transform: scale(0.98);
            background: #f8fafc;
        }

        .task-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .task-id {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            color: var(--primary);
            font-size: 13px;
        }

        .task-status-pill {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .customer-name {
            font-size: 22px;
            font-weight: 800;
            color: var(--text-h);
            margin-bottom: 12px;
        }

        .task-info-chips {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        }

        .info-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .task-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;
        }

        .checklist-preview {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .error-alert {
            background: #fef2f2;
            color: var(--error);
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            font-size: 14px;
            position: relative;
        }

        .close-alert {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: var(--error);
            cursor: pointer;
        }

        .job-center {
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .customer-avatar-large {
            width: 56px;
            height: 56px;
            background: var(--primary);
            color: #fff;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
        }

        .contact-link {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
            text-decoration: none;
            padding: 6px 12px;
            background: #f0f7ff;
            border-radius: 8px;
        }

        .section-title {
            font-size: 12px;
            font-weight: 900;
            color: var(--text-muted);
            letter-spacing: 0.1em;
            margin-bottom: 16px;
            text-transform: uppercase;
        }

        .checklist-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .checklist-item {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.2s;
        }

        .checklist-item.completed {
            background: #f8fafc;
            border-color: #dcfce7;
            opacity: 0.8;
        }

        .checkbox-container {
            display: flex;
            align-items: center;
            position: relative;
            padding-left: 35px;
            cursor: pointer;
            user-select: none;
            width: 100%;
        }

        .checkbox-container input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }

        .checkmark {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            height: 24px;
            width: 24px;
            background-color: #fff;
            border: 2px solid var(--border);
            border-radius: 6px;
        }

        .checkbox-container:hover input ~ .checkmark {
            border-color: var(--primary);
        }

        .checkbox-container input:checked ~ .checkmark {
            background-color: var(--success);
            border-color: var(--success);
        }

        .checkmark:after {
            content: "";
            position: absolute;
            display: none;
        }

        .checkbox-container input:checked ~ .checkmark:after {
            display: block;
        }

        .checkbox-container .checkmark:after {
            left: 8px;
            top: 4px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 3px 3px 0;
            transform: rotate(45deg);
        }

        .task-text {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-h);
        }

        .completed .task-text {
            text-decoration: line-through;
            color: var(--text-muted);
        }

        .evidence-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }

        .evidence-thumb {
            aspect-ratio: 1;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            border: 1px solid var(--border);
        }

        .evidence-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .upload-placeholder {
            aspect-ratio: 1;
            border: 2px dashed var(--border);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .evidence-input-bar {
            display: flex;
            gap: 12px;
            padding: 8px;
            background: #f1f5f9;
            border-radius: 12px;
        }

        .evidence-input-bar input {
            flex: 1;
            background: none;
            border: none;
            padding: 8px 12px;
            font-size: 14px;
            outline: none;
        }

        .btn-send {
            background: var(--primary);
            color: #fff;
            border: none;
            border-radius: 8px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .job-actions-sticky {
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }

        .btn-lg {
            width: 100%;
            height: 56px;
            font-size: 16px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            border-radius: 16px;
        }

        .btn-success {
            background: var(--success);
            color: #fff;
            border: none;
        }

        .completed-banner {
            width: 100%;
            padding: 16px;
            background: #dcfce7;
            color: #166534;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
        }

        .truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }
      `}</style>
    </Layout>
  );
};

export default Tasks;
