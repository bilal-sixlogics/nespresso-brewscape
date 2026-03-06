@extends('emails.layout')

@section('body')
<h2>{{ $locale === 'fr' ? 'Commande confirmée ✓' : 'Order Confirmed ✓' }}</h2>

<p>{{ $locale === 'fr' ? "Bonjour {$customer_name}," : "Hello {$customer_name}," }}</p>

<p>
  {{ $locale === 'fr'
    ? "Merci pour votre commande. Nous l'avons bien reçue et nous la préparons avec soin."
    : "Thank you for your order. We've received it and are preparing it with care." }}
</p>

<div class="highlight">
  <strong>{{ $locale === 'fr' ? 'Numéro de commande :' : 'Order number:' }}</strong> {{ $order_number }}<br>
  <strong>{{ $locale === 'fr' ? 'Total :' : 'Total:' }}</strong> {{ $order_total }}<br>
  <strong>{{ $locale === 'fr' ? 'Livraison :' : 'Delivery:' }}</strong> {{ $delivery_name }} ({{ $estimated_days }})
</div>

<p style="text-align:center;">
  <a href="{{ $order_url }}" class="btn">
    {{ $locale === 'fr' ? 'Voir ma commande' : 'View my order' }}
  </a>
</p>

<div class="divider"></div>

<p style="color:#888; font-size:13px;">
  {{ $locale === 'fr'
    ? "Vous recevrez un email dès que votre commande sera expédiée."
    : "You'll receive another email once your order has shipped." }}
</p>
@endsection
