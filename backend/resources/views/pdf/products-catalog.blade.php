<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #111; margin: 0; padding: 0; }
  .header { background: #3C7A58; color: #fff; padding: 20px 30px; }
  .header h1 { margin: 0; font-size: 22px; letter-spacing: 2px; }
  .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.8; }
  .content { padding: 20px 30px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #3C7A58; color: #fff; text-align: left; padding: 8px 10px; font-size: 10px; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red   { background: #fee2e2; color: #991b1b; }
  .badge-blue  { background: #dbeafe; color: #1e40af; }
  .footer { text-align: center; font-size: 9px; color: #aaa; padding: 10px; border-top: 1px solid #eee; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>
<div class="header">
  <h1>CAFREZZO</h1>
  <p>Catalogue Produits — Exporté le {{ now()->format('d/m/Y H:i') }}</p>
</div>
<div class="content">
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Nom</th>
        <th>Catégorie</th>
        <th>Marque</th>
        <th>Prix</th>
        <th>Remise</th>
        <th>Stock</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      @foreach($products as $i => $product)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>
          <strong>{{ $product->name }}</strong>
          @if($product->name_en)<br><span style="color:#666;font-size:9px">{{ $product->name_en }}</span>@endif
          @if($product->weight)<br><span style="color:#888;font-size:9px">{{ $product->weight }}</span>@endif
        </td>
        <td>{{ $product->category?->name ?? '—' }}</td>
        <td>{{ $product->brand?->name ?? '—' }}</td>
        <td>
          <strong>€{{ number_format($product->price, 2) }}</strong>
          @if($product->original_price && $product->original_price > $product->price)
            <br><span style="text-decoration:line-through;color:#999;font-size:9px">€{{ number_format($product->original_price, 2) }}</span>
          @endif
        </td>
        <td>
          @if($product->is_on_sale && $product->sale_discount_percent)
            <span class="badge badge-blue">{{ $product->sale_discount_percent }}% off</span>
          @elseif($product->original_price && $product->original_price > $product->price)
            <span class="badge badge-blue">{{ $product->discount_percent }}% off</span>
          @else
            —
          @endif
        </td>
        <td>
          @if($product->in_stock)
            <span class="badge badge-green">En stock</span>
          @else
            <span class="badge badge-red">Épuisé</span>
          @endif
        </td>
        <td>
          @if($product->is_active)
            <span class="badge badge-green">Actif</span>
          @else
            <span class="badge badge-red">Inactif</span>
          @endif
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>
  <p style="margin-top:16px;color:#666;font-size:10px;">Total: {{ $products->count() }} produits</p>
</div>
<div class="footer">Cafrezzo — Document généré automatiquement — cafrezzo.com</div>
</body>
</html>
