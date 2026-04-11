# Payment Integration Research — Nespresso Brewscape
**Author:** Research compiled April 2026  
**Scope:** All payment methods, providers, SDKs, APIs, backend flows, security requirements  
**Stack:** Next.js 16 + React 19 (storefront) · Laravel 12 (backend) · TypeScript

---

## Table of Contents

1. [Payment Method Overview](#1-payment-method-overview)
2. [PCI DSS & Security Fundamentals](#2-pci-dss--security-fundamentals)
3. [Stripe — Complete Integration](#3-stripe--complete-integration)
   - 3.1 Stripe Architecture & SDKs
   - 3.2 PaymentIntent Lifecycle (Full State Machine)
   - 3.3 PaymentElement (Frontend)
   - 3.4 Express Checkout (Apple Pay / Google Pay)
   - 3.5 Laravel Backend Integration
   - 3.6 Webhooks
   - 3.7 Stripe Error Reference
4. [PayPal — Complete Integration](#4-paypal--complete-integration)
   - 4.1 Orders v2 API
   - 4.2 JavaScript SDK Setup
   - 4.3 Server-Side (PHP/Laravel)
   - 4.4 Webhooks
5. [Wise — Payouts & Transfers](#5-wise--payouts--transfers)
   - 5.1 What Wise Is For
   - 5.2 Authentication
   - 5.3 Transfer Flow (4 Steps)
   - 5.4 Webhooks
6. [Cash on Delivery (COD)](#6-cash-on-delivery-cod)
7. [Debit & Credit Cards — Direct](#7-debit--credit-cards--direct)
8. [Implementation Plan for Brewscape](#8-implementation-plan-for-brewscape)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Testing Reference](#10-testing-reference)

---

## 1. Payment Method Overview

| Method | Provider | Direction | Use Case | Complexity |
|---|---|---|---|---|
| Credit Card | Stripe | Customer → Store | All orders | Medium |
| Debit Card | Stripe | Customer → Store | All orders | Medium |
| Apple Pay | Stripe Express Checkout | Customer → Store | Mobile checkout | Low (via Stripe) |
| Google Pay | Stripe Express Checkout | Customer → Store | Android/Web checkout | Low (via Stripe) |
| PayPal | PayPal Orders v2 | Customer → Store | Alt checkout option | Medium |
| Cash on Delivery | Internal | Customer → Courier | Physical delivery | Low |
| Wise | Wise Platform API | Store → Supplier/Refund | B2B payouts, refunds | High |

**Decision Matrix for Brewscape:**
- **Primary:** Stripe (cards + wallets) — handles 80% of users
- **Secondary:** PayPal — covers users who distrust card entry
- **Logistics:** COD — required for MENA market
- **Payouts/Refunds:** Wise — international supplier payments
- **Skip for now:** Direct bank transfer, crypto, BNPL (Klarna/Afterpay)

---

## 2. PCI DSS & Security Fundamentals

### What is PCI DSS?
The Payment Card Industry Data Security Standard mandates how card data must be handled. **The single most important rule:** you must never touch raw card numbers (`PAN`). Use a payment provider's hosted fields / tokenization so card data never reaches your server.

### Compliance Levels
| Level | Annual Transactions | Requirement |
|---|---|---|
| Level 1 | > 6 million | On-site audit by QSA |
| Level 2 | 1–6 million | Annual questionnaire + quarterly scan |
| Level 3 | 20,000–1 million | Annual questionnaire |
| Level 4 | < 20,000 | Annual questionnaire |

Brewscape starts at **Level 4**. Using Stripe's hosted Elements automatically reduces scope — raw card data never enters your servers.

### Tokenization
Tokenization replaces a PAN (`4242 4242 4242 4242`) with a non-sensitive token (`pm_1Abc...`). The token:
- Has no monetary value if stolen
- Can only be used by your Stripe account
- Expires / is revocable

### Rules You Must Follow
1. Never store raw card numbers in your database or logs
2. Never log client secrets
3. Always use HTTPS (TLS 1.2+) on all payment pages
4. Use `dangerouslySetInnerHTML` only for non-payment content (already fixed with DOMPurify)
5. Webhook signatures must always be verified before trusting payload
6. Idempotency keys on all POST requests to prevent double charges

---

## 3. Stripe — Complete Integration

### 3.1 Stripe Architecture & SDKs

**Packages needed:**
```bash
# Frontend (storefront)
npm install stripe @stripe/stripe-js @stripe/react-stripe-js isomorphic-dompurify

# Backend (Laravel)
composer require stripe/stripe-php laravel/cashier
```

**Environment variables:**
```ini
# .env (Laravel backend)
STRIPE_KEY=pk_live_...         # Publishable key (safe for frontend)
STRIPE_SECRET=sk_live_...      # Secret key (NEVER expose to frontend)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret

# .env.local (Next.js storefront)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Initialize Stripe (backend — `config/services.php`):**
```php
'stripe' => [
    'key'     => env('STRIPE_KEY'),
    'secret'  => env('STRIPE_SECRET'),
    'webhook' => ['secret' => env('STRIPE_WEBHOOK_SECRET')],
],
```

**Initialize Stripe (frontend — singleton):**
```typescript
// src/lib/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
```

> **Critical:** Always load Stripe.js from `https://js.stripe.com` — never self-host or bundle it. This is required for PCI compliance.

---

### 3.2 PaymentIntent Lifecycle (Full State Machine)

A PaymentIntent tracks a payment from creation to completion. Every payment goes through this state machine:

```
[Created]
    │
    ▼
requires_payment_method ──(attach payment method)──▶ requires_confirmation
                                                              │
                                          ┌───────────────────┘
                                          ▼
                                    requires_action  ──(3DS auth)──▶ processing
                                          │                               │
                                          │                               ▼
                                          └──────────────────────────▶ succeeded
                                                                          │
                                                       requires_capture   │
                                                       (manual capture)   │
                                                              │           │
                                                              ▼           │
                                                          succeeded ◀─────┘
                                                          
    Any state before processing/succeeded ──▶ canceled (terminal)
    processing/succeeded on decline ──▶ requires_payment_method (retry)
```

**All possible statuses:**

| Status | Meaning | Frontend Action | Backend Action |
|---|---|---|---|
| `requires_payment_method` | No card attached yet, or last attempt failed | Show payment form | None |
| `requires_confirmation` | Payment method attached, needs confirm | Auto-confirm or call `confirmPayment()` | None |
| `requires_action` | 3D Secure authentication needed | Call `stripe.handleNextAction(clientSecret)` | Wait for webhook |
| `processing` | Async payment method in progress (bank debits) | Show "processing…" spinner | Wait for webhook |
| `requires_capture` | Authorized but not captured (manual capture mode) | Show "authorized" message | Call `capture` API |
| `succeeded` | Payment complete | Show success page | Fulfill order |
| `canceled` | Payment canceled, no retries | Show error, offer new checkout | Void order or restart |

**Creating a PaymentIntent (backend — Laravel):**
```php
// app/Modules/Payments/Controllers/PaymentController.php

use Stripe\StripeClient;

public function createPaymentIntent(Request $request): JsonResponse
{
    $request->validate([
        'amount'   => 'required|integer|min:50', // minimum 50 cents
        'currency' => 'required|string|size:3',
        'order_id' => 'required|exists:orders,id',
    ]);

    $stripe = new StripeClient(config('services.stripe.secret'));

    $intent = $stripe->paymentIntents->create([
        'amount'                    => $request->amount,        // in cents
        'currency'                  => strtolower($request->currency),
        'automatic_payment_methods' => ['enabled' => true],
        'metadata'                  => [
            'order_id'  => $request->order_id,
            'user_id'   => auth()->id(),
        ],
        'statement_descriptor_suffix' => 'Brewscape',
        'capture_method'            => 'automatic',
    ], [
        'idempotency_key' => 'order_' . $request->order_id,    // prevent double charge
    ]);

    return response()->json([
        'client_secret'      => $intent->client_secret,
        'payment_intent_id'  => $intent->id,
    ]);
}
```

**PaymentIntent required parameters:**
| Parameter | Type | Required | Notes |
|---|---|---|---|
| `amount` | integer | Yes | In smallest currency unit (cents for USD) |
| `currency` | string | Yes | ISO 4217 lowercase (`usd`, `aed`, `eur`) |
| `payment_method` | string | No | Attach at creation or later |
| `customer` | string | No | Stripe customer ID for saved cards |
| `description` | string | No | Shown on Stripe dashboard |
| `confirm` | boolean | No | `true` = confirm immediately |
| `capture_method` | enum | No | `automatic` (default) or `manual` |
| `setup_future_usage` | enum | No | `on_session` or `off_session` for saved cards |
| `metadata` | object | No | Max 50 keys, 500 chars each |
| `statement_descriptor_suffix` | string | No | Max 22 chars, shown on bank statement |
| `automatic_payment_methods` | object | No | `{enabled: true}` = use Dashboard config |
| `payment_method_types` | array | No | Explicit list: `['card', 'paypal']` |

**PaymentIntent response object:**
```json
{
  "id": "pi_3Abc123...",
  "object": "payment_intent",
  "amount": 2000,
  "currency": "usd",
  "status": "requires_payment_method",
  "client_secret": "pi_3Abc123..._secret_xyz",
  "payment_method": null,
  "charges": { "data": [] },
  "metadata": { "order_id": "42" },
  "next_action": null,
  "last_payment_error": null,
  "created": 1712000000,
  "livemode": true
}
```

---

### 3.3 PaymentElement (Frontend — Next.js)

The `PaymentElement` is Stripe's all-in-one component. It renders:
- Credit / debit card fields
- Apple Pay (Safari + macOS)  
- Google Pay (Chrome + Android)
- Link (Stripe's 1-click checkout)
- 100+ local payment methods based on customer location

**Full implementation:**

```typescript
// src/app/checkout/StripeCheckout.tsx
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Parent: fetch client secret from your backend ──────────────────────────

export function StripeCheckoutWrapper({ orderId, amount }: { orderId: number; amount: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, amount, currency: 'usd' }),
    })
      .then(r => r.json())
      .then(data => setClientSecret(data.client_secret));
  }, [orderId, amount]);

  if (!clientSecret) return <div>Loading payment...</div>;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#3B7E5A',       // Brewscape green
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '12px',
          },
        },
      }}
    >
      <CheckoutForm orderId={orderId} />
    </Elements>
  );
}

// ── Inner form: confirm payment ────────────────────────────────────────────

function CheckoutForm({ orderId }: { orderId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Validation failed');
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?order_id=${orderId}`,
        payment_method_data: {
          billing_details: {
            // pre-fill from your form
          },
        },
      },
    });

    // Only reaches here if redirect didn't happen (e.g., error)
    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'accordion',        // or 'tabs'
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'paypal'],
          fields: {
            billingDetails: {
              name: 'auto',
              email: 'auto',
            },
          },
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

**PaymentElement layout options:**
| Layout | Behavior |
|---|---|
| `tabs` | Payment methods shown as selectable tabs |
| `accordion` | Collapsed list, expands selected method |
| `accordion` + `radios: false` | Accordion without radio buttons |

**PaymentElement `fields` option:**
| Field | Values |
|---|---|
| `billingDetails.name` | `'auto'` \| `'never'` |
| `billingDetails.email` | `'auto'` \| `'never'` |
| `billingDetails.phone` | `'auto'` \| `'never'` |
| `billingDetails.address` | `'auto'` \| `'never'` \| `'if_required'` |

---

### 3.4 Express Checkout — Apple Pay & Google Pay

Use `ExpressCheckoutElement` for dedicated wallet buttons (shows only Apple Pay / Google Pay, no card form).

**Requirements:**
- **Apple Pay:** Safari on macOS/iOS, domain registered with Apple via Stripe Dashboard → Payment method domains
- **Google Pay:** Chrome on Android/desktop, domain registered via Stripe Dashboard
- **Both:** HTTPS required, physical device for testing (not simulators)

**Domain registration (one-time, via Stripe API or Dashboard):**
```bash
curl https://api.stripe.com/v1/payment_method_domains \
  -u "sk_live_...:" \
  -d "domain_name=brewscape.com"
```

**Implementation:**
```typescript
import { ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';

function ExpressCheckout({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const onConfirm = async () => {
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
    });

    if (error) console.error(error);
  };

  return (
    <ExpressCheckoutElement
      onConfirm={onConfirm}
      options={{
        buttonType: { applePay: 'buy', googlePay: 'buy' },
        buttonTheme: { applePay: 'black', googlePay: 'black' },
        layout: { maxColumns: 1, maxRows: 2, overflow: 'auto' },
      }}
    />
  );
}
```

---

### 3.5 Laravel Backend — Full Integration

**Install Cashier:**
```bash
composer require laravel/cashier stripe/stripe-php
php artisan vendor:publish --tag="cashier-migrations"
php artisan migrate
```

**User model:**
```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable; // Adds: stripe_id, pm_type, pm_last_four, trial_ends_at columns
}
```

**PaymentController — all methods:**
```php
<?php
namespace App\Modules\Payments\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\StripeClient;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Enums\OrderStatus;

class PaymentController extends Controller
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    // ── 1. Create PaymentIntent ─────────────────────────────────────────────

    public function createIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'currency' => 'required|string|size:3',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Ensure the authenticated user owns this order
        if ($order->user_id && $order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $amountCents = (int) round($order->grand_total * 100);

        $intent = $this->stripe->paymentIntents->create([
            'amount'                    => $amountCents,
            'currency'                  => strtolower($validated['currency']),
            'automatic_payment_methods' => ['enabled' => true],
            'metadata'                  => [
                'order_id' => $order->id,
                'user_id'  => auth()->id() ?? 'guest',
            ],
        ], [
            'idempotency_key' => 'order_pi_' . $order->id,
        ]);

        // Store intent ID on order for later verification
        $order->update(['payment_intent_id' => $intent->id]);

        return response()->json([
            'client_secret'     => $intent->client_secret,
            'payment_intent_id' => $intent->id,
            'amount'            => $amountCents,
            'currency'          => strtolower($validated['currency']),
        ]);
    }

    // ── 2. Webhook Handler ─────────────────────────────────────────────────

    public function webhook(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook.secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded'              => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed'         => $this->handlePaymentFailed($event->data->object),
            'payment_intent.requires_action'        => $this->handleRequiresAction($event->data->object),
            'charge.dispute.created'                => $this->handleDispute($event->data->object),
            default                                 => null,
        };

        return response()->json(['received' => true]);
    }

    private function handlePaymentSucceeded(object $intent): void
    {
        $order = Order::where('payment_intent_id', $intent->id)->first();
        if (!$order) return;

        $order->update([
            'status'     => OrderStatus::Paid,
            'paid_at'    => now(),
        ]);

        // Dispatch fulfillment job
        // dispatch(new FulfillOrderJob($order));
    }

    private function handlePaymentFailed(object $intent): void
    {
        $order = Order::where('payment_intent_id', $intent->id)->first();
        if (!$order) return;

        $order->update(['status' => OrderStatus::PaymentFailed]);

        $error = $intent->last_payment_error;
        \Log::warning('Payment failed', [
            'order_id' => $order->id,
            'code'     => $error?->code,
            'message'  => $error?->message,
        ]);
    }

    private function handleRequiresAction(object $intent): void
    {
        // 3DS authentication required — frontend handles this
        // Just log for monitoring
        \Log::info('3DS required', ['payment_intent_id' => $intent->id]);
    }

    private function handleDispute(object $charge): void
    {
        \Log::critical('Chargeback dispute created', [
            'charge_id' => $charge->id,
            'amount'    => $charge->amount,
        ]);
        // Alert operations team
    }
}
```

**Routes (`routes/api_website.php`):**
```php
// Public (no auth required — webhook must be accessible)
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Auth required
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/intent', [PaymentController::class, 'createIntent']);
});
```

**Critical — exclude webhook from CSRF (`app/Http/Middleware/VerifyCsrfToken.php`):**
```php
protected $except = [
    'api/v1/payments/webhook',
];
```

---

### 3.6 Webhooks — Complete Event Reference

Webhooks are **the only reliable way** to confirm payment. Never trust only the frontend `return_url` redirect — it can be spoofed or dropped.

**Key events to handle:**

| Event | Trigger | Action |
|---|---|---|
| `payment_intent.succeeded` | Payment complete | Mark order paid, start fulfillment |
| `payment_intent.payment_failed` | Card declined / error | Mark order failed, notify user |
| `payment_intent.requires_action` | 3DS needed | Log, wait for user to complete |
| `payment_intent.canceled` | Canceled | Release inventory hold |
| `charge.refunded` | Refund issued | Update order to refunded |
| `charge.dispute.created` | Chargeback | Alert operations team |
| `charge.dispute.closed` | Dispute resolved | Update records |
| `radar.early_fraud_warning.created` | Fraud signal | Flag order for review |

**Testing webhooks locally:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward to local dev server
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# Trigger a test event
stripe trigger payment_intent.succeeded
```

**Webhook security checklist:**
- ✅ Always verify `Stripe-Signature` header
- ✅ Return `200 OK` immediately, process asynchronously in a queue
- ✅ Store processed event IDs to prevent duplicate processing
- ✅ Make handlers idempotent (safe to run twice)
- ✅ Log all webhook events for debugging

---

### 3.7 Stripe Error Reference

**Decline codes your frontend should handle:**

| Code | Meaning | User Message |
|---|---|---|
| `card_declined` | Generic decline | "Your card was declined. Try a different card." |
| `insufficient_funds` | Not enough balance | "Insufficient funds. Try a different card." |
| `incorrect_cvc` | Wrong CVV | "Your card's security code is incorrect." |
| `expired_card` | Expired | "Your card has expired." |
| `fraudulent` | Flagged as fraud | "Your card was declined." (vague on purpose) |
| `do_not_honor` | Bank blocked | "Your card was declined. Contact your bank." |
| `lost_card` / `stolen_card` | Reported lost/stolen | "Your card was declined." |
| `incorrect_zip` | ZIP mismatch | "Your billing ZIP code is incorrect." |
| `processing_error` | Stripe-side issue | "A processing error occurred. Please try again." |
| `authentication_required` | 3DS needed | Auto-handled by Stripe.js |

**Error types in the API response:**
```typescript
type StripeErrorType =
  | 'api_error'          // Stripe internal error — retry
  | 'card_error'         // User error — show to customer
  | 'idempotency_error'  // Duplicate request — safe to ignore
  | 'invalid_request_error' // Bad API call — fix your code
  | 'rate_limit_error';  // Too many requests — back off
```

---

## 4. PayPal — Complete Integration

### 4.1 Orders v2 API

PayPal's Orders v2 API is the current standard (v1 is deprecated). It supports:
- CAPTURE (immediate) — most common for e-commerce
- AUTHORIZE then CAPTURE — for pre-auth scenarios (ship-first models)

**Base URLs:**
```
Sandbox:    https://api-m.sandbox.paypal.com
Production: https://api-m.paypal.com
```

**Authentication — OAuth 2.0:**
```bash
# Get access token (expires in 32400 seconds / 9 hours)
curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials"

# Response
{
  "access_token": "A21AAH...",
  "token_type": "Bearer",
  "expires_in": 32400,
  "scope": "https://uri.paypal.com/services/checkout/orders/..."
}
```

**Create Order — request:**
```bash
curl -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "PayPal-Request-Id: ORDER-UNIQUE-ID-123" \
  -d '{
    "intent": "CAPTURE",
    "purchase_units": [
      {
        "reference_id": "order_42",
        "description": "Nespresso Brewscape Order #42",
        "amount": {
          "currency_code": "USD",
          "value": "89.99",
          "breakdown": {
            "item_total": { "currency_code": "USD", "value": "79.99" },
            "shipping":   { "currency_code": "USD", "value": "10.00" }
          }
        },
        "items": [
          {
            "name": "Vertuo Next Premium",
            "unit_amount": { "currency_code": "USD", "value": "79.99" },
            "quantity": "1",
            "category": "PHYSICAL_GOODS"
          }
        ]
      }
    ],
    "payment_source": {
      "paypal": {
        "experience_context": {
          "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
          "landing_page": "LOGIN",
          "user_action": "PAY_NOW",
          "return_url": "https://brewscape.com/order-success",
          "cancel_url": "https://brewscape.com/checkout"
        }
      }
    }
  }'
```

**Create Order — response:**
```json
{
  "id": "5O190127TN364715T",
  "status": "PAYER_ACTION_REQUIRED",
  "links": [
    {
      "href": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
      "rel": "payer-action",
      "method": "GET"
    }
  ]
}
```

**Capture Order (after buyer approves):**
```bash
curl -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders/5O190127TN364715T/capture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "PayPal-Request-Id: CAPTURE-UNIQUE-ID-123"
```

**Capture response:**
```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "purchase_units": [{
    "payments": {
      "captures": [{
        "id": "1A23456789",
        "status": "COMPLETED",
        "amount": { "currency_code": "USD", "value": "89.99" },
        "seller_protection": { "status": "ELIGIBLE" },
        "create_time": "2026-04-11T10:00:00Z"
      }]
    }
  }]
}
```

**Order statuses:**
| Status | Meaning |
|---|---|
| `CREATED` | Order created, not yet approved |
| `SAVED` | Order saved for later |
| `APPROVED` | Buyer approved, ready to capture |
| `VOIDED` | Order voided |
| `COMPLETED` | Captured and settled |
| `PAYER_ACTION_REQUIRED` | Buyer must take action |

---

### 4.2 JavaScript SDK Setup

**Load SDK:**
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD&components=buttons,marks"></script>
```

**React implementation:**
```typescript
// src/components/PayPalButton.tsx
'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    paypal: {
      Buttons: (config: unknown) => { render: (selector: string) => void };
    };
  }
}

interface PayPalButtonProps {
  orderId: number;
  amount: string;
  currency?: string;
  onSuccess: (captureId: string) => void;
  onError: (error: unknown) => void;
}

export function PayPalButton({
  orderId,
  amount,
  currency = 'USD',
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.paypal || !containerRef.current) return;

    window.paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'black',
          shape: 'pill',
          label: 'pay',
        },

        // Step 1: Create order on your backend
        createOrder: async () => {
          const res = await fetch('/api/v1/paypal/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, amount, currency }),
          });
          const data = await res.json();
          return data.paypal_order_id; // PayPal order ID
        },

        // Step 2: Capture after buyer approves
        onApprove: async (data: { orderID: string }) => {
          const res = await fetch(`/api/v1/paypal/orders/${data.orderID}/capture`, {
            method: 'POST',
          });
          const capture = await res.json();

          if (capture.status === 'COMPLETED') {
            onSuccess(capture.purchase_units[0].payments.captures[0].id);
          } else {
            onError(capture);
          }
        },

        onError,
        onCancel: () => console.log('PayPal checkout cancelled'),
      })
      .render(`#paypal-container-${orderId}`);
  }, [orderId, amount, currency, onSuccess, onError]);

  return <div id={`paypal-container-${orderId}`} ref={containerRef} />;
}
```

---

### 4.3 Server-Side — Laravel PayPal Controller

```php
<?php
namespace App\Modules\Payments\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class PayPalController extends Controller
{
    private string $baseUrl;
    private string $clientId;
    private string $clientSecret;

