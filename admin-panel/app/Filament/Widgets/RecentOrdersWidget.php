<?php
namespace App\Filament\Widgets;

use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use App\Models\Order;

class RecentOrdersWidget extends BaseWidget
{
    protected static ?string $heading = 'Recent Orders';
    protected static ?int $sort = 4;
    protected int|string|array $columnSpan = ['default' => 1, 'sm' => 2, 'lg' => 2];

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::with(['user', 'items'])->orderByDesc('created_at')->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->copyable()->weight('bold'),
                Tables\Columns\TextColumn::make('user.name')->default('Guest'),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn($state) => match($state) {
                    'pending' => 'warning', 'processing' => 'info',
                    'shipped' => 'primary', 'delivered' => 'success', 'cancelled' => 'danger', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('total')->money('EUR'),
                Tables\Columns\TextColumn::make('created_at')->since(),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->url(fn($record) => route('filament.admin.resources.orders.view', $record))
                    ->icon('heroicon-o-eye'),
            ]);
    }
}
