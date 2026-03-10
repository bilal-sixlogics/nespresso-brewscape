<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::with('author')
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) =>
                $sq->where('title', 'like', '%' . $request->search . '%')
                   ->orWhere('title_en', 'like', '%' . $request->search . '%')
            ))
            ->when($request->boolean('published'), fn ($q) => $q->where('is_published', true))
            ->orderByDesc('created_at');

        return response()->json($query->paginate($request->query('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'title_en'     => 'nullable|string',
            'slug'         => 'nullable|string|unique:blog_posts,slug',
            'category'     => 'nullable|string',
            'category_en'  => 'nullable|string',
            'excerpt'      => 'nullable|string',
            'excerpt_en'   => 'nullable|string',
            'body'         => 'nullable|string',
            'body_en'      => 'nullable|string',
            'published_at' => 'nullable|date',
            'is_published' => 'nullable|boolean',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        $data['author_id'] = $request->user()?->id;

        return response()->json(BlogPost::create($data), 201);
    }

    public function show(BlogPost $blogPost)
    {
        return response()->json($blogPost->load('author'));
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        $blogPost->update($request->all());
        return response()->json($blogPost);
    }

    public function destroy(BlogPost $blogPost)
    {
        $blogPost->delete();
        return response()->json(['message' => 'Post deleted']);
    }
}
