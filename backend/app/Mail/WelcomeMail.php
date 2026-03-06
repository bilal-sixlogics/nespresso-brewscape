<?php

namespace App\Mail;

use App\Models\User;

class WelcomeMail extends BaseMail
{
    protected string $templateKey = 'welcome';

    public function __construct(private User $user)
    {
        $this->vars = [
            'customer_name' => $this->user->name,
            'shop_url'      => config('app.url') . '/shop',
            'account_url'   => config('app.url') . '/account',
        ];
    }

    protected function getLocale(): string { return $this->user->locale; }
    protected function getFallbackSubject(): string
    {
        return $this->user->locale === 'fr'
            ? 'Bienvenue chez Cafrezzo !'
            : 'Welcome to Cafrezzo!';
    }
}
