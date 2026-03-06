<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\CheckoutSetting;
use App\Models\ContactInfo;
use App\Models\FooterSection;
use App\Models\FooterLink;
use App\Models\DeliveryType;
use App\Models\PaymentMethod;
use App\Models\SiteBanner;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Brand
            ['key' => 'brand_name',                'value' => 'Cafrezzo',         'type' => 'string',  'group' => 'brand',  'label' => 'Brand Name'],
            ['key' => 'tagline',                   'value' => 'Le goût qui reste', 'type' => 'string',  'group' => 'brand',  'label' => 'Tagline'],
            ['key' => 'google_analytics_id',       'value' => '',                  'type' => 'string',  'group' => 'brand',  'label' => 'Google Analytics ID'],
            ['key' => 'maintenance_mode',          'value' => '0',                 'type' => 'boolean', 'group' => 'brand',  'label' => 'Maintenance Mode'],
            // Promo
            ['key' => 'sitewide_discount_enabled', 'value' => '0',                 'type' => 'boolean', 'group' => 'promo',  'label' => 'Sitewide Discount Enabled'],
            ['key' => 'sitewide_discount_percent', 'value' => '0',                 'type' => 'number',  'group' => 'promo',  'label' => 'Sitewide Discount %'],
            ['key' => 'sitewide_discount_label',   'value' => 'Soldes !',          'type' => 'string',  'group' => 'promo',  'label' => 'Sitewide Discount Label'],
            ['key' => 'free_shipping_enabled',     'value' => '1',                 'type' => 'boolean', 'group' => 'shipping','label' => 'Free Shipping Enabled'],
            ['key' => 'free_shipping_threshold',   'value' => '50',                'type' => 'number',  'group' => 'shipping','label' => 'Free Shipping Threshold (€)'],
            ['key' => 'free_shipping_label',       'value' => 'Livraison offerte dès 50€', 'type' => 'string', 'group' => 'shipping', 'label' => 'Free Shipping Label'],
            ['key' => 'promo_banner_enabled',      'value' => '1',                 'type' => 'boolean', 'group' => 'promo',  'label' => 'Promo Banner Enabled'],
            ['key' => 'promo_banner_text',         'value' => '🎉 Livraison offerte dès 50€ d\'achat', 'type' => 'string', 'group' => 'promo', 'label' => 'Promo Banner Text'],
            // Colors
            ['key' => 'color_primary',             'value' => '#3C7A58',            'type' => 'string',  'group' => 'colors', 'label' => 'Primary Color'],
            ['key' => 'color_secondary',           'value' => '#111111',            'type' => 'string',  'group' => 'colors', 'label' => 'Secondary Color'],
            ['key' => 'color_accent',              'value' => '#F5F0E8',            'type' => 'string',  'group' => 'colors', 'label' => 'Accent Color'],
            ['key' => 'color_text',                'value' => '#111111',            'type' => 'string',  'group' => 'colors', 'label' => 'Text Color'],
            ['key' => 'color_background',          'value' => '#FFFFFF',            'type' => 'string',  'group' => 'colors', 'label' => 'Background Color'],
            // Checkout
            ['key' => 'checkout_guest_checkout',   'value' => '1',                  'type' => 'boolean', 'group' => 'checkout','label' => 'Allow Guest Checkout'],
            ['key' => 'checkout_require_phone',    'value' => '0',                  'type' => 'boolean', 'group' => 'checkout','label' => 'Require Phone Number'],
            ['key' => 'checkout_order_prefix',     'value' => 'CAF',                'type' => 'string',  'group' => 'checkout','label' => 'Order Number Prefix'],
        ];
        foreach ($settings as $s) {
            Setting::updateOrCreate(['key' => $s['key']], $s);
        }

        // Contact Info
        $contacts = [
            ['key' => 'email',     'value' => 'contact@cafrezzo.com', 'label' => 'Email'],
            ['key' => 'phone',     'value' => '+32 2 123 45 67',      'label' => 'Phone'],
            ['key' => 'whatsapp',  'value' => '+32 493 123 456',      'label' => 'WhatsApp'],
            ['key' => 'address',   'value' => 'Rue du Commerce 42, 1000 Bruxelles', 'label' => 'Address'],
            ['key' => 'maps_url',  'value' => 'https://maps.google.com', 'label' => 'Google Maps URL'],
            ['key' => 'instagram', 'value' => 'https://instagram.com/cafrezzo', 'label' => 'Instagram'],
            ['key' => 'facebook',  'value' => 'https://facebook.com/cafrezzo', 'label' => 'Facebook'],
        ];
        foreach ($contacts as $c) {
            ContactInfo::updateOrCreate(['key' => $c['key']], $c);
        }

        // Footer
        $footerData = [
            ['title' => 'Catalogue',   'title_en' => 'Catalogue',    'sort_order' => 1, 'links' => [
                ['label' => 'Café en Grains', 'label_en' => 'Whole Bean', 'url' => '/shop?cat=cafe-en-grains'],
                ['label' => 'Machines',       'label_en' => 'Machines',   'url' => '/machines'],
                ['label' => 'Accessoires',    'label_en' => 'Accessories','url' => '/accessories'],
            ]],
            ['title' => 'Informations', 'title_en' => 'Information', 'sort_order' => 2, 'links' => [
                ['label' => 'À propos',     'label_en' => 'About',       'url' => '/about'],
                ['label' => 'Blog',         'label_en' => 'Blog',        'url' => '/blog'],
                ['label' => 'Contact',      'label_en' => 'Contact',     'url' => '/contact'],
                ['label' => 'CGV',          'label_en' => 'Terms',       'url' => '/cgv'],
            ]],
        ];
        foreach ($footerData as $section) {
            $s = FooterSection::firstOrCreate(
                ['title' => $section['title']],
                ['title_en' => $section['title_en'], 'sort_order' => $section['sort_order'], 'is_active' => true]
            );
            foreach ($section['links'] as $i => $link) {
                FooterLink::firstOrCreate(['section_id' => $s->id, 'url' => $link['url']], array_merge($link, ['sort_order' => $i, 'is_active' => true]));
            }
        }

        // Delivery types
        $deliveries = [
            ['name' => 'Livraison standard', 'name_en' => 'Standard Delivery', 'price' => 4.90, 'estimated_days' => '3-5 jours', 'icon' => 'heroicon-o-truck', 'sort_order' => 1],
            ['name' => 'Livraison express',  'name_en' => 'Express Delivery',  'price' => 9.90, 'estimated_days' => '1-2 jours', 'icon' => 'heroicon-o-bolt',  'sort_order' => 2],
            ['name' => 'Retrait en magasin', 'name_en' => 'Store Pickup',      'price' => 0,    'estimated_days' => 'Aujourd\'hui', 'icon' => 'heroicon-o-building-storefront', 'sort_order' => 3],
        ];
        foreach ($deliveries as $d) {
            DeliveryType::firstOrCreate(['name' => $d['name']], array_merge($d, ['is_active' => true]));
        }

        // Payment methods
        $payments = [
            ['name' => 'Carte bancaire', 'name_en' => 'Credit Card',    'icon' => 'heroicon-o-credit-card', 'sort_order' => 1],
            ['name' => 'Virement',       'name_en' => 'Bank Transfer',  'icon' => 'heroicon-o-building-library', 'sort_order' => 2],
            ['name' => 'À la livraison', 'name_en' => 'Cash on Delivery','icon' => 'heroicon-o-banknotes', 'sort_order' => 3],
        ];
        foreach ($payments as $p) {
            PaymentMethod::firstOrCreate(['name' => $p['name']], array_merge($p, ['is_active' => true]));
        }

        // Site banner
        SiteBanner::firstOrCreate(['message' => '🎉 Livraison offerte dès 50€'], [
            'message_en' => '🎉 Free delivery from €50',
            'bg_color' => '#3C7A58',
            'text_color' => '#FFFFFF',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->command->info('✅ Default settings, contact info, footer, delivery types, payment methods seeded');
    }
}
