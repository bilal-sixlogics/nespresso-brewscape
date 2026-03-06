<?php
namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Order;
use App\Models\Product;
use App\Models\InventoryStock;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;
    protected int|string|array $columnSpan = 'full';
    protected static ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        $todayRevenue = Cache::remember('stat_today_revenue', 30, fn() =>
            Order::where('status', '!=', 'cancelled')
                ->whereDate('created_at', today())
                ->sum('total')
        );

        $todayOrders = Cache::remember('stat_today_orders', 30, fn() =>
            Order::whereDate('created_at', today())->count()
        );

        $yesterdayOrders = Cache::remember('stat_yesterday_orders', 60, fn() =>
            Order::whereDate('created_at', Carbon::yesterday())->count()
        );

        $activeProducts = Cache::remember('stat_active_products', 300, fn() =>
            Product::where('is_active', true)->count()
        );

        $lowStockCount = Cache::remember('stat_low_stock', 60, fn() =>
            InventoryStock::whereColumn('quantity_on_hand', '<=', 'reorder_threshold')->count()
        );

        $pendingOrders = Cache::remember('stat_pending_orders', 30, fn() =>
            Order::where('status', 'pending')->count()
        );

        $orderTrend = $yesterdayOrders > 0
            ? round((($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100)
            : 0;

        return [
            Stat::make("Today's Revenue", '€' . number_format($todayRevenue, 2))
                ->description('Orders today')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success')
                ->chart([max(0, $todayRevenue * 0.8), $todayRevenue]),

            Stat::make('Orders Today', $todayOrders)
                ->description($orderTrend >= 0 ? "+{$orderTrend}% vs yesterday" : "{$orderTrend}% vs yesterday")
                ->descriptionIcon($orderTrend >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($orderTrend >= 0 ? 'success' : 'danger'),

            Stat::make('Active Products', $activeProducts)
                ->description('In catalogue')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('info'),

            Stat::make('Pending Orders', $pendingOrders)
                ->description('Awaiting processing')
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingOrders > 10 ? 'warning' : 'gray'),

            Stat::make('Low Stock Alerts', $lowStockCount)
                ->description('Units below threshold')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($lowStockCount > 0 ? 'danger' : 'success'),
        ];
    }
}
