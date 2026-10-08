"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { Product } from '@/types';

const ProductDetailPanel = dynamic(
    () => import('@/components/ui/ProductDetailPanel').then(m => m.ProductDetailPanel),
    { ssr: false },
);

/**
 * The product quick-view panel, loaded the first time a product is opened.
 *
 * Six listing pages imported the panel eagerly, so its code shipped in their
 * first-load bundle although it only appears after a click. Same props as
 * ProductDetailPanel; stays mounted after first use so its exit animation runs.
 */
export function LazyProductDetailPanel(props: { product: Product | null; onClose: () => void }) {
    const [needed, setNeeded] = useState(false);
    if (props.product && !needed) setNeeded(true);
    return needed ? <ProductDetailPanel {...props} /> : null;
}
