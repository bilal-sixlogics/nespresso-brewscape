@extends('emails.layout')
@section('body')
<h2>{{ $locale === 'fr' ? 'Commande annulée' : 'Order Cancelled' }}</h2>
<p>{{ $locale === 'fr' ? "Bonjour {$customer_name}," : "Hello {$customer_name}," }}</p>
<p>{{ $locale === 'fr' ? "Votre commande #{$order_number} a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter." : "Your order #{$order_number} has been cancelled. If you have any questions, please don't hesitate to contact us." }}</p>
<p style="text-align:center;"><a href="{{ $shop_url }}" class="btn">{{ $locale === 'fr' ? 'Retourner à la boutique' : 'Return to shop' }}</a></p>
@endsection
