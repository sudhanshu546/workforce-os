import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface ExpandableRowTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderExpanded: (item: T) => React.ReactNode;
  loading?: boolean;
}

export function ExpandableRowTable<T extends { id: string | number }>({
  data,
  columns,
  renderExpanded,
  loading
}: ExpandableRowTableProps<T>) {
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);

  const toggleRow = (id: string | number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  if (loading) {
    return (
        <div className="premium-table-container" style={{ padding: '60px 0' }}>
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <div className="premium-table-container">
      <div className="table-responsive-wrapper">
        <table className="premium-table zebra-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                  onClick={() => toggleRow(item.id)} 
                  className={expandedRowId === item.id ? 'row-active' : ''}
                >
                  {columns.map((col, idx) => (
                    <td key={idx}>{col.accessor(item)}</td>
                  ))}
                  <td className="action-toggle">
                    {expandedRowId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </td>
                </tr>
                {expandedRowId === item.id && (
                  <tr>
                    <td colSpan={columns.length + 1} className="expanded-cell">
                      <div className="expanded-content-anim">
                        {renderExpanded(item)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .row-active td { 
          background-color: var(--primary-light) !important; 
          color: var(--primary); 
          font-weight: 800;
          border-bottom-color: transparent;
        }
        .row-active {
          box-shadow: inset 6px 0 0 0 var(--primary);
        }
        .expanded-cell { 
          padding: 0 !important; 
          background-color: #f8fafc;
        }
        .expanded-content-anim { 
          padding: 40px; 
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
          border-bottom: 4px solid var(--primary);
          box-shadow: inset 0 8px 12px -8px rgba(0, 0, 0, 0.1), inset 0 -8px 12px -8px rgba(0, 0, 0, 0.1);
          position: relative;
          background: white;
          margin: 0 12px 12px;
          border-radius: 0 0 16px 16px;
        }
        .expanded-content-anim::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: var(--primary);
          opacity: 0.8;
          border-radius: 0 0 0 6px;
        }

        @keyframes slideDown { 
          from { opacity: 0; transform: translateY(-20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        .action-toggle { 
          text-align: right; 
          padding-right: 24px !important; 
          color: var(--text-muted);
          transition: transform 0.3s ease;
        }
        .row-active .action-toggle { 
          color: var(--primary);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
