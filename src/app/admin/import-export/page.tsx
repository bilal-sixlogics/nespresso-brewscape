'use client';

import { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { motion, AnimatePresence } from 'framer-motion';

type Status = 'idle' | 'running' | 'done' | 'error';

interface JobResult {
  type: string;
  status: Status;
  message: string;
  count?: number;
}

const EXPORT_OPTIONS = [
  { key: 'products',    label: 'Products',       desc: 'All product data with pricing and stock',      icon: '☕' },
  { key: 'orders',      label: 'Orders',          desc: 'Order history with customer details',          icon: '📦' },
  { key: 'categories',  label: 'Categories',      desc: 'Category hierarchy',                           icon: '📁' },
  { key: 'customers',   label: 'Customers',       desc: 'Registered users and addresses',               icon: '👤' },
  { key: 'inventory',   label: 'Inventory',       desc: 'Current stock levels per SKU',                 icon: '📊' },
  { key: 'promo_codes', label: 'Promo Codes',     desc: 'All active and expired promo codes',           icon: '🏷️' },
];

const IMPORT_TEMPLATES = [
  { key: 'products',   label: 'Product Import Template',   cols: 'name,name_en,sku,category,brand,price,original_price,product_type,in_stock,is_active' },
  { key: 'inventory',  label: 'Stock Update Template',     cols: 'sku,quantity_on_hand,reorder_threshold,notes' },
  { key: 'categories', label: 'Category Import Template',  cols: 'name,name_en,slug,product_type,sort_order,is_active' },
];

function downloadCSV(filename: string, header: string, rows: string[][]) {
  const csv = [header, ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTemplate(tpl: typeof IMPORT_TEMPLATES[0]) {
  const exampleRows: Record<string, string[][]> = {
    products:   [['Espresso Intense','Intense Espresso','COF-001','Coffee','Nespresso','9.90','12.00','coffee','1','1']],
    inventory:  [['COF-001','50','10','Restock after audit']],
    categories: [['Café','Coffee','cafe','coffee','1','1']],
  };
  downloadCSV(`${tpl.key}-template.csv`, tpl.cols, exampleRows[tpl.key] ?? []);
}

export default function ImportExportPage() {
  const [jobs, setJobs]       = useState<JobResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('products');
  const [dragOver, setDragOver] = useState(false);

  const runExport = async (key: string, label: string) => {
    const jobId = `export-${key}`;
    setJobs(prev => [...prev.filter(j => j.type !== jobId), { type: jobId, status: 'running', message: `Exporting ${label}…` }]);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    // Generate mock CSV and download
    const headers: Record<string, string> = {
      products:    'id,name,name_en,sku,category,brand,price,product_type,in_stock',
      orders:      'id,status,total,customer_name,customer_email,created_at',
      categories:  'id,name,name_en,slug,product_type,sort_order,is_active',
      customers:   'id,name,email,locale,created_at',
      inventory:   'sku,product_name,quantity_on_hand,reorder_threshold',
      promo_codes: 'code,type,value,usage_limit,used_count,expires_at,is_active',
    };
    const mockRows: string[][] = Array.from({ length: 5 }, (_, i) => [
      String(i + 1), 'Sample Item', 'Sample Item EN', `SKU-${String(i+1).padStart(4,'0')}`,
      'Coffee', 'Nespresso', '9.90', 'coffee', '1',
    ].slice(0, (headers[key]?.split(',').length ?? 6)));

    downloadCSV(`cafrezzo-${key}-${new Date().toISOString().split('T')[0]}.csv`, headers[key] ?? 'id,data', mockRows);

    setJobs(prev => prev.map(j => j.type === jobId ? { ...j, status: 'done', message: `Exported ${mockRows.length} ${label.toLowerCase()} rows` } : j));
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    const jobId = `import-${importType}`;
    setJobs(prev => [...prev.filter(j => j.type !== jobId), { type: jobId, status: 'running', message: `Importing ${importType}…` }]);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    // Read CSV lines (mock)
    const text  = await importFile.text();
    const lines = text.split('\n').filter(Boolean).length - 1; // minus header

    setJobs(prev => prev.map(j => j.type === jobId ? { ...j, status: 'done', message: `Imported ${lines} rows successfully`, count: lines } : j));
    setImporting(false);
    setImportFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) setImportFile(file);
  };

  return (
    <>
      <AdminPageHeader
        title="Import / Export"
        subtitle="Export data to CSV or import bulk records from spreadsheet files."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Export */}
        <div>
          <div className="admin-card-title" style={{ marginBottom: 12 }}>Export Data</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXPORT_OPTIONS.map(opt => {
              const job = jobs.find(j => j.type === `export-${opt.key}`);
              return (
                <div key={opt.key} className="admin-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 22 }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)', marginTop: 2 }}>{opt.desc}</div>
                    <AnimatePresence>
                      {job && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ fontSize: 11, marginTop: 4, color: job.status === 'done' ? 'var(--color-a-green)' : job.status === 'error' ? '#EF4444' : 'var(--color-a-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {job.status === 'done' && <CheckCircle size={11} />}
                          {job.status === 'error' && <AlertCircle size={11} />}
                          {job.status === 'running' && <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />}
                          {job.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    className="admin-btn admin-btn-ghost"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => runExport(opt.key, opt.label)}
                    disabled={jobs.find(j => j.type === `export-${opt.key}`)?.status === 'running'}
                  >
                    <Download size={13} /> CSV
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Import */}
        <div>
          <div className="admin-card-title" style={{ marginBottom: 12 }}>Import Data</div>
          <div className="admin-card" style={{ padding: 20 }}>
            <div>
              <label className="admin-label">Data Type</label>
              <select className="admin-input admin-select" value={importType} onChange={e => setImportType(e.target.value)}>
                <option value="products">Products</option>
                <option value="inventory">Inventory / Stock Levels</option>
                <option value="categories">Categories</option>
              </select>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                marginTop: 14,
                border: `2px dashed ${dragOver ? 'var(--color-a-green)' : 'var(--color-a-border)'}`,
                borderRadius: 10,
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'var(--color-a-green)08' : 'var(--color-a-surface-2)',
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <Upload size={28} style={{ color: 'var(--color-a-text-muted)', marginBottom: 8 }} />
              {importFile ? (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{importFile.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)', marginTop: 4 }}>
                    {(importFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Drop CSV file here</div>
                  <div style={{ fontSize: 12, color: 'var(--color-a-text-muted)', marginTop: 4 }}>or click to browse</div>
                </>
              )}
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <AnimatePresence>
              {(() => {
                const job = jobs.find(j => j.type === `import-${importType}`);
                return job ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      marginTop: 12,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: job.status === 'done' ? 'rgba(52,211,153,0.08)' : job.status === 'error' ? 'rgba(239,68,68,0.08)' : 'var(--color-a-surface-2)',
                      border: `1px solid ${job.status === 'done' ? 'rgba(52,211,153,0.2)' : job.status === 'error' ? 'rgba(239,68,68,0.2)' : 'var(--color-a-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                    }}
                  >
                    {job.status === 'done' && <CheckCircle size={14} style={{ color: '#34D399' }} />}
                    {job.status === 'running' && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-a-text-muted)' }} />}
                    {job.message}
                    {job.count !== undefined && <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{job.count} rows</span>}
                  </motion.div>
                ) : null;
              })()}
            </AnimatePresence>

            <button
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
              onClick={handleImport}
              disabled={!importFile || importing}
            >
              {importing ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Importing…</> : <><Upload size={14} /> Import CSV</>}
            </button>
          </div>

          {/* Templates */}
          <div style={{ marginTop: 20 }}>
            <div className="admin-card-title" style={{ marginBottom: 10 }}>Download Templates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {IMPORT_TEMPLATES.map(tpl => (
                <div key={tpl.key} className="admin-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} style={{ color: 'var(--color-a-text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{tpl.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)', marginTop: 2 }}>{tpl.cols.split(',').length} columns</div>
                  </div>
                  <button className="admin-btn admin-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => downloadTemplate(tpl)}>
                    <Download size={12} /> .csv
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
