<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInfo;
use Illuminate\Support\Facades\Cache;

class ContactInfoController extends Controller
{
    public function index()
    {
        return response()->json(Cache::remember('api_contact', 3600, fn () =>
            ContactInfo::all()->pluck('value', 'key')
        ));
    }
}
