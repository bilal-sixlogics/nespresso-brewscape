<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_payment_methods_' . $locale, 3600, fn () =>
            PaymentMethod::where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn ($p) => [
                    'id'          => $p->id,
                    'name'        => $locale === 'fr' ? $p->name : ($p->name_en ?: $p->name),
                    'description' => $locale === 'fr' ? $p->description : ($p->description_en ?: $p->description),
                    'icon'        => $p->icon,
                ])
        ));
    }
}
