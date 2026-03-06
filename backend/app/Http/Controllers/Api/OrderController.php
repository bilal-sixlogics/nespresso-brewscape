<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Mail\OrderConfirmedMail;
use App\Models\DeliveryType;
use App\Models\InventoryStock;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSaleUnit;
use App\Models\PromoCode;
use App\Models\Setting;
use App\Services\InventoryService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * @OA\Tag(name="Orders", description="Customer order management")
 */
class OrderController extends Controller
{
    public function __construct(private InventoryService $inventory) {}

    /** @OA\Get(path="/api/v1/orders", tags={"Orders"}, summary="List my orders", security={{"sanctum":{}}}) */
    public function index(Request $request)
    {
        $orders = Auth::user()->orders()
            ->with(['items', 'deliveryType', 'paymentMethod'])
            ->latest()
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    /** @OA\Get(path="/api/v1/orders/{id}", tags={"Orders"}, summary="Get single order", security={{"sanctum":{}}}) */
    public function show(int $id)
    {
        $order = Auth::user()->orders()
            ->with(['items.product', 'deliveryType', 'paymentMethod', 'shippingAddress'])
            ->findOrFail($id);

        return new OrderResource($order);
    }

    /**
     * @OA\Post(path="/api/v1/orders", tags={"Orders"}, summary="Place a new order", security={{"sanctum":{}}})
     *
     * Tax logic:
     *   - tax_enabled=false → no tax
     *   - tax_inclusive=true → prices already include tax, we just report the embedded tax amount
     *   - tax_mode=cart_total → one tax line on the full cart
     *   - tax_mode=per_product → each product may have its own tax_rate_override or is_tax_exempt
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'items'                   => 'required|array|min:1',
            'items.*.sale_unit_id'    => 'required|exists:product_sale_units,id',
            'items.*.quantity'        => 'required|integer|min:1|max:99',
            'delivery_type_id'        => 'required|exists:delivery_types,id',
            'payment_method_id'       => 'required|exists:payment_methods,id',
            'shipping_address_id'     => 'nullable|exists:addresses,id',
            'billing_address'         => 'nullable|array',
            'promo_code'              => 'nullable|string',
            'notes'                   => 'nullable|string|max:500',
        ]);

        $order = DB::transaction(function () use ($data) {
            $delivery    = DeliveryType::findOrFail($data['delivery_type_id']);
            $user        = Auth::user();
            $subtotal    = 0.0;
            $orderItems  = [];
            $cartItems   = []; // for promo targeting logic

            // ── 1. Build cart items ──────────────────────────────────────────────
            foreach ($data['items'] as $item) {
                $unit    = ProductSaleUnit::with('product')->findOrFail($item['sale_unit_id']);
                $product = $unit->product;

                // Stock check
                $stock = InventoryStock::where('product_sale_unit_id', $unit->id)
                    ->lockForUpdate()->first();
                if ($stock && $stock->quantity_on_hand < $item['quantity']) {
                    abort(422, __('validation.insufficient_stock', ['product' => $product->name]));
                }

                $lineTotal  = (float) $unit->price * $item['quantity'];
                $subtotal  += $lineTotal;

                $orderItems[] = [
                    'sale_unit'  => $unit,
                    'product'    => $product,
                    'quantity'   => $item['quantity'],
                    'unit_price' => (float) $unit->price,
                    'line_total' => $lineTotal,
                    'snapshot'   => [
                        'name'  => $product->name,
                        'sku'   => $unit->sku_code,
                        'label' => $unit->label,
                        'image' => $product->images()->where('is_primary', true)->value('path'),
                    ],
                ];

                $cartItems[] = [
                    'product'    => $product,
                    'sale_unit'  => $unit,
                    'quantity'   => $item['quantity'],
                    'line_total' => $lineTotal,
                ];
            }

            // ── 2. Promo code validation (enhanced) ──────────────────────────────
            $discountAmount = 0.0;
            $promoCode      = null;

            if (!empty($data['promo_code'])) {
                $promo = PromoCode::with('products')
                    ->where('code', strtoupper($data['promo_code']))->first();

                if ($promo) {
                    $orderCount = Order::where('user_id', $user->id)
                        ->whereIn('status', ['delivered', 'shipped', 'processing'])
                        ->count();

                    if ($promo->meetsConditions($subtotal, $orderCount, $user->email)) {
                        $applicable     = $promo->getApplicableSubtotal($cartItems);
                        $discountAmount = $promo->calculateDiscount($applicable);
                        $promo->increment('used_count');
                        $promoCode = $promo->code;
                    }
                }
            }

            // ── 3. Tax calculation ───────────────────────────────────────────────
            $taxEnabled   = (bool) Setting::getValue('tax_enabled', false);
            $taxAmount    = 0.0;
            $taxBreakdown = [];

            if ($taxEnabled) {
                $taxMode      = Setting::getValue('tax_mode', 'cart_total');
                $defaultRate  = (float) Setting::getValue('tax_rate', 21);
                $taxInclusive = (bool) Setting::getValue('tax_inclusive', true);
                $taxableBase  = max(0, $subtotal - $discountAmount);

                if ($taxMode === 'per_product') {
                    foreach ($cartItems as $ci) {
                        $p = $ci['product'];
                        if ($p->is_tax_exempt) continue;
                        $rate      = $p->tax_rate_override !== null ? (float) $p->tax_rate_override : $defaultRate;
                        $lineBase  = (float) $ci['line_total'];
                        $lineTax   = $taxInclusive
                            ? $lineBase - ($lineBase / (1 + $rate / 100))
                            : $lineBase * ($rate / 100);
                        $taxAmount += $lineTax;
                        $taxBreakdown[] = [
                            'product'   => $p->name,
                            'rate'      => $rate,
                            'tax'       => round($lineTax, 2),
                            'inclusive' => $taxInclusive,
                        ];
                    }
                } else {
                    // cart_total mode
                    $taxAmount = $taxInclusive
                        ? $taxableBase - ($taxableBase / (1 + $defaultRate / 100))
                        : $taxableBase * ($defaultRate / 100);
                }

                $taxAmount = round($taxAmount, 2);
            }

            // ── 4. Total ─────────────────────────────────────────────────────────
            $taxInclusive = (bool) Setting::getValue('tax_inclusive', true);
            // If tax is exclusive (added on top), add it; if inclusive it's already in price
            $taxAddOn = $taxEnabled && !$taxInclusive ? $taxAmount : 0.0;
            $total    = round(max(0, $subtotal - $discountAmount + (float) $delivery->price + $taxAddOn), 2);

            // ── 5. Create order ──────────────────────────────────────────────────
            $order = Order::create([
                'user_id'             => $user->id,
                'status'              => 'pending',
                'subtotal'            => $subtotal,
                'shipping_cost'       => $delivery->price,
                'discount_amount'     => $discountAmount,
                'tax_amount'          => $taxAmount,
                'total'               => $total,
                'payment_method_id'   => $data['payment_method_id'],
                'delivery_type_id'    => $data['delivery_type_id'],
                'shipping_address_id' => $data['shipping_address_id'] ?? null,
                'billing_address'     => $data['billing_address'] ?? null,
                'promo_code'          => $promoCode,
                'notes'               => $data['notes'] ?? null,
            ]);

            // ── 6. Order items + deduct inventory ────────────────────────────────
            foreach ($orderItems as $item) {
                $order->items()->create([
                    'product_id'           => $item['sale_unit']->product_id,
                    'product_sale_unit_id' => $item['sale_unit']->id,
                    'product_snapshot'     => $item['snapshot'],
                    'quantity'             => $item['quantity'],
                    'unit_price'           => $item['unit_price'],
                    'line_total'           => $item['line_total'],
                ]);

                $this->inventory->adjust(
                    saleUnitId:    $item['sale_unit']->id,
                    type:          'sale',
                    quantity:      $item['quantity'],
                    notes:         "Order #{$order->order_number}",
                    referenceType: Order::class,
                    referenceId:   $order->id,
                    performedBy:   $user->id,
                );
            }

            return $order;
        });

        $order->load(['items.product', 'deliveryType', 'paymentMethod', 'shippingAddress']);
        Mail::to(Auth::user()->email)->queue(new OrderConfirmedMail($order, Auth::user()));

        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    /** @OA\Post(path="/api/v1/orders/{id}/cancel", tags={"Orders"}, summary="Cancel an order", security={{"sanctum":{}}}) */
    public function cancel(int $id)
    {
        $order = Auth::user()->orders()->findOrFail($id);

        abort_if(!in_array($order->status, ['pending', 'processing']), 422,
            __('validation.order_not_cancellable'));

        DB::transaction(function () use ($order) {
            $order->update(['status' => 'cancelled']);

            foreach ($order->items as $item) {
                if ($item->product_sale_unit_id) {
                    $this->inventory->adjust(
                        saleUnitId:    $item->product_sale_unit_id,
                        type:          'return',
                        quantity:      $item->quantity,
                        notes:         "Cancelled order #{$order->order_number}",
                        referenceType: Order::class,
                        referenceId:   $order->id,
                    );
                }
            }
        });

        return response()->json(['message' => __('messages.order_cancelled')]);
    }

    /**
     * @OA\Get(path="/api/v1/orders/{id}/receipt", tags={"Orders"}, summary="Download order receipt PDF", security={{"sanctum":{}}})
     */
    public function receipt(int $id)
    {
        $order = Auth::user()->orders()
            ->with(['items.product', 'deliveryType', 'paymentMethod', 'shippingAddress', 'user'])
            ->findOrFail($id);

        $taxEnabled  = (bool) Setting::getValue('tax_enabled', false);
        $taxLabel    = app()->getLocale() === 'fr'
            ? Setting::getValue('tax_label', 'TVA')
            : Setting::getValue('tax_label_en', 'VAT');
        $taxInclusive = (bool) Setting::getValue('tax_inclusive', true);

        $pdf = Pdf::loadView('pdf.order-receipt', compact('order', 'taxEnabled', 'taxLabel', 'taxInclusive'))
            ->setPaper('a4');

        return $pdf->download("receipt-{$order->order_number}.pdf");
    }

    /**
     * @OA\Post(path="/api/v1/public/promo-codes/validate", tags={"Orders"}, summary="Validate a promo code against a cart")
     */
    public function validatePromo(Request $request)
    {
        $data = $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $promo = PromoCode::with('products')
            ->where('code', strtoupper($data['code']))->first();

        if (!$promo || !$promo->isValid()) {
            return response()->json(['valid' => false, 'message' => __('validation.promo_invalid')], 422);
        }

        $orderCount = Auth::check()
            ? Order::where('user_id', Auth::id())->whereIn('status', ['delivered','shipped','processing'])->count()
            : 0;
        $email = Auth::check() ? Auth::user()->email : '';

        if (!$promo->meetsConditions((float) $data['subtotal'], $orderCount, $email)) {
            $msg = $promo->first_order_only
                ? __('validation.promo_first_order_only')
                : ($promo->min_order_amount
                    ? __('validation.promo_min_order', ['amount' => '€' . number_format($promo->min_order_amount, 2)])
                    : __('validation.promo_conditions_not_met'));

            return response()->json(['valid' => false, 'message' => $msg], 422);
        }

        $discount = $promo->calculateDiscount((float) $data['subtotal']);

        return response()->json([
            'valid'         => true,
            'code'          => $promo->code,
            'type'          => $promo->type,
            'value'         => $promo->value,
            'discount'      => $discount,
            'applies_to'    => $promo->applies_to,
            'description'   => $promo->description,
        ]);
    }
}
