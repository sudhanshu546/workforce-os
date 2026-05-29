import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useNetworkStatus } from '../services/sync';
import { useBranding } from '../services/branding';
import { WifiOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { LoadingSpinner } from './LoadingSpinner';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isOnline = useNetworkStatus();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading);
  useBranding();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {isLoading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          background: 'rgba(255,255,255,0.7)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 999999 
        }}>
          <LoadingSpinner size={60} />
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
    </div>
  );
};
