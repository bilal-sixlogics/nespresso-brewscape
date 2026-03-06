<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

/**
 * @OA\Tag(name="Settings", description="Site configuration endpoints")
 */
class SettingController extends Controller
{
    private function localized(string $value): string
    {
        // If value looks like a JSON object with fr/en keys, decode it
        $decoded = json_decode($value, true);
        if (is_array($decoded)) {
            $locale = App::getLocale();
            return $decoded[$locale] ?? $decoded['fr'] ?? $value;
        }
        return $value;
    }

    /** @OA\Get(path="/api/v1/public/settings/brand", tags={"Settings"}, summary="Brand info") */
    public function brand()
    {
        return response()->json(Cache::remember('api_settings_brand_' . App::getLocale(), 300, fn () => [
            'brand_name' => Setting::getValue('brand_name', 'Cafrezzo'),
            'tagline'    => Setting::getValue('tagline', ''),
            'logo_path'  => Setting::getValue('logo_path', ''),
            'favicon'    => Setting::getValue('favicon_path', ''),
        ]));
    }

    /** @OA\Get(path="/api/v1/public/settings/promo", tags={"Settings"}, summary="Active promotions config") */
    public function promo()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_settings_promo_' . $locale, 60, fn () => [
            'sitewide_discount' => [
                'enabled' => (bool) Setting::getValue('sitewide_discount_enabled', false),
                'percent' => (float) Setting::getValue('sitewide_discount_percent', 0),
                'label'   => $locale === 'fr'
                    ? Setting::getValue('sitewide_discount_label', '')
                    : Setting::getValue('sitewide_discount_label_en', Setting::getValue('sitewide_discount_label', '')),
            ],
            'free_shipping'     => [
                'enabled'   => (bool) Setting::getValue('free_shipping_enabled', false),
                'threshold' => (float) Setting::getValue('free_shipping_threshold', 0),
                'label'     => $locale === 'fr'
                    ? Setting::getValue('free_shipping_label', '')
                    : Setting::getValue('free_shipping_label_en', Setting::getValue('free_shipping_label', '')),
            ],
            'promo_banner'      => [
                'enabled' => (bool) Setting::getValue('promo_banner_enabled', false),
                'text'    => $locale === 'fr'
                    ? Setting::getValue('promo_banner_text', '')
                    : Setting::getValue('promo_banner_text_en', Setting::getValue('promo_banner_text', '')),
            ],
        ]));
    }

    /** @OA\Get(path="/api/v1/public/settings/checkout", tags={"Settings"}, summary="Checkout configuration") */
    public function checkout()
    {
        return response()->json(Cache::remember('api_settings_checkout', 300, fn () => [
            'guest_checkout'   => (bool) Setting::getValue('guest_checkout', true),
            'require_phone'    => (bool) Setting::getValue('require_phone', false),
            'terms_url'        => Setting::getValue('terms_url', ''),
            'auto_cancel_hours'=> (int) Setting::getValue('auto_cancel_hours', 48),
        ]));
    }

    /** @OA\Get(path="/api/v1/public/settings/colors", tags={"Settings"}, summary="Frontend color palette") */
    public function colors()
    {
        return response()->json(Cache::remember('api_settings_colors', 3600, fn () => [
            'primary'    => Setting::getValue('color_primary', '#3C7A58'),
            'secondary'  => Setting::getValue('color_secondary', '#111111'),
            'accent'     => Setting::getValue('color_accent', '#F5F0E8'),
            'text'       => Setting::getValue('color_text', '#111111'),
            'background' => Setting::getValue('color_background', '#FFFFFF'),
        ]));
    }

    /** @OA\Get(path="/api/v1/public/settings/tax", tags={"Settings"}, summary="Tax / VAT configuration for cart display") */
    public function tax()
    {
        $locale = App::getLocale();
        return response()->json(Cache::remember('api_settings_tax_' . $locale, 300, fn () => [
            'enabled'    => (bool) Setting::getValue('tax_enabled', false),
            'mode'       => Setting::getValue('tax_mode', 'cart_total'),
            'rate'       => (float) Setting::getValue('tax_rate', 21),
            'label'      => $locale === 'fr'
                ? Setting::getValue('tax_label', 'TVA')
                : Setting::getValue('tax_label_en', 'VAT'),
            'inclusive'  => (bool) Setting::getValue('tax_inclusive', true),
        ]));
    }
}
