<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Category::withCount('products')
                ->when($request->filled('product_type'), fn ($q) => $q->where('product_type', $request->product_type))
                ->orderBy('sort_order')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'name_en'      => 'nullable|string',
            'slug'         => 'nullable|string|unique:categories,slug',
            'description'  => 'nullable|string',
            'product_type' => 'nullable|in:coffee,machine,accessory,sweet,all',
            'sort_order'   => 'nullable|integer',
            'is_active'    => 'nullable|boolean',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return response()->json(Category::create($data), 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->loadCount('products'));
    }

    public function update(Request $request, Category $category)
    {
        $category->update($request->validated() ?: $request->all());
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete category with products'], 422);
        }
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
