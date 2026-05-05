import React from 'react';
import { 
  Users, Briefcase, Clock, LayoutDashboard, 
  UserCircle, FileText, Settings, LogOut, HardHat, CheckSquare,
  MapPin, Tag, X, Receipt
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  
  // Basic role check from localStorage (in production, use a secure AuthContext)
  const role = localStorage.getItem('role') || 'WORKER';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <HardHat size={28} />
          <span>Workforce OS</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}><LayoutDashboard size={20} /> Dashboard</Link>
        
        {role === 'OWNER' && (
          <>
            <div className="sidebar-section-title">OPERATIONS</div>
            <Link to="/leads" className={`nav-item ${isActive('/leads') ? 'active' : ''}`}><Briefcase size={20} /> Leads</Link>
            <Link to="/quotations" className={`nav-item ${isActive('/quotations') ? 'active' : ''}`}><FileText size={20} /> Quotations</Link>
            <Link to="/work-orders" className={`nav-item ${isActive('/work-orders') ? 'active' : ''}`}><Briefcase size={20} /> Work Orders</Link>
            <Link to="/services" className={`nav-item ${isActive('/services') ? 'active' : ''}`}><Tag size={20} /> Services</Link>
            
            <div className="sidebar-section-title">WORKFORCE</div>
            <Link to="/workers" className={`nav-item ${isActive('/workers') ? 'active' : ''}`}><Users size={20} /> Team</Link>
            <Link to="/attendance" className={`nav-item ${isActive('/attendance') ? 'active' : ''}`}><Clock size={20} /> Attendance</Link>
            <Link to="/invoices" className={`nav-item ${isActive('/invoices') ? 'active' : ''}`}><Receipt size={20} /> Invoices</Link>
            
            <div className="sidebar-section-title">SYSTEM</div>
            <Link to="/profile" className="nav-item"><UserCircle size={20} /> Profile</Link>
            <Link to="/settings" className="nav-item"><Settings size={20} /> Settings</Link>
          </>
        )}
        
        {role === 'WORKER' && (
          <Link to="/tasks" className={`nav-item ${isActive('/tasks') ? 'active' : ''}`}><CheckSquare size={20} /> My Tasks</Link>
        )}

        {role === 'CUSTOMER' && (
          <>
            <Link to="/customer/profile" className={`nav-item ${isActive('/customer/profile') ? 'active' : ''}`}><UserCircle size={20} /> My Profile</Link>
            <Link to="/customer/addresses" className={`nav-item ${isActive('/customer/addresses') ? 'active' : ''}`}><MapPin size={20} /> My Addresses</Link>
          </>
        )}
      </nav>
      <div style={{ padding: '20px' }}>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};
