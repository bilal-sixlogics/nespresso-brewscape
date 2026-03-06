<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class FooterSection extends Model {
    protected $fillable = ['title','title_en','sort_order','is_active'];
    protected $casts = ['is_active' => 'boolean'];
    public function links() { return $this->hasMany(FooterLink::class, 'section_id')->orderBy('sort_order'); }
}
