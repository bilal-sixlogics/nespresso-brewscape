<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * @OA\Tag(name="Products", description="Product catalog endpoints")
 */
class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/public/products",
     *     tags={"Products"},
     *     summary="List products with filters and pagination",
     *     @OA\Parameter(name="category", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="brand", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="featured", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="in_stock", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="min_price", in="query", @OA\Schema(type="number")),
     *     @OA\Parameter(name="max_price", in="query", @OA\Schema(type="number")),
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="sort", in="query", @OA\Schema(type="string", enum={"price_asc","price_desc","rating","newest"})),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated product list")
     * )
     */
    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['category', 'brand', 'images', 'saleUnits'])
            ->where('is_active', true);

        // Filters
        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }
        if ($request->filled('brand')) {
            $query->whereHas('brand', fn ($q) => $q->where('id', $request->brand)->orWhere('name', $request->brand));
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->boolean('in_stock')) {
            $query->where('in_stock', true);
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$term}%")
                ->orWhere('name_en', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('tagline', 'like', "%{$term}%")
            );
        }
        if ($request->filled('tags')) {
            $query->whereHas('tags', fn ($q) => $q->whereIn('tag', (array) $request->tags));
        }

        // Sorting
        match ($request->sort) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'rating'     => $query->orderByDesc('average_rating'),
            'newest'     => $query->orderByDesc('created_at'),
            default      => $query->orderBy('name'),
        };

        $perPage = min((int) ($request->per_page ?? 12), 48);
        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/public/products/{slug}",
     *     tags={"Products"},
     *     summary="Get single product with all relations",
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Product detail"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(string $slug)
    {
        $product = Cache::remember("product_{$slug}_" . app()->getLocale(), 300, fn () =>
            Product::with([
                'category', 'brand', 'images', 'saleUnits',
                'tasteProfile', 'features.items', 'notes',
                'brewSizes', 'tags', 'allergens',
            ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail()
        );

        return new ProductResource($product);
    }
}
