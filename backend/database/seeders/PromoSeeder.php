<?php

namespace Database\Seeders;

use App\Models\PromoCode;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    public function run(): void
    {
        $promos = [
            // ── First-order welcome discount ──────────────────────────────────────
            [
                'code'             => 'BIENVENUE10',
                'type'             => 'percent',
                'value'            => 10,
                'is_active'        => true,
                'first_order_only' => true,
                'applies_to'       => 'all',
                'description'      => '10% off for new customers on their first order',
            ],
            [
                'code'             => 'WELCOME10',
                'type'             => 'percent',
                'value'            => 10,
                'is_active'        => true,
                'first_order_only' => true,
                'applies_to'       => 'all',
                'description'      => '10% off – English first-order code',
            ],

            // ── Minimum order threshold ───────────────────────────────────────────
            [
                'code'              => 'GROS5000',
                'type'              => 'percent',
                'value'             => 10,
                'is_active'         => true,
                'min_order_amount'  => 500.00,  // €500+ order (realistic B2B)
                'applies_to'        => 'all',
                'description'       => '10% off orders over €500',
            ],
            [
                'code'              => 'ORDER100',
                'type'              => 'fixed',
                'value'             => 10.00,
                'is_active'         => true,
                'min_order_amount'  => 100.00,
                'applies_to'        => 'all',
                'description'       => '€10 off orders over €100',
            ],

            // ── Capped percentage discount ────────────────────────────────────────
            [
                'code'                => 'ETE15',
                'type'                => 'percent',
                'value'               => 15,
                'max_discount_amount' => 30.00,
                'is_active'           => true,
                'applies_to'          => 'all',
                'expires_at'          => now()->addMonths(3),
                'description'         => '15% off, capped at €30 – summer promo',
            ],

            // ── Fixed amount off ──────────────────────────────────────────────────
            [
                'code'        => 'CAFE5',
                'type'        => 'fixed',
                'value'       => 5.00,
                'is_active'   => true,
                'applies_to'  => 'all',
                'description' => '€5 off any order',
            ],

            // ── Product-category specific (coffee beans only) ─────────────────────
            [
                'code'        => 'GRAINS20',
                'type'        => 'percent',
                'value'       => 20,
                'is_active'   => true,
                'applies_to'  => 'categories',
                'description' => '20% off whole-bean coffee category',
                // included_ids will be set dynamically if categories exist
            ],

            // ── Skip already-discounted products ──────────────────────────────────
            [
                'code'                        => 'NODEAL15',
                'type'                        => 'percent',
                'value'                       => 15,
                'is_active'                   => true,
                'applies_to'                  => 'all',
                'exclude_discounted_products' => true,
                'exclude_on_sale_products'    => true,
                'description'                 => '15% off – excludes items already on sale or discounted',
            ],

            // ── Limited usage code ────────────────────────────────────────────────
            [
                'code'        => 'VIP30',
                'type'        => 'percent',
                'value'       => 30,
                'usage_limit' => 10,
                'is_active'   => true,
                'applies_to'  => 'all',
                'description' => '30% off – VIP code, max 10 uses',
            ],

            // ── Seasonal / expiring ───────────────────────────────────────────────
            [
                'code'        => 'NOEL10',
                'type'        => 'percent',
                'value'       => 10,
                'is_active'   => false, // enabled only for Christmas season
                'expires_at'  => now()->endOfYear(),
                'applies_to'  => 'all',
                'description' => 'Christmas 10% promo – activate for the season',
            ],
        ];

        foreach ($promos as $promo) {
            PromoCode::updateOrCreate(['code' => $promo['code']], $promo);
        }

        // ── Tax / VAT settings ─────────────────────────────────────────────────
        $taxSettings = [
            ['key' => 'tax_enabled',   'value' => '1',             'type' => 'boolean', 'group' => 'tax', 'label' => 'Enable Tax / VAT'],
            ['key' => 'tax_mode',      'value' => 'cart_total',    'type' => 'string',  'group' => 'tax', 'label' => 'Tax Mode (cart_total | per_product)'],
            ['key' => 'tax_rate',      'value' => '21',            'type' => 'number',  'group' => 'tax', 'label' => 'Default Tax Rate (%)'],
            ['key' => 'tax_label',     'value' => 'TVA 21%',       'type' => 'string',  'group' => 'tax', 'label' => 'Tax Label (FR)'],
            ['key' => 'tax_label_en',  'value' => 'VAT 21%',       'type' => 'string',  'group' => 'tax', 'label' => 'Tax Label (EN)'],
            ['key' => 'tax_inclusive', 'value' => '1',             'type' => 'boolean', 'group' => 'tax', 'label' => 'Prices Are Tax-Inclusive'],
        ];

        foreach ($taxSettings as $s) {
            Setting::updateOrCreate(['key' => $s['key']], $s);
        }

        $this->command->info('✅ Sample promo codes + tax settings seeded');
    }
}
