<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Order extends Model {
    use LogsActivity;
    protected $fillable = ['order_number','user_id','status','subtotal','shipping_cost','discount_amount','tax_amount','total','payment_method_id','delivery_type_id','tracking_number','shipping_address_id','billing_address','promo_code','notes'];
    protected $casts = ['subtotal' => 'decimal:2','shipping_cost' => 'decimal:2','discount_amount' => 'decimal:2','tax_amount' => 'decimal:2','total' => 'decimal:2','billing_address' => 'array'];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function user() { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
    public function shippingAddress() { return $this->belongsTo(Address::class, 'shipping_address_id'); }
    public function deliveryType() { return $this->belongsTo(DeliveryType::class); }
    public function paymentMethod() { return $this->belongsTo(PaymentMethod::class); }
    protected static function boot() {
        parent::boot();
        static::creating(function ($order) {
            if (!$order->order_number) {
                $prefix = \App\Models\Setting::getValue('checkout_order_prefix', 'CAF');
                $order->order_number = $prefix . '-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }
}
