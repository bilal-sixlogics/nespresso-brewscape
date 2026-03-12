'use client';

import { motion } from 'framer-motion';
import {
  Star, ShoppingCart, Heart, Truck, Shield, Package,
  Eye, Tag, Coffee, Flame, Droplets, Leaf, Award,
} from 'lucide-react';

interface PreviewData {
  name: string;
  nameEn?: string;
  tagline?: string;
  taglineEn?: string;
  price: string;
  originalPrice?: string;
  description?: string;
  descriptionEn?: string;
  weight?: string;
  origin?: string;
  intensity?: string;
  roastLevel?: string;
  processing?: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  saleDiscount?: string;
  imagePath?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  type: 'coffee' | 'machine' | 'accessory' | 'sweet';
}

export function ProductPreview({ data }: { data: PreviewData }) {
  const priceNum = Number(data.price) || 0;
  const origNum  = Number(data.originalPrice) || 0;
  const discount = data.isOnSale && data.saleDiscount ? Number(data.saleDiscount) : (origNum > priceNum ? Math.round((1 - priceNum / origNum) * 100) : 0);
  const intensityNum = Number(data.intensity) || 0;

  const emptyState = !data.name && !priceNum;

  if (emptyState) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px', textAlign: 'center', color: 'var(--a-text-muted)',
      }}>
        <Eye size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Live Preview</div>
        <div style={{ fontSize: 13, maxWidth: 280, lineHeight: 1.5 }}>
          Start filling in the product details and the preview will update in real-time.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ fontSize: 14 }}
    >
      {/* ── Preview header label ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        padding: '8px 12px', borderRadius: 10,
        background: 'var(--a-green-light)', fontSize: 12, fontWeight: 600,
        color: 'var(--a-green)',
      }}>
        <Eye size={14} />
        Customer View Preview
      </div>

      {/* ── Product card simulation ── */}
      <div style={{
        background: '#fafaf7', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #e8e3da',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        {/* Image area */}
        <div style={{
          position: 'relative', height: 220,
          background: 'linear-gradient(135deg, #e8e3da 0%, #d4cfbf 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {data.imagePath ? (
            <img
              src={data.imagePath}
              alt={data.name}
              style={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              color: '#b5ad9e', gap: 8,
            }}>
              <Coffee size={48} strokeWidth={1.2} />
              <span style={{ fontSize: 11, fontWeight: 500 }}>No image yet</span>
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {discount > 0 && (
              <span style={{
                background: '#E05252', color: 'white', padding: '3px 10px',
                borderRadius: 99, fontSize: 11, fontWeight: 700,
              }}>
                -{discount}%
              </span>
            )}
            {data.isNew && (
              <span style={{
                background: '#1a1a1a', color: 'white', padding: '3px 10px',
                borderRadius: 99, fontSize: 11, fontWeight: 700,
              }}>
                NEW
              </span>
            )}
            {data.isFeatured && (
              <span style={{
                background: '#E8734A', color: 'white', padding: '3px 10px',
                borderRadius: 99, fontSize: 11, fontWeight: 700,
              }}>
                <Award size={10} style={{ marginRight: 3, verticalAlign: -1 }} />
                Featured
              </span>
            )}
          </div>

          {/* Stock badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
            color: data.inStock ? '#16A34A' : '#DC2626',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: data.inStock ? '#16A34A' : '#DC2626',
            }} />
            {data.inStock ? 'In Stock' : 'Out of Stock'}
          </div>

          {/* Wishlist */}
          <button style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'default',
          }}>
            <Heart size={16} color="#999" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          {/* Category & brand */}
          {(data.category || data.brand) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
              fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {data.brand && <span>{data.brand}</span>}
              {data.brand && data.category && <span>·</span>}
              {data.category && <span>{data.category}</span>}
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontSize: 20, fontWeight: 700, color: '#1a1a1a',
            letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 4px',
          }}>
            {data.name || 'Product Name'}
          </h2>
          {data.nameEn && data.nameEn !== data.name && (
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{data.nameEn}</div>
          )}

          {/* Tagline */}
          {data.tagline && (
            <p style={{ fontSize: 13, color: '#777', fontStyle: 'italic', margin: '6px 0 0' }}>
              {data.tagline}
            </p>
          )}

          {/* Rating placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '10px 0' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill={i < 4 ? '#F59E0B' : 'none'} color={i < 4 ? '#F59E0B' : '#ddd'} />
            ))}
            <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>4.0 (0 reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '12px 0 16px' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1A6B5A', letterSpacing: '-0.03em' }}>
              €{priceNum.toFixed(2)}
            </span>
            {origNum > priceNum && origNum > 0 && (
              <span style={{ fontSize: 16, color: '#999', textDecoration: 'line-through' }}>
                €{origNum.toFixed(2)}
              </span>
            )}
            {data.weight && (
              <span style={{ fontSize: 12, color: '#999' }}>/ {data.weight}</span>
            )}
          </div>

          {/* Coffee-specific: Intensity bar */}
          {data.type === 'coffee' && intensityNum > 0 && (
            <div style={{
              background: '#f5f0e8', borderRadius: 12, padding: '14px 16px', marginBottom: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
                  <Flame size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                  Intensity
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{intensityNum}/13</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 13 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: 6, borderRadius: 3,
                      background: i < intensityNum ? '#1A6B5A' : '#e0dbd2',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Coffee specs row */}
          {data.type === 'coffee' && (data.roastLevel || data.origin || data.processing) && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 10, marginBottom: 14,
            }}>
              {data.roastLevel && (
                <div style={{ background: '#f5f0e8', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <Flame size={14} color="#E8734A" style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 10, color: '#888', fontWeight: 500, textTransform: 'uppercase' }}>Roast</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333', textTransform: 'capitalize' }}>{data.roastLevel}</div>
                </div>
              )}
              {data.origin && (
                <div style={{ background: '#f5f0e8', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <Leaf size={14} color="#1A6B5A" style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 10, color: '#888', fontWeight: 500, textTransform: 'uppercase' }}>Origin</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{data.origin}</div>
                </div>
              )}
              {data.processing && (
                <div style={{ background: '#f5f0e8', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <Droplets size={14} color="#3A8FD6" style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 10, color: '#888', fontWeight: 500, textTransform: 'uppercase' }}>Process</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{data.processing}</div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {data.tags.map((t) => (
                <span key={t} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: 'rgba(26,107,90,0.08)', color: '#1A6B5A',
                  border: '1px solid rgba(26,107,90,0.15)',
                }}>
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {(data.description || data.descriptionEn) && (
            <div style={{
              borderTop: '1px solid #e8e3da', paddingTop: 16, marginTop: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 8 }}>Description</div>
              <div
                className="admin-rte-content"
                style={{
                  fontSize: 13, lineHeight: 1.65, color: '#555',
                  maxHeight: 160, overflow: 'hidden',
                  padding: 0, minHeight: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: data.description || data.descriptionEn || '' }}
              />
              {(data.description || data.descriptionEn || '').length > 300 && (
                <div style={{
                  marginTop: -20, paddingTop: 20, position: 'relative',
                  background: 'linear-gradient(transparent, #fafaf7)',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: 12, color: '#1A6B5A', fontWeight: 600 }}>Read more →</span>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{
            display: 'flex', gap: 10, marginTop: 20,
          }}>
            <button style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 20px', borderRadius: 14,
              background: data.inStock ? '#1A6B5A' : '#ccc',
              color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
              cursor: 'default', letterSpacing: '-0.01em',
            }}>
              <ShoppingCart size={16} />
              {data.inStock ? `Add to Cart · €${priceNum.toFixed(2)}` : 'Out of Stock'}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16,
            fontSize: 11, color: '#999',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Truck size={13} /> Free shipping €49+
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={13} /> Secure checkout
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Package size={13} /> Easy returns
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
