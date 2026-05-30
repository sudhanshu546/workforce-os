import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import {
    CheckCircle2, Clock, MapPin, Phone, Loader2, ChevronRight,
    Camera, X, AlertCircle, PlayCircle, ClipboardList,
    CheckSquare, Send, Package, Tag, IndianRupee,
    Navigation, MessageCircle, User
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { saveTasksOffline, getTasksOffline } from '../services/offline';
import { ChatModal } from '../components/ChatModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import { EXPENSE_CATEGORIES, API_ENDPOINTS } from '../utils/constants';
import { startLiveTracking, stopLiveTracking } from '../services/location';

import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const Tasks: React.FC = () => {
    const showToast = useToast();
    const { workerId, role } = useSelector((state: RootState) => state.auth);
    const [tasks, setTasks] = useState<any[]>([]);
    // ... rest of state ...
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [materialQty, setMaterialQty] = useState(0);
    const [evidenceNote, setEvidenceNote] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentChatId, setCurrentChatId] = useState('');

    // Expense States
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState('FUEL');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseFile, setExpenseFile] = useState<File | null>(null);

    const [materials, setMaterials] = useState<any[]>([]);

    const handleAddExpense = async () => {
        if (!expenseAmount || !expenseDescription) {
            showToast('Please fill in all expense details.', 'info');
            return;
        }

        setUploading(true);
        try {
            let receiptUrl = '';
            if (expenseFile) {
                const formData = new FormData();
                formData.append('file', expenseFile);
                const uploadRes: any = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                receiptUrl = uploadRes.url;
            }

            await api.post(API_ENDPOINTS.FINANCE.EXPENSES, {
                workOrderId: selectedTask.id,
                workerId: Number(workerId),
                category: expenseCategory,
                amount: Number(expenseAmount),
                description: expenseDescription,
                receiptImageUrl: receiptUrl
            });

            showToast('Expense logged successfully!', 'success');
            setIsExpenseModalOpen(false);
            setExpenseAmount('');
            setExpenseDescription('');
            setExpenseFile(null);
            fetchTasks(page);
        } catch (err) {
            showToast('Failed to log expense', 'error');
        } finally {
            setUploading(false);
        }
    };

    const fetchTasks = async (pageNumber: number) => {
        if (!workerId) return;
        try {
            setLoading(true);
            const data: any = await api.get(`${API_ENDPOINTS.OPERATIONS.WORK_ORDERS}/worker/${workerId}?page=${pageNumber}&size=10`);
            setTasks(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            saveTasksOffline(data.content || []); // Cache locally
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
            const data: any = await api.get(API_ENDPOINTS.INVENTORY.MATERIALS);
            setMaterials(data.content || []);
        } catch (e) { console.error(e); }
    };

    const fetchAttendanceStatus = async () => {
        if (!workerId) return;
        try {
            const data: any = await api.get(`${API_ENDPOINTS.ATTENDANCE.STATUS}?workerId=${workerId}`);
            setIsClockedIn(data);
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

    useEffect(() => {
        const hasActiveTask = tasks.some(t => t.status === 'IN_PROGRESS');
        if (hasActiveTask && workerId) {
            startLiveTracking(workerId.toString());
        } else {
            stopLiveTracking();
        }
        return () => stopLiveTracking();
    }, [tasks, workerId]);

    const handleAddMaterial = async () => {
        if (!selectedMaterial) return;
        try {
            await api.post(`${API_ENDPOINTS.OPERATIONS.WORK_ORDERS}/${selectedTask.id}/materials`, {
                materialId: selectedMaterial.id,
                quantity: materialQty
            });
            setIsMaterialModalOpen(false);
            showToast('Material added successfully', 'success');
            fetchTasks(page);
        } catch (e) { 
            showToast('Failed to add material', 'error'); 
        }
    };

    const handleUploadEvidence = async () => {
        if (!evidenceNote.trim() || !evidenceFile) {
            showToast('Please provide both a photo and a note.', 'info');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', evidenceFile);
            const uploadRes: any = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await api.post(`${API_ENDPOINTS.OPERATIONS.WORK_ORDERS}/${selectedTask.id}/evidence`, {
                imageUrl: uploadRes.url,
                notes: evidenceNote
            });

            showToast('Evidence uploaded successfully', 'success');
            setEvidenceNote('');
            setEvidenceFile(null);
            setEvidencePreview(null);
            fetchTasks(page);
        } catch (err) {
            console.error('Failed to upload evidence:', err);
            showToast('Technical error: Failed to upload evidence.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setEvidenceFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setEvidencePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleNavigate = () => {
        if (!selectedTask.customer?.latitude || !selectedTask.customer?.longitude) {
            showToast('Customer location is not set. Opening destination search instead.', 'info');
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTask.customer?.address)}`, '_blank');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
                const destination = `${selectedTask.customer.latitude},${selectedTask.customer.longitude}`;
                
                if (Math.abs(pos.coords.latitude - selectedTask.customer.latitude) < 0.0001 && 
                    Math.abs(pos.coords.longitude - selectedTask.customer.longitude) < 0.0001) {
                    showToast('You appear to be already at the customer location.', 'info');
                }

                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                window.open(url, '_blank');
            },
            () => {
                const destination = `${selectedTask.customer.latitude},${selectedTask.customer.longitude}`;
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank');
            }
        );
    };

    const updateStatus = async (taskId: number, action: 'start' | 'submit-verification') => {
        setError(null);
        
        if (action === 'start' && !isClockedIn) {
            showToast('Operational requirement: You must clock in for your shift before starting any job.', 'error');
            return;
        }

        if (action === 'submit-verification' && (!selectedTask.evidence || selectedTask.evidence.length === 0)) {
            showToast('Industry Standard: At least one photo upload is mandatory to finalize this job.', 'error');
            return;
        }

        const proceedWithUpdate = async (lat = 0.0, lon = 0.0) => {
            try {
                const locationData = { latitude: lat, longitude: lon };
                await api.patch(`/work-orders/${taskId}/${action}`, locationData);
                
                if (workerId) {
                    const updatedTasks: any = await api.get(`/work-orders/worker/${workerId}?page=${page}&size=10`);
                    setTasks(updatedTasks.content || []);
                    
                    const refreshedTask = updatedTasks.content.find((t: any) => t.id === taskId);
                    if (refreshedTask) {
                        setSelectedTask(refreshedTask);
                        showToast(`Task ${action.replace('-', ' ')}ed successfully`, 'success');
                    } else {
                        setIsDetailModalOpen(false);
                    }
                }
            } catch (err: any) {
                showToast(err.message || `Technical error: Failed to ${action} task.`, 'error');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => proceedWithUpdate(pos.coords.latitude, pos.coords.longitude),
                () => {
                    showToast('Location access denied. Using default coordinates.', 'info');
                    proceedWithUpdate();
                }
            );
        } else {
            proceedWithUpdate();
        }
    };

    const toggleSubTask = async (taskId: number, currentStatus: boolean) => {
        try {
            await api.patch(`/work-orders/tasks/${taskId}`, { isCompleted: !currentStatus });
            fetchTasks(page);
            setSelectedTask((prev: any) => ({
                ...prev,
                tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, completed: !currentStatus } : t)
            }));
        } catch (err) {
            console.error('Failed to update subtask:', err);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return { color: 'var(--primary)', bg: '#eef2ff', badge: 'badge-primary', icon: <PlayCircle size={14} /> };
            case 'COMPLETED': return { color: 'var(--success)', bg: '#dcfce7', badge: 'badge-success', icon: <CheckCircle2 size={14} /> };
            case 'AWAITING_VERIFICATION': return { color: '#92400e', bg: '#fef3c7', badge: 'badge-warning', icon: <Clock size={14} /> };
            default: return { color: 'var(--text-muted)', bg: '#f1f5f9', badge: 'badge-secondary', icon: <Clock size={14} /> };
        }
    };

    return (
        <Layout>
            <div className="worker-tasks-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Job Assignments</h1>
                        <p className="text-muted">Welcome back! You have {(tasks || []).filter(t => t.status !== 'COMPLETED').length} active missions today.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="mini-stat">
                            <span className="stat-label">Shift Status</span>
                            <span className={`stat-value ${isClockedIn ? 'text-success' : 'text-error'}`}>{isClockedIn ? 'Active' : 'Off-Duty'}</span>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}><LoadingSpinner /></div>
                ) : tasks.length === 0 ? (
                    <div style={{ padding: '100px', textAlign: 'center', background: 'var(--surface-muted)', borderRadius: '24px', border: '1.5px dashed var(--border)' }}>
                        <ClipboardList size={64} className="text-muted" strokeWidth={1} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3 style={{ fontWeight: '800' }}>Schedule Clear</h3>
                        <p className="text-muted">You have no pending assignments at the moment.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                        {tasks.map(task => {
                            const style = getStatusStyle(task.status);
                            const doneTasks = task.tasks?.filter((t: any) => t.completed).length || 0;
                            const totalTasks = task.tasks?.length || 0;
                            
                            return (
                                <div key={task.id} className="card-premium" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => { setSelectedTask(task); setIsDetailModalOpen(true); }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <span className="id-tag">#WO-{task.id + 1000}</span>
                                        <span className={`badge ${style.badge}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                                            {style.icon} {task.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <div className="stat-label">Mission Brief</div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: 'var(--text-h)' }}>{task.serviceName}</h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                                            {task.customer?.name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} /></div>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.customer?.address || 'Site mapping pending'}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>
                                            <CheckSquare size={16} /> {doneTasks} / {totalTasks} Completed
                                        </div>
                                        <ChevronRight size={20} className="text-muted" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Pagination currentPage={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setPage} />

                <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Job Execution Center" width="900px">
                    {selectedTask && (
                        <div className="job-center premium-form-layout">
                            <div className="job-overview-card-standard">
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div className="customer-avatar-large-standard">
                                        {selectedTask.customer?.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="stat-label" style={{ marginBottom: '4px' }}>CLIENT NAME & SERVICE</div>
                                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-h)' }}>{selectedTask.customer?.name}</h2>
                                        <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '15px' }}>{selectedTask.serviceName}</div>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                            <a href={selectedTask.status !== 'COMPLETED' ? `tel:${selectedTask.customer?.phone}` : '#'} className="contact-link-standard" style={{ opacity: selectedTask.status === 'COMPLETED' ? 0.5 : 1, pointerEvents: selectedTask.status === 'COMPLETED' ? 'none' : 'auto' }}><Phone size={14} /> Call Client</a>
                                            <button 
                                                onClick={handleNavigate} 
                                                className="contact-link-standard" 
                                                style={{ borderColor: 'var(--success)', color: 'var(--success)', opacity: selectedTask.status === 'COMPLETED' ? 0.5 : 1, pointerEvents: selectedTask.status === 'COMPLETED' ? 'none' : 'auto' }}
                                            >
                                                <Navigation size={14} /> Navigate
                                            </button>
                                            <button 
                                                onClick={() => { setCurrentChatId(`WO-${selectedTask.id}`); setIsChatOpen(true); }} 
                                                className="contact-link-standard" 
                                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', opacity: selectedTask.status === 'COMPLETED' ? 0.5 : 1 }}
                                                disabled={selectedTask.status === 'COMPLETED'}
                                            >
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setIsExpenseModalOpen(true)}
                                                className="btn-add-item"
                                                style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}
                                            >
                                                <IndianRupee size={14} /> Log Expense
                                            </button>
                                            <button
                                                onClick={() => setIsMaterialModalOpen(true)}
                                                className="btn-add-item"
                                                style={{ background: '#eff6ff', color: 'var(--primary)', borderColor: '#bfdbfe' }}
                                            >
                                                <Package size={14} /> Add Materials Used
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="evidence-container-standard">
                                    <div className="evidence-gallery-standard">
                                        {(Array.isArray(selectedTask.evidence) ? selectedTask.evidence : []).map((ev: any) => (
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
                                                {evidencePreview ? (
                                                    <img src={evidencePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <>
                                                        <Camera size={28} />
                                                        <span>Capture Photo</span>
                                                    </>
                                                )}
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
                                        {Array.isArray(selectedTask?.materials) ? selectedTask.materials.map((m: any) => (
                                            <div key={m.id} className="checklist-item-standard" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Tag size={18} className="text-muted" />
                                                    <span style={{ fontWeight: '700' }}>{m.materialName || 'Unknown Material'}</span>
                                                </div>
                                                <span className="badge badge-primary">Qty: {m.quantityUsed} {m.unit}</span>
                                            </div>
                                        )) : null}
                                    </div>
                                </div>
                            )}

                            <div className="job-section-standard">
                                <div className="section-title-bar-standard">
                                    <h4 className="section-title-standard">LIVE JOB VALUE</h4>
                                    <div className="running-total-pill">
                                            <IndianRupee size={14} />
                                            <span>{((selectedTask.totalAmount || 0) + (selectedTask.materials?.reduce((acc: number, m: any) => acc + ((m.unitPriceAtUse || 0) * (m.quantityUsed || 0)), 0) || 0)).toFixed(2)}</span>
                                        </div>
                                </div>
                                <div className="value-breakdown-card">
                                    <div className="value-row">
                                        <span>Quoted Services</span>
                                        <span><IndianRupee size={12} /> {(selectedTask.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="value-row">
                                        <span>On-Site Materials</span>
                                        <span><IndianRupee size={12} /> {(selectedTask.materials?.reduce((acc: number, m: any) => acc + ((m.unitPriceAtUse || 0) * (m.quantityUsed || 0)), 0) || 0).toFixed(2)}</span>
                                    </div>
                                    <p className="value-disclaimer">Tax will be calculated automatically on the final invoice.</p>
                                </div>
                            </div>

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
                                        onClick={() => { updateStatus(selectedTask.id, 'submit-verification'); }}
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
                                {selectedTask.status === 'AWAITING_PAYMENT' && (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div className="completed-banner-standard" style={{ background: '#eef2ff', color: 'var(--primary)', height: 'auto', padding: '16px', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Clock size={20} /> <span>Awaiting Customer Payment</span>
                                            </div>
                                            <span style={{ fontSize: '13px', opacity: 0.8 }}>Customer is choosing payment method...</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const data: any = await api.get('/finance/invoices');
                                                    const inv = (data || []).find((i: any) => i.workOrder?.id === selectedTask.id);
                                                    if (inv) {
                                                        await api.post(`/finance/payments/cash`, {
                                                            invoiceId: inv.id,
                                                            amount: inv.total,
                                                            paymentMethod: 'CASH',
                                                            transactionReference: `CASH_COLLECTED_BY_WORKER_${workerId}`,
                                                            workerId: Number(workerId)
                                                        });
                                                        showToast('Cash payment recorded successfully!', 'success');
                                                        setIsDetailModalOpen(false);
                                                        fetchTasks(page);
                                                    }
                                                } catch (e) { showToast('Failed to record cash payment', 'error'); }
                                            }}
                                            className="btn btn-primary btn-lg-standard"
                                            style={{ background: 'var(--success)', color: 'white' }}
                                        >
                                            <IndianRupee size={24} /> Confirm Cash Received
                                        </button>
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
                                    onChange={e => {
                                        const val = Number(e.target.value);
                                        const mList = Array.isArray(materials) ? materials : [];
                                        setSelectedMaterial(mList.find(m => m.id === val));
                                    }}
                                >                                    <option value="">Choose material...</option>
                                    {(Array.isArray(materials) ? materials : []).map(m => (
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

                <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Field Expense" width="600px">
                    <div className="premium-form-layout">
                        <div className="form-group">
                            <label className="form-label">Expense Category</label>
                            <select 
                                className="input-field" 
                                value={expenseCategory} 
                                onChange={e => setExpenseCategory(e.target.value)}
                            >
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount (INR)</label>
                            <div className="input-with-icon">
                                <IndianRupee size={18} className="input-icon" />
                                <input 
                                    type="number" 
                                    className="input-field pl-10" 
                                    placeholder="0.00"
                                    value={expenseAmount}
                                    onChange={e => setExpenseAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description / Purpose</label>
                            <textarea 
                                className="input-field" 
                                style={{ minHeight: '100px', paddingTop: '12px' }}
                                placeholder="What was this expense for?"
                                value={expenseDescription}
                                onChange={e => setExpenseDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Upload Receipt (Optional)</label>
                            <label className="upload-placeholder-standard" style={{ height: '140px' }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => setExpenseFile(e.target.files?.[0] || null)} 
                                />
                                {expenseFile ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                                        <CheckCircle2 size={24} />
                                        <span>{expenseFile.name} attached</span>
                                    </div>
                                ) : (
                                    <>
                                        <Camera size={32} />
                                        <span>Capture Receipt</span>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="modal-footer-actions">
                            <button onClick={() => setIsExpenseModalOpen(false)} className="btn btn-secondary">Cancel</button>
                            <button 
                                onClick={handleAddExpense} 
                                className="btn btn-primary"
                                disabled={uploading || !expenseAmount || !expenseDescription}
                            >
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : 'Log Expense'}
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
        .running-total-pill { display: flex; align-items: center; gap: 8px; background: #eef2ff; color: var(--primary); padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 16px; }
        .value-breakdown-card { background: #f8fafc; border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-top: 16px; }
        .value-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; font-weight: 600; color: var(--text-h); }
        .value-disclaimer { font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 12px; font-style: italic; }
        .modal-footer-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--border); }
    `}</style>
        </Layout>
    );
};

export default Tasks;
