'use client';

import { useState, useEffect } from 'react';
import type { Product, Category, Brand, Tag } from '@/types/admin';
import { adminApi } from '@/lib/admin/api';

type ProductType = 'coffee' | 'machine' | 'accessory' | 'sweet';

interface Props {
  product:   Product | null;
  type:      ProductType;
  skuPrefix: string;
  onSubmit:  (data: Partial<Product>) => Promise<void>;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomSku(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const TABS = [
  { id: 'basics',      label: 'Basics' },
  { id: 'description', label: 'Description' },
  { id: 'pricing',     label: 'Pricing & Sale' },
  { id: 'meta',        label: 'Tags & SEO' },
];

const COFFEE_TABS = [...TABS.slice(0, 2), { id: 'coffee', label: 'Coffee Profile' }, ...TABS.slice(2)];
const ALLERGEN_TABS = [...TABS.slice(0, 2), { id: 'allergens', label: 'Allergens' }, ...TABS.slice(2)];

function getTabs(type: ProductType) {
  if (type === 'coffee') return COFFEE_TABS;
  if (type === 'sweet')  return ALLERGEN_TABS;
  return TABS;
}

export function ProductForm({ product, type, skuPrefix, onSubmit }: Props) {
  const [tab, setTab]               = useState('basics');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands]         = useState<Brand[]>([]);
  const [allTags, setAllTags]       = useState<Tag[]>([]);

  // Form state
  const [name, setName]                     = useState(product?.name ?? '');
  const [nameEn, setNameEn]                 = useState(product?.name_en ?? '');
  const [slug, setSlug]                     = useState(product?.slug ?? '');
  const [sku, setSku]                       = useState(product?.sku ?? '');
  const [categoryId, setCategoryId]         = useState<number | ''>(product?.category_id ?? '');
  const [brandId, setBrandId]               = useState<number | ''>(product?.brand_id ?? '');
  const [price, setPrice]                   = useState(String(product?.price ?? ''));
  const [originalPrice, setOriginalPrice]   = useState(String(product?.original_price ?? ''));
  const [weight, setWeight]                 = useState(product?.weight ?? '');
  const [origin, setOrigin]                 = useState(product?.origin ?? '');
  const [roastLevel, setRoastLevel]         = useState(product?.roast_level ?? '');
  const [processing, setProcessing]         = useState(product?.processing_method ?? '');
  const [intensity, setIntensity]           = useState(String(product?.intensity ?? ''));
  const [tagline, setTagline]               = useState(product?.tagline ?? '');
  const [taglineEn, setTaglineEn]           = useState(product?.tagline_en ?? '');
  const [description, setDescription]      = useState(product?.description ?? '');
  const [descriptionEn, setDescriptionEn]  = useState(product?.description_en ?? '');
  const [inStock, setInStock]               = useState(product?.in_stock ?? true);
  const [isActive, setIsActive]             = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured]         = useState(product?.is_featured ?? false);
  const [isNew, setIsNew]                   = useState(product?.is_new ?? false);
  const [isOnSale, setIsOnSale]             = useState(product?.is_on_sale ?? false);
  const [saleDiscount, setSaleDiscount]     = useState(String(product?.sale_discount_percent ?? ''));
  const [saleEnds, setSaleEnds]             = useState(product?.sale_ends_at?.split('T')[0] ?? '');
  const [selectedTags, setSelectedTags]     = useState<number[]>(
    product?.globalTags?.map((t) => t.id) ?? []
  );

