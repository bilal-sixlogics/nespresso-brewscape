<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_categories_' . $locale, 3600, fn () =>
            Category::where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($c) => [
                    'id'          => $c->id,
                    'slug'        => $c->slug,
                    'name'        => $locale === 'fr' ? $c->name : ($c->name_en ?: $c->name),
                    'description' => $locale === 'fr' ? $c->description : ($c->description_en ?: $c->description),
                    'image'       => $c->image_path,
                ])
        ));
    }
}
