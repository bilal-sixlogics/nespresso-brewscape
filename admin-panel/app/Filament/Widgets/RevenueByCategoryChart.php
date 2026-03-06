<?php
namespace App\Filament\Widgets;

use Leandrocfe\FilamentApexCharts\Widgets\ApexChartWidget;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RevenueByCategoryChart extends ApexChartWidget
{
    protected static ?string $chartId = 'revenueByCategoryChart';
    protected static ?string $heading = 'Revenue by Category';
    protected static ?int $sort = 3;
    protected int|string|array $columnSpan = 1;

    protected function getOptions(): array
    {
        $data = Cache::remember('chart_revenue_by_category', 600, function () {
            return OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'cancelled')
                ->whereDate('orders.created_at', '>=', now()->subDays(30))
                ->select('categories.name', DB::raw('SUM(order_items.line_total) as total'))
                ->groupBy('categories.name')
                ->orderByDesc('total')
                ->limit(8)
                ->get();
        });

        return [
            'chart'   => ['type' => 'donut', 'height' => 300],
            'series'  => $data->pluck('total')->map(fn($v) => (float)$v)->toArray(),
            'labels'  => $data->pluck('name')->toArray(),
            'colors'  => ['#3C7A58', '#111111', '#F5F0E8', '#6B9E7E', '#D4A96A', '#8B5CF6', '#EC4899', '#14B8A6'],
            'legend'  => ['position' => 'bottom'],
            'plotOptions' => ['pie' => ['donut' => ['size' => '65%']]],
        ];
    }
}
