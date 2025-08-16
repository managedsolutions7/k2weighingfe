import type { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  emptyText?: string;
}

function DataTable<T>({
  columns,
  data,
  keyField,
  emptyText = 'No records found',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-[700px] w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-3 py-2 font-semibold ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-gray-500">
                {emptyText}
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr
              key={
                keyField
                  ? String(
                      (row as unknown as Record<string, unknown>)[keyField as unknown as string],
                    )
                  : idx
              }
              className="border-t"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-3 py-2 ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
