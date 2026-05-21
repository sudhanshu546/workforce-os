import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({ 
  size = 40, 
  color = 'var(--primary)' 
}) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '40px',
    gap: '16px'
  }}>
    <div className="spinner-container" style={{ width: size, height: size }}>
      <div className="spinner-ring"></div>
      <div className="spinner-core"></div>
    </div>
    <span style={{ 
      fontSize: '14px', 
      fontWeight: 600, 
      color: 'var(--text-muted)',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }}>
      Loading...
    </span>
    <style>{`
      .spinner-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .spinner-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 4px solid #e2e8f0;
        border-top: 4px solid ${color};
        border-radius: 50%;
        animation: premium-spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      .spinner-core {
        width: 25%;
        height: 25%;
        background-color: ${color};
        border-radius: 50%;
        opacity: 0.3;
        animation: pulse 1.5s ease-in-out infinite;
      }
      @keyframes premium-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0.6; }
      }
    `}</style>
  </div>
);
