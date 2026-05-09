import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'flex-start', // Align to top for "below navbar" feel
      justifyContent: 'center',
      zIndex: 1000,
      padding: '80px 20px 20px 20px', // Top padding to push below navbar
      overflowY: 'auto' // Handle scroll at backdrop level
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '24px',
        borderRadius: '20px', // More premium radius
        width: '100%',
        maxWidth: width || '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        maxHeight: 'calc(100vh - 120px)', // Ensure content fits in viewport
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-h)' }}>{title}</h2>
          <button onClick={onClose} style={{ 
            background: '#f1f5f9', 
            border: 'none', 
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'all 0.2s'
          }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ 
            overflowY: 'auto', // Scrollable content area
            flex: 1,
            paddingRight: '4px' // Space for scrollbar
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
