<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductFeature extends Model {
    protected $fillable = ['product_id','title','title_en','sort_order'];
    public function product() { return $this->belongsTo(Product::class); }
    public function items() { return $this->hasMany(ProductFeatureItem::class, 'feature_id')->orderBy('sort_order'); }
}
