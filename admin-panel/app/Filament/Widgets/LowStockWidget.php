<?php
namespace App\Filament\Widgets;

use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use App\Models\InventoryStock;

class LowStockWidget extends BaseWidget
{
    protected static ?string $heading = 'Low Stock Alerts';
    protected static ?int $sort = 5;
    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                InventoryStock::with(['saleUnit.product'])
                    ->whereColumn('quantity_on_hand', '<=', 'reorder_threshold')
                    ->orderBy('quantity_on_hand')
            )
            ->columns([
                Tables\Columns\TextColumn::make('saleUnit.product.name')->label('Product')->limit(30),
                Tables\Columns\TextColumn::make('saleUnit.label')->label('Unit'),
                Tables\Columns\TextColumn::make('quantity_on_hand')->label('On Hand')
                    ->badge()->color('danger'),
                Tables\Columns\TextColumn::make('reorder_threshold')->label('Threshold'),
            ]);
    }
}
