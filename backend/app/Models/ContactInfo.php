<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ContactInfo extends Model {
    protected $table = 'contact_info';
    protected $fillable = ['key','value','label'];
    public static function get(string $key, string $default = ''): string {
        return static::where('key', $key)->value('value') ?? $default;
    }
}
