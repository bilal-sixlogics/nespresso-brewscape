<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function validate(Request $request)
    {
        $data = $request->validate([
            'code'        => 'required|string',
            'cart_total'  => 'required|numeric|min:0',
        ]);

        $promo = PromoCode::where('code', strtoupper($data['code']))->first();

        if (!$promo || !$promo->isValid()) {
            return response()->json(['valid' => false, 'message' => __('messages.promo_invalid')], 422);
        }

        $discount = $promo->type === 'percent'
            ? round($data['cart_total'] * ($promo->value / 100), 2)
            : min($promo->value, $data['cart_total']);

        return response()->json([
            'valid'    => true,
            'code'     => $promo->code,
            'type'     => $promo->type,
            'value'    => $promo->value,
            'discount' => $discount,
        ]);
    }
}
