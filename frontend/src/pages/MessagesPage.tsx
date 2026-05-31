import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, MessageSquare, Send, User, 
    Clock, CheckCheck, Loader2, ChevronLeft,
    MoreVertical, Phone, Video, ShieldCheck
} from 'lucide-react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { 
  useGetConversationsQuery, 
  useGetChatHistoryQuery, 
  useMarkAsReadMutation 
} from '../redux/chatApi';
import { Layout } from '../components/Layout';
import { useToast } from '../components/ToastProvider';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useWebSocket } from '../hooks/useWebSocket';

const MessagesPage: React.FC = () => {
    const showToast = useToast();
    const { user, workerId, customerId, role } = useSelector((state: any) => state.auth);
    
    // Improved userId derivation: Always ensure we have a valid ID string for the chat system
    const userId = React.useMemo(() => {
        if (role === 'WORKER' && workerId) return `W-${workerId}`;
        if (role === 'CUSTOMER' && customerId) return `C-${customerId}`;
        if (user?.id) return `U-${user.id}`; // Fallback for OWNER/MANAGER
        return '';
    }, [role, workerId, customerId, user?.id]);
    
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [localMessages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const { data: conversations = [], isLoading: convLoading, refetch: refetchConvs } = useGetConversationsQuery(userId, { skip: !userId });
    const { data: history = [], isFetching: historyLoading } = useGetChatHistoryQuery(selectedConv?.conversationId, { skip: !selectedConv?.conversationId });
    const [markRead] = useMarkAsReadMutation();

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Track selectedConv in a ref for the WebSocket callback
    const selectedConvRef = useRef<any>(null);
    useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);

    // Use the common WebSocket hook for stability
    const { sendMessage: emitMessage } = useWebSocket(
        userId ? `/user/${userId}/queue/messages` : '',
        (incoming: any) => {
            if (selectedConvRef.current && incoming.conversationId === selectedConvRef.current.conversationId) {
                setMessages(prev => [...prev, incoming]);
                try {
                    markRead({ conversationId: incoming.conversationId, userId });
                } catch (e) {
                    console.error('Failed to mark as read', e);
                }
            }
            refetchConvs();
        }
    );

    useEffect(() => {
        if (history) setMessages(history);
    }, [history]);

    useEffect(() => {
        if (selectedConv && userId) {
            markRead({ conversationId: selectedConv.conversationId, userId }).unwrap().catch(console.error);
        }
    }, [selectedConv, userId]);

    useEffect(() => {
        if (localMessages.length > 0) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [localMessages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || !userId) return;

        const msg = {
            senderId: userId,
            senderName: user?.name,
            senderRole: role,
            recipientId: selectedConv.participantId,
            content: newMessage,
            conversationId: selectedConv.conversationId
        };

        emitMessage('/app/chat.sendMessage', msg);
        setMessages(prev => [...prev, { ...msg, createdAt: new Date() }]);
        setNewMessage('');
        refetchConvs();
    };

    const filteredConversations = conversations.filter((c: any) => 
        c.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div className="messaging-hub">
                <div className={`conv-list-pane ${selectedConv ? 'mobile-hidden' : ''}`}>
                    <div className="pane-header">
                        <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Messages</h2>
                        <div className="search-bar-mini">
                            <Search size={16} />
                            <input placeholder="Filter chats..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="conv-scroll-area">
                        {convLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map((conv: any) => (
                                <div key={conv.conversationId} className={`conv-item ${selectedConv?.conversationId === conv.conversationId ? 'active' : ''}`} onClick={() => setSelectedConv(conv)}>
                                    <div className="conv-avatar">
                                        {conv.participantName?.[0] || 'U'}
                                        {conv.unreadCount > 0 && <div className="unread-dot" />}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-top-row">
                                            <span className="conv-name">{conv.participantName}</span>
                                            <span className="conv-time">{moment(conv.timestamp).fromNow(true)}</span>
                                        </div>
                                        <div className="conv-snippet">{conv.lastMessage}</div>
                                    </div>
                                    {conv.unreadCount > 0 && <div className="unread-badge">{conv.unreadCount}</div>}
                                </div>
                            ))
                        ) : (
                            <div className="empty-conv">
                                <MessageSquare size={48} strokeWidth={1} />
                                <p>No active conversations</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`chat-pane ${!selectedConv ? 'mobile-hidden' : ''}`}>
                    {selectedConv ? (
                        <>
                            <div className="pane-header chat-header-main">
                                <button className="mobile-only back-btn" onClick={() => setSelectedConv(null)}><ChevronLeft /></button>
                                <div className="active-user-info">
                                    <div className="avatar-small">{selectedConv.participantName?.[0]}</div>
                                    <div>
                                        <div className="active-name">{selectedConv.participantName}</div>
                                        <div className="active-status">
                                            <div className="status-indicator online" /> Online
                                            {selectedConv.participantRole && <span className="role-tag">{selectedConv.participantRole}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button className="icon-btn"><Phone size={20}/></button>
                                    <button className="icon-btn"><Video size={20}/></button>
                                    <button className="icon-btn"><MoreVertical size={20}/></button>
                                </div>
                            </div>

                            <div className="chat-messages-area">
                                <div className="trust-banner"><ShieldCheck size={14} /> End-to-end encrypted technical communication</div>
                                {historyLoading && localMessages.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" /></div>
                                ) : localMessages.map((m, i) => {
                                    const isMe = String(m.senderId) === String(userId);
                                    const showDate = i === 0 || moment(m.createdAt).format('YYYY-MM-DD') !== moment(localMessages[i-1].createdAt).format('YYYY-MM-DD');
                                    return (
                                        <React.Fragment key={i}>
                                            {showDate && (
                                                <div className="date-separator">
                                                    <span>{moment(m.createdAt).calendar(null, { sameDay: '[Today]', lastDay: '[Yesterday]', lastWeek: 'dddd', sameElse: 'MMMM Do, YYYY' })}</span>
                                                </div>
                                            )}
                                            <div className={`msg-wrapper ${isMe ? 'msg-me' : 'msg-them'}`}>
                                                {!isMe && <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '8px' }}>{m.senderName}</div>}
                                                <div className="msg-bubble">
                                                    {m.content}
                                                    <div className="msg-meta">{moment(m.createdAt).format('h:mm A')} {isMe && <CheckCheck size={14} className="msg-status" />}</div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                                <input placeholder="Type your message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                                <button type="submit" className="send-btn" disabled={!newMessage.trim()}><Send size={20} /></button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <div className="placeholder-content">
                                <div className="placeholder-icon"><MessageSquare size={64} color="var(--primary)" strokeWidth={1.5} /></div>
                                <h2>Operational Command Hub</h2>
                                <p>Select a participant from the left to start a real-time secure conversation.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .messaging-hub { display: flex; height: calc(100vh - 120px); background: white; border-radius: 24px; border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-lg); }
                .conv-list-pane { width: 380px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: #fdfdfe; }
                .pane-header { padding: 24px; border-bottom: 1px solid var(--border-light); }
                .search-bar-mini { margin-top: 16px; background: var(--surface-muted); padding: 0 16px; border-radius: 12px; display: flex; align-items: center; gap: 10px; border: 1.5px solid transparent; transition: all 0.2s; }
                .search-bar-mini:focus-within { border-color: var(--primary); background: white; }
                .search-bar-mini input { border: none; background: transparent; padding: 10px 0; width: 100%; outline: none; font-weight: 600; font-size: 14px; }
                .conv-scroll-area { flex: 1; overflow-y: auto; }
                .conv-item { display: flex; gap: 16px; padding: 16px 24px; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid var(--border-light); position: relative; }
                .conv-item:hover { background: var(--surface-muted); }
                .conv-item.active { background: var(--primary-light); border-left: 4px solid var(--primary); }
                .conv-avatar { width: 52px; height: 52px; border-radius: 16px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; position: relative; }
                .unread-dot { position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: var(--error); border-radius: 50%; border: 2px solid white; }
                .conv-info { flex: 1; min-width: 0; }
                .conv-top-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .conv-name { font-weight: 800; color: var(--text-h); font-size: 15px; }
                .conv-time { font-size: 12px; color: var(--text-muted); font-weight: 600; }
                .conv-snippet { font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .unread-badge { background: var(--primary); color: white; border-radius: 10px; padding: 2px 8px; font-size: 11px; font-weight: 800; }
                .chat-pane { flex: 1; display: flex; flex-direction: column; background: white; }
                .chat-header-main { display: flex; justify-content: space-between; align-items: center; }
                .active-user-info { display: flex; align-items: center; gap: 16px; }
                .avatar-small { width: 40px; height: 40px; border-radius: 12px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; }
                .active-name { font-weight: 800; font-size: 16px; color: var(--text-h); }
                .active-status { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-weight: 600; }
                .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
                .status-indicator.online { background: var(--success); }
                .role-tag { margin-left: 8px; background: var(--surface-muted); padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                .chat-messages-area { flex: 1; padding: 24px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 16px; }
                .trust-banner { align-self: center; background: white; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; color: var(--text-muted); display: flex; align-items: center; gap: 8px; border: 1px solid var(--border); margin-bottom: 12px; }
                .msg-wrapper { display: flex; flex-direction: column; max-width: 70%; }
                .msg-me { align-self: flex-end; }
                .msg-them { align-self: flex-start; }
                .msg-bubble { padding: 12px 18px; border-radius: 18px; font-size: 14.5px; line-height: 1.5; font-weight: 500; position: relative; }
                .msg-me .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
                .msg-them .msg-bubble { background: white; color: var(--text-main); border-bottom-left-radius: 4px; box-shadow: var(--shadow-sm); }
                .msg-meta { display: flex; align-items: center; gap: 6px; font-size: 10px; margin-top: 6px; opacity: 0.8; font-weight: 700; }
                .msg-me .msg-meta { justify-content: flex-end; }
                .msg-status { color: #818cf8; }
                .date-separator { align-self: center; margin: 24px 0 8px; position: relative; width: 100%; text-align: center; }
                .date-separator::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--border); z-index: 1; }
                .date-separator span { position: relative; z-index: 2; background: #f8fafc; padding: 4px 16px; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
                .chat-input-wrapper { padding: 24px; border-top: 1px solid var(--border-light); display: flex; gap: 16px; }
                .chat-input-wrapper input { flex: 1; border: 1.5px solid var(--border); padding: 14px 20px; border-radius: 14px; outline: none; font-size: 15px; font-weight: 600; transition: all 0.2s; }
                .chat-input-wrapper input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
                .send-btn { width: 48px; height: 48px; border-radius: 14px; background: var(--primary); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .send-btn:hover { transform: scale(1.05); }
                .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .chat-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
                .placeholder-content { text-align: center; max-width: 400px; padding: 40px; }
                .placeholder-icon { width: 100px; height: 100px; background: white; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: var(--shadow); }
                .placeholder-content h2 { font-weight: 900; margin-bottom: 12px; color: var(--text-h); }
                .placeholder-content p { color: var(--text-muted); line-height: 1.6; font-weight: 500; }
                @media (max-width: 1024px) { .conv-list-pane { width: 320px; } }
                @media (max-width: 768px) { .mobile-hidden { display: none; } .conv-list-pane { width: 100%; border-right: none; } .back-btn { margin-right: 12px; border: none; background: none; } }
            `}</style>
        </Layout>
    );
};

export default MessagesPage;
