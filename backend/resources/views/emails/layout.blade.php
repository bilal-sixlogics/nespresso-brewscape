<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{ $brandName ?? 'Cafrezzo' }}</title>
<style>
  body { margin:0; padding:0; background:#F5F0E8; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#111; }
  .wrapper { width:100%; background:#F5F0E8; padding:40px 0; }
  .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:{{ $color ?? '#3C7A58' }}; padding:32px 40px; text-align:center; }
  .header img { height:40px; }
  .header h1 { color:#ffffff; margin:12px 0 0; font-size:20px; letter-spacing:0.05em; font-weight:300; }
  .body { padding:40px; }
  .footer { background:#F5F0E8; padding:24px 40px; text-align:center; border-top:1px solid #e5e0d8; }
  .footer p { color:#888; font-size:12px; margin:4px 0; }
  .footer a { color:#888; text-decoration:none; }
  .btn { display:inline-block; background:{{ $color ?? '#3C7A58' }}; color:#ffffff !important; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:14px; font-weight:600; letter-spacing:0.03em; margin:20px 0; }
  h2 { color:#111; font-size:22px; font-weight:700; margin:0 0 20px; }
  p { color:#444; line-height:1.7; font-size:15px; margin:0 0 16px; }
  .highlight { background:#F5F0E8; border-left:4px solid {{ $color ?? '#3C7A58' }}; padding:16px 20px; border-radius:0 8px 8px 0; margin:20px 0; }
  table.order-items { width:100%; border-collapse:collapse; margin:20px 0; }
  table.order-items th { background:#F5F0E8; padding:10px 12px; text-align:left; font-size:12px; text-transform:uppercase; color:#888; border-bottom:2px solid #e5e0d8; }
  table.order-items td { padding:12px; border-bottom:1px solid #f0ebe3; font-size:14px; vertical-align:middle; }
  .divider { height:1px; background:#f0ebe3; margin:24px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      @if(!empty($logo))
        <img src="{{ $logo }}" alt="{{ $brandName }}">
      @else
        <h1>{{ strtoupper($brandName ?? 'CAFREZZO') }}</h1>
      @endif
    </div>
    <div class="body">
      {!! $body !!}
    </div>
    <div class="footer">
      <p>&copy; {{ date('Y') }} {{ $brandName ?? 'Cafrezzo' }}. Tous droits réservés.</p>
      <p><a href="{{ config('app.url') }}">{{ config('app.url') }}</a></p>
    </div>
  </div>
</div>
</body>
</html>
