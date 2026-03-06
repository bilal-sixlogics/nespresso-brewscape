<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductBrewSize extends Model {
    public $timestamps = false;
    protected $fillable = ['product_id','brew_size'];
    public function product() { return $this->belongsTo(Product::class); }
}
