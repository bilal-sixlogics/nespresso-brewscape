'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pencil, Shield } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column, type TableAction } from '@/components/admin/ui/AdminDataTable';
import { AdminBadge, StatusBadge } from '@/components/admin/ui/AdminBadge';
import { AdminModal }      from '@/components/admin/ui/AdminModal';
import { adminApi }        from '@/lib/admin/api';
import type { User }       from '@/types/admin';

const ROLES = [
  { value: 'super_admin',     label: 'Super Admin'     },
  { value: 'manager',         label: 'Manager'         },
  { value: 'inventory_staff', label: 'Inventory Staff' },
];

const COLS: Column<User>[] = [
  {
    key: 'name', label: 'User', sortable: true,
    render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--color-a-green), var(--color-a-green-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
          {r.name[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{r.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'role', label: 'Role',
    render: (r) => <StatusBadge status={r.role} />,
  },
  {
    key: 'locale', label: 'Locale', width: '70px',
    render: (r) => <AdminBadge variant="gray">{r.locale ?? 'fr'}</AdminBadge>,
  },
  {
    key: 'created_at', label: 'Joined', sortable: true, width: '100px',
    render: (r) => <span style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</span>,
  },
];

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEdit]   = useState<User | null>(null);
  const [form, setForm]       = useState<Partial<User>>({});
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.users.list() as { data?: User[] } | User[];
      setUsers(Array.isArray(res) ? res : (res as { data?: User[] }).data ?? []);
    } catch { setUsers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u: User) => { setEdit(u); setForm({ role: u.role, locale: u.locale }); };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi.users.update(editUser.id, form);
      setEdit(null);
      load();
    } finally { setSaving(false); }
  };

  const actions: TableAction<User>[] = [
    { label: 'Edit Role', icon: Shield, onClick: openEdit },
  ];

  return (
    <>
      <AdminPageHeader
        title="Users"
        subtitle="Manage admin panel users and their roles."
      />
      <AdminDataTable
        data={users}
        columns={COLS}
        actions={actions}
        keyFn={(u) => u.id}
        loading={loading}
        searchPlaceholder="Search users by name or email…"
        emptyTitle="No admin users found"
        onRowClick={openEdit}
      />

      <AdminModal open={!!editUser} onClose={() => setEdit(null)}
        title="Edit User Role" subtitle={editUser?.email} size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="admin-label">Role</label>
            <select className="admin-input admin-select" value={form.role ?? ''} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as User['role'] }))}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <p style={{ fontSize: 11.5, color: 'var(--color-a-text-muted)', marginTop: 6 }}>
              Super Admin — full access. Manager — products, orders, content. Inventory Staff — inventory only.
            </p>
          </div>
          <div>
            <label className="admin-label">Locale</label>
            <select className="admin-input admin-select" value={form.locale ?? 'fr'} onChange={(e) => setForm((p) => ({ ...p, locale: e.target.value }))}>
              {[['fr','French'],['en','English'],['de','German'],['nl','Dutch'],['ru','Russian']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
