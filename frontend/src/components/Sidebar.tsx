import { 
  Users, Briefcase, Clock, LayoutDashboard, 
  UserCircle, FileText, Settings, LogOut, HardHat, CheckSquare,
  MapPin, Tag, X, Receipt, Package, TrendingUp, Calendar as CalendarIcon, Map,
  IndianRupee, MessageSquare
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { STORAGE_KEYS, ROLES } from '../utils/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  
  const role = localStorage.getItem(STORAGE_KEYS.ROLE) || ROLES.WORKER;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
        <div className="sidebar-logo">
          <div style={{ background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '10px', display: 'flex' }}>
            <HardHat size={22} />
          </div>
          <span style={{ color: 'var(--text-h)', fontWeight: '900', letterSpacing: '-0.03em' }}>Workforce<span style={{ color: 'var(--primary)' }}>OS</span></span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} style={{ display: 'none' }}>
          <X size={24} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={18} /> <span>Dashboard Overview</span>
        </Link>
        
        {(role === ROLES.OWNER || role === ROLES.MANAGER) && (
          <>
            <div className="sidebar-section-title">Field Operations</div>
            <Link to="/live-ops" className={`nav-item ${isActive('/live-ops') ? 'active' : ''}`} onClick={onClose}><Map size={18} /> <span>Live Tracking</span></Link>
            <Link to="/work-orders" className={`nav-item ${isActive('/work-orders') ? 'active' : ''}`} onClick={onClose}><Briefcase size={18} /> <span>Service Orders</span></Link>
            <Link to="/calendar" className={`nav-item ${isActive('/calendar') ? 'active' : ''}`} onClick={onClose}><CalendarIcon size={18} /> <span>Job Scheduler</span></Link>
            
            <div className="sidebar-section-title">Sales Desk</div>
            <Link to="/leads" className={`nav-item ${isActive('/leads') ? 'active' : ''}`} onClick={onClose}><CheckSquare size={18} /> <span>Leads & Inquiries</span></Link>
            <Link to="/quotations" className={`nav-item ${isActive('/quotations') ? 'active' : ''}`} onClick={onClose}><FileText size={18} /> <span>Quotes & Estimates</span></Link>
            
            <div className="sidebar-section-title">Resources</div>
            <Link to="/workers" className={`nav-item ${isActive('/workers') ? 'active' : ''}`} onClick={onClose}><Users size={18} /> <span>Field Staff</span></Link>
            <Link to="/inventory" className={`nav-item ${isActive('/inventory') ? 'active' : ''}`} onClick={onClose}><Package size={18} /> <span>Stock & Inventory</span></Link>
            <Link to="/services" className={`nav-item ${isActive('/services') ? 'active' : ''}`} onClick={onClose}><Tag size={18} /> <span>Service Catalog</span></Link>
            
            <div className="sidebar-section-title">Finance & Payroll</div>
            <Link to="/invoices" className={`nav-item ${isActive('/invoices') ? 'active' : ''}`} onClick={onClose}><Receipt size={18} /> <span>Billing / Invoices</span></Link>
            <Link to="/finance/expenses" className={`nav-item ${isActive('/finance/expenses') ? 'active' : ''}`} onClick={onClose}><IndianRupee size={18} /> <span>Expense Claims</span></Link>
            <Link to="/finance/payroll" className={`nav-item ${isActive('/finance/payroll') ? 'active' : ''}`} onClick={onClose}><LogOut size={18} style={{ transform: 'rotate(90deg)' }} /> <span>Staff Payroll</span></Link>
            <Link to="/attendance" className={`nav-item ${isActive('/attendance') ? 'active' : ''}`} onClick={onClose}><Clock size={18} /> <span>Staff Attendance</span></Link>
          </>
        )}
        
        {role === ROLES.WORKER && (
          <Link to="/tasks" className={`nav-item ${isActive('/tasks') ? 'active' : ''}`} onClick={onClose}><CheckSquare size={20} /> My Tasks</Link>
        )}

        {role === ROLES.CUSTOMER && (
          <>
            <Link to="/customer/profile" className={`nav-item ${isActive('/customer/profile') ? 'active' : ''}`} onClick={onClose}><UserCircle size={20} /> My Profile</Link>
            <Link to="/customer/orders" className={`nav-item ${isActive('/customer/orders') ? 'active' : ''}`} onClick={onClose}><Briefcase size={20} /> My Orders</Link>
            <Link to="/customer/addresses" className={`nav-item ${isActive('/customer/addresses') ? 'active' : ''}`} onClick={onClose}><MapPin size={20} /> My Addresses</Link>
            <Link to="/support" className={`nav-item ${isActive('/support') ? 'active' : ''}`} onClick={onClose}><MessageSquare size={20} /> Support Center</Link>
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
