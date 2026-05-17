import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useNetworkStatus } from '../services/sync';
import { WifiOff } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isOnline = useNetworkStatus();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-layout">
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
