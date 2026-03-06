<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FooterSection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class FooterController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_footer_' . $locale, 3600, fn () =>
            FooterSection::where('is_active', true)
                ->with(['links' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($s) => [
                    'title' => $locale === 'fr' ? $s->title : ($s->title_en ?: $s->title),
                    'links' => $s->links->map(fn ($l) => [
                        'label'       => $locale === 'fr' ? $l->label : ($l->label_en ?: $l->label),
                        'url'         => $l->url,
                        'is_external' => (bool) $l->is_external,
                    ]),
                ])
        ));
    }
}
