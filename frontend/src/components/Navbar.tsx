import React, { useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import api from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setUserProfile } from '../redux/authSlice';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        dispatch(setUserProfile(response.data));
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (!user) {
        fetchProfile();
    }
  }, [dispatch, user]);
  
  const displayName = user?.name || 'Loading...';
  const displayRole = user?.role || '';
  
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search operations..." />
        </div>
      </div>
      
      <div className="navbar-right">
        <button className="nav-icon-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        <div className="user-profile-nav">
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>
          <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', borderRadius: '50%', width: '40px', height: '40px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#4338ca' }}>
              {user?.name && user.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
