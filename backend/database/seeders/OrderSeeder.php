<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSaleUnit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // Load all customer users (not admin/manager)
            $customers = User::whereNotIn('email', ['admin@cafrezzo.com', 'manager@cafrezzo.com'])->get();

            if ($customers->isEmpty()) {
                $this->command->warn('⚠️  No customers found — run CustomerSeeder first');
                return;
            }

            // Load all active products with their sale units
            $products = Product::where('is_active', true)->with('saleUnits')->get();

            if ($products->isEmpty()) {
                $this->command->warn('⚠️  No products found — run ProductSeeder first');
                return;
            }

            $statuses   = ['pending', 'pending', 'processing', 'processing', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled'];
            $payMethods = [1, 2]; // Assume IDs 1 & 2 exist from SettingsSeeder
            $delTypes   = [1, 2]; // Assume IDs 1 & 2 exist
            $prefix     = \App\Models\Setting::getValue('checkout_order_prefix', 'CAF');

            $orderCount = 0;
            $targetOrders = 50;

            // Distribute orders across all customers (at least 1 per customer, up to 5)
            $perCustomer = (int) ceil($targetOrders / $customers->count());

            foreach ($customers as $customer) {
                $address = Address::where('user_id', $customer->id)->first();
                if (!$address) continue;

                $ordersForThisCustomer = rand(1, min($perCustomer + 2, 7));
                if ($orderCount + $ordersForThisCustomer > $targetOrders) {
                    $ordersForThisCustomer = $targetOrders - $orderCount;
                }
                if ($ordersForThisCustomer <= 0) break;

                for ($i = 0; $i < $ordersForThisCustomer; $i++) {
                    // Pick 1–4 random products for this order
                    $selectedProducts = $products->random(rand(1, 4));
                    $subtotal = 0;
                    $items = [];

                    foreach ($selectedProducts as $product) {
                        $unit = $product->saleUnits->first();
                        if (!$unit) continue;

                        $qty       = rand(1, 3);
                        $unitPrice = (float) $unit->price;
                        $lineTotal = round($unitPrice * $qty, 2);
                        $subtotal += $lineTotal;

                        $items[] = [
                            'product_id'          => $product->id,
                            'product_sale_unit_id' => $unit->id,
                            'quantity'             => $qty,
                            'unit_price'           => $unitPrice,
                            'line_total'           => $lineTotal,
                            'product_snapshot'     => [
                                'name'    => $product->name,
                                'slug'    => $product->slug,
                                'price'   => $unitPrice,
                                'sku'     => $unit->sku_code,
                                'label'   => $unit->label,
                                'image'   => optional($product->images()->first())->path,
                            ],
                        ];
                    }

                    if (empty($items)) continue;

                    $subtotal       = round($subtotal, 2);
                    $shippingCost   = $subtotal >= 50 ? 0.00 : 4.95;
                    $discountAmount = rand(0, 4) === 0 ? round($subtotal * 0.1, 2) : 0.00; // 25% chance of 10% discount
                    $taxRate        = 0.21;
                    $taxAmount      = round(($subtotal - $discountAmount + $shippingCost) * $taxRate, 2);
                    $total          = round($subtotal - $discountAmount + $shippingCost + $taxAmount, 2);

                    $status     = $statuses[array_rand($statuses)];
                    $createdAt  = now()->subDays(rand(1, 180))->subHours(rand(0, 23));

                    $order = Order::create([
                        'user_id'          => $customer->id,
                        'status'           => $status,
                        'subtotal'         => $subtotal,
                        'shipping_cost'    => $shippingCost,
                        'discount_amount'  => $discountAmount,
                        'tax_amount'       => $taxAmount,
                        'total'            => $total,
                        'shipping_address_id' => $address->id,
                        'billing_address'  => [
                            'first_name'  => $address->first_name,
                            'last_name'   => $address->last_name,
                            'address'     => $address->address,
                            'city'        => $address->city,
                            'postal_code' => $address->postal_code,
                            'country'     => $address->country,
                            'phone'       => $address->phone,
                        ],
                        'promo_code'       => $discountAmount > 0 ? 'WELCOME10' : null,
                        'notes'            => rand(0, 3) === 0 ? 'Merci de bien emballer.' : null,
                        'created_at'       => $createdAt,
                        'updated_at'       => $createdAt->addHours(rand(1, 48)),
                    ]);

                    foreach ($items as $item) {
                        OrderItem::create(array_merge(['order_id' => $order->id], $item));
                    }

                    // Log activity
                    activity()
                        ->causedBy($customer)
                        ->performedOn($order)
                        ->withProperties(['total' => $total, 'status' => $status])
                        ->log("Commande {$order->order_number} créée");

                    $orderCount++;
                    if ($orderCount >= $targetOrders) break;
                }

                if ($orderCount >= $targetOrders) break;
            }

            $this->command->info("✅ Seeded {$orderCount} orders with items and activity logs");
        });
    }
}
