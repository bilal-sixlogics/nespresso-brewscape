<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteBanner;
use Illuminate\Http\Request;

class AdminBannerController extends Controller
{
    public function index()
    {
        return response()->json(SiteBanner::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'message'    => 'required|string',
            'message_en' => 'nullable|string',
            'cta_label'  => 'nullable|string',
            'cta_label_en' => 'nullable|string',
            'cta_url'    => 'nullable|string',
            'bg_color'   => 'nullable|string|max:20',
            'text_color' => 'nullable|string|max:20',
            'is_active'  => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        return response()->json(SiteBanner::create($data), 201);
    }

    public function update(Request $request, SiteBanner $siteBanner)
    {
        $siteBanner->update($request->all());
        return response()->json($siteBanner);
    }

    public function destroy(SiteBanner $siteBanner)
    {
        $siteBanner->delete();
        return response()->json(['message' => 'Banner deleted']);
    }
}
