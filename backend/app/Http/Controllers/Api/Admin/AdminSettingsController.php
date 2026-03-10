<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * GET /api/v1/admin/settings
     * Returns all settings grouped by group key.
     */
    public function index()
    {
        $settings = Setting::all()->groupBy('group');
        return response()->json($settings);
    }

    /**
     * PUT /api/v1/admin/settings
     * Bulk upsert settings. Body: array of {key, value, group, type, label}
     */
    public function update(Request $request)
    {
        $request->validate([
            '*.key'   => 'required|string',
            '*.value' => 'nullable|string',
        ]);

        foreach ($request->all() as $item) {
            Setting::updateOrCreate(
                ['key' => $item['key']],
                array_merge($item, ['value' => $item['value'] ?? ''])
            );
        }

        return response()->json(['message' => 'Settings saved']);
    }

    /**
     * GET /api/v1/admin/settings/{group}
     * Returns settings for a specific group.
     */
    public function group(string $group)
    {
        return response()->json(
            Setting::where('group', $group)->get()->keyBy('key')
        );
    }
}
