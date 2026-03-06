<!DOCTYPE html>
<html lang="{{ $locale ?? 'fr' }}">
<head>
<meta charset="UTF-8">
<title>Reçu {{ $order->order_number }}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, Arial, sans-serif; color: #111; font-size: 13px; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3C7A58; padding-bottom: 20px; }
  .brand { font-size: 28px; font-weight: 700; color: #3C7A58; letter-spacing: 0.05em; }
  .receipt-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
  .order-number { font-size: 18px; font-weight: 700; color: #111; }
  .meta { display: flex; gap: 40px; margin-bottom: 30px; }
  .meta-block h4 { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.08em; margin-bottom: 6px; }
  .meta-block p { font-size: 13px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #f5f0e8; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #888; border-bottom: 2px solid #e5e0d8; }
  td { padding: 12px; border-bottom: 1px solid #f0ebe3; vertical-align: middle; }
  .totals { width: 280px; margin-left: auto; margin-top: 10px; }
  .totals tr td { border: none; padding: 5px 12px; }
  .totals tr.grand-total td { font-weight: 700; font-size: 16px; border-top: 2px solid #3C7A58; padding-top: 10px; color: #3C7A58; }
  .badge { display: inline-block; background: #3C7A58; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e0d8; font-size: 11px; color: #aaa; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">CAFREZZO</div>
    <div style="font-size:12px; color:#888; margin-top:4px;">{{ config('app.url') }}</div>
  </div>
  <div style="text-align:right;">
    <div class="receipt-label">{{ $locale === 'fr' ? 'Reçu de commande' : 'Order Receipt' }}</div>
    <div class="order-number">#{{ $order->order_number }}</div>
    <div style="color:#888; font-size:12px; margin-top:4px;">
      {{ $order->created_at->format('d/m/Y') }}
    </div>
    <div style="margin-top:8px;"><span class="badge">{{ ucfirst($order->status) }}</span></div>
  </div>
</div>

<div class="meta">
  <div class="meta-block">
    <h4>{{ $locale === 'fr' ? 'Client' : 'Customer' }}</h4>
    <p>{{ $order->user->name }}<br>{{ $order->user->email }}</p>
  </div>
  @if($order->shippingAddress)
  <div class="meta-block">
    <h4>{{ $locale === 'fr' ? 'Livraison' : 'Shipping' }}</h4>
    <p>
      {{ $order->shippingAddress->first_name }} {{ $order->shippingAddress->last_name }}<br>
      {{ $order->shippingAddress->address }}<br>
      {{ $order->shippingAddress->postal_code }} {{ $order->shippingAddress->city }}, {{ $order->shippingAddress->country }}
    </p>
  </div>
  @endif
  <div class="meta-block">
    <h4>{{ $locale === 'fr' ? 'Paiement' : 'Payment' }}</h4>
    <p>{{ $order->paymentMethod?->name ?? '—' }}</p>
    @if($order->deliveryType)
    <h4 style="margin-top:10px;">{{ $locale === 'fr' ? 'Expédition' : 'Delivery' }}</h4>
    <p>{{ $order->deliveryType->name }}</p>
    @endif
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>{{ $locale === 'fr' ? 'Produit' : 'Product' }}</th>
      <th>SKU</th>
      <th style="text-align:center;">{{ $locale === 'fr' ? 'Qté' : 'Qty' }}</th>
      <th style="text-align:right;">{{ $locale === 'fr' ? 'Prix unitaire' : 'Unit price' }}</th>
      <th style="text-align:right;">Total</th>
    </tr>
  </thead>
  <tbody>
    @foreach($order->items as $item)
    <tr>
      <td>{{ $item->product_snapshot['name'] ?? $item->product?->name ?? '—' }}</td>
      <td style="color:#888; font-size:12px;">{{ $item->product_snapshot['sku'] ?? '—' }}</td>
      <td style="text-align:center;">{{ $item->quantity }}</td>
      <td style="text-align:right;">{{ number_format($item->unit_price, 2) }} €</td>
      <td style="text-align:right; font-weight:600;">{{ number_format($item->line_total, 2) }} €</td>
    </tr>
    @endforeach
  </tbody>
</table>

<table class="totals">
  <tr>
    <td style="color:#888;">{{ $locale === 'fr' ? 'Sous-total' : 'Subtotal' }}</td>
    <td style="text-align:right;">{{ number_format($order->subtotal, 2) }} €</td>
  </tr>
  @if($order->discount_amount > 0)
  <tr>
    <td style="color:#3C7A58;">{{ $locale === 'fr' ? 'Remise' : 'Discount' }} {{ $order->promo_code ? "({$order->promo_code})" : '' }}</td>
    <td style="text-align:right; color:#3C7A58;">-{{ number_format($order->discount_amount, 2) }} €</td>
  </tr>
  @endif
  <tr>
    <td style="color:#888;">{{ $locale === 'fr' ? 'Livraison' : 'Shipping' }}</td>
    <td style="text-align:right;">{{ number_format($order->shipping_cost, 2) }} €</td>
  </tr>
  @if(($taxEnabled ?? false) && ($order->tax_amount ?? 0) > 0)
  <tr>
    <td style="color:#888;">
      {{ $taxLabel ?? ($locale === 'fr' ? 'TVA' : 'VAT') }}
      @if($taxInclusive ?? true)<span style="font-size:10px;color:#bbb;"> ({{ $locale === 'fr' ? 'incluse' : 'inclusive' }})</span>@endif
    </td>
    <td style="text-align:right; color:#888;">{{ number_format($order->tax_amount, 2) }} €</td>
  </tr>
  @endif
  <tr class="grand-total">
    <td>Total</td>
    <td style="text-align:right;">{{ number_format($order->total, 2) }} €</td>
  </tr>
</table>

<div class="footer">
  <p>{{ $locale === 'fr' ? 'Merci pour votre confiance.' : 'Thank you for your purchase.' }} — Cafrezzo</p>
  <p style="margin-top:6px;">{{ config('app.url') }} · contact@cafrezzo.com</p>
</div>
</body>
</html>
