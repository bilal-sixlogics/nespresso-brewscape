<?php

namespace App\Filament\Pages\Auth;

use Filament\Pages\Auth\Login as BaseLogin;

class Login extends BaseLogin
{
    // Expose a method for demo logins called via Livewire
    public function demoLogin(string $email, string $password): void
    {
        $this->form->fill([
            'email'    => $email,
            'password' => $password,
        ]);
        $this->authenticate();
    }
}
