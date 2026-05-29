import React, { useState } from 'react';
import { Star, X, MessageSquare, Loader2, Send } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    workOrderId: number;
    workerName: string;
    onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, workOrderId, workerName, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/reviews', {
                workOrderId,
                rating,
                comment
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Experience">
            <div style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Star size={32} fill="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-h)', marginBottom: '8px' }}>How was {workerName}?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Your feedback helps us maintain professional standards.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer',
                                padding: '4px',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <Star 
                                size={40} 
                                fill={star <= rating ? '#f59e0b' : 'none'} 
                                color={star <= rating ? '#f59e0b' : '#d1d5db'} 
                                strokeWidth={star <= rating ? 0 : 2}
                            />
                        </button>
                    ))}
                </div>

                <div className="input-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={16} /> 
                        Share your feedback (Optional)
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="Was the technician professional? Was the quality of work satisfactory?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ minHeight: '120px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        className="btn btn-primary" 
                        disabled={loading}
                        style={{ flex: 2 }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
