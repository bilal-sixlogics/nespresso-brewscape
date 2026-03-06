<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductNote extends Model {
    public $timestamps = false;
    protected $fillable = ['product_id','note_text'];
    public function product() { return $this->belongsTo(Product::class); }
}
