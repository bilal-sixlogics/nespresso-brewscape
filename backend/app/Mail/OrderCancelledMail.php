<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;

class OrderCancelledMail extends BaseMail
{
    protected string $templateKey = 'order_cancelled';

    public function __construct(private Order $order, private User $user)
    {
        $this->vars = [
            'customer_name' => $this->user->name,
            'order_number'  => $this->order->order_number,
            'shop_url'      => config('app.url') . '/shop',
        ];
    }

    protected function getLocale(): string { return $this->user->locale; }
    protected function getFallbackSubject(): string
    {
        return $this->user->locale === 'fr'
            ? "Commande #{$this->order->order_number} annulée"
            : "Order #{$this->order->order_number} cancelled";
    }
}
