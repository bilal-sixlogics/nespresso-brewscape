<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $brandName }}</title>
<style>
  body { margin:0; padding:0; background:#F5F0E8; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
  .wrapper { width:100%; background:#F5F0E8; padding:40px 0; }
  .container { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:{{ $color }}; padding:32px 40px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:24px; font-weight:300; letter-spacing:0.1em; }
  .body { padding:40px; font-size:15px; line-height:1.7; color:#444; }
  .footer { background:#F5F0E8; padding:20px 40px; text-align:center; border-top:1px solid #e5e0d8; }
  .footer p { color:#aaa; font-size:12px; margin:4px 0; }
  .footer a { color:#aaa; text-decoration:underline; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header"><h1>{{ strtoupper($brandName) }}</h1></div>
    <div class="body">
      @if(!empty($subscriberName))
        <p>Bonjour {{ $subscriberName }},</p>
      @endif
      {!! $body !!}
    </div>
    <div class="footer">
      <p>&copy; {{ date('Y') }} {{ $brandName }}. Tous droits réservés.</p>
      <p><a href="{{ $unsubscribeUrl }}">Se désabonner / Unsubscribe</a></p>
    </div>
  </div>
</div>
</body>
</html>
