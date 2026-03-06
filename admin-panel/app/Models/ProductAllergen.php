<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductAllergen extends Model {
    public $timestamps = false;
    protected $fillable = ['product_id','allergen_text','allergen_text_en'];
    public function product() { return $this->belongsTo(Product::class); }
}
