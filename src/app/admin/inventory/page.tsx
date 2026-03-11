'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, TrendingDown, AlertTriangle, RefreshCw, Plus, Minus, History, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

interface StockItem {
  id: number;
  product_id: number;
  product_name: string;
  product_type: string;
  sku: string;
  sale_unit_label: string;
  quantity_on_hand: number;
  reorder_threshold: number;
  reorder_quantity: number;
  last_updated: string;
}

interface Transaction {
  id: number;
  type: 'restock' | 'sale' | 'return' | 'adjustment' | 'wastage';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  notes: string;
  performed_by: string;
  created_at: string;
}

const TYPE_COLOR: Record<string, string> = {
  restock: 'badge-green',
  sale: 'badge-sky',
  return: 'badge-amber',
  adjustment: 'badge-primary',
  wastage: 'badge-red',
};

function toArr<T>(r: unknown): T[] {
  if (Array.isArray(r)) return r as T[];
  const x = r as Record<string, unknown>;
  return Array.isArray(x?.data) ? (x.data as T[]) : [];
}

export default function InventoryPage() {
  const [items, setItems]       = useState<StockItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<'all' | 'low' | 'out'>('all');
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [modalType, setModalType] = useState<'adjust' | 'history' | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'restock' | 'adjustment' | 'wastage'>('restock');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [saving, setSaving]     = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(toArr<StockItem>(await adminApi.inventory.list())); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(item => {
    const matchSearch = !search ||
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? item.quantity_on_hand > 0 && item.quantity_on_hand <= item.reorder_threshold :
      filter === 'out' ? item.quantity_on_hand <= 0 : true;
    return matchSearch && matchFilter;
  });

  const lowStock  = items.filter(i => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.reorder_threshold).length;
  const outOfStock = items.filter(i => i.quantity_on_hand <= 0).length;

  const openAdjust = (item: StockItem) => {
    setSelected(item);
    setAdjustQty(0);
    setAdjustType('restock');
    setAdjustNotes('');
    setModalType('adjust');
  };

  const openHistory = async (item: StockItem) => {
    setSelected(item);
    setModalType('history');
    try { setTransactions(toArr<Transaction>(await adminApi.inventory.transactions(item.id))); }
    catch { setTransactions([]); }
  };

  const handleAdjust = async () => {
    if (!selected || adjustQty === 0) return;
    setSaving(true);
    try {
      await adminApi.inventory.adjust(selected.id, {
        type: adjustType,
        quantity: adjustType === 'adjustment' || adjustType === 'wastage' ? -Math.abs(adjustQty) : Math.abs(adjustQty),
        notes: adjustNotes,
      });
    } catch { /* ignore */ }
    // Update local state optimistically
    setItems(prev => prev.map(i => i.id === selected.id ? {
      ...i,
      quantity_on_hand: adjustType === 'restock'
        ? i.quantity_on_hand + Math.abs(adjustQty)
        : i.quantity_on_hand - Math.abs(adjustQty),
    } : i));
    setSaving(false);
    setModalType(null);
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stockLevel = (qty: number, threshold: number) => {
    if (qty <= 0)         return { label: 'Out of Stock', cls: 'badge-red' };
    if (qty <= threshold) return { label: 'Low Stock',    cls: 'badge-amber' };
    return                       { label: 'In Stock',     cls: 'badge-green' };
  };

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        subtitle="Monitor stock levels, adjust quantities and view transaction history."
        actions={
          <button className="admin-btn admin-btn-primary" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total SKUs',   value: items.length,  icon: Package,       color: 'var(--color-a-green)' },
          { label: 'Low Stock',    value: lowStock,       icon: TrendingDown,  color: '#F59E0B' },
          { label: 'Out of Stock', value: outOfStock,     icon: AlertTriangle, color: '#EF4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-a-text)' }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-a-text-muted)' }} />
          <input
            className="admin-input"
            placeholder="Search by name or SKU…"
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {(['all','low','out'] as const).map(f => (
          <button
            key={f}
            className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'low' ? `Low Stock (${lowStock})` : `Out of Stock (${outOfStock})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit</th>
              <th>On Hand</th>
              <th>Threshold</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j}><div className="admin-skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--color-a-text-muted)' }}>No items found</td></tr>
            ) : filtered.map((item, idx) => {
              const level = stockLevel(item.quantity_on_hand, item.reorder_threshold);
              const expanded = expandedRows.has(item.id);
              return (
                <>
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleRow(item.id)}
                  >
                    <td>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-a-text-muted)', padding: 0, display: 'flex' }}>
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{item.product_type}</div>
                    </td>
                    <td><code style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{item.sku}</code></td>
                    <td style={{ fontSize: 12 }}>{item.sale_unit_label}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 15, color: item.quantity_on_hand <= 0 ? '#EF4444' : item.quantity_on_hand <= item.reorder_threshold ? '#F59E0B' : 'var(--color-a-text)' }}>
                        {item.quantity_on_hand}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{item.reorder_threshold}</td>
                    <td><span className={`admin-badge ${level.cls}`}>{level.label}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>
                      {new Date(item.last_updated).toLocaleDateString()}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openAdjust(item)}>
                          <Plus size={12} /> Adjust
                        </button>
                        <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openHistory(item)}>
                          <History size={12} /> History
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expanded && (
                      <motion.tr
                        key={`${item.id}-expand`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={9} style={{ background: 'var(--color-a-surface-2)', padding: '12px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, fontSize: 12 }}>
                            <div>
                              <div style={{ color: 'var(--color-a-text-muted)', marginBottom: 2 }}>Reorder Qty</div>
                              <div style={{ fontWeight: 600 }}>{item.reorder_quantity} units</div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--color-a-text-muted)', marginBottom: 2 }}>Product Type</div>
                              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.product_type}</div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--color-a-text-muted)', marginBottom: 2 }}>Stock Value (est.)</div>
                              <div style={{ fontWeight: 600 }}>—</div>
                            </div>
                            <div>
                              <button className="admin-btn admin-btn-primary" style={{ padding: '6px 14px', fontSize: 11 }} onClick={() => openAdjust(item)}>
                                Quick Restock
                              </button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      <AdminModal
        open={modalType === 'adjust'}
        onClose={() => setModalType(null)}
        title={`Adjust Stock — ${selected?.product_name}`}
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleAdjust} disabled={saving || adjustQty === 0}>
              {saving ? 'Saving…' : 'Apply Adjustment'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-a-surface-2)', display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>Current Stock</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{selected?.quantity_on_hand ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>After Adjustment</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-a-green)' }}>
                {adjustType === 'restock'
                  ? (selected?.quantity_on_hand ?? 0) + Math.abs(adjustQty)
                  : Math.max(0, (selected?.quantity_on_hand ?? 0) - Math.abs(adjustQty))}
              </div>
            </div>
          </div>

          <div>
            <label className="admin-label">Adjustment Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {(['restock','adjustment','wastage'] as const).map(t => (
                <button
                  key={t}
                  className={`admin-btn ${adjustType === t ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                  style={{ textTransform: 'capitalize', padding: '8px' }}
                  onClick={() => setAdjustType(t)}
                >
                  {t === 'restock' ? <><Plus size={13} /> Restock</> : t === 'adjustment' ? <><Minus size={13} /> Adjust</> : <><Minus size={13} /> Wastage</>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="admin-label">Quantity</label>
            <input
              className="admin-input"
              type="number"
              min="1"
              value={adjustQty || ''}
              onChange={e => setAdjustQty(Math.abs(parseInt(e.target.value) || 0))}
              placeholder="Enter quantity…"
            />
          </div>

          <div>
            <label className="admin-label">Notes</label>
            <textarea
              className="admin-input"
              rows={2}
              value={adjustNotes}
              onChange={e => setAdjustNotes(e.target.value)}
              placeholder="Reason for adjustment…"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </AdminModal>

      {/* Transaction History Modal */}
      <AdminModal
        open={modalType === 'history'}
        onClose={() => setModalType(null)}
        title={`Transaction History — ${selected?.product_name}`}
        size="lg"
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Before</th>
              <th>After</th>
              <th>Notes</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td style={{ fontSize: 11 }}>{new Date(tx.created_at).toLocaleString()}</td>
                <td><span className={`admin-badge ${TYPE_COLOR[tx.type]}`} style={{ textTransform: 'capitalize' }}>{tx.type}</span></td>
                <td>
                  <span style={{ fontWeight: 700, color: tx.quantity > 0 ? 'var(--color-a-green)' : '#EF4444' }}>
                    {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{tx.quantity_before}</td>
                <td style={{ fontSize: 12 }}>{tx.quantity_after}</td>
                <td style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{tx.notes || '—'}</td>
                <td style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{tx.performed_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminModal>
    </>
  );
}
