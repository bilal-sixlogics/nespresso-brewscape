<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryType;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class AdminDeliveryController extends Controller
{
    // ── Delivery Types ─────────────────────────────────────────────────────────

    public function deliveryIndex()
    {
        return response()->json(DeliveryType::orderBy('sort_order')->get());
    }

    public function deliveryStore(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'name_en'         => 'nullable|string',
            'description'     => 'nullable|string',
            'description_en'  => 'nullable|string',
            'price'           => 'nullable|numeric|min:0',
            'estimated_days'  => 'nullable|string',
            'icon'            => 'nullable|string',
            'is_active'       => 'nullable|boolean',
            'sort_order'      => 'nullable|integer',
        ]);

        return response()->json(DeliveryType::create($data), 201);
    }

    public function deliveryUpdate(Request $request, DeliveryType $deliveryType)
    {
        $deliveryType->update($request->all());
        return response()->json($deliveryType);
    }

    public function deliveryDestroy(DeliveryType $deliveryType)
    {
        $deliveryType->delete();
        return response()->json(['message' => 'Delivery type deleted']);
    }

    // ── Payment Methods ────────────────────────────────────────────────────────

    public function paymentIndex()
    {
        return response()->json(PaymentMethod::orderBy('sort_order')->get());
    }

    public function paymentStore(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'name_en'     => 'nullable|string',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string',
            'is_active'   => 'nullable|boolean',
            'sort_order'  => 'nullable|integer',
        ]);

        return response()->json(PaymentMethod::create($data), 201);
    }

    public function paymentUpdate(Request $request, PaymentMethod $paymentMethod)
    {
        $paymentMethod->update($request->all());
        return response()->json($paymentMethod);
    }

    public function paymentDestroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();
        return response()->json(['message' => 'Payment method deleted']);
    }
}
