import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
    <div className="modern-spinner" style={{ width: size, height: size }}></div>
    <style>{`
      .modern-spinner {
        border: 4px solid #e2e8f0;
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
