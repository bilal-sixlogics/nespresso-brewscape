<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
class Setting extends Model {
    protected $fillable = ['key','value','type','group','label'];
    public static function getValue(string $key, mixed $default = null): mixed {
        $setting = Cache::remember("setting_{$key}", 3600, fn() => static::where('key', $key)->first());
        if (!$setting) return $default;
        return match($setting->type) {
            'boolean' => (bool) $setting->value,
            'number'  => (float) $setting->value,
            'json'    => json_decode($setting->value, true),
            default   => $setting->value,
        };
    }
    public static function setValue(string $key, mixed $value): void {
        static::updateOrCreate(['key' => $key], ['value' => is_array($value) ? json_encode($value) : $value]);
        Cache::forget("setting_{$key}");
    }
}
