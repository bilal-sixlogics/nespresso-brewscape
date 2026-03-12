'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render: (row: T) => React.ReactNode;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ElementType;
  variant?: 'default' | 'danger';
  onClick: (row: T) => void;
  hide?: (row: T) => boolean;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  actions?: TableAction<T>[];
  keyFn: (row: T) => string | number;
  loading?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function AdminDataTable<T>({
  data, columns, actions, keyFn,
  loading, pageSize = 15,
  searchable = true, searchPlaceholder = 'Search…',
  emptyTitle = 'No records found',
  emptySubtitle = 'Try adjusting your search or filters.',
  toolbar,
  onRowClick,
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = (row as Record<string, unknown>)[col.key];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] ?? '';
      const bv = (b as Record<string, unknown>)[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  // Skeleton rows
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="admin-table-wrap">
      {/* Toolbar */}
      <div className="admin-table-toolbar">
        {searchable && (
          <div className="admin-search-input">
            <Search size={14} style={{ color: 'var(--a-text-dim)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}
        {toolbar}
        {filtered.length !== data.length && (
          <span style={{ fontSize: 12, color: 'var(--a-text-muted)' }}>
            {filtered.length} of {data.length}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th style={{ width: 60 }}>
                  <SlidersHorizontal size={12} />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? skeletonRows.map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        <div
                          className="admin-skeleton"
                          style={{ height: 14, width: `${60 + Math.random() * 30}%` }}
                        />
                      </td>
                    ))}
                    {actions && <td />}
                  </tr>
                ))
              : paged.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon">
                        <Search size={22} />
                      </div>
                      <div className="admin-empty-title">{emptyTitle}</div>
                      <div className="admin-empty-sub">{emptySubtitle}</div>
                    </div>
                  </td>
                </tr>
              )
              : paged.map((row, idx) => (
                  <motion.tr
                    key={keyFn(row)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.025 }}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>{col.render(row)}</td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {actions
                            .filter((a) => !a.hide?.(row))
                            .map((action) => {
                              const ActionIcon = action.icon;
                              return (
                                <button
                                  key={action.label}
                                  className={`admin-btn admin-btn-ghost ${action.variant === 'danger' ? 'admin-btn-danger' : ''}`}
                                  style={{ padding: '4px 8px', fontSize: 12 }}
                                  onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                                  title={action.label}
                                >
                                  {ActionIcon && <ActionIcon size={13} />}
                                  <span className="hidden sm:inline">{action.label}</span>
                                </button>
                              );
                            })}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="admin-pagination">
          <span style={{ fontSize: 12, color: 'var(--a-text-muted)', marginRight: 8 }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="admin-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button
                key={pg}
                className={`admin-page-btn ${pg === page ? 'active' : ''}`}
                onClick={() => setPage(pg)}
              >
                {pg}
              </button>
            );
          })}
          <button
            className="admin-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
