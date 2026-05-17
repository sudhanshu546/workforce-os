import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Clock, MessageSquare, 
  UserCircle, Briefcase, Receipt, Tag, Map
} from 'lucide-react';
import { STORAGE_KEYS, ROLES } from '../utils/constants';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const role = localStorage.getItem(STORAGE_KEYS.ROLE) || ROLES.WORKER;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>Home</span>
      </Link>

      {(role === ROLES.OWNER || role === ROLES.MANAGER) && (
        <>
          <Link to="/live-ops" className={`bottom-nav-item ${isActive('/live-ops') ? 'active' : ''}`}>
            <Map size={22} />
            <span>Map</span>
          </Link>
          <Link to="/leads" className={`bottom-nav-item ${isActive('/leads') ? 'active' : ''}`}>
            <Briefcase size={22} />
            <span>Leads</span>
          </Link>
        </>
      )}

      {role === ROLES.WORKER && (
        <Link to="/tasks" className={`bottom-nav-item ${isActive('/tasks') ? 'active' : ''}`}>
          <CheckSquare size={22} />
          <span>Jobs</span>
        </Link>
      )}

      {role === ROLES.CUSTOMER && (
        <Link to="/customer/orders" className={`bottom-nav-item ${isActive('/customer/orders') ? 'active' : ''}`}>
          <Briefcase size={22} />
          <span>Orders</span>
        </Link>
      )}

      {(role === ROLES.OWNER || role === ROLES.MANAGER || role === ROLES.WORKER) && (
        <Link to="/attendance" className={`bottom-nav-item ${isActive('/attendance') ? 'active' : ''}`}>
          <Clock size={22} />
          <span>Clock</span>
        </Link>
      )}

      {role === ROLES.CUSTOMER && (
        <Link to="/customer/profile" className={`bottom-nav-item ${isActive('/customer/profile') ? 'active' : ''}`}>
          <UserCircle size={22} />
          <span>Profile</span>
        </Link>
      )}
      
      {role !== ROLES.CUSTOMER && (
        <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <UserCircle size={22} />
          <span>Profile</span>
        </Link>
      )}
    </nav>
  );
};
