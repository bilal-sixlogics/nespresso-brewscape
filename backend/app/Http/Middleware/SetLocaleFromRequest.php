<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

/**
 * Sets the application locale for API responses based on:
 *  1. Accept-Language header (e.g. fr-FR → fr)
 *  2. ?lang= query param
 *  3. Authenticated user's profile locale
 *  4. App default (fr)
 *
 * This ensures validation errors, exception messages, and
 * any __() translated strings are returned in the caller's language.
 */
class SetLocaleFromRequest
{
    protected array $supportedLocales = ['fr', 'en', 'de', 'ru', 'nl'];

    public function handle(Request $request, Closure $next)
    {
        App::setLocale($this->resolveLocale($request));
        return $next($request);
    }

    protected function resolveLocale(Request $request): string
    {
        // 1. Explicit query param (?lang=fr) — useful for frontend locale selection
        if ($request->has('lang')) {
            $lang = strtolower(substr($request->query('lang'), 0, 2));
            if (in_array($lang, $this->supportedLocales)) {
                return $lang;
            }
        }

        // 2. Authenticated user's saved locale (API token bearer)
        if (Auth::check() && in_array(Auth::user()->locale, $this->supportedLocales)) {
            return Auth::user()->locale;
        }

        // 3. Accept-Language header (browser/app sends this automatically)
        $acceptLang = $request->header('Accept-Language', '');
        foreach (explode(',', $acceptLang) as $part) {
            $lang = strtolower(substr(trim(explode(';', $part)[0]), 0, 2));
            if (in_array($lang, $this->supportedLocales)) {
                return $lang;
            }
        }

        return config('app.locale', 'fr');
    }
}
