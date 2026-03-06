<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductTasteProfile extends Model {
    protected $fillable = ['product_id','bitterness','acidity','roastiness','body','sweetness'];
    public function product() { return $this->belongsTo(Product::class); }
}
