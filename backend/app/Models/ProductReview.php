<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model {
    protected $fillable = [
        'product_id', 'reviewer_name', 'reviewer_avatar',
        'rating', 'title', 'comment', 'review_date', 'is_verified_purchase',
    ];
    protected $casts = [
        'review_date' => 'date',
        'is_verified_purchase' => 'boolean',
    ];
    public function product() { return $this->belongsTo(Product::class); }
}
