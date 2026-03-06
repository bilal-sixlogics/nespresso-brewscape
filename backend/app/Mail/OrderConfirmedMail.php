<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;

class OrderConfirmedMail extends BaseMail
{
    protected string $templateKey = 'order_confirmed';

    public function __construct(private Order $order, private User $user)
    {
        $this->vars = [
            'customer_name'  => $this->user->name,
            'order_number'   => $this->order->order_number,
            'order_total'    => number_format($this->order->total, 2) . ' €',
            'items_count'    => $this->order->items->count(),
            'delivery_name'  => $this->order->deliveryType?->name ?? '',
            'estimated_days' => $this->order->deliveryType?->estimated_days ?? '',
            'order_url'      => config('app.url') . '/account/orders/' . $this->order->id,
        ];
    }

    protected function getLocale(): string { return $this->user->locale; }
    protected function getFallbackSubject(): string
    {
        return $this->user->locale === 'fr'
            ? "Confirmation de commande #{$this->order->order_number}"
            : "Order Confirmation #{$this->order->order_number}";
    }
}
