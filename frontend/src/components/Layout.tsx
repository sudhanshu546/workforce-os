import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useNetworkStatus } from '../services/sync';
import { useBranding } from '../services/branding';
import { WifiOff } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { forceResetLoading } from '../redux/uiSlice';
import type { RootState } from '../redux/store';
import { LoadingSpinner } from './LoadingSpinner';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);
  const isOnline = useNetworkStatus();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading);
  const dispatch = useDispatch();
  const location = useLocation();
  useBranding();

  // Reset loading state on navigation to ensure UI doesn't stay stuck
  useEffect(() => {
    dispatch(forceResetLoading());
  }, [location.pathname, dispatch]);

  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isLoading) {
          timer = setTimeout(() => setShowDismiss(true), 8000); // 8s timeout
      } else {
          setShowDismiss(false);
      }
      return () => clearTimeout(timer);
  }, [isLoading]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Global Loading Progress Bar (Modern & Non-blocking) */}
      {isLoading && (
        <div className="global-progress-bar">
          <div className="progress-bar-fill" />
        </div>
      )}

      {/* Subtle Bottom Loading Indicator */}
      {isLoading && (
        <div style={{ 
          position: 'fixed', 
          bottom: '24px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '8px 16px',
          borderRadius: '99px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 2000,
          border: '1px solid var(--border)',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <LoadingSpinner size={16} />
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-h)' }}>Synchronizing...</span>
          {showDismiss && (
            <button 
              onClick={() => dispatch(forceResetLoading())}
              style={{ border: 'none', background: 'var(--surface-muted)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '800' }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {!isOnline && (
        <div style={{ background: '#f59e0b', color: 'white', padding: '12px 24px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', position: 'fixed', top: 0, width: '100%', zIndex: 9999 }}>
            <WifiOff size={18} /> OFFLINE MODE ACTIVE
        </div>
      )}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="main-wrapper">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="main-content">
          {children}
        </main>
        <MobileBottomNav />
      </div>

      <style>{`
        .global-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--primary-light);
          z-index: 10000;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--primary);
          animation: progressIndeterminate 2s infinite ease-in-out;
          width: 30%;
        }
        @keyframes progressIndeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(300%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};
