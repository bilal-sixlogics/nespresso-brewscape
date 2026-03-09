<?php

namespace App\Filament\Widgets;

use Leandrocfe\FilamentApexCharts\Widgets\ApexChartWidget;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class SalesTrendChart extends ApexChartWidget
{
    protected static ?string $chartId       = 'salesTrendChart';
    protected static ?string $heading       = 'Sales Trend';
    protected static ?int    $sort          = 2;
    protected static ?string $pollingInterval = '60s';

    // Full-width across the dashboard grid
    protected int|string|array $columnSpan = 'full';

    // Default filter on load
    public ?string $filter = '30d';

    /**
     * Tab filters shown in the chart header.
     */
    protected function getFilters(): ?array
    {
        return [
            '7d'  => 'Last 7 Days',
            '30d' => 'Last 30 Days',
            '3m'  => 'Last 3 Months',
            '1y'  => 'This Year',
        ];
    }

    protected function getOptions(): array
    {
        [$labels, $revenue, $orders] = match ($this->filter) {
            '7d'    => $this->buildDailyData(7),
            '3m'    => $this->buildWeeklyData(12),
            '1y'    => $this->buildMonthlyData(12),
            default => $this->buildDailyData(30),
        };

        return [
            'chart' => [
                'type'    => 'area',
                'height'  => 360,
                'fontFamily' => 'Inter, ui-sans-serif, system-ui, sans-serif',
                'toolbar' => [
                    'show'  => true,
                    'tools' => [
                        'download'  => true,
                        'selection' => true,
                        'zoom'      => true,
                        'zoomin'    => true,
                        'zoomout'   => true,
                        'pan'       => true,
                        'reset'     => true,
                    ],
                    'export' => [
                        'csv' => ['filename' => 'cafrezzo-sales'],
                        'svg' => ['filename' => 'cafrezzo-sales'],
                        'png' => ['filename' => 'cafrezzo-sales'],
                    ],
                ],
                'animations' => [
                    'enabled'           => true,
                    'easing'            => 'easeinout',
                    'speed'             => 600,
                    'animateGradually'  => ['enabled' => true, 'delay' => 100],
                    'dynamicAnimation'  => ['enabled' => true, 'speed' => 400],
                ],
                'zoom'       => ['enabled' => true, 'type' => 'x'],
                'dropShadow' => [
                    'enabled' => true,
                    'top'     => 6,
                    'left'    => 0,
                    'blur'    => 10,
                    'opacity' => 0.07,
                ],
            ],

            'series' => [
                ['name' => 'Revenue (€)', 'data' => $revenue],
                ['name' => 'Orders',      'data' => $orders],
            ],

            'xaxis' => [
                'categories' => $labels,
                'axisBorder' => ['show' => false],
                'axisTicks'  => ['show' => false],
                'labels'     => [
                    'style' => [
                        'fontSize'   => '11px',
                        'fontFamily' => 'Inter, sans-serif',
                        'fontWeight' => 500,
                        'colors'     => '#A1A1AA',
                    ],
                ],
                'crosshairs' => [
                    'show'   => true,
                    'stroke' => ['color' => '#3C7A58', 'width' => 1, 'dashArray' => 4],
                ],
            ],

            'yaxis' => [
                [
                    'seriesName' => 'Revenue (€)',
                    'labels'     => [
                        'formatter'  => 'function(v){ return "€"+v.toFixed(0) }',
                        'style'      => ['fontSize' => '11px', 'fontFamily' => 'Inter, sans-serif', 'colors' => '#A1A1AA'],
                    ],
                ],
                [
                    'opposite'   => true,
                    'seriesName' => 'Orders',
                    'labels'     => [
                        'formatter'  => 'function(v){ return Math.round(v) }',
                        'style'      => ['fontSize' => '11px', 'fontFamily' => 'Inter, sans-serif', 'colors' => '#A1A1AA'],
                    ],
                ],
            ],

            'stroke' => [
                'curve'   => 'smooth',
                'width'   => [2.5, 1.5],
                'lineCap' => 'round',
            ],

            'fill' => [
                'type'     => 'gradient',
                'gradient' => [
                    'type'           => 'vertical',
                    'shadeIntensity' => 1,
                    'opacityFrom'    => 0.22,
                    'opacityTo'      => 0.0,
                    'stops'          => [0, 85, 100],
                ],
            ],

            'colors'  => ['#3C7A58', '#93C5B0'],

            'markers' => [
                'size'        => 0,
                'strokeColors'=> '#FFFFFF',
                'strokeWidth' => 2,
                'hover'       => ['size' => 5, 'sizeOffset' => 2],
            ],

            'grid' => [
                'borderColor'     => '#F0F0F0',
                'strokeDashArray' => 4,
                'xaxis'           => ['lines' => ['show' => false]],
                'padding'         => ['top' => -10, 'right' => 8, 'bottom' => 0, 'left' => 8],
            ],

            'tooltip' => [
                'shared'    => true,
                'intersect' => false,
                'theme'     => 'light',
                'style'     => ['fontSize' => '12px', 'fontFamily' => 'Inter, sans-serif'],
                'y'         => [
                    ['formatter' => 'function(v){ return "€"+v.toFixed(2) }'],
                    ['formatter' => 'function(v){ return Math.round(v)+" orders" }'],
                ],
                'marker'    => ['show' => true],
            ],

            'legend' => [
                'position'        => 'top',
                'horizontalAlign' => 'right',
                'fontFamily'      => 'Inter, sans-serif',
                'fontSize'        => '12px',
                'fontWeight'      => 600,
                'markers'         => ['size' => 6, 'offsetX' => -2],
                'itemMargin'      => ['horizontal' => 10],
            ],

            'responsive' => [
                [
                    'breakpoint' => 1024,
                    'options'    => [
                        'chart'  => ['height' => 300],
                        'yaxis'  => [['show' => true], ['show' => false, 'opposite' => true]],
                    ],
                ],
                [
                    'breakpoint' => 640,
                    'options'    => [
                        'chart'  => ['height' => 240, 'toolbar' => ['show' => false]],
                        'yaxis'  => [['show' => false], ['show' => false, 'opposite' => true]],
                        'legend' => ['position' => 'bottom', 'horizontalAlign' => 'center'],
                    ],
                ],
            ],
        ];
    }

    // ─── Data builders ───────────────────────────────────────────

    private function buildDailyData(int $days): array
    {
        $data = Cache::remember("chart_daily_{$days}", 300, function () use ($days) {
            return collect(range($days - 1, 0))->map(fn ($d) => [
                'label'   => Carbon::now()->subDays($d)->format($days <= 7 ? 'D, d M' : 'M d'),
                'revenue' => (float) Order::where('status', '!=', 'cancelled')
                                          ->whereDate('created_at', Carbon::now()->subDays($d))
                                          ->sum('total'),
                'orders'  => (int) Order::whereDate('created_at', Carbon::now()->subDays($d))->count(),
            ]);
        });

        return [$data->pluck('label')->all(), $data->pluck('revenue')->all(), $data->pluck('orders')->all()];
    }

    private function buildWeeklyData(int $weeks): array
    {
        $data = Cache::remember("chart_weekly_{$weeks}", 600, function () use ($weeks) {
            return collect(range($weeks - 1, 0))->map(function ($w) {
                $start = Carbon::now()->startOfWeek()->subWeeks($w);
                $end   = (clone $start)->endOfWeek();
                return [
                    'label'   => $start->format('M d'),
                    'revenue' => (float) Order::where('status', '!=', 'cancelled')
                                              ->whereBetween('created_at', [$start, $end])
                                              ->sum('total'),
                    'orders'  => (int) Order::whereBetween('created_at', [$start, $end])->count(),
                ];
            });
        });

        return [$data->pluck('label')->all(), $data->pluck('revenue')->all(), $data->pluck('orders')->all()];
    }

    private function buildMonthlyData(int $months): array
    {
        $data = Cache::remember("chart_monthly_{$months}", 900, function () use ($months) {
            return collect(range($months - 1, 0))->map(function ($m) {
                $start = Carbon::now()->startOfMonth()->subMonths($m);
                $end   = (clone $start)->endOfMonth();
                return [
                    'label'   => $start->format("M 'y"),
                    'revenue' => (float) Order::where('status', '!=', 'cancelled')
                                              ->whereBetween('created_at', [$start, $end])
                                              ->sum('total'),
                    'orders'  => (int) Order::whereBetween('created_at', [$start, $end])->count(),
                ];
            });
        });

        return [$data->pluck('label')->all(), $data->pluck('revenue')->all(), $data->pluck('orders')->all()];
    }
}
