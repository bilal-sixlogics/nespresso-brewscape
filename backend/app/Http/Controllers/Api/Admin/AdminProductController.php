<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    /**
     * GET /api/v1/admin/products
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'images', 'saleUnits', 'globalTags'])
            ->when($request->filled('product_type'), fn ($q) => $q->where('product_type', $request->product_type))
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) =>
                $sq->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('sku', 'like', '%' . $request->search . '%')
            ))
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy($request->query('sort_by', 'updated_at'), $request->query('sort_dir', 'desc'));

        return response()->json($query->paginate($request->query('per_page', 20)));
    }

    /**
     * POST /api/v1/admin/products
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'product_type' => 'required|in:coffee,machine,accessory,sweet',
            'price'        => 'required|numeric|min:0',
            'category_id'  => 'nullable|exists:categories,id',
            'brand_id'     => 'nullable|exists:brands,id',
            'slug'         => 'nullable|string|unique:products,slug',
            'sku'          => 'nullable|string|unique:products,sku',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        if (empty($data['sku'])) {
            $prefix = match ($data['product_type']) {
                'coffee'    => 'COF',
                'machine'   => 'MCH',
                'accessory' => 'ACC',
                'sweet'     => 'SWT',
                default     => 'PRD',
            };
            $data['sku'] = $prefix . '-' . strtoupper(Str::random(6));
        }

        $product = Product::create(array_merge($request->except(['tags', 'sale_units']), $data));

        // Sync tags
        if ($request->filled('tags')) {
            $product->globalTags()->sync($request->input('tags'));
        }

        return response()->json($product->load(['category', 'brand', 'images', 'saleUnits', 'globalTags']), 201);
    }

    /**
     * GET /api/v1/admin/products/{id}
     */
    public function show(Product $product)
    {
        return response()->json(
            $product->load(['category', 'brand', 'images', 'saleUnits', 'features.items', 'tasteProfile', 'globalTags', 'allergens'])
        );
    }

    /**
     * PUT /api/v1/admin/products/{id}
     */
    public function update(Request $request, Product $product)
    {
        $product->update($request->except(['tags', 'sale_units']));

        if ($request->has('tags')) {
            $product->globalTags()->sync($request->input('tags', []));
        }

        return response()->json($product->load(['category', 'brand', 'images', 'saleUnits', 'globalTags']));
    }

    /**
     * DELETE /api/v1/admin/products/{id}
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
