<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CheckoutSetting extends Model {
    protected $fillable = ['key','value','type','label'];
    public static function get(string $key, mixed $default = null): mixed {
        $s = static::where('key', $key)->first();
        if (!$s) return $default;
        return $s->type === 'boolean' ? (bool) $s->value : $s->value;
    }
}
