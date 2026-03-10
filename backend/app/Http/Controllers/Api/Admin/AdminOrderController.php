<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * GET /api/v1/admin/orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) =>
                $sq->where('id', 'like', '%' . $request->search . '%')
                   ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', '%' . $request->search . '%')
                       ->orWhere('email', 'like', '%' . $request->search . '%'))
            ))
            ->orderByDesc('created_at');

        return response()->json($query->paginate($request->query('per_page', 20)));
    }

    /**
     * GET /api/v1/admin/orders/{id}
     */
    public function show(Order $order)
    {
        return response()->json(
            $order->load(['user', 'items.product', 'items.saleUnit'])
        );
    }

    /**
     * PATCH /api/v1/admin/orders/{id}/status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated', 'order' => $order->fresh()]);
    }

    /**
     * DELETE /api/v1/admin/orders/{id}  (soft cancel)
     */
    public function destroy(Order $order)
    {
        $order->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Order cancelled']);
    }
}
