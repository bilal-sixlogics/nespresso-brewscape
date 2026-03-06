<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->addresses()->orderByDesc('is_default')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label'       => 'nullable|string|max:50',
            'first_name'  => 'required|string|max:80',
            'last_name'   => 'required|string|max:80',
            'address'     => 'required|string|max:200',
            'city'        => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country'     => 'nullable|string|size:2',
            'phone'       => 'nullable|string|max:20',
            'is_default'  => 'nullable|boolean',
        ]);

        if (!empty($data['is_default'])) {
            Auth::user()->addresses()->update(['is_default' => false]);
        }

        $address = Auth::user()->addresses()->create($data + ['is_default' => $data['is_default'] ?? false]);
        return response()->json($address, 201);
    }

    public function update(Request $request, int $id)
    {
        $address = Auth::user()->addresses()->findOrFail($id);
        $data = $request->validate([
            'label'       => 'nullable|string|max:50',
            'first_name'  => 'sometimes|string|max:80',
            'last_name'   => 'sometimes|string|max:80',
            'address'     => 'sometimes|string|max:200',
            'city'        => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:20',
            'country'     => 'nullable|string|size:2',
            'phone'       => 'nullable|string|max:20',
            'is_default'  => 'nullable|boolean',
        ]);

        if (!empty($data['is_default'])) {
            Auth::user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($data);
        return response()->json($address);
    }

    public function destroy(int $id)
    {
        Auth::user()->addresses()->findOrFail($id)->delete();
        return response()->json(['message' => __('messages.address_deleted')]);
    }
}
