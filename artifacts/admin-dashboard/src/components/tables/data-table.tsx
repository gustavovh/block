export type SortingState = "asc" | "desc" | null;

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (column: keyof T, direction: SortingState) => void;
  selectedRows?: (keyof T)[];
  onRowSelect?: (id: any) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  onSort,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50 border-b border-slate-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-4 text-left text-sm font-semibold text-white"
                  style={{ width: column.width }}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() =>
                        onSort(column.key, "asc")
                      }
                      className="hover:text-primary transition-colors"
                    >
                      {column.header}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4">
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
