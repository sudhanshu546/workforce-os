import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalElements, 
  onPageChange 
}) => {
  if (totalElements === 0) return null;

  const startRecord = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) pages.push(-1); // Ellipsis
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) pages.push(-2); // Ellipsis
      
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '16px' }}>
      <div className="pagination-info" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600', minWidth: 'fit-content' }}>
        Showing <span style={{ color: 'var(--text-h)', fontWeight: '800' }}>{startRecord}-{endRecord}</span> of <span style={{ color: 'var(--text-h)', fontWeight: '800' }}>{totalElements}</span> records
      </div>

      <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 0}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getPageNumbers().map((page, index) => {
            if (page < 0) {
              return (
                <div key={`ellipsis-${index}`} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '0 4px' }}>
                  <MoreHorizontal size={16} />
                </div>
              );
            }
            return (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        <button 
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages - 1}
          title="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="pagination-page-info" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
        Page <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{currentPage + 1}</span> of <span style={{ fontWeight: '800' }}>{totalPages}</span>
      </div>
    </div>
  );
};
