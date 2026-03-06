<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'order_number'     => $this->order_number,
            'status'           => $this->status,
            'subtotal'         => (float) $this->subtotal,
            'shipping_cost'    => (float) $this->shipping_cost,
            'discount_amount'  => (float) $this->discount_amount,
            'total'            => (float) $this->total,
            'promo_code'       => $this->promo_code,
            'notes'            => $this->notes,
            'tracking_number'  => $this->tracking_number,
            'created_at'       => $this->created_at->toISOString(),
            'updated_at'       => $this->updated_at->toISOString(),
            'shipping_address' => $this->whenLoaded('shippingAddress', fn () => $this->shippingAddress ? [
                'first_name'  => $this->shippingAddress->first_name,
                'last_name'   => $this->shippingAddress->last_name,
                'address'     => $this->shippingAddress->address,
                'city'        => $this->shippingAddress->city,
                'postal_code' => $this->shippingAddress->postal_code,
                'country'     => $this->shippingAddress->country,
                'phone'       => $this->shippingAddress->phone,
            ] : $this->billing_address),
            'delivery_type'    => $this->whenLoaded('deliveryType', fn () => $this->deliveryType ? [
                'name'  => $this->deliveryType->name,
                'price' => (float) $this->deliveryType->price,
            ] : null),
            'payment_method'   => $this->whenLoaded('paymentMethod', fn () => $this->paymentMethod?->name),
            'items'            => $this->whenLoaded('items', fn () =>
                $this->items->map(fn ($item) => [
                    'id'           => $item->id,
                    'product_slug' => $item->product?->slug,
                    'snapshot'     => $item->product_snapshot,
                    'quantity'     => $item->quantity,
                    'unit_price'   => (float) $item->unit_price,
                    'line_total'   => (float) $item->line_total,
                ])
            ),
        ];
    }
}
