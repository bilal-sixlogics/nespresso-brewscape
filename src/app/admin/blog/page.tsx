'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, Search, Globe, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/admin/api';

interface BlogPost {
  id: number;
  title: string;
  title_en: string;
  slug: string;
  category: string;
  category_en: string;
  excerpt: string;
  excerpt_en: string;
  body: string;
  body_en: string;
  image_path: string | null;
  external_url: string | null;
  published_at: string | null;
  is_published: boolean;
  author_id: number | null;
}

function toArr(r: unknown): BlogPost[] {
  if (Array.isArray(r)) return r as BlogPost[];
  const x = r as Record<string, unknown>;
  return Array.isArray(x?.data) ? (x.data as BlogPost[]) : [];
}

const emptyPost = (): Partial<BlogPost> => ({
  title: '', title_en: '', slug: '', category: '', category_en: '',
  excerpt: '', excerpt_en: '', body: '', body_en: '',
  image_path: null, external_url: null, published_at: null, is_published: false,
});

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BlogPage() {
  const [posts, setPosts]       = useState<BlogPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<'all' | 'published' | 'draft'>('all');
  const [editing, setEditing]   = useState<Partial<BlogPost> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState('');
  const [activeTab, setActiveTab] = useState<'fr' | 'en'>('fr');

  const load = useCallback(async () => {
    setLoading(true); setApiError('');
    try { setPosts(toArr(await adminApi.blog.list())); }
    catch (e) { setApiError((e as Error).message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.title_en ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : filter === 'published' ? p.is_published : !p.is_published;
    return matchSearch && matchFilter;
  });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await adminApi.blog.update(editing.id, editing);
        setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as BlogPost : p));
      } else {
        const created = await adminApi.blog.create(editing) as BlogPost;
        setPosts(prev => [...prev, created]);
      }
    } catch { /* ignore */ }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await adminApi.blog.delete(deleteTarget.id); } catch { /* ignore */ }
    setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try { await adminApi.blog.update(post.id, { is_published: !post.is_published }); } catch { /* ignore */ }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p));
  };

  const set = (field: keyof BlogPost, value: unknown) =>
    setEditing(prev => prev ? { ...prev, [field]: value } : prev);

  return (
    <>
      <AdminPageHeader
        title="Blog Posts"
        subtitle="Manage brew journals, guides and coffee culture articles."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-ghost" onClick={load}><RefreshCw size={14} /></button>
            <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(emptyPost()); setActiveTab('fr'); }}><Plus size={15} /> New Post</button>
          </div>
        }
      />

      {/* Filters */}
      <div className="admin-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-a-text-muted)' }} />
          <input className="admin-input" placeholder="Search posts…" style={{ paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {(['all','published','draft'] as const).map(f => (
          <button key={f} className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Published At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="admin-skeleton" style={{ height: 14, borderRadius: 4 }} /></td>)}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-a-text-muted)' }}>No posts found</td></tr>
            ) : filtered.map((post, idx) => (
              <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{post.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-a-text-muted)' }}>{post.title_en}</div>
                </td>
                <td>
                  <span className="admin-badge badge-primary">{post.category}</span>
                </td>
                <td>
                  <AdminBadge variant={post.is_published ? 'green' : 'gray'}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </AdminBadge>
                </td>
                <td style={{ fontSize: 12, color: 'var(--color-a-text-muted)' }}>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditing({ ...post }); setActiveTab('fr'); }}>
                      <Pencil size={13} />
                    </button>
                    <button
                      className={`admin-btn admin-btn-ghost`}
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={() => handleTogglePublish(post)}
                      title={post.is_published ? 'Unpublish' : 'Publish'}
                    >
                      <Eye size={13} /> {post.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDeleteTarget(post)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      <AdminModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Blog Post' : 'New Blog Post'}
        size="xl"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <div
                onClick={() => set('is_published', !editing?.is_published)}
                style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: editing?.is_published ? 'var(--color-a-green)' : 'var(--color-a-surface-3)', border: '1px solid var(--color-a-border)', transition: 'background 0.2s' }}
              >
                <div style={{ position: 'absolute', top: 2, left: editing?.is_published ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              Published
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Post'}
              </button>
            </div>
          </div>
        }
      >
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Lang tabs */}
            <div style={{ display: 'flex', gap: 2, background: 'var(--color-a-surface-2)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {(['fr','en'] as const).map(lang => (
                <button key={lang} className={`admin-btn ${activeTab === lang ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '5px 18px', fontSize: 12 }} onClick={() => setActiveTab(lang)}>
                  <Globe size={12} /> {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === 'fr' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="admin-label">Title (FR)</label>
                    <input className="admin-input" value={editing.title ?? ''} onChange={e => { set('title', e.target.value); set('slug', slugify(e.target.value)); }} placeholder="Titre de l'article" />
                  </div>
                  <div>
                    <label className="admin-label">Category (FR)</label>
                    <input className="admin-input" value={editing.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="Guides, Culture, Conseils…" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Excerpt (FR)</label>
                  <textarea className="admin-input" rows={2} value={editing.excerpt ?? ''} onChange={e => set('excerpt', e.target.value)} placeholder="Short description…" style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="admin-label">Body (FR)</label>
                  <textarea className="admin-input" rows={8} value={editing.body ?? ''} onChange={e => set('body', e.target.value)} placeholder="Full article content…" style={{ resize: 'vertical' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="admin-label">Title (EN)</label>
                    <input className="admin-input" value={editing.title_en ?? ''} onChange={e => set('title_en', e.target.value)} placeholder="Article title" />
                  </div>
                  <div>
                    <label className="admin-label">Category (EN)</label>
                    <input className="admin-input" value={editing.category_en ?? ''} onChange={e => set('category_en', e.target.value)} placeholder="Guides, Culture, Tips…" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Excerpt (EN)</label>
                  <textarea className="admin-input" rows={2} value={editing.excerpt_en ?? ''} onChange={e => set('excerpt_en', e.target.value)} placeholder="Short description…" style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="admin-label">Body (EN)</label>
                  <textarea className="admin-input" rows={8} value={editing.body_en ?? ''} onChange={e => set('body_en', e.target.value)} placeholder="Full article content…" style={{ resize: 'vertical' }} />
                </div>
              </>
            )}

            {/* Common fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="admin-label">URL Slug</label>
                <input className="admin-input" value={editing.slug ?? ''} onChange={e => set('slug', e.target.value)} placeholder="url-slug" />
              </div>
              <div>
                <label className="admin-label">Published At</label>
                <input className="admin-input" type="date" value={editing.published_at?.split('T')[0] ?? ''} onChange={e => set('published_at', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="admin-label">External URL (optional)</label>
              <input className="admin-input" value={editing.external_url ?? ''} onChange={e => set('external_url', e.target.value)} placeholder="https://…" />
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        }
      >
        <p style={{ fontSize: 14 }}>Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.</p>
      </AdminModal>
    </>
  );
}
