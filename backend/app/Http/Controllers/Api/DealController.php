<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class DealController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_deals_' . $locale, 60, fn () =>
            Deal::with(['product.images'])
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($d) => [
                    'id'         => $d->id,
                    'label'      => $locale === 'fr' ? $d->label : ($d->label_en ?: $d->label),
                    'deal_price' => (float) $d->deal_price,
                    'expires_at' => $d->expires_at?->toISOString(),
                    'product'    => $d->product ? [
                        'slug'  => $d->product->slug,
                        'name'  => $locale === 'fr' ? $d->product->name : ($d->product->name_en ?: $d->product->name),
                        'image' => $d->product->images->firstWhere('is_primary', true)?->path,
                        'price' => (float) $d->product->price,
                    ] : null,
                ])
        ));
    }
}