    public function __construct()
    {
        $this->baseUrl      = config('services.paypal.sandbox')
                                ? 'https://api-m.sandbox.paypal.com'
                                : 'https://api-m.paypal.com';
        $this->clientId     = config('services.paypal.client_id');
        $this->clientSecret = config('services.paypal.client_secret');
    }

    // Get OAuth token (cache for 9 hours)
    private function getAccessToken(): string
    {
        return cache()->remember('paypal_access_token', 32000, function () {
            $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                ->asForm()
                ->post("{$this->baseUrl}/v1/oauth2/token", [
                    'grant_type' => 'client_credentials',
                ]);

            return $response->json('access_token');
        });
    }

    // Create PayPal order
    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount'   => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
        ]);

        $token = $this->getAccessToken();

        $response = Http::withToken($token)
            ->withHeaders(['PayPal-Request-Id' => 'order_' . $validated['order_id']])
            ->post("{$this->baseUrl}/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => 'order_' . $validated['order_id'],
                    'amount' => [
                        'currency_code' => strtoupper($validated['currency']),
                        'value'         => number_format($validated['amount'], 2, '.', ''),
                    ],
                ]],
            ]);

        if (!$response->successful()) {
            return response()->json(['message' => 'PayPal order creation failed'], 422);
        }

        return response()->json([
            'paypal_order_id' => $response->json('id'),
        ]);
    }

    // Capture PayPal order after buyer approves
    public function captureOrder(string $paypalOrderId): JsonResponse
    {
        $token = $this->getAccessToken();

        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type'    => 'application/json',
                'PayPal-Request-Id' => 'capture_' . $paypalOrderId,
            ])
            ->post("{$this->baseUrl}/v2/checkout/orders/{$paypalOrderId}/capture");

        if (!$response->successful()) {
            return response()->json(['message' => 'Capture failed'], 422);
        }

        $data = $response->json();

        if ($data['status'] === 'COMPLETED') {
            $captureId = $data['purchase_units'][0]['payments']['captures'][0]['id'];
            $referenceId = $data['purchase_units'][0]['reference_id'];
            $orderId = str_replace('order_', '', $referenceId);

            // Update internal order
            \App\Modules\Orders\Models\Order::find($orderId)?->update([
                'status'            => \App\Modules\Orders\Enums\OrderStatus::Paid,
                'paid_at'           => now(),
                'payment_reference' => $captureId,
            ]);
        }

        return response()->json($data);
    }

    // Webhook handler
    public function webhook(Request $request): JsonResponse
    {
        // Verify PayPal webhook signature
        $headers = $request->headers->all();
        $body    = $request->getContent();

        $eventType = $request->json('event_type');

        match ($eventType) {
            'PAYMENT.CAPTURE.COMPLETED'  => $this->onCaptureCompleted($request->json('resource')),
            'PAYMENT.CAPTURE.DENIED'     => $this->onCaptureDenied($request->json('resource')),
            'PAYMENT.CAPTURE.REFUNDED'   => $this->onCaptureRefunded($request->json('resource')),
            default                      => null,
        };

        return response()->json(['received' => true]);
    }
}
```

---

### 4.4 PayPal Webhook Events

| Event | Trigger | Action |
|---|---|---|
| `PAYMENT.CAPTURE.COMPLETED` | Payment captured | Mark order paid |
| `PAYMENT.CAPTURE.DENIED` | Payment denied | Mark order failed |
| `PAYMENT.CAPTURE.REFUNDED` | Refund issued | Mark order refunded |
| `PAYMENT.CAPTURE.REVERSED` | Capture reversed | Mark order reversed |
| `CHECKOUT.ORDER.APPROVED` | Buyer approved | Ready to capture |
| `CHECKOUT.ORDER.COMPLETED` | Order complete | Confirm fulfillment |

---

## 5. Wise — Payouts & Transfers

### 5.1 What Wise Is For

**Wise is NOT a customer payment method** — customers don't pay you through Wise.  

Wise is for **outgoing payments from your business**:
- Paying international suppliers
- Sending refunds internationally where credit card refunds fail
- Paying remote staff/contractors
- Receiving marketplace payouts in local currency

**For Brewscape specifically:**
- Paying coffee bean suppliers in Europe/Colombia
- Refunding international customers when card refunds fail
- Receiving bulk payouts from marketplace partners

**Base URL:** `https://api.transferwise.com`  
**Sandbox:** `https://api.sandbox.transferwise.tech`

