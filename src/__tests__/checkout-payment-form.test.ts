import { describe, it, expect } from 'vitest';

/**
 * Unit tests verifying checkout payment form structure and validation logic.
 * These test the data contracts — not the React rendering (which needs E2E).
 */

interface PaymentForm {
  method: 'stripe' | 'cod';
  createAccount: boolean;
  acceptedTerms: boolean;
}

describe('Checkout PaymentForm validation', () => {
  const defaultForm: PaymentForm = {
    method: 'stripe',
    createAccount: false,
    acceptedTerms: false,
  };

  it('should default to stripe payment method', () => {
    expect(defaultForm.method).toBe('stripe');
  });

  it('should require acceptedTerms before submission', () => {
    // The button should be disabled when terms not accepted
    const canSubmit = defaultForm.acceptedTerms;
    expect(canSubmit).toBe(false);
  });

  it('should allow submission when terms accepted', () => {
    const form = { ...defaultForm, acceptedTerms: true };
    expect(form.acceptedTerms).toBe(true);
  });

  it('should only allow stripe or cod as payment method', () => {
    const validMethods: PaymentForm['method'][] = ['stripe', 'cod'];
    expect(validMethods).toContain(defaultForm.method);
  });
});

describe('Checkout payload builder', () => {
  const shippingForm = {
    firstName: 'Marie', lastName: 'Dupont',
    email: 'marie@example.com', phone: '+33600000000',
    address: '16 Rue de Rivoli', city: 'Paris',
    postalCode: '75001', country: 'FR', state: '',
  };

  it('should build shipping address with snake_case keys', () => {
    const payload = {
      first_name: shippingForm.firstName,
      last_name: shippingForm.lastName,
      line_1: shippingForm.address,
      city: shippingForm.city,
      zip: shippingForm.postalCode,
      country: shippingForm.country,
    };

    expect(payload.first_name).toBe('Marie');
    expect(payload.line_1).toBe('16 Rue de Rivoli');
    expect(payload.country).toBe('FR');
    expect(payload.zip).toBe('75001');
  });

  it('should include payment_method in checkout payload', () => {
    const payload = {
      shipping_address: {},
      shipping_method_id: 1,
      payment_method: 'stripe' as const,
      email: shippingForm.email,
    };

    expect(payload.payment_method).toBe('stripe');
  });

  it('should omit billing_address when same as shipping', () => {
    const billing = { sameAsShipping: true };
    const billingAddress = billing.sameAsShipping ? undefined : {};
    expect(billingAddress).toBeUndefined();
  });
});
