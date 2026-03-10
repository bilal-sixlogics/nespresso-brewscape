<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class AdminBrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::withCount('products')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
        ]);
        return response()->json(Brand::create($data), 201);
    }

    public function show(Brand $brand)
    {
        return response()->json($brand->loadCount('products'));
    }

    public function update(Request $request, Brand $brand)
    {
        $brand->update($request->all());
        return response()->json($brand);
    }

    public function destroy(Brand $brand)
    {
        if ($brand->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete brand with products'], 422);
        }
        $brand->delete();
        return response()->json(['message' => 'Brand deleted']);
    }
}