---

### 5.2 Authentication

**Personal Token (for single account):**
```bash
curl https://api.transferwise.com/v3/profiles \
  -H "Authorization: Bearer YOUR_PERSONAL_TOKEN"
```

**OAuth 2.0 (for platforms acting on behalf of users):**
```
POST https://api.transferwise.com/oauth/token
  grant_type=authorization_code
  client_id=YOUR_CLIENT_ID
  client_secret=YOUR_CLIENT_SECRET
  code=AUTHORIZATION_CODE
  redirect_uri=YOUR_REDIRECT_URI

Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 43199,
  "refresh_token": "...",
  "scope": "transfers"
}
```

**Get your profile ID (needed for all transfers):**
```bash
GET /v3/profiles
# Returns array of profiles — use the BUSINESS profile ID
```

---

### 5.3 Transfer Flow — 4 Steps

#### Step 1: Create Quote
```bash
POST /v3/profiles/{profileId}/quotes
{
  "sourceCurrency": "USD",
  "targetCurrency": "EUR",
  "sourceAmount": 1000.00,
  "targetAmount": null,          # set one, leave the other null
  "payOut": "BANK_TRANSFER"
}

Response:
{
  "id": "quote-uuid-here",
  "sourceCurrency": "USD",
  "targetCurrency": "EUR",
  "sourceAmount": 1000.00,
  "targetAmount": 925.50,
  "rate": 0.9255,
  "fee": { "transferwise": 4.50, "total": 4.50 },
  "expirationTime": "2026-04-11T12:00:00Z",
  "paymentOptions": [
    { "payIn": "BANK_TRANSFER", "payOut": "BANK_TRANSFER", "fee": { "total": 4.50 } }
  ]
}
```

