@extends('emails.layout')

@section('body')
<h2>{{ $locale === 'fr' ? 'Votre commande est en route ! 🚚' : "Your order is on its way! 🚚" }}</h2>

<p>{{ $locale === 'fr' ? "Bonjour {$customer_name}," : "Hello {$customer_name}," }}</p>

<p>
  {{ $locale === 'fr'
    ? "Excellente nouvelle ! Votre commande a été expédiée."
    : "Great news! Your order has been shipped." }}
</p>

<div class="highlight">
  <strong>{{ $locale === 'fr' ? 'Commande :' : 'Order:' }}</strong> {{ $order_number }}<br>
  <strong>{{ $locale === 'fr' ? 'N° de suivi :' : 'Tracking number:' }}</strong> {{ $tracking_number }}
</div>

<p style="text-align:center;">
  <a href="{{ $order_url }}" class="btn">{{ $locale === 'fr' ? 'Suivre ma commande' : 'Track my order' }}</a>
</p>
@endsection
