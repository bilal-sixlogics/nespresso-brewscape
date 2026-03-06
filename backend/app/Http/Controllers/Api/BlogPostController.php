<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $locale = App::getLocale();
        $query = BlogPost::where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->orderByDesc('published_at');

        if ($request->filled('category')) {
            $query->where(fn ($q) => $q
                ->where('category', $request->category)
                ->orWhere('category_en', $request->category)
            );
        }
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$term}%")
                ->orWhere('title_en', 'like', "%{$term}%")
                ->orWhere('excerpt', 'like', "%{$term}%")
            );
        }

        return $query->paginate(9)->through(fn ($p) => [
            'id'           => $p->id,
            'slug'         => $p->slug,
            'title'        => $locale === 'fr' ? $p->title : ($p->title_en ?: $p->title),
            'category'     => $locale === 'fr' ? $p->category : ($p->category_en ?: $p->category),
            'excerpt'      => $locale === 'fr' ? $p->excerpt : ($p->excerpt_en ?: $p->excerpt),
            'image'        => $p->image_path,
            'external_url' => $p->external_url,
            'published_at' => $p->published_at?->toISOString(),
        ]);
    }

    public function show(string $slug)
    {
        $locale = App::getLocale();
        $post = BlogPost::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'id'           => $post->id,
            'slug'         => $post->slug,
            'title'        => $locale === 'fr' ? $post->title : ($post->title_en ?: $post->title),
            'category'     => $locale === 'fr' ? $post->category : ($post->category_en ?: $post->category),
            'excerpt'      => $locale === 'fr' ? $post->excerpt : ($post->excerpt_en ?: $post->excerpt),
            'body'         => $locale === 'fr' ? $post->body : ($post->body_en ?: $post->body),
            'image'        => $post->image_path,
            'external_url' => $post->external_url,
            'published_at' => $post->published_at?->toISOString(),
        ]);
    }
}