#### Step 2: Create Recipient Account
```bash
POST /v1/accounts
{
  "currency": "EUR",
  "type": "iban",
  "profile": {profileId},
  "accountHolderName": "Coffee Supplier GmbH",
  "details": {
    "iban": "DE89370400440532013000"
  }
}

Response:
{
  "id": 12345678,
  "accountHolderName": "Coffee Supplier GmbH",
  "currency": "EUR",
  "type": "iban"
}
```

Recipient types vary by currency:
| Currency | Type | Required Fields |
|---|---|---|
| EUR | `iban` | `iban` |
| GBP | `sort_code` | `sortCode`, `accountNumber` |
| USD | `aba` | `abartn`, `accountNumber`, `accountType` |
| AED | `emirates` | `iban` |
| CAD | `canadian` | `transitNumber`, `institutionNumber`, `accountNumber` |

#### Step 3: Create Transfer
```bash
POST /v1/transfers
{
  "targetAccount": 12345678,          # recipient account ID
  "quoteUuid": "quote-uuid-here",
  "customerTransactionId": "order-42-refund",  # your unique ID
  "details": {
    "reference": "Invoice INV-2026-042",
    "transferPurpose": "verification.transfers.purpose.pay.bills",
    "sourceOfFunds": "verification.source.of.funds.business"
  }
}

Response:
{
  "id": 99988877,
  "status": "incoming_payment_waiting",
  "sourceCurrency": "USD",
  "sourceValue": 1000.00,
  "targetCurrency": "EUR",
  "targetValue": 925.50,
  "created": "2026-04-11T10:00:00Z"
}
```

**Transfer statuses:**
| Status | Meaning |
|---|---|
| `incoming_payment_waiting` | Waiting for you to fund |
| `processing` | Wise processing the transfer |
| `funds_converted` | Currency exchanged |
| `outgoing_payment_sent` | Sent to recipient bank |
| `cancelled` | Cancelled |
| `funds_refunded` | Failed, money returned |
| `unknown` | Contact Wise support |

#### Step 4: Fund the Transfer
```bash
POST /v3/profiles/{profileId}/transfers/{transferId}/payments
{
  "type": "BALANCE"  # fund from Wise balance
  # or "BANK_TRANSFER" — you manually wire money to Wise
}

Response:
{
  "type": "BALANCE",
  "status": "COMPLETED",
  "balanceTransactionId": 123456
}
```

