<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductFeatureItem extends Model {
    protected $fillable = ['feature_id','item_text','item_text_en','sort_order'];
    public function feature() { return $this->belongsTo(ProductFeature::class, 'feature_id'); }
}
