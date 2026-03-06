@extends('emails.layout')
@section('body')
<h2>{{ $locale === 'fr' ? '📦 Votre commande est arrivée !' : '📦 Your order has arrived!' }}</h2>
<p>{{ $locale === 'fr' ? "Bonjour {$customer_name}," : "Hello {$customer_name}," }}</p>
<p>{{ $locale === 'fr' ? "Votre commande #{$order_number} a bien été livrée. Nous espérons qu'elle vous ravira !" : "Your order #{$order_number} has been delivered. We hope you enjoy it!" }}</p>
<p style="text-align:center;"><a href="{{ $review_url }}" class="btn">{{ $locale === 'fr' ? 'Laisser un avis ☕' : 'Leave a review ☕' }}</a></p>
<div class="divider"></div>
<p><a href="{{ $order_url }}" style="color:{{ $color }}">{{ $locale === 'fr' ? '→ Voir ma commande' : '→ View my order' }}</a></p>
@endsection
