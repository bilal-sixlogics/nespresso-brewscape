<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;

class OrderDeliveredMail extends BaseMail
{
    protected string $templateKey = 'order_delivered';

    public function __construct(private Order $order, private User $user)
    {
        $this->vars = [
            'customer_name' => $this->user->name,
            'order_number'  => $this->order->order_number,
            'review_url'    => config('app.url') . '/review?order=' . $this->order->order_number,
            'order_url'     => config('app.url') . '/account/orders/' . $this->order->id,
        ];
    }

    protected function getLocale(): string { return $this->user->locale; }
    protected function getFallbackSubject(): string
    {
        return $this->user->locale === 'fr'
            ? "Votre commande #{$this->order->order_number} a été livrée"
            : "Your order #{$this->order->order_number} has been delivered";
    }
}
