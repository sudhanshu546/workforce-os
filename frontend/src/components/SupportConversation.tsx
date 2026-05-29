import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Loader2, Clock } from 'lucide-react';
import api from '../services/api';

interface Comment {
    id: number;
    message: string;
    user: {
        name: string;
        email: string;
    };
    createdAt: string;
}

interface SupportConversationProps {
    ticketId: number;
}

export const SupportConversation: React.FC<SupportConversationProps> = ({ ticketId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}').email;

    useEffect(() => {
        fetchComments();
        const interval = setInterval(fetchComments, 10000); // Poll every 10s for "real-time" feel
        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const fetchComments = async () => {
        try {
            const res: any = await api.get(`/support/tickets/${ticketId}/comments`);
            setComments(res || []);
        } catch (e) {
            console.error('Failed to fetch comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await api.post(`/support/tickets/${ticketId}/comments`, { message: newMessage });
            setNewMessage('');
            fetchComments();
        } catch (e) {
            console.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="support-chat-container">
            <div className="chat-messages" ref={scrollRef}>
                {comments.map((comment) => (
                    <div key={comment.id} className={`message-bubble ${comment.user.email === currentUserEmail ? 'sent' : 'received'}`}>
                        <div className="message-header">
                            <span className="sender-name">{comment.user.name}</span>
                            <span className="message-time"><Clock size={10} /> {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="message-text">{comment.message}</div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                        No conversation history yet. Start the thread below.
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="chat-input-area">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <button type="submit" className="chat-send-btn" disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
            </form>

            <style>{`
                .support-chat-container { display: flex; flex-direction: column; height: 400px; background: white; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
                .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; }
                
                .message-bubble { max-width: 80%; padding: 10px 14px; border-radius: 14px; position: relative; font-size: 14px; line-height: 1.5; box-shadow: var(--shadow-sm); }
                .message-bubble.sent { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 2px; }
                .message-bubble.received { align-self: flex-start; background: white; color: var(--text-h); border-bottom-left-radius: 2px; border: 1px solid var(--border); }
                
                .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 12px; }
                .sender-name { font-size: 11px; font-weight: 800; opacity: 0.8; }
                .message-time { font-size: 10px; opacity: 0.6; display: flex; align-items: center; gap: 3px; }
                
                .message-text { word-break: break-word; font-weight: 500; }
                
                .chat-input-area { display: flex; padding: 12px; gap: 10px; background: white; border-top: 1px solid var(--border); }
                .chat-input { flex: 1; border: 1.5px solid var(--border); border-radius: 10px; padding: 8px 16px; font-size: 14px; outline: none; transition: border-color 0.2s; }
                .chat-input:focus { border-color: var(--primary); }
                
                .chat-send-btn { background: var(--primary); color: white; border: none; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .chat-send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
                .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};
