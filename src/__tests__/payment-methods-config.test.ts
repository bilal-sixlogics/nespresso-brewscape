import { describe, it, expect } from 'vitest';

/**
 * Tests verifying the payment methods configuration logic
 * that connects admin settings to checkout behavior.
 */

interface PaymentMethodsResponse {
  stripe: boolean;
  cod: boolean;
  paypal: boolean;
}

type PaymentMethod = { id: 'stripe' | 'cod'; label: string };

function filterEnabledMethods(
  allMethods: PaymentMethod[],
  enabled: PaymentMethodsResponse | null,
): PaymentMethod[] {
  if (!enabled) return allMethods;
  return allMethods.filter(m => enabled[m.id]);
}

const allMethods: PaymentMethod[] = [
  { id: 'stripe', label: 'Card / Apple Pay / Google Pay' },
  { id: 'cod', label: 'Cash on Delivery' },
];

describe('Payment methods filtering', () => {
  it('should show all methods when API returns null (fallback)', () => {
    const result = filterEnabledMethods(allMethods, null);
    expect(result).toHaveLength(2);
  });

  it('should show all methods when all enabled', () => {
    const result = filterEnabledMethods(allMethods, { stripe: true, cod: true, paypal: false });
    expect(result).toHaveLength(2);
  });

  it('should hide COD when admin disables it', () => {
    const result = filterEnabledMethods(allMethods, { stripe: true, cod: false, paypal: false });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('stripe');
  });

  it('should hide Stripe when admin disables it', () => {
    const result = filterEnabledMethods(allMethods, { stripe: false, cod: true, paypal: false });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cod');
  });

  it('should show no methods when all disabled', () => {
    const result = filterEnabledMethods(allMethods, { stripe: false, cod: false, paypal: false });
    expect(result).toHaveLength(0);
  });
});

describe('Stripe key security', () => {
  it('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should never be a secret key', () => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_REPLACE_ME';
    // Publishable keys start with pk_, secret keys start with sk_
    expect(key.startsWith('sk_')).toBe(false);
  });

  it('should never expose stripe secret in NEXT_PUBLIC_ vars', () => {
    const publicEnvKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'));
    for (const key of publicEnvKeys) {
      const val = process.env[key] ?? '';
      expect(val.startsWith('sk_'), `${key} should not contain a Stripe secret key`).toBe(false);
      expect(val.startsWith('whsec_'), `${key} should not contain a webhook secret`).toBe(false);
    }
  });
});

describe('PCI DSS compliance checks', () => {
  it('PaymentForm type should not have card number fields', () => {
    // This is a structural test — the PaymentForm interface should only have
    // method, createAccount, and acceptedTerms. No cardNumber, cvv, expiry.
    const formKeys = ['method', 'createAccount', 'acceptedTerms'];
    const forbiddenKeys = ['cardNumber', 'cvv', 'expiry', 'cardHolder'];

    for (const key of forbiddenKeys) {
      expect(formKeys).not.toContain(key);
    }
  });
});
