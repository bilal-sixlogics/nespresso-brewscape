<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Cache::remember('api_brands', 3600, fn () =>
            Brand::where('is_active', true)->get()
                ->map(fn ($b) => ['id' => $b->id, 'name' => $b->name, 'logo' => $b->logo_path])
        ));
    }
}
