<?php

namespace Database\Seeders;

use App\Models\MailTemplate;
use App\Models\NewsletterSubscriber;
use App\Models\PolicyPage;
use Illuminate\Database\Seeder;

class MailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $green = '#3C7A58';

        $templates = [
            [
                'key'        => 'order_confirmed',
                'name'       => 'Order Confirmation',
                'subject_fr' => 'Confirmation de commande #{order_number}',
                'subject_en' => 'Order Confirmation #{order_number}',
                'body_fr'    => $this->orderConfirmedFr($green),
                'body_en'    => $this->orderConfirmedEn($green),
                'variables'  => ['customer_name', 'order_number', 'order_total', 'delivery_name', 'estimated_days', 'order_url'],
            ],
            [
                'key'        => 'order_shipped',
                'name'       => 'Order Shipped',
                'subject_fr' => 'Votre commande #{order_number} est en route !',
                'subject_en' => 'Your order #{order_number} is on its way!',
                'body_fr'    => $this->orderShippedFr($green),
                'body_en'    => $this->orderShippedEn($green),
                'variables'  => ['customer_name', 'order_number', 'tracking_number', 'order_url'],
            ],
            [
                'key'        => 'order_delivered',
                'name'       => 'Order Delivered',
                'subject_fr' => 'Votre commande #{order_number} a été livrée',
                'subject_en' => 'Your order #{order_number} has been delivered',
                'body_fr'    => $this->orderDeliveredFr($green),
                'body_en'    => $this->orderDeliveredEn($green),
                'variables'  => ['customer_name', 'order_number', 'review_url', 'order_url'],
            ],
            [
                'key'        => 'order_cancelled',
                'name'       => 'Order Cancelled',
                'subject_fr' => 'Commande #{order_number} annulée',
                'subject_en' => 'Order #{order_number} cancelled',
                'body_fr'    => $this->orderCancelledFr($green),
                'body_en'    => $this->orderCancelledEn($green),
                'variables'  => ['customer_name', 'order_number', 'shop_url'],
            ],
            [
                'key'        => 'welcome',
                'name'       => 'Welcome Email',
                'subject_fr' => 'Bienvenue chez Cafrezzo !',
                'subject_en' => 'Welcome to Cafrezzo!',
                'body_fr'    => $this->welcomeFr($green),
                'body_en'    => $this->welcomeEn($green),
                'variables'  => ['customer_name', 'shop_url', 'account_url'],
            ],
            [
                'key'        => 'newsletter',
                'name'       => 'Newsletter (General)',
                'subject_fr' => 'Les nouveautés Cafrezzo',
                'subject_en' => "What's new at Cafrezzo",
                'body_fr'    => '<h2 style="color:#3C7A58">Bonjour {customer_name},</h2><p>Découvrez nos dernières nouveautés...</p><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Voir la boutique</a></p>',
                'body_en'    => '<h2 style="color:#3C7A58">Hello {customer_name},</h2><p>Check out our latest updates...</p><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Visit the shop</a></p>',
                'variables'  => ['customer_name', 'shop_url'],
            ],
            [
                'key'        => 'promotion',
                'name'       => 'Promotional Offer',
                'subject_fr' => '🎁 Offre spéciale pour vous !',
                'subject_en' => '🎁 A special offer just for you!',
                'body_fr'    => '<h2 style="color:#3C7A58">🎁 Offre exclusive</h2><p>Bonjour {customer_name},</p><p>Utilisez le code <strong style="color:#3C7A58">{promo_code}</strong> pour bénéficier de <strong>{discount}</strong> sur votre prochaine commande.</p><div style="background:#F5F0E8;border-left:4px solid #3C7A58;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0"><strong>Code : {promo_code}</strong><br>Valable jusqu\'au {expires_at}</div><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Profiter de l\'offre</a></p>',
                'body_en'    => '<h2 style="color:#3C7A58">🎁 Exclusive offer</h2><p>Hello {customer_name},</p><p>Use code <strong style="color:#3C7A58">{promo_code}</strong> to get <strong>{discount}</strong> off your next order.</p><div style="background:#F5F0E8;border-left:4px solid #3C7A58;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0"><strong>Code: {promo_code}</strong><br>Valid until {expires_at}</div><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Claim offer</a></p>',
                'variables'  => ['customer_name', 'promo_code', 'discount', 'expires_at', 'shop_url'],
            ],
            [
                'key'        => 'back_in_stock',
                'name'       => 'Back in Stock Alert',
                'subject_fr' => '✅ {product_name} est de retour !',
                'subject_en' => '✅ {product_name} is back in stock!',
                'body_fr'    => '<h2 style="color:#3C7A58">✅ De retour en stock !</h2><p>Bonjour {customer_name},</p><p><strong>{product_name}</strong> est à nouveau disponible. Ne le manquez pas !</p><p style="text-align:center"><a href="{product_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Commander maintenant</a></p>',
                'body_en'    => '<h2 style="color:#3C7A58">✅ Back in stock!</h2><p>Hello {customer_name},</p><p><strong>{product_name}</strong> is available again. Don\'t miss it!</p><p style="text-align:center"><a href="{product_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Order now</a></p>',
                'variables'  => ['customer_name', 'product_name', 'product_url'],
            ],
            [
                'key'        => 'order_processing',
                'name'       => 'Order Processing',
                'subject_fr' => 'Votre commande #{order_number} est en préparation',
                'subject_en' => 'Your order #{order_number} is being prepared',
                'body_fr'    => '<h2 style="color:#3C7A58">⚙️ En cours de préparation</h2><p>Bonjour {customer_name},</p><p>Votre commande <strong>#{order_number}</strong> est actuellement en cours de préparation par notre équipe.</p><p style="text-align:center"><a href="{order_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Voir ma commande</a></p>',
                'body_en'    => '<h2 style="color:#3C7A58">⚙️ Being prepared</h2><p>Hello {customer_name},</p><p>Your order <strong>#{order_number}</strong> is currently being prepared by our team.</p><p style="text-align:center"><a href="{order_url}" style="display:inline-block;background:#3C7A58;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">View my order</a></p>',
                'variables'  => ['customer_name', 'order_number', 'order_url'],
            ],
        ];

        foreach ($templates as $t) {
            MailTemplate::updateOrCreate(['key' => $t['key']], $t);
        }

        // Default policy pages
        PolicyPage::firstOrCreate(['key' => 'privacy'], [
            'title_fr'    => 'Politique de confidentialité',
            'title_en'    => 'Privacy Policy',
            'content_fr'  => '<h2>Politique de confidentialité</h2><p>Cafrezzo s\'engage à protéger vos données personnelles...</p>',
            'content_en'  => '<h2>Privacy Policy</h2><p>Cafrezzo is committed to protecting your personal data...</p>',
            'last_updated_at' => now(),
        ]);
        PolicyPage::firstOrCreate(['key' => 'returns'], [
            'title_fr'    => 'Politique de retour',
            'title_en'    => 'Return Policy',
            'content_fr'  => '<h2>Politique de retour</h2><p>Vous disposez de 30 jours pour retourner tout article non ouvert...</p>',
            'content_en'  => '<h2>Return Policy</h2><p>You have 30 days to return any unopened item...</p>',
            'last_updated_at' => now(),
        ]);
        PolicyPage::firstOrCreate(['key' => 'terms'], [
            'title_fr'    => 'Conditions générales de vente',
            'title_en'    => 'Terms and Conditions',
            'content_fr'  => '<h2>Conditions générales</h2><p>En utilisant ce site, vous acceptez les présentes conditions...</p>',
            'content_en'  => '<h2>Terms and Conditions</h2><p>By using this site, you agree to these terms...</p>',
            'last_updated_at' => now(),
        ]);

        echo "✅ Mail templates and policy pages seeded\n";
    }

    private function orderConfirmedFr(string $c): string
    {
        return '<h2 style="color:#111">Commande confirmée ✓</h2><p>Bonjour {customer_name},</p><p>Merci pour votre commande. Nous la préparons avec soin.</p><div style="background:#F5F0E8;border-left:4px solid '.$c.';padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0"><strong>Commande :</strong> #{order_number}<br><strong>Total :</strong> {order_total}<br><strong>Livraison :</strong> {delivery_name} ({estimated_days})</div><p style="text-align:center"><a href="{order_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Voir ma commande</a></p>';
    }

    private function orderConfirmedEn(string $c): string
    {
        return '<h2 style="color:#111">Order Confirmed ✓</h2><p>Hello {customer_name},</p><p>Thank you for your order. We\'re preparing it with care.</p><div style="background:#F5F0E8;border-left:4px solid '.$c.';padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0"><strong>Order:</strong> #{order_number}<br><strong>Total:</strong> {order_total}<br><strong>Delivery:</strong> {delivery_name} ({estimated_days})</div><p style="text-align:center"><a href="{order_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">View my order</a></p>';
    }

    private function orderShippedFr(string $c): string
    {
        return '<h2 style="color:#111">Votre commande est en route ! 🚚</h2><p>Bonjour {customer_name},</p><p>Votre commande <strong>#{order_number}</strong> a été expédiée.</p><div style="background:#F5F0E8;border-left:4px solid '.$c.';padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0"><strong>N° de suivi :</strong> {tracking_number}</div><p style="text-align:center"><a href="{order_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Suivre ma commande</a></p>';
    }

    private function orderShippedEn(string $c): string
    {
        return '<h2 style="color:#111">Your order is on its way! 🚚</h2><p>Hello {customer_name},</p><p>Your order <strong>#{order_number}</strong> has been shipped.</p><div style="background:#F5F0E8;border-left:4px solid '.$c.';padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0"><strong>Tracking number:</strong> {tracking_number}</div><p style="text-align:center"><a href="{order_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Track my order</a></p>';
    }

    private function orderDeliveredFr(string $c): string
    {
        return '<h2 style="color:#111">📦 Votre commande est arrivée !</h2><p>Bonjour {customer_name},</p><p>Votre commande <strong>#{order_number}</strong> a été livrée. Nous espérons qu\'elle vous ravira !</p><p style="text-align:center"><a href="{review_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Laisser un avis ☕</a></p>';
    }

    private function orderDeliveredEn(string $c): string
    {
        return '<h2 style="color:#111">📦 Your order has arrived!</h2><p>Hello {customer_name},</p><p>Your order <strong>#{order_number}</strong> has been delivered. We hope you enjoy it!</p><p style="text-align:center"><a href="{review_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Leave a review ☕</a></p>';
    }

    private function orderCancelledFr(string $c): string
    {
        return '<h2 style="color:#111">Commande annulée</h2><p>Bonjour {customer_name},</p><p>Votre commande <strong>#{order_number}</strong> a été annulée.</p><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Retour à la boutique</a></p>';
    }

    private function orderCancelledEn(string $c): string
    {
        return '<h2 style="color:#111">Order Cancelled</h2><p>Hello {customer_name},</p><p>Your order <strong>#{order_number}</strong> has been cancelled.</p><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Return to shop</a></p>';
    }

    private function welcomeFr(string $c): string
    {
        return '<h2 style="color:#111">Bienvenue chez Cafrezzo ☕</h2><p>Bonjour {customer_name},</p><p>Votre compte a été créé avec succès. Découvrez notre sélection de cafés d\'exception.</p><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Découvrir la boutique</a></p>';
    }

    private function welcomeEn(string $c): string
    {
        return '<h2 style="color:#111">Welcome to Cafrezzo ☕</h2><p>Hello {customer_name},</p><p>Your account has been successfully created. Discover our selection of exceptional coffees.</p><p style="text-align:center"><a href="{shop_url}" style="display:inline-block;background:'.$c.';color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Explore the shop</a></p>';
    }
}