**Laravel implementation:**
```php
class WiseService
{
    private string $baseUrl = 'https://api.sandbox.transferwise.tech';
    private string $token;
    private int $profileId;

    public function __construct()
    {
        $this->token     = config('services.wise.api_token');
        $this->profileId = config('services.wise.profile_id');
    }

    public function sendPayout(
        string $currency,
        float  $amount,
        array  $recipient,
        string $reference
    ): array {
        // 1. Quote
        $quote = Http::withToken($this->token)
            ->post("{$this->baseUrl}/v3/profiles/{$this->profileId}/quotes", [
                'sourceCurrency' => 'USD',
                'targetCurrency' => $currency,
                'sourceAmount'   => $amount,
                'payOut'         => 'BANK_TRANSFER',
            ])->json();

        // 2. Recipient
        $recipientAccount = Http::withToken($this->token)
            ->post("{$this->baseUrl}/v1/accounts", array_merge(
                ['currency' => $currency, 'profile' => $this->profileId],
                $recipient
            ))->json();

        // 3. Transfer
        $transfer = Http::withToken($this->token)
            ->post("{$this->baseUrl}/v1/transfers", [
                'targetAccount'           => $recipientAccount['id'],
                'quoteUuid'               => $quote['id'],
                'customerTransactionId'   => $reference,
                'details'                 => ['reference' => $reference],
            ])->json();

        // 4. Fund
        $payment = Http::withToken($this->token)
            ->post("{$this->baseUrl}/v3/profiles/{$this->profileId}/transfers/{$transfer['id']}/payments", [
                'type' => 'BALANCE',
            ])->json();

        return ['transfer_id' => $transfer['id'], 'status' => $payment['status']];
    }
}
```

---

### 5.4 Wise Webhooks

```bash
POST /v3/profiles/{profileId}/subscriptions
{
  "name": "Brewscape Transfers Hook",
  "trigger_on": "transfers#state-change",
  "delivery": {
    "version": "2.0.0",
    "url": "https://api.brewscape.com/api/v1/wise/webhook"
  }
}
```

**Webhook events:**
| Event | Trigger |
|---|---|
| `transfers#state-change` | Transfer status changed |
| `balances#credit` | Balance credited |
| `balances#debit` | Balance debited |

---

## 6. Cash on Delivery (COD)

### What is COD?
Customer pays in cash (or card) at time of delivery. The courier collects and remits payment to the merchant.

### COD Flow in Brewscape

```
Customer selects COD
        │
        ▼
Order created with status = 'pending_cod'
        │
        ▼
Warehouse picks and ships order
        │
        ▼
Courier delivers, collects cash/card payment
        │
        ▼
Courier confirms delivery in system
        │
        ▼
Order status → 'delivered' + payment_method = 'cod'
        │
        ▼
Accounting reconciles cash daily
```

### Backend Implementation

**No payment gateway needed.** COD is handled purely through order state.

```php
// In CheckoutController — COD path
public function placeOrder(Request $request): JsonResponse
{
    $validated = $request->validate([
        'payment_method' => 'required|in:card,cod,paypal',
        // ... other fields
    ]);

    if ($validated['payment_method'] === 'cod') {
        $order = Order::create([
            'status'         => OrderStatus::Pending,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            // ... order fields
        ]);

        // Optional: COD surcharge (5 AED flat fee for MENA)
        if ($codFee = config('payments.cod_fee', 0)) {
            $order->increment('grand_total', $codFee);
        }

        // Send confirmation email with "Pay on delivery" note
        // Mail::to($order->email)->send(new OrderConfirmationMail($order));

        return response()->json([
            'order_id' => $order->id,
            'message'  => 'Order placed. Pay on delivery.',
        ]);
    }

    // ... handle card/paypal
}
```

**Admin marks COD as collected:**
```php
// Admin COD confirmation endpoint
Route::patch('/orders/{id}/cod-collected', function ($id) {
    $order = Order::findOrFail($id);
    $order->update([
        'status'         => OrderStatus::Delivered,
        'payment_status' => 'paid',
        'paid_at'        => now(),
    ]);
    return response()->json(['message' => 'COD collected']);
});
```

### COD Best Practices
1. **Order verification:** Send SMS/WhatsApp confirmation + require customer to confirm before dispatch
2. **Purchase limits:** Cap COD orders at $200 to limit exposure from non-delivery
3. **Fraud signals:** Flag COD orders from new addresses or high-risk areas
4. **Surcharge:** Charge a COD handling fee (AED 5–10) to offset courier cost
5. **Refund policy:** COD refunds are store credit only — cash refunds at scale are impossible
6. **Failed delivery:** If customer refuses, mark as `delivery_failed` and add address to risk list

---

## 7. Debit & Credit Cards — Direct

### Why You MUST Use a Provider's Hosted Fields
You cannot collect card numbers directly in your own form. Doing so:
- Puts you in PCI DSS Level 1 (full audit, $250K+/year)
- Exposes you to catastrophic data breach liability
- Violates Mastercard/Visa rules

**The correct approach:** Use Stripe's `PaymentElement` or PayPal's hosted card fields. Card data never reaches your server — Stripe's JavaScript intercepts it, tokenizes it, and gives you a token (`pm_xxx`).

### Card Data Flow (Correct)

```
Browser                 Stripe.js              Stripe Servers     Your Backend
   │                        │                        │                 │
   │──[card number]──────▶  │                        │                 │
   │                        │──[tokenize]──────────▶ │                 │
   │                        │◀─[payment_method_id]── │                 │
   │                        │                        │                 │
   │──[pm_xxx, amount]────────────────────────────────────────────────▶│
   │                        │                        │◀─[confirm PI]───│
   │                        │                        │                 │
   │◀───────────────────────────────────────[success]─────────────────│
```

### Saved Cards (Stripe)

```typescript
// Frontend: save card for future use
const { setupIntent } = await stripe.confirmSetup({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/account`,
  },
  redirect: 'if_required',
});

// Backend: attach payment method to customer
$stripe->paymentMethods->attach($paymentMethodId, [
    'customer' => $user->stripe_id,
]);

// Backend: charge saved card (off-session)
$stripe->paymentIntents->create([
    'amount'               => 2000,
    'currency'             => 'usd',
    'customer'             => $user->stripe_id,
    'payment_method'       => $savedPaymentMethodId,
    'off_session'          => true,
    'confirm'              => true,
]);
```

### Supported Card Networks
Stripe supports: Visa, Mastercard, American Express, Discover, UnionPay, JCB, Diners Club, Cartes Bancaires (France), Interac (Canada)

### Card Testing (Stripe Test Numbers)
| Number | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 3220` | 3D Secure required |
| `4000 0000 0000 9995` | Decline (insufficient funds) |
| `4000 0000 0000 0002` | Generic decline |
| `4100 0000 0000 0019` | Blocked (fraud) |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |

Use any future expiry date, any 3-digit CVV.

---

## 8. Implementation Plan for Brewscape

### Priority Order

**Phase 1 — Critical (Week 1–2)**
| Task | File | Notes |
|---|---|---|
| Create `/api/v1/payments/intent` endpoint | `PaymentController.php` | Returns client_secret |
| Replace fake card form with Stripe `PaymentElement` | `checkout/page.tsx` | Install `@stripe/react-stripe-js` |
| Implement real Stripe webhook handler | `PaymentController.php` | Verify signature, update order status |
| Exclude webhook from CSRF | `VerifyCsrfToken.php` | Already partially done |
| Add `payment_intent_id` column to orders table | Migration | For webhook matching |

**Phase 2 — PayPal (Week 3)**
| Task | File | Notes |
|---|---|---|
| Add PayPal credentials to config | `config/services.php` | Sandbox + prod |
| Create `PayPalController` | New controller | createOrder + captureOrder |
| Add `PayPalButton` React component | `src/components/PayPalButton.tsx` | Load SDK dynamically |
| Add PayPal webhook route | `routes/api_website.php` | |

**Phase 3 — COD improvements (Week 3)**
| Task | File | Notes |
|---|---|---|
| Add COD surcharge config | `config/payments.php` | AED 5 flat fee |
| Add OTP verification for COD orders | New service | Reduce fraud |
| Admin COD collection endpoint | Admin routes | PATCH `/orders/{id}/cod-collected` |