  useEffect(() => {
    Promise.all([
      adminApi.categories.list().catch(() => ({ data: [] })),
      adminApi.brands.list().catch(() => ({ data: [] })),
      adminApi.tags.list().catch(() => ({ data: [] })),
    ]).then(([cats, brds, tgs]) => {
      const catList = Array.isArray(cats) ? cats : (cats as { data?: Category[] }).data ?? [];
      const brdList = Array.isArray(brds) ? brds : (brds as { data?: Brand[] }).data ?? [];
      const tagList = Array.isArray(tgs)  ? tgs  : (tgs  as { data?: Tag[] }).data ?? [];
      setCategories(catList.filter((c: Category) => c.product_type === type || c.product_type === 'all'));
      setBrands(brdList);
      setAllTags(tagList.filter((t: Tag) => t.is_active));
    });
  }, [type]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!product) setSlug(slugify(v));
    if (!product && !sku) setSku(randomSku(skuPrefix));
  };

  const toggleTag = (id: number) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name, name_en: nameEn || undefined,
      slug,
      sku: sku || undefined,
      category_id: categoryId !== '' ? Number(categoryId) : undefined,
      brand_id:    brandId    !== '' ? Number(brandId)    : undefined,
      price:       Number(price),
      original_price: originalPrice ? Number(originalPrice) : undefined,
      weight:        weight || undefined,
      origin:        origin || undefined,
      roast_level:   (roastLevel || undefined) as Product['roast_level'],
      processing_method: processing || undefined,
      intensity:     intensity ? Number(intensity) : undefined,
      tagline:       tagline || undefined,
      tagline_en:    taglineEn || undefined,
      description:   description || undefined,
      description_en: descriptionEn || undefined,
      in_stock:  inStock,
      is_active: isActive,
      is_featured: isFeatured,
      is_new:    isNew,
      is_on_sale:           isOnSale,
      sale_discount_percent: saleDiscount ? Number(saleDiscount) : undefined,
      sale_ends_at:         saleEnds || undefined,
      // Tags sent separately — backend handles pivot
    });
  };

  const tabs = getTabs(type);

  const field = (label: string, node: React.ReactNode, half = false) => (
    <div style={{ gridColumn: half ? 'span 1' : 'span 1' }}>
      <label className="admin-label">{label}</label>
      {node}
    </div>
  );

  const toggle = (label: string, val: boolean, set: (v: boolean) => void) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div
        onClick={() => set(!val)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer',
          background: val ? 'var(--color-a-green)' : 'var(--color-a-surface-3)',
          border: '1px solid var(--color-a-border)',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: val ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-a-text)' }}>{label}</span>
    </label>
  );

  return (
    <form id="product-form" onSubmit={handleSubmit}>
      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 20,
        borderBottom: '1px solid var(--color-a-border)', paddingBottom: 0,
      }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--color-a-green-hover)' : 'var(--color-a-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: tab === t.id ? '2px solid var(--color-a-green)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BASICS ─────────────────────────────────────────────────────── */}
      {tab === 'basics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('Name (FR) *', (
            <input className="admin-input" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Product name" />
          ))}
          {field('Name (EN)', (
            <input className="admin-input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Product name in English" />
          ))}
          {field('URL Slug *', (
            <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="auto-generated" />
          ))}
          {field('SKU', (
            <input className="admin-input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder={`${skuPrefix}-XXXXXX`} />
          ))}
          {field('Category *', (
            <select className="admin-input admin-select" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value) || '')} required>
              <option value="">— Select category —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ))}
          {field('Brand', (
            <select className="admin-input admin-select" value={brandId} onChange={(e) => setBrandId(Number(e.target.value) || '')}>
              <option value="">— No brand —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          ))}
          {field('Price (€) *', (
            <input className="admin-input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
          ))}
          {field('Original Price (€)', (
            <input className="admin-input" type="number" step="0.01" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="0.00" />
          ))}
          {field('Weight', (
            <input className="admin-input" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="250g, 1kg" />
          ))}
          {type === 'coffee' && field('Origin', (
            <input className="admin-input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Brasil & Uganda" />
          ))}

          {/* Toggles row */}
          <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '8px 0' }}>
            {toggle('In Stock',  inStock,    setInStock)}
            {toggle('Active',    isActive,   setIsActive)}
            {toggle('Featured',  isFeatured, setIsFeatured)}
            {toggle('New',       isNew,      setIsNew)}
          </div>
        </div>
      )}

      {/* ── DESCRIPTION ────────────────────────────────────────────────── */}
      {tab === 'description' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {field('Tagline (FR)', (
              <input className="admin-input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short tagline" />
            ))}
            {field('Tagline (EN)', (
              <input className="admin-input" value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} placeholder="Tagline in English" />
            ))}
          </div>
          {field('Description (FR)', (
            <textarea
              className="admin-input"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full product description…"
              style={{ resize: 'vertical' }}
            />
          ))}
          {field('Description (EN)', (
            <textarea
              className="admin-input"
              rows={5}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Description in English…"
              style={{ resize: 'vertical' }}
            />
          ))}
        </div>
      )}

      {/* ── COFFEE PROFILE ─────────────────────────────────────────────── */}
      {tab === 'coffee' && type === 'coffee' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('Intensity (0–13)', (
            <input className="admin-input" type="number" min="0" max="13" value={intensity} onChange={(e) => setIntensity(e.target.value)} placeholder="6" />
          ))}
          {field('Roast Level', (
            <select className="admin-input admin-select" value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)}>
              <option value="">— Select —</option>
              {['light', 'medium', 'dark', 'espresso'].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          ))}
          {field('Processing Method', (
            <input className="admin-input" value={processing} onChange={(e) => setProcessing(e.target.value)} placeholder="Washed, Natural, Honey…" />
          ))}
          {field('Origin', (
            <input className="admin-input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Brasil & Uganda" />
          ))}
        </div>
      )}

      {/* ── ALLERGENS (sweets) ─────────────────────────────────────────── */}
      {tab === 'allergens' && type === 'sweet' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-a-text-muted)', marginBottom: 12 }}>
            Allergen information is managed in the Filament admin panel or via bulk import.
            Save the product first, then add allergens via the Filament interface.
          </p>
        </div>
      )}

      {/* ── PRICING & SALE ─────────────────────────────────────────────── */}
      {tab === 'pricing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: 'span 2' }}>
            {toggle('On Sale', isOnSale, setIsOnSale)}
          </div>
          {isOnSale && (
            <>
              {field('Sale Discount (%)', (
                <input className="admin-input" type="number" min="0" max="100" value={saleDiscount} onChange={(e) => setSaleDiscount(e.target.value)} placeholder="20" />
              ))}
              {field('Sale Ends At', (
                <input className="admin-input" type="date" value={saleEnds} onChange={(e) => setSaleEnds(e.target.value)} />
              ))}
            </>
          )}
          {!isOnSale && (
            <div style={{ gridColumn: 'span 2', padding: '20px 0', color: 'var(--color-a-text-muted)', fontSize: 13 }}>
              Enable "On Sale" to set a discount percentage and expiry date.
            </div>
          )}
        </div>
      )}

      {/* ── TAGS & SEO ─────────────────────────────────────────────────── */}
      {tab === 'meta' && (
        <div>
          <label className="admin-label">Global Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {allTags.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-a-text-muted)' }}>
                No tags defined yet. Create tags in Catalog Setup → Tags.
              </p>
            )}
            {allTags.map((t) => {
              const sel = selectedTags.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: sel ? t.color : 'var(--color-a-surface-2)',
                    color: sel ? 'white' : 'var(--color-a-text-muted)',
                    border: `1px solid ${sel ? t.color : 'var(--color-a-border)'}`,
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden submit target */}
      <button id="product-form-submit" type="submit" style={{ display: 'none' }} />
    </form>
  );
}
