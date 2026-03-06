<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;

class OrderShippedMail extends BaseMail
{
    protected string $templateKey = 'order_shipped';

    public function __construct(private Order $order, private User $user)
    {
        $this->vars = [
            'customer_name'   => $this->user->name,
            'order_number'    => $this->order->order_number,
            'tracking_number' => $this->order->tracking_number ?? __('messages.tracking_pending'),
            'order_url'       => config('app.url') . '/account/orders/' . $this->order->id,
        ];
    }

    protected function getLocale(): string { return $this->user->locale; }
    protected function getFallbackSubject(): string
    {
        return $this->user->locale === 'fr'
            ? "Votre commande #{$this->order->order_number} est en route !"
            : "Your order #{$this->order->order_number} is on its way!";
    }
}
