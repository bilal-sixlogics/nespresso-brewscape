<?php
namespace App\Filament\Widgets;

use Leandrocfe\FilamentApexCharts\Widgets\ApexChartWidget;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class SalesTrendChart extends ApexChartWidget
{
    protected static ?string $chartId = 'salesTrendChart';
    protected static ?string $heading = '30-Day Sales Trend';
    protected static ?int $sort = 2;
    protected int|string|array $columnSpan = 2;
    protected static ?string $pollingInterval = '60s';

    protected function getOptions(): array
    {
        $data = Cache::remember('chart_sales_trend', 300, function () {
            return collect(range(29, 0))
                ->map(fn($days) => [
                    'date'    => Carbon::now()->subDays($days)->format('M d'),
                    'revenue' => (float) Order::where('status', '!=', 'cancelled')
                        ->whereDate('created_at', Carbon::now()->subDays($days))
                        ->sum('total'),
                    'orders'  => (int) Order::whereDate('created_at', Carbon::now()->subDays($days))->count(),
                ]);
        });

        return [
            'chart'   => ['type' => 'area', 'height' => 300, 'toolbar' => ['show' => true]],
            'series'  => [
                ['name' => 'Revenue (€)', 'data' => $data->pluck('revenue')->toArray()],
                ['name' => 'Orders',      'data' => $data->pluck('orders')->toArray()],
            ],
            'xaxis'   => ['categories' => $data->pluck('date')->toArray()],
            'stroke'  => ['curve' => 'smooth', 'width' => 2],
            'fill'    => ['type' => 'gradient', 'gradient' => ['shadeIntensity' => 0.2]],
            'colors'  => ['#3C7A58', '#111111'],
            'tooltip' => ['y' => [['formatter' => 'function(val) { return "€" + val.toFixed(2) }'], ['formatter' => 'function(val) { return val + " orders" }']]],
        ];
    }
}
