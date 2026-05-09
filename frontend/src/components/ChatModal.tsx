import React, { useState, useEffect, useRef } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { Send, X, MessageCircle } from 'lucide-react';
import api from '../services/api';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    conversationId: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recipientId, conversationId }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClient = useRef<Stomp.Client | null>(null);
    const senderId = localStorage.getItem('userId') || 'current-user';

    useEffect(() => {
        if (!isOpen) return;

        // Fetch history
        api.get(`/chat/history/${conversationId}`).then(res => setMessages(res.data));

        // Setup WebSocket
        const socket = new SockJS('http://localhost:8080/ws-workforce');
        stompClient.current = Stomp.over(socket);
        stompClient.current.connect({}, () => {
            stompClient.current?.subscribe(`/user/${senderId}/queue/messages`, (msg) => {
                setMessages(prev => [...prev, JSON.parse(msg.body)]);
            });
        });

        return () => { stompClient.current?.disconnect(() => {}); };
    }, [isOpen, conversationId, senderId]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = { senderId, recipientId, content: newMessage, conversationId };
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
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-bubble ${m.senderId === senderId ? 'sent' : 'received'}`}>
                            {m.content}
                        </div>
                    ))}
                </div>
                <div className="chat-footer">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
                    <button onClick={sendMessage}><Send size={20} /></button>
                </div>
            </div>
            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
                .chat-modal { width: 400px; height: 500px; background: white; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; }
                .chat-header { padding: 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
                .chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
                .chat-bubble { padding: 10px 14px; border-radius: 12px; max-width: 80%; }
                .sent { align-self: flex-end; background: #4f46e5; color: white; }
                .received { align-self: flex-start; background: #f1f5f9; }
                .chat-footer { padding: 16px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }
            `}</style>
        </div>
    );
};
