import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import {
    CheckCircle2, Circle, Clock, MapPin, Phone, Loader2, ChevronRight,
    Camera, Save, X, AlertCircle, PlayCircle, ClipboardList, Image as ImageIcon,
    CheckSquare, ArrowLeft, Send, Package, Tag, IndianRupee,
    Navigation, MessageCircle
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { saveTasksOffline, getTasksOffline } from '../services/offline';
import { ChatModal } from '../components/ChatModal';

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
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentChatId, setCurrentChatId] = useState('');

    const workerId = localStorage.getItem('worker_id');

    const [materials, setMaterials] = useState<any[]>([]);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [materialQty, setMaterialQty] = useState(1);

    const fetchTasks = async (pageNumber: number) => {
        try {
            const response = await api.get(`/work-orders/worker/${workerId}?page=${pageNumber}&size=10`);
            setTasks(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            saveTasksOffline(response.data.content || []); // Cache locally
        } catch (err) {
            console.warn('Offline mode: Loading tasks from local cache');
            const cachedTasks = await getTasksOffline();
            setTasks(cachedTasks);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterials = async () => {
        try {
            const res = await api.get('/inventory/materials');
            setMaterials(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchAttendanceStatus = async () => {
        try {
            const response = await api.get(`/attendance/status?workerId=${workerId}`);
            setIsClockedIn(response.data);
        } catch (err) {
            console.error('Failed to fetch attendance');
        }
    };

    useEffect(() => {
        if (workerId) {
            fetchTasks(page);
            fetchAttendanceStatus();
            fetchMaterials();
        } else {
            setLoading(false);
        }
    }, [workerId, page]);

    const handleAddMaterial = async () => {
        if (!selectedMaterial) return;
        try {
            await api.post(`/work-orders/${selectedTask.id}/materials`, {
                materialId: selectedMaterial.id,
                quantity: materialQty
            });
            setIsMaterialModalOpen(false);
            fetchTasks(page);
        } catch (e) { alert('Failed to add material'); }
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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('File selected:', file);
            alert('Photo selected. Add a note and send to upload.');
        }
    };

    const updateStatus = async (taskId: number, action: 'start' | 'submit-verification') => {
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return { color: 'var(--primary)', bg: '#eef2ff', icon: <PlayCircle size={14} /> };
            case 'COMPLETED': return { color: 'var(--success)', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> };
            case 'AWAITING_VERIFICATION': return { color: '#92400e', bg: '#fef3c7', icon: <Clock size={14} /> };
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

                <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Job Execution Center" width="900px">
                    {selectedTask && (
                        <div className="job-center premium-form-layout">
                            <div className="job-overview-card-standard">
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div className="customer-avatar-large-standard">
                                        {selectedTask.customer?.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="stat-label" style={{ marginBottom: '4px' }}>CLIENT NAME</div>
                                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-h)' }}>{selectedTask.customer?.name}</h2>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                            <a href={`tel:${selectedTask.customer?.phone}`} className="contact-link-standard"><Phone size={14} /> Call Client</a>
                                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedTask.customer?.address || '')}`} target="_blank" rel="noreferrer" className="contact-link-standard" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                                                <Navigation size={14} /> Navigate
                                            </a>
                                            <button onClick={() => { setCurrentChatId(`WO-${selectedTask.id}`); setIsChatOpen(true); }} className="contact-link-standard" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                                <MessageCircle size={14} /> Message
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="stat-label" style={{ marginBottom: '4px' }}>REFERENCE</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>#WO-{selectedTask.id + 1000}</div>
                                    </div>
                                </div>
                                <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} conversationId={currentChatId} recipientId={selectedTask.customer?.id} />
                            </div>

                            <div className="job-section-standard">
                                <div className="section-title-bar-standard">
                                    <h4 className="section-title-standard">SERVICE CHECKLIST</h4>
                                    <span className="step-counter-standard">{selectedTask.tasks?.filter((t: any) => t.completed).length} / {selectedTask.tasks?.length} Completed</span>
                                </div>
                                <div className="checklist-grid-standard">
                                    {selectedTask.tasks?.map((t: any) => (
                                        <div key={t.id} className={`checklist-item-standard ${t.completed ? 'completed' : ''}`}>
                                            <label className="checkbox-container-standard">
                                                <input
                                                    type="checkbox"
                                                    checked={t.completed}
                                                    disabled={selectedTask.status === 'COMPLETED'}
                                                    onChange={() => toggleSubTask(t.id, t.completed)}
                                                />
                                                <span className="checkmark-standard"></span>
                                                <span className="task-text-standard">{t.description}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="job-section-standard">
                                <div className="section-title-bar-standard">
                                    <h4 className="section-title-standard">FIELD EVIDENCE & OBSERVATIONS</h4>
                                    {selectedTask.status !== 'COMPLETED' && (
                                        <button
                                            onClick={() => setIsMaterialModalOpen(true)}
                                            className="btn-add-item"
                                            style={{ background: '#eff6ff', color: 'var(--primary)', borderColor: '#bfdbfe' }}
                                        >
                                            <Package size={14} /> Add Materials Used
                                        </button>
                                    )}
                                </div>
                                <div className="evidence-container-standard">
                                    <div className="evidence-gallery-standard">
                                        {selectedTask.evidence?.map((ev: any) => (
                                            <div key={ev.id} className="evidence-thumb-standard">
                                                <img src={ev.imageUrl} alt="Field site" />
                                                <div className="evidence-overlay-standard">
                                                    <span className="evidence-note-standard">{ev.notes}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedTask.status !== 'COMPLETED' && (
                                            <label className="upload-placeholder-standard">
                                                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileSelect} />
                                                <Camera size={28} />
                                                <span>Capture Photo</span>
                                            </label>
                                        )}
                                    </div>
                                    {selectedTask.status !== 'COMPLETED' && (
                                        <div className="evidence-input-bar-standard">
                                            <input
                                                type="text"
                                                className="evidence-input-standard"
                                                placeholder="Add a detailed field note or observation..."
                                                value={evidenceNote}
                                                onChange={e => setEvidenceNote(e.target.value)}
                                            />
                                            <button onClick={handleUploadEvidence} disabled={uploading || !evidenceNote} className="btn-send-standard">
                                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedTask.materials && selectedTask.materials.length > 0 && (
                                <div className="job-section-standard">
                                    <h4 className="section-title-standard">LOGGED MATERIALS</h4>
                                    <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                                        {selectedTask.materials.map((m: any) => (
                                            <div key={m.id} className="checklist-item-standard" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Tag size={18} className="text-muted" />
                                                    <span style={{ fontWeight: '700' }}>{m.material.name}</span>
                                                </div>
                                                <span className="badge badge-primary">Qty: {m.quantityUsed} {m.material.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="job-actions-sticky-standard">
                                {selectedTask.status === 'ASSIGNED' && (
                                    <button
                                        onClick={() => updateStatus(selectedTask.id, 'start')}
                                        className="btn btn-primary btn-lg-standard"
                                    >
                                        <PlayCircle size={24} /> Confirm Arrival & Start Job
                                    </button>
                                )}
                                {selectedTask.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => { updateStatus(selectedTask.id, 'submit-verification'); setIsDetailModalOpen(false); }}
                                        className="btn btn-success-standard btn-lg-standard"
                                        disabled={selectedTask.tasks?.some((t: any) => !t.completed)}
                                    >
                                        <CheckCircle2 size={24} /> Submit for Customer Verification
                                    </button>
                                )}
                                {selectedTask.status === 'AWAITING_VERIFICATION' && (
                                    <div className="completed-banner-standard" style={{ background: '#fef3c7', color: '#92400e' }}>
                                        <Clock size={24} /> Awaiting Customer Sign-off
                                    </div>
                                )}
                                {selectedTask.status === 'COMPLETED' && (
                                    <div className="completed-banner-standard">
                                        <CheckCircle2 size={24} /> Job Fulfillment Complete
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                <Modal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} title="Log Material Usage" width="700px">
                    <div className="premium-form-layout">
                        <div className="form-group">
                            <label className="form-label">Select Material from Stock</label>
                            <div className="input-with-icon">
                                <Package size={18} className="input-icon" />
                                <select
                                    className="input-field pl-10"
                                    value={selectedMaterial?.id || ''}
                                    onChange={e => setSelectedMaterial(materials.find(m => m.id === Number(e.target.value)))}
                                >
                                    <option value="">Choose material...</option>
                                    {materials.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity} {m.unit})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedMaterial && (
                            <div className="form-grid-standard">
                                <div className="form-group">
                                    <label className="form-label">Quantity to Use</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        min="1"
                                        max={selectedMaterial.quantity}
                                        value={materialQty}
                                        onChange={e => setMaterialQty(Number(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit Price (at source)</label>
                                    <div className="input-with-icon">
                                        <IndianRupee size={16} className="input-icon" />
                                        <input type="text" className="input-field pl-10" disabled value={selectedMaterial.price} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer-actions">
                            <button onClick={() => setIsMaterialModalOpen(false)} className="btn btn-secondary">Cancel</button>
                            <button
                                onClick={handleAddMaterial}
                                className="btn btn-primary"
                                disabled={!selectedMaterial || materialQty <= 0 || materialQty > selectedMaterial.quantity}
                            >
                                Confirm & Deduct Stock
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>

            <style>{`
        .worker-tasks-container { max-width: 1200px; margin: 0 auto; }
        .premium-form-layout { display: flex; flex-direction: column; gap: 32px; padding: 8px 4px; }
        .job-overview-card-standard { padding: 24px; background: #f8fafc; border: 1px solid var(--border); border-radius: 16px; }
        .customer-avatar-large-standard { width: 64px; height: 64px; background: var(--primary); color: #fff; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
        .contact-link-standard { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--primary); text-decoration: none; padding: 10px 18px; background: white; border: 1px solid #e0e7ff; border-radius: 12px; transition: all 0.2s; }
        .contact-link-standard:hover { background: #f8faff; border-color: var(--primary); transform: translateY(-1px); }
        .job-section-standard { margin-bottom: 24px; }
        .section-title-bar-standard { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-title-standard { font-size: 13px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; }
        .step-counter-standard { font-size: 13px; font-weight: 800; color: var(--primary); background: #eef2ff; padding: 6px 14px; border-radius: 10px; }
        .checklist-grid-standard { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .checklist-item-standard { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 20px; transition: all 0.2s; }
        .checklist-item-standard.completed { background: #f8fafc; border-color: #dcfce7; }
        .checkbox-container-standard { display: flex; align-items: center; position: relative; padding-left: 40px; cursor: pointer; user-select: none; width: 100%; }
        .checkbox-container-standard input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
        .checkmark-standard { position: absolute; top: 50%; left: 0; transform: translateY(-50%); height: 28px; width: 28px; background-color: #fff; border: 2px solid var(--border); border-radius: 10px; transition: all 0.2s; }
        .checkbox-container-standard:hover input ~ .checkmark-standard { border-color: var(--primary); }
        .checkbox-container-standard input:checked ~ .checkmark-standard { background-color: var(--success); border-color: var(--success); }
        .checkmark-standard:after { content: ""; position: absolute; display: none; }
        .checkbox-container-standard input:checked ~ .checkmark-standard:after { display: block; }
        .checkbox-container-standard .checkmark-standard:after { left: 10px; top: 5px; width: 6px; height: 12px; border: solid white; border-width: 0 3px 3px 0; transform: rotate(45deg); }
        .task-text-standard { font-size: 16px; font-weight: 700; color: var(--text-h); }
        .completed .task-text-standard { text-decoration: line-through; color: var(--text-muted); opacity: 0.6; }
        .evidence-container-standard { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 24px; }
        .evidence-gallery-standard { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .evidence-thumb-standard { aspect-ratio: 1; border-radius: 16px; overflow: hidden; position: relative; border: 1px solid var(--border); }
        .evidence-thumb-standard img { width: 100%; height: 100%; object-fit: cover; }
        .evidence-overlay-standard { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 12px; color: white; font-size: 11px; font-weight: 600; }
        .upload-placeholder-standard { aspect-ratio: 1; border: 2px dashed var(--border); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--text-muted); font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; background: #f8fafc; }
        .upload-placeholder-standard:hover { border-color: var(--primary); color: var(--primary); background: #f0f7ff; }
        .evidence-input-bar-standard { display: flex; gap: 12px; padding: 12px; background: #f8fafc; border: 1px solid var(--border); border-radius: 16px; }
        .evidence-input-standard { flex: 1; background: none; border: none; padding: 8px 16px; font-size: 15px; font-weight: 500; outline: none; color: var(--text-h); }
        .btn-send-standard { background: var(--primary); color: #fff; border: none; border-radius: 12px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .btn-send-standard:hover { background: #4338ca; transform: scale(1.05); }
        .job-actions-sticky-standard { padding-top: 24px; border-top: 1px solid var(--border); }
        .btn-lg-standard { width: 100%; height: 64px; font-size: 18px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
        .btn-lg-standard:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .btn-success-standard { background: var(--success); color: #fff; border: none; }
        .btn-success-standard:hover:not(:disabled) { background: #059669; }
        .completed-banner-standard { width: 100%; height: 64px; background: #ecfdf5; color: #065f46; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 900; font-size: 18px; }
        .stat-label { font-size: 11px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .tasks-mobile-grid { display: grid; gap: 16px; }
        .task-card { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s; }
        .task-card:active { transform: scale(0.98); background: #f8fafc; }
        .task-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .task-id { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary); font-size: 13px; }
        .task-status-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .customer-name { font-size: 22px; font-weight: 800; color: var(--text-h); margin-bottom: 12px; }
        .task-info-chips { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .info-chip { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); font-weight: 500; }
        .task-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #f1f5f9; }
        .checklist-preview { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--text-muted); }
        .error-alert { background: #fef2f2; color: var(--error); padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 14px; position: relative; }
        .close-alert { position: absolute; right: 12px; background: none; border: none; color: var(--error); cursor: pointer; }
        .loading-center { text-align: center; padding: 100px; }
        .empty-state-card { padding: 80px 20px; text-align: center; background: #f8fafc; border-radius: 20px; border: 2px dashed var(--border); }
        .btn-add-item { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #bcf0da; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-add-item:hover { transform: translateY(-1px); }
        .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--border); }
    `}</style>
        </Layout>
    );
};

export default Tasks;
