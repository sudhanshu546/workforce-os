import React, { useState, useEffect, useRef } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { Send, X, MessageCircle } from 'lucide-react';
import api from '../services/api';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { useToast } from './ToastProvider';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    conversationId: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recipientId, conversationId }) => {
    const showToast = useToast();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClient = useRef<Stomp.Client | null>(null);
    const { workerId, customerId, role } = useSelector((state: any) => state.auth);
    const senderId = role === 'WORKER' ? `W-${workerId}` : `C-${customerId}`;
    const scopedRecipientId = typeof recipientId === 'string' && (recipientId.startsWith('W-') || recipientId.startsWith('C-')) 
        ? recipientId 
        : (role === 'WORKER' ? `C-${recipientId}` : `W-${recipientId}`);

    useEffect(() => {
        if (!isOpen) return;

        // Fetch history
        api.get(`/chat/history/${conversationId}`)
            .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
            .catch(err => {
                console.error('Chat history fetch failed', err);
                showToast('Failed to load chat history', 'error');
            });

        // Setup WebSocket
        const socket = new SockJS(import.meta.env.VITE_WS_BASE_URL);
        stompClient.current = Stomp.over(socket);
        stompClient.current.connect({}, () => {
            stompClient.current?.subscribe(`/user/${senderId}/queue/messages`, (msg) => {
                const newMsg = JSON.parse(msg.body);
                setMessages(prev => Array.isArray(prev) ? [...prev, newMsg] : [newMsg]);
            });
        });

        return () => { stompClient.current?.disconnect(() => {}); };
    }, [isOpen, conversationId, senderId]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = { 
            senderId, 
            recipientId: scopedRecipientId, 
            content: newMessage, 
            conversationId 
        };
        stompClient.current?.send('/app/chat.sendMessage', {}, JSON.stringify(msg));
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="chat-modal">
                <div className="chat-header">
                    <h3>Conversation</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="chat-body">
                    {(messages || []).map((m, i) => {
                        const isMe = String(m.senderId) === String(senderId);
                        return (
                            <div key={i} className={`msg-wrapper ${isMe ? 'msg-me' : 'msg-them'}`}>
                                {!isMe && <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '8px' }}>{m.senderName || 'User'}</div>}
                                <div className="msg-bubble">
                                    {m.content}
                                    <div className="msg-meta">{moment(m.createdAt).format('h:mm A')}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="chat-footer">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                    <button onClick={sendMessage}><Send size={20} /></button>
                </div>
            </div>
            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
                .chat-modal { width: 400px; height: 500px; background: white; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-xl); }
                .chat-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .chat-header h3 { margin: 0; font-size: 16px; font-weight: 900; }
                .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 12px; }
                
                .msg-wrapper { display: flex; flex-direction: column; max-width: 85%; }
                .msg-me { align-self: flex-end; }
                .msg-them { align-self: flex-start; }
                .msg-bubble { padding: 10px 16px; border-radius: 16px; font-size: 14px; line-height: 1.4; position: relative; }
                .msg-me .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
                .msg-them .msg-bubble { background: white; color: var(--text-main); border-bottom-left-radius: 4px; box-shadow: var(--shadow-sm); }
                .msg-meta { font-size: 9px; margin-top: 4px; opacity: 0.7; text-align: right; font-weight: 700; }

                .chat-footer { padding: 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; background: white; }
                .chat-footer input { flex: 1; border: 1px solid var(--border); padding: 10px 16px; border-radius: 10px; outline: none; }
                .chat-footer button { border: none; background: var(--primary); color: white; border-radius: 10px; padding: 0 16px; cursor: pointer; }
            `}</style>
        </div>
    );
};
