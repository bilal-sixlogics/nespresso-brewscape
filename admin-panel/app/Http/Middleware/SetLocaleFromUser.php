<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

class SetLocaleFromUser
{
    protected array $supportedLocales = ['fr', 'en', 'de', 'ru', 'nl'];

    public function handle(Request $request, Closure $next)
    {
        $locale = $this->resolveLocale($request);
        App::setLocale($locale);

        return $next($request);
    }

    protected function resolveLocale(Request $request): string
    {
        // 1. Explicit override via query param (e.g. ?lang=fr) — stores in session
        if ($request->has('lang') && in_array($request->query('lang'), $this->supportedLocales)) {
            $request->session()->put('admin_locale', $request->query('lang'));
        }

        // 2. Session-stored locale (persists across requests after explicit change)
        if ($request->session()->has('admin_locale')) {
            return $request->session()->get('admin_locale');
        }

        // 3. Authenticated user's profile locale
        if (Auth::check() && in_array(Auth::user()->locale, $this->supportedLocales)) {
            return Auth::user()->locale;
        }

        // 4. Browser Accept-Language header
        $browserLocale = substr($request->getPreferredLanguage($this->supportedLocales) ?? '', 0, 2);
        if (in_array($browserLocale, $this->supportedLocales)) {
            return $browserLocale;
        }

        // 5. App default
        return config('app.locale', 'fr');
    }
}
