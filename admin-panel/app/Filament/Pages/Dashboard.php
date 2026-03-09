<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    /**
     * 12-column grid: widgets use integer spans (e.g. columnSpan = 4 = 1/3 width).
     * On tablet (sm) drops to 2 columns, on mobile to 1.
     */
    public function getColumns(): int|string|array
    {
        return [
            'default' => 1,
            'sm'      => 2,
            'lg'      => 3,
            'xl'      => 3,
        ];
    }
}
