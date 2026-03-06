<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\BlogPost;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2|max:100']);
        $term   = $request->q;
        $locale = App::getLocale();

        $products = Product::with(['category', 'images'])
            ->where('is_active', true)
            ->where(fn ($q) => $q
                ->where('name', 'like', "%{$term}%")
                ->orWhere('name_en', 'like', "%{$term}%")
                ->orWhere('tagline', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
            )
            ->limit(8)
            ->get();

        $posts = BlogPost::where('is_published', true)
            ->where(fn ($q) => $q
                ->where('title', 'like', "%{$term}%")
                ->orWhere('title_en', 'like', "%{$term}%")
                ->orWhere('excerpt', 'like', "%{$term}%")
            )
            ->limit(4)
            ->get();

        return response()->json([
            'query'    => $term,
            'products' => ProductResource::collection($products),
            'posts'    => $posts->map(fn ($p) => [
                'slug'  => $p->slug,
                'title' => $locale === 'fr' ? $p->title : ($p->title_en ?: $p->title),
                'image' => $p->image_path,
            ]),
        ]);
    }
}
