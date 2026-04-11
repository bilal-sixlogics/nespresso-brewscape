import { describe, it, expect } from 'vitest';
import { Endpoints, API_BASE } from '@/lib/api/endpoints';

describe('API Endpoints', () => {
  it('should use API_BASE as prefix for all string endpoints', () => {
    const stringEndpoints = Object.entries(Endpoints).filter(
      ([, value]) => typeof value === 'string'
    );

    for (const [key, url] of stringEndpoints) {
      expect(url, `Endpoint "${key}" should start with API_BASE`).toContain('/api/v1');
    }
  });

  it('placeOrder should point to /checkout, not /orders', () => {
    expect(Endpoints.placeOrder).toBe(`${API_BASE}/checkout`);
  });

  it('paymentMethods endpoint should exist', () => {
    expect(Endpoints.paymentMethods).toBe(`${API_BASE}/payment-methods`);
  });

  it('paymentStatus should be a function returning order-specific URL', () => {
    expect(typeof Endpoints.paymentStatus).toBe('function');
    expect(Endpoints.paymentStatus(42)).toBe(`${API_BASE}/orders/42/payment-status`);
  });

  it('product slug endpoint should interpolate correctly', () => {
    expect(Endpoints.product('espresso-gold')).toBe(`${API_BASE}/products/espresso-gold`);
  });

  it('blogPost should accept number or string id', () => {
    expect(Endpoints.blogPost(5)).toBe(`${API_BASE}/blog/5`);
    expect(Endpoints.blogPost('my-post')).toBe(`${API_BASE}/blog/my-post`);
  });
});
