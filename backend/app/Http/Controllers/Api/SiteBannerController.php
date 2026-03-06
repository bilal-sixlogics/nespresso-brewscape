<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteBanner;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class SiteBannerController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_banners_' . $locale, 60, fn () =>
            SiteBanner::where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn ($b) => [
                    'message'   => $locale === 'fr' ? $b->message : ($b->message_en ?: $b->message),
                    'cta_label' => $locale === 'fr' ? $b->cta_label : ($b->cta_label_en ?: $b->cta_label),
                    'cta_url'   => $b->cta_url,
                    'bg_color'  => $b->bg_color,
                    'text_color'=> $b->text_color,
                ])
        ));
    }
}
