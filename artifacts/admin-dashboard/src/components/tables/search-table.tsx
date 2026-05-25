"use client";

import { Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export interface SearchTableProps<T> {
  title: string;
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  searchKey: keyof T;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
}

export function SearchTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  searchKey,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
}: SearchTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
          >
            + Add New
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400">No data found</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-6 py-4 text-left text-sm font-semibold text-white"
                    >
                      {col.label}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-700/50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-6 py-4 text-sm text-slate-300"
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key])}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="text-primary hover:text-blue-300 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
