<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/v1/admin/dashboard/stats
     */
    public function stats()
    {
        $today     = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();

        $revenueToday     = Order::where('created_at', '>=', $today)
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');
        $revenueYesterday = Order::whereBetween('created_at', [$yesterday, $today])
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $ordersToday     = Order::where('created_at', '>=', $today)->count();
        $ordersYesterday = Order::whereBetween('created_at', [$yesterday, $today])->count();

        $pendingOrders = Order::where('status', 'pending')->count();
        $activeProducts = Product::where('is_active', true)->count();
        $lowStock = InventoryStock::whereColumn('quantity_on_hand', '<=', 'reorder_threshold')
            ->where('quantity_on_hand', '>', 0)
            ->count();
        $outOfStock = InventoryStock::where('quantity_on_hand', '<=', 0)->count();

        $newCustomersToday = User::where('created_at', '>=', $today)->count();

        $avgOrder = Order::where('created_at', '>=', now()->subDays(30))
            ->whereNotIn('status', ['cancelled'])
            ->avg('total') ?? 0;

        return response()->json([
            'revenue_today'    => round($revenueToday, 2),
            'revenue_yesterday'=> round($revenueYesterday, 2),
            'orders_today'     => $ordersToday,
            'orders_yesterday' => $ordersYesterday,
            'pending_orders'   => $pendingOrders,
            'active_products'  => $activeProducts,
            'low_stock'        => $lowStock,
            'out_of_stock'     => $outOfStock,
            'new_customers'    => $newCustomersToday,
            'avg_order'        => round($avgOrder, 2),
        ]);
    }

    /**
     * GET /api/v1/admin/dashboard/sales-trend?days=30
     */
    public function salesTrend(Request $request)
    {
        $days = min((int) $request->query('days', 30), 90);

        $trend = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotIn('status', ['cancelled'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill missing days with 0
        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $row  = $trend->firstWhere('date', $date);
            $result[] = [
                'date'    => $date,
                'revenue' => $row ? round($row->revenue, 2) : 0,
                'orders'  => $row ? $row->orders : 0,
            ];
        }

        return response()->json($result);
    }

    /**
     * GET /api/v1/admin/dashboard/recent-orders
     */
    public function recentOrders()
    {
        $orders = Order::with(['user'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($o) => [
                'id'           => $o->id,
                'status'       => $o->status,
                'total'        => $o->total,
                'customer'     => $o->user?->name ?? 'Guest',
                'customer_email' => $o->user?->email ?? '—',
                'created_at'   => $o->created_at,
            ]);

        return response()->json($orders);
    }
}