**Phase 4 — Wise Payouts (Week 4, internal only)**
| Task | File | Notes |
|---|---|---|
| Create `WiseService` | New service class | 4-step transfer flow |
| Admin payout trigger UI | Admin panel | Manual trigger for now |
| Wise webhook handler | New controller | Monitor transfer status |

### Required New Database Columns

```sql
-- Add to orders table
ALTER TABLE orders ADD COLUMN payment_intent_id VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255) NULL; -- capture ID
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'card';
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP NULL;
```

```php
// Migration
Schema::table('orders', function (Blueprint $table) {
    $table->string('payment_intent_id')->nullable()->after('status');
    $table->string('payment_reference')->nullable()->after('payment_intent_id');
    $table->string('payment_method', 50)->default('card')->after('payment_reference');
    $table->string('payment_status', 50)->default('pending')->after('payment_method');
    $table->timestamp('paid_at')->nullable()->after('payment_status');
});
```

---

## 9. Environment Variables Reference

```ini
# ─── Stripe ───────────────────────────────────────────────────
STRIPE_KEY=pk_live_...                    # Publishable — safe for frontend
STRIPE_SECRET=sk_live_...                 # Secret — backend ONLY
STRIPE_WEBHOOK_SECRET=whsec_...           # Webhook signing secret

# ─── PayPal ───────────────────────────────────────────────────
PAYPAL_CLIENT_ID=AXxx...                  # Public — used in JS SDK
PAYPAL_CLIENT_SECRET=ELxx...              # Backend ONLY
PAYPAL_SANDBOX=true                       # false in production
PAYPAL_WEBHOOK_ID=xxxx                    # For webhook verification

# ─── Wise ─────────────────────────────────────────────────────
WISE_API_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx    # Personal/API token
WISE_PROFILE_ID=12345678                  # Your business profile ID
WISE_SANDBOX=true                         # false in production

# ─── General ──────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Next.js env (storefront)
```

**Frontend `.env.local` (Next.js — safe to expose):**
```ini
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXxx...
```

---

## 10. Testing Reference

### Stripe Test Environment
```bash
# Use test keys (pk_test_... / sk_test_...)
# Test cards:
4242 4242 4242 4242  # Visa success
5555 5555 5555 4444  # Mastercard success
4000 0027 6000 3184  # 3DS2 required
4000 0000 0000 9995  # Decline: insufficient funds

# Test webhook locally
stripe login
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# Trigger specific events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.dispute.created
```

### PayPal Sandbox
1. Create sandbox accounts at developer.paypal.com
2. Use sandbox personal account email/password as the buyer
3. Test transactions appear in sandbox dashboard
4. Use `https://api-m.sandbox.paypal.com` base URL

### Wise Sandbox
- URL: `https://api.sandbox.transferwise.tech`
- Sandbox personal token from sandbox.transferwise.tech
- Test transfers complete immediately (no real money moves)

### Full Checkout Test Checklist
- [ ] Card success flow — order marked paid, confirmation email sent
- [ ] Card decline — error shown, order stays pending
- [ ] 3D Secure — auth popup shows, payment completes after
- [ ] Apple Pay — shows in Safari, processes correctly
- [ ] Google Pay — shows in Chrome, processes correctly
- [ ] PayPal — redirect to PayPal sandbox, capture on return
- [ ] COD — order placed, no payment gateway called
- [ ] Webhook — payment_intent.succeeded updates order status
- [ ] Duplicate webhook — idempotent, doesn't double-update
- [ ] Refund — charge.refunded webhook updates order to refunded

---

## 11. Gaps Filled — Additional Deep Detail

### 11.1 SetupIntent — Save Card Without Charging

Use `SetupIntent` when you want to save a card for later without charging immediately (e.g., "save card for future orders").

**Backend — create SetupIntent:**
```php
public function createSetupIntent(Request $request): JsonResponse
{
    $stripe = new StripeClient(config('services.stripe.secret'));

    // Create or retrieve Stripe customer
    $user = auth()->user();
    if (!$user->stripe_id) {
        $customer = $stripe->customers->create([
            'email' => $user->email,
            'name'  => $user->name,
            'metadata' => ['user_id' => $user->id],
        ]);
        $user->update(['stripe_id' => $customer->id]);
    }

    $setupIntent = $stripe->setupIntents->create([
        'customer'                  => $user->stripe_id,
        'automatic_payment_methods' => ['enabled' => true],
    ]);

    return response()->json(['client_secret' => $setupIntent->client_secret]);
}
```

**Frontend — save card form (React):**
```typescript
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

function SaveCardForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account?saved=true`,
      },
      redirect: 'if_required', // only redirect for methods that need it (iDEAL, etc.)
    });

    if (error) console.error(error.message);
    // On success with redirect: 'if_required', card is saved — no page navigation needed
  };

  return (
    <form onSubmit={handleSave}>
      <PaymentElement />
      <button type="submit">Save Card</button>
    </form>
  );
}
```

**Charge saved card later (off-session):**
```php
// Backend: charge a saved payment method
public function chargeStoredCard(Request $request): JsonResponse
{
    $stripe = new StripeClient(config('services.stripe.secret'));
    $user   = auth()->user();

    try {
        $intent = $stripe->paymentIntents->create([
            'amount'         => $request->amount_cents,
            'currency'       => 'usd',
            'customer'       => $user->stripe_id,
            'payment_method' => $request->payment_method_id, // pm_xxx from saved card
            'off_session'    => true,
            'confirm'        => true,
        ]);

        return response()->json(['status' => $intent->status]);

    } catch (\Stripe\Exception\CardException $e) {
        // Card declined — customer needs to authenticate
        if ($e->getError()->code === 'authentication_required') {
            return response()->json([
                'error'         => 'authentication_required',
                'client_secret' => $e->getError()->payment_intent->client_secret,
            ], 402);
        }
        return response()->json(['error' => $e->getMessage()], 422);
    }
}
```

---

### 11.2 3D Secure (3DS) — Complete Flow

3DS is triggered automatically by Stripe when required. You do not need to handle it manually if you use `PaymentElement` — it handles the challenge UI natively.

**When 3DS triggers:**
- European transactions (SCA regulation mandates it)
- Stripe Radar flags the transaction as risky
- Issuer soft-declines and requests auth
- You manually set `request_three_d_secure: 'challenge'`

**How PaymentElement handles it automatically:**
`confirmPayment()` from `@stripe/react-stripe-js` handles the full 3DS redirect and returns only when the auth is complete. You do NOT need to call `handleNextAction` manually when using `PaymentElement`.

**Manual `handleNextAction` (only needed if using raw `confirmCardPayment`):**
```typescript
// Only needed for legacy confirmCardPayment flows
const { paymentIntent, error } = await stripe.confirmCardPayment(
  clientSecret,
  { payment_method: { card: cardElement } },
  { handleActions: false } // don't auto-handle, we'll do it manually
);

