@extends('emails.layout')

@section('body')
<h2>{{ $locale === 'fr' ? "Bienvenue chez Cafrezzo ☕" : "Welcome to Cafrezzo ☕" }}</h2>

<p>{{ $locale === 'fr' ? "Bonjour {$customer_name}," : "Hello {$customer_name}," }}</p>

<p>
  {{ $locale === 'fr'
    ? "Votre compte a été créé avec succès. Découvrez notre sélection de cafés d'exception et commencez votre expérience Cafrezzo."
    : "Your account has been successfully created. Discover our selection of exceptional coffees and start your Cafrezzo experience." }}
</p>

<p style="text-align:center;">
  <a href="{{ $shop_url }}" class="btn">{{ $locale === 'fr' ? 'Découvrir la boutique' : 'Explore the shop' }}</a>
</p>

<div class="divider"></div>

<p>
  <a href="{{ $account_url }}" style="color:{{ $color }}">
    {{ $locale === 'fr' ? '→ Accéder à mon compte' : '→ Access my account' }}
  </a>
</p>
@endsection
