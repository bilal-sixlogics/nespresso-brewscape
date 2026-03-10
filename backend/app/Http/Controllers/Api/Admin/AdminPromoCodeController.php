<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class AdminPromoCodeController extends Controller
{
    public function index()
    {
        return response()->json(PromoCode::orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'          => 'required|string|unique:promo_codes,code|max:50',
            'type'          => 'required|in:percent,fixed',
            'value'         => 'required|numeric|min:0',
            'usage_limit'   => 'nullable|integer|min:1',
            'expires_at'    => 'nullable|date',
            'minimum_order' => 'nullable|numeric|min:0',
            'is_active'     => 'nullable|boolean',
        ]);

        return response()->json(PromoCode::create($data), 201);
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $promoCode->update($request->all());
        return response()->json($promoCode);
    }

    public function destroy(PromoCode $promoCode)
    {
        $promoCode->delete();
        return response()->json(['message' => 'Promo code deleted']);
    }
}
