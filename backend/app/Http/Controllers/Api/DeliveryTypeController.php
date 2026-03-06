<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryType;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class DeliveryTypeController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_delivery_types_' . $locale, 3600, fn () =>
            DeliveryType::where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn ($d) => [
                    'id'             => $d->id,
                    'name'           => $locale === 'fr' ? $d->name : ($d->name_en ?: $d->name),
                    'description'    => $locale === 'fr' ? $d->description : ($d->description_en ?: $d->description),
                    'price'          => (float) $d->price,
                    'estimated_days' => $d->estimated_days,
                    'icon'           => $d->icon,
                ])
        ));
    }
}
