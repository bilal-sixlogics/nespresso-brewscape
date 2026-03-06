<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Product extends Model {
    use LogsActivity, SoftDeletes;
    protected $fillable = [
        'slug','category_id','brand_id','name','name_en','name_part2','name_part2_en',
        'tagline','tagline_en','description','description_en','price','original_price',
        'intensity','origin','roast_level','processing_method','weight',
        'average_rating','review_count','is_featured','is_new','in_stock','is_active',
    ];
    protected $casts = [
        'price' => 'decimal:2','original_price' => 'decimal:2',
        'average_rating' => 'decimal:2','is_featured' => 'boolean',
        'is_new' => 'boolean','in_stock' => 'boolean','is_active' => 'boolean',
    ];
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }
    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function saleUnits() { return $this->hasMany(ProductSaleUnit::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function primaryImage() { return $this->hasOne(ProductImage::class)->where('is_primary', true); }
    public function tasteProfile() { return $this->hasOne(ProductTasteProfile::class); }
    public function features() { return $this->hasMany(ProductFeature::class)->orderBy('sort_order'); }
    public function notes() { return $this->hasMany(ProductNote::class); }
    public function brewSizes() { return $this->hasMany(ProductBrewSize::class); }
    public function tags() { return $this->hasMany(ProductTag::class); }
    public function allergens() { return $this->hasMany(ProductAllergen::class); }
    public function testimonials() { return $this->hasMany(Testimonial::class); }
    public function deals() { return $this->hasMany(Deal::class); }
    public function getDiscountPercentAttribute(): ?int {
        if ($this->original_price && $this->original_price > $this->price) {
            return (int) round((1 - $this->price / $this->original_price) * 100);
        }
        return null;
    }
}