if (paymentIntent?.status === 'requires_action') {
  const { error: actionError } = await stripe.handleNextAction({
    clientSecret: paymentIntent.client_secret!,
  });
  // handleNextAction opens the 3DS modal and waits for the user
  if (actionError) console.error('3DS failed:', actionError);
}
```

**3DS `next_action` object structure (when status = `requires_action`):**
```json
{
  "next_action": {
    "type": "redirect_to_url",
    "redirect_to_url": {
      "url": "https://hooks.stripe.com/3d_secure_2/...",
      "return_url": "https://brewscape.com/checkout"
    }
  }
}
```

**Content Security Policy headers required for 3DS iframes:**
```
Content-Security-Policy: frame-src https://js.stripe.com https://hooks.stripe.com;
```

**3DS Test Cards:**
| Card | Behaviour |
|---|---|
| `4000 0000 0000 3220` | Always requires 3DS2 challenge |
| `4000 0025 0000 3155` | 3DS for off-session only |
| `4000 0084 0000 1629` | Auth succeeds but charge declines |
| `4000 0000 0000 3055` | 3DS optional (may or may not trigger) |

**Liability shift:** When 3DS succeeds, the card issuer is liable for fraudulent chargebacks — not you.

---

### 11.3 Stripe Refund API — Complete Reference

**Create a refund (Laravel/PHP):**
```php
public function refundOrder(Request $request, int $orderId): JsonResponse
{
    $order = Order::findOrFail($orderId);

    // Ensure order is paid
    if (!$order->payment_intent_id) {
        return response()->json(['message' => 'No payment to refund'], 422);
    }

    $stripe = new StripeClient(config('services.stripe.secret'));

    $refund = $stripe->refunds->create([
        'payment_intent' => $order->payment_intent_id,
        'amount'         => $request->amount_cents ?? null, // null = full refund
        'reason'         => $request->reason ?? 'requested_by_customer',
        'metadata'       => ['order_id' => $order->id, 'admin_id' => auth()->id()],
    ]);

    if ($refund->status === 'succeeded') {
        $order->update([
            'status'            => OrderStatus::Refunded,
            'payment_status'    => 'refunded',
            'refund_id'         => $refund->id,
        ]);
    }

    return response()->json([
        'refund_id' => $refund->id,
        'status'    => $refund->status,
        'amount'    => $refund->amount,
    ]);
}
```

**Refund parameters:**
| Parameter | Type | Notes |
|---|---|---|
| `payment_intent` | string | Preferred — refund by PI ID |
| `charge` | string | Alternative — refund by charge ID |
| `amount` | integer | Cents. Omit for full refund |
| `reason` | enum | `duplicate`, `fraudulent`, `requested_by_customer` |
| `metadata` | object | Up to 50 key-value pairs |
| `instructions_email` | string | For non-card methods that need manual refund |

**Refund statuses:**
| Status | Meaning |
|---|---|
| `pending` | Not yet submitted (insufficient balance) |
| `succeeded` | Refund issued, customer will see credit in 5–10 days |
| `failed` | Bank rejected the refund |
| `canceled` | Refund canceled before reaching customer |

**Partial refunds:** Call `refunds->create()` multiple times. Sum cannot exceed original charge. Example: $100 order → refund $40 + refund $60 = done. Stripe enforces this automatically.

**Refund webhook events:**
```
refund.created        → log it
refund.updated        → reference number added (for SEPA etc.)
refund.failed         → alert operations, manual resolution needed
charge.refunded       → order fully refunded (check charge.amount_refunded)
```

**Disputes vs refunds:** If a customer files a chargeback on a payment you've already refunded, do NOT issue another refund. Accept/challenge the dispute instead — Stripe handles deduplication.

---

### 11.4 PayPal Webhook Signature Verification (PHP)

PayPal uses a different verification approach than Stripe. Two methods:

**Method 1 — API-based verification (recommended):**
```php
public function verifyPayPalWebhook(Request $request): bool
{
    $token = $this->getAccessToken();

    $response = Http::withToken($token)
        ->post("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", [
            'auth_algo'         => $request->header('PAYPAL-AUTH-ALGO'),
            'cert_url'          => $request->header('PAYPAL-CERT-URL'),
            'transmission_id'   => $request->header('PAYPAL-TRANSMISSION-ID'),
            'transmission_sig'  => $request->header('PAYPAL-TRANSMISSION-SIG'),
            'transmission_time' => $request->header('PAYPAL-TRANSMISSION-TIME'),
            'webhook_id'        => config('services.paypal.webhook_id'),
            'webhook_event'     => $request->json()->all(),
        ]);

    return $response->json('verification_status') === 'SUCCESS';
}
```

**Method 2 — Local verification (faster, no extra API call):**
```php
// Headers needed for local verification:
// PAYPAL-TRANSMISSION-ID | PAYPAL-TRANSMISSION-TIME | PAYPAL-CERT-URL
// PAYPAL-AUTH-ALGO | PAYPAL-TRANSMISSION-SIG

$crc32 = crc32($request->getContent());
$message = sprintf(
    '%s|%s|%s|%s',
    $request->header('PAYPAL-TRANSMISSION-ID'),
    $request->header('PAYPAL-TRANSMISSION-TIME'),
    config('services.paypal.webhook_id'),
    $crc32
);

// Download cert from PAYPAL-CERT-URL (cache it)
$cert = file_get_contents($request->header('PAYPAL-CERT-URL'));
$pubKey = openssl_get_publickey($cert);

$verified = openssl_verify(
    $message,
    base64_decode($request->header('PAYPAL-TRANSMISSION-SIG')),
    $pubKey,
    OPENSSL_ALGO_SHA256
) === 1;
```

**PayPal webhook events full list:**
| Event | When | Action |
|---|---|---|
| `PAYMENT.CAPTURE.COMPLETED` | Payment captured | Mark order paid |
| `PAYMENT.CAPTURE.DENIED` | Payment denied | Mark order failed |
| `PAYMENT.CAPTURE.REFUNDED` | Refund issued | Mark order refunded |
| `PAYMENT.CAPTURE.REVERSED` | Capture reversed | Alert operations |
| `PAYMENT.CAPTURE.PENDING` | Pending (review) | Hold order |
| `CHECKOUT.ORDER.APPROVED` | Buyer approved | Trigger capture |
| `CHECKOUT.ORDER.COMPLETED` | Order complete | Confirm fulfillment |
| `CUSTOMER.DISPUTE.CREATED` | Chargeback filed | Alert team |
| `CUSTOMER.DISPUTE.RESOLVED` | Dispute settled | Update records |

---

### 11.5 Wise — Sandbox & Rate Limits

**Sandbox vs Production URLs:**
```
Sandbox:    https://api.sandbox.transferwise.tech
Production: https://api.wise.com
```

**Sandbox setup:**
1. Go to sandbox.transferwise.tech
2. Create sandbox account
3. Settings → API tokens → Create token
4. Sandbox accounts are pre-funded with 1,000,000 GBP equivalent test credit
5. Transfers in sandbox complete immediately (no waiting for bank)
6. Not all currencies/routes available in sandbox vs production

**Token types:**
| Type | Use Case | Expiry |
|---|---|---|
| Personal API token | Your own business account automation | Never (until revoked) |
| OAuth user access token | Acting on behalf of customers | 12 hours |
| OAuth refresh token | Getting new access tokens | Long-lived |
| Client credentials token | App-level (unauthenticated quotes) | Varies |

**Rate limits:** Not publicly documented — Wise recommends contacting their team for enterprise limits. Default: be conservative with ~10 req/sec.

**Required setup for production:**
- Partnership agreement with Wise
- mTLS certificate (mutual TLS) for enhanced security
- Client ID + Client Secret from Wise partner portal
- JOSE signing for tamper-proof API calls

---

### 11.6 Checkout Session vs PaymentIntent — When to Use Which

| Feature | Checkout Session | PaymentIntent |
|---|---|---|
| Setup effort | Low (Stripe hosts the UI) | Higher (you build the UI) |
| UI control | Limited (Stripe's design) | Full control |
| Tax handling | Built-in | Manual |
| Subscriptions | Built-in | Manual |
| Coupons/discounts | Built-in | Manual |
| Embedded on your page | Yes (`ui_mode: embedded`) | Yes |
| Custom payment flows | No | Yes |
| Save card + pay later | Via SetupMode | Via SetupIntent |
| Recommended for Brewscape | No (not enough UI control) | Yes |

**Brewscape uses PaymentIntent** — full UI control needed for branded checkout.

---

### 11.7 Stripe Idempotency Keys

Always send idempotency keys to prevent double charges on network retries:

```php
// Laravel/PHP
$intent = $stripe->paymentIntents->create(
    [ /* params */ ],
    [ 'idempotency_key' => 'order_' . $order->id . '_' . date('Ymd') ]
);
```

```typescript
// Frontend: safe because client_secret is single-use — no extra key needed
// Backend: ALWAYS use idempotency_key on create/confirm
```

Rules:
- Key must be unique per **intended operation** (not per request)
- Reusing same key with same params → returns cached response (safe)
- Reusing same key with **different** params → throws `IdempotencyError`
- Keys expire after 24 hours
- Use `order_{id}` or `order_{id}_retry_{n}` as the key

---

## 12. How to Store API Keys Securely

This section directly answers: **how do you store payment keys so they are never exposed or leaked?**

### The Golden Rule
> A secret key that touches version control (Git) or client-side JavaScript is already compromised. Treat it as if it is public.

### What Goes Where

| Key | Prefix | Lives In | Accessible By |
|---|---|---|---|
| Stripe publishable key | `pk_live_...` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local` | Browser — intentionally public |
| Stripe secret key | `sk_live_...` | `.env` (Laravel) only | Server only — NEVER in frontend |
| Stripe webhook secret | `whsec_...` | `.env` (Laravel) only | Server only |
| PayPal client ID | `AXxx...` | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in `.env.local` | Browser — safe for JS SDK |
| PayPal client secret | `ELxx...` | `.env` (Laravel) only | Server only |
| PayPal webhook ID | string | `.env` (Laravel) only | Server only |
| Wise API token | UUID | `.env` (Laravel) only | Server only |
| Wise profile ID | integer | `.env` (Laravel) only | Server only |

