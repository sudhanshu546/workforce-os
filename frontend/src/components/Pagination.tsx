import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', padding: '16px' }}>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 0}
        style={{ background: 'none', border: 'none', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', color: currentPage === 0 ? 'var(--text-muted)' : 'var(--primary)' }}
      >
        <ChevronLeft size={24} />
      </button>
      
      <span style={{ fontSize: '14px', fontWeight: '600' }}>
        Page {currentPage + 1} of {totalPages}
      </span>

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages - 1}
        style={{ background: 'none', border: 'none', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer', color: currentPage >= totalPages - 1 ? 'var(--text-muted)' : 'var(--primary)' }}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
