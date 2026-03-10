<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminTagController extends Controller
{
    public function index()
    {
        return response()->json(Tag::withCount('products')->orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'name_en'    => 'nullable|string',
            'slug'       => 'nullable|string|unique:tags,slug',
            'color'      => 'nullable|string|max:20',
            'icon'       => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return response()->json(Tag::create($data), 201);
    }

    public function show(Tag $tag)
    {
        return response()->json($tag->loadCount('products'));
    }

    public function update(Request $request, Tag $tag)
    {
        $tag->update($request->all());
        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        $tag->products()->detach();
        $tag->delete();
        return response()->json(['message' => 'Tag deleted']);
    }
}
