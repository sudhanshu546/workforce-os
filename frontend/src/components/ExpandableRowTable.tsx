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
        .row-active td { background-color: var(--primary-light) !important; color: var(--primary); font-weight: 700; }
        .expanded-cell { padding: 0 !important; background-color: var(--surface-muted); }
        .expanded-content-anim { padding: 32px; animation: slideDown 0.3s ease-out; border-bottom: 2px solid var(--primary); }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .action-toggle { text-align: right; padding-right: 20px !important; color: var(--text-muted); }
        .row-active .action-toggle { color: var(--primary); }
      `}</style>
    </div>
  );
}
