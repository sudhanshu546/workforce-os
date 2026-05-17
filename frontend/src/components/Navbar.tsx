import React, { useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import api from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setUserProfile } from '../redux/authSlice';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data: any = await api.get('/auth/profile');
        dispatch(setUserProfile(data));
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (!user) {
        fetchProfile();
    }
  }, [dispatch, user]);
  
  const displayName = user?.name || 'User';
  const displayRole = user?.role || '';
  
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <Menu size={24} />
        </button>
        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-muted)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', width: '300px' }}>
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Quick find..." style={{ border: 'none', background: 'transparent', padding: '10px 8px', width: '100%', fontSize: '14px', outline: 'none' }} />
        </div>
      </div>
      
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <NotificationCenter />
        <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--border)' }}>
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span className="user-name" style={{ fontWeight: '800', color: 'var(--text-h)', fontSize: '14px' }}>{displayName}</span>
            <span className="user-role" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{displayRole}</span>
          </div>
          <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-light)', borderRadius: '12px', width: '40px', height: '40px', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