### Step 1 — Local Development

**Next.js storefront — `.env.local`:**
```ini
# Safe to expose (NEXT_PUBLIC_ = bundled into browser JS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXxx_sandbox...

# Never add sk_live, sk_test, or any secret here
```

**Laravel backend — `.env`:**
```ini
# Never commit this file. Already in .gitignore by default.
STRIPE_KEY=pk_test_51...
STRIPE_SECRET=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_test...

PAYPAL_CLIENT_ID=AXxx_sandbox...
PAYPAL_CLIENT_SECRET=ELxx_sandbox...
PAYPAL_WEBHOOK_ID=xxxx
PAYPAL_SANDBOX=true

WISE_API_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
WISE_PROFILE_ID=12345678
WISE_SANDBOX=true
```

**`.gitignore` — verify these are listed:**
```
# Storefront
.env
.env.local
.env*.local

# Laravel
.env
.env.backup
```

### Step 2 — Production Deployment

Never put real keys in any file that gets committed to Git. For production, use your hosting platform's secret manager:

**Option A — Laravel Forge (recommended for this stack):**
1. Go to Site → Environment on Forge
2. Edit the `.env` directly in the Forge dashboard
3. Forge stores it encrypted and injects it at runtime
4. The file on the server is permission `600` (owner-readable only)
5. You never commit it, it never enters Git

**Option B — Laravel's built-in encrypted env (Laravel 9+):**
```bash
# Encrypt your .env file — safe to commit the output
php artisan env:encrypt --key=base64:YOUR_32_BYTE_KEY

# The encrypted .env.encrypted can live in Git
# Decrypt on the server:
php artisan env:decrypt --key=base64:YOUR_32_BYTE_KEY
```
Keep the decryption key in your CI/CD system secrets or Forge environment variable, not in the repo.

**Option C — AWS Secrets Manager / HashiCorp Vault:**
```php
// Pull secrets at runtime in AppServiceProvider
use Aws\SecretsManager\SecretsManagerClient;

$client = new SecretsManagerClient(['region' => 'us-east-1']);
$secret = $client->getSecretValue(['SecretId' => 'brewscape/stripe']);
$values = json_decode($secret['SecretString'], true);

config(['services.stripe.secret' => $values['STRIPE_SECRET']]);
```

**Option D — GitHub Actions CI/CD:**
```yaml
# In .github/workflows/deploy.yml
env:
  STRIPE_SECRET: ${{ secrets.STRIPE_SECRET }}
  WISE_API_TOKEN: ${{ secrets.WISE_API_TOKEN }}
```
Store secrets in: GitHub repo → Settings → Secrets and variables → Actions

### Step 3 — Verify Nothing Is Leaked

**Check your frontend bundle doesn't contain secrets:**
```bash
# Build the Next.js app
npm run build

# Search the output for your secret key prefix
grep -r "sk_" .next/
grep -r "whsec_" .next/
# If anything shows — you have a leak. Fix immediately.
```

**Verify Laravel doesn't log secrets:**
```php
// config/logging.php — add a filter to scrub secrets
'processors' => [
    fn($record) => array_merge($record, [
        'context' => collect($record['context'])
            ->map(fn($v, $k) => str_contains(strtolower($k), 'secret') ? '***' : $v)
            ->all()
    ])
],
```

**Rotate a key if you suspect exposure:**
1. Stripe Dashboard → Developers → API keys → Roll key
2. Update `.env` / Forge / Secrets Manager immediately
3. Old key is invalidated instantly
4. Never delete webhook secret without updating webhook config first

### Step 4 — Server File Permissions

```bash
# On your production server
chmod 600 /var/www/brewscape/backend/.env
chown www-data:www-data /var/www/brewscape/backend/.env

# Verify no world-readable .env
ls -la /var/www/brewscape/backend/.env
# Should show: -rw------- 1 www-data www-data
```

### Step 5 — Per-Environment Keys

Use **different keys** for development, staging, and production:

| Environment | Stripe | PayPal | Wise |
|---|---|---|---|
| Local dev | `pk_test_...` / `sk_test_...` | Sandbox credentials | Sandbox token |
| Staging | `pk_test_...` / `sk_test_...` | Sandbox credentials | Sandbox token |
| Production | `pk_live_...` / `sk_live_...` | Live credentials | Live token |

Never use live keys in development. A test charge with `sk_live_` charges a real card.

### Summary Checklist

- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] `git log --all -- .env` shows no history of commits with `.env`
- [ ] `NEXT_PUBLIC_` only contains publishable/public keys
- [ ] Production secrets are in Forge / AWS / GitHub secrets — NOT in the repo
- [ ] `.env` on server has `600` permissions
- [ ] Separate keys per environment (test vs live)
- [ ] Webhook secrets verified on every incoming request before trusting payload
- [ ] Build output searched for any `sk_` or `whsec_` strings
- [ ] Key rotation procedure documented and tested

---

## Sources

- [Stripe Payment Intents API](https://docs.stripe.com/payments/payment-intents)
- [Stripe PaymentIntent Create Reference](https://docs.stripe.com/api/payment_intents/create)
- [Stripe PaymentElement](https://docs.stripe.com/payments/payment-element)
- [Stripe PaymentIntent Lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle)
- [Stripe Google Pay](https://docs.stripe.com/google-pay)
- [Stripe.js Reference](https://docs.stripe.com/js)
- [Stripe PCI Compliance Guide](https://stripe.com/guides/pci-compliance)
- [Laravel Cashier (Stripe) — Laravel 12.x](https://laravel.com/docs/12.x/billing)
- [spatie/laravel-stripe-webhooks](https://github.com/spatie/laravel-stripe-webhooks)
- [PayPal Orders v2 API](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal REST API Getting Started](https://developer.paypal.com/api/rest/)
- [PayPal Standard Checkout Integration](https://developer.paypal.com/studio/checkout/standard/integrate)
- [PayPal Checkout Orders API Use Cases](https://developer.paypal.com/api/rest/integration/orders-api/)
- [Wise Platform API Reference](https://docs.wise.com/api-reference)
- [Wise Enterprise Payout Guide](https://docs.wise.com/guides/product/send-money/use-cases/enterprise/send-money)
- [Wise Standard Transfers](https://docs.wise.com/guides/product/send-money/standard-api-transfers)
- [PCI Security Standards Council](https://www.pcisecuritystandards.org/)
- [Tokenization for PCI DSS Compliance](https://www.securitymetrics.com/blog/what-tokenization-and-how-can-i-use-it-pci-dss-compliance)
- [COD Best Practices — Elite Extra](https://eliteextra.com/best-practices-for-managing-cash-on-delivery/)
- [Stripe + Next.js 2026 Guide](https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33)
- [Stripe Webhook Setup — Laravel Daily](https://laraveldaily.com/lesson/laravel-http-client-api/stripe-webhooks-processing)
