import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T | string) => void;
  sortKey?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  loading = false,
  emptyMessage = 'Nenhum item encontrado'
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edp-electric mx-auto"></div>
          <p className="mt-4 text-edp-neutral-medium font-edp">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-edp-neutral-lighter">
          {/* Header */}
          <thead className="bg-edp-neutral-white-wash">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-edp font-semibold text-edp-neutral-dark uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-edp-neutral-white-tint' : ''
                  } ${column.width ? `w-${column.width}` : ''}`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <svg
                        className={`w-3 h-3 transition-transform ${
                          sortKey === column.key && sortDirection === 'desc' ? 'rotate-180' : ''
                        } ${
                          sortKey === column.key ? 'text-edp-electric' : 'text-edp-neutral-medium'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-edp-neutral-lighter">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <p className="text-edp-neutral-medium font-edp">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-edp-neutral-white-wash transition-colors">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm font-edp text-edp-neutral-darkest">
                      {column.render 
                        ? column.render(item[column.key as keyof T], item)
                        : String(item[column.key as keyof T] || '-')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}