import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Info, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const user = useSelector((state: any) => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        if (user?.id) {
            const socket = new SockJS(import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws-workforce');
            const stompClient = Stomp.over(socket);
            stompClient.debug = () => {}; // Disable logging

            stompClient.connect({}, () => {
                stompClient.subscribe(`/topic/notifications/${user.id}`, () => {
                    fetchNotifications();
                    fetchUnreadCount();
                });
            });

            return () => {
                if (stompClient.connected) stompClient.disconnect(() => {});
            };
        }
    }, [user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data: any = await api.get('/notifications?size=5');
            setNotifications(data.content || []);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data: any = await api.get('/notifications/unread-count');
            setUnreadCount(data || 0);
        } catch (err) {
            console.error('Failed to fetch unread count');
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const handleNotificationClick = async (n: any) => {
        if (!n.read) {
            try {
                await api.patch(`/notifications/${n.id}/read`);
                fetchUnreadCount();
            } catch (err) {}
        }
        setIsOpen(false);
        if (n.route) navigate(n.route);
    };

    return (
        <div className="notification-center-container" ref={dropdownRef}>
            <button className="nav-icon-btn" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="btn-text" onClick={markAllRead}>Mark all read</button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <Info size={32} className="text-muted" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="notification-icon-box">
                                        {n.title.includes('Job') ? <CheckCircle2 size={16} color="var(--success)" /> : <Clock size={16} color="var(--primary)" />}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{n.title}</div>
                                        <div className="notification-body">{n.body}</div>
                                        <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                                    </div>
                                    {!n.read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="notification-footer">
                        <button className="btn-text" style={{ width: '100%' }}>View all activity</button>
                    </div>
                </div>
            )}

            <style>{`
                .notification-center-container { position: relative; }
                .notification-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 360px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    border: 1px solid var(--border);
                    margin-top: 12px;
                    z-index: 1000;
                    overflow: hidden;
                    animation: slideDown 0.2s ease-out;
                }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                
                .notification-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-header h3 { font-size: 16px; fontWeight: 800; }
                
                .notification-list { max-height: 400px; overflow-y: auto; }
                .notification-item {
                    padding: 16px 20px;
                    display: flex;
                    gap: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f1f5f9;
                    position: relative;
                }
                .notification-item:hover { background: #f8fafc; }
                .notification-item.unread { background: #f0f4ff; }
                .notification-item.unread:hover { background: #eef2ff; }
                
                .notification-icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border: 1px solid #e2e8f0;
                }
                
                .notification-content { flex: 1; min-width: 0; }
                .notification-title { font-size: 14px; font-weight: 800; color: var(--text-h); margin-bottom: 2px; }
                .notification-body { font-size: 13px; color: var(--text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .notification-time { font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 600; }
                
                .unread-dot {
                    width: 8px; height: 8px; background: var(--primary); border-radius: 50%;
                    position: absolute; right: 12px; top: 12px;
                }
                
                .empty-notifications { padding: 40px 20px; text-align: center; color: var(--text-muted); }
                .notification-footer { padding: 12px; border-top: 1px solid var(--border); text-align: center; }

                @media (max-width: 768px) {
                    .notification-dropdown {
                        position: fixed;
                        top: 60px;
                        left: 10px;
                        right: 10px;
                        width: auto;
                    }
                }
            `}</style>
        </div>
    );
};
