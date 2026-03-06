<?php

namespace App\Filament\Pages;

use App\Models\InventoryStock;
use App\Models\InventoryTransaction;
use App\Models\ProductSaleUnit;
use App\Services\InventoryService;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables\Actions\Action as TableAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class InventoryManager extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-archive-box';
    protected static ?string $navigationGroup = 'Inventory';
    protected static ?string $navigationLabel = 'Inventory Manager';
    protected static ?string $title = 'Inventory Manager';
    protected static ?int $navigationSort = 1;
    protected static string $view = 'filament.pages.inventory-manager';

    public static function canAccess(): bool
    {
        return Gate::allows('access-inventory');
    }

    public ?array $transactionHistory = null;
    public ?int $selectedUnitId = null;
    public string $selectedUnitLabel = '';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                ProductSaleUnit::query()
                    ->with(['product', 'inventoryStock'])
                    ->whereHas('product', fn (Builder $q) => $q->whereNull('deleted_at'))
            )
            ->columns([
                TextColumn::make('product.name')
                    ->label('Product')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->limit(30),

                TextColumn::make('sku_code')
                    ->label('SKU')
                    ->searchable()
                    ->badge()
                    ->color('gray'),

                TextColumn::make('label')
                    ->label('Unit'),

                TextColumn::make('inventoryStock.quantity_on_hand')
                    ->label('Stock')
                    ->sortable()
                    ->numeric(decimalPlaces: 0)
                    ->color(fn ($record) => match (true) {
                        !$record->inventoryStock => 'danger',
                        $record->inventoryStock->quantity_on_hand <= 0 => 'danger',
                        $record->inventoryStock->isLow() => 'warning',
                        default => 'success',
                    })
                    ->weight('bold'),

                TextColumn::make('inventoryStock.reorder_threshold')
                    ->label('Reorder At')
                    ->numeric(decimalPlaces: 0)
                    ->color('gray'),

                IconColumn::make('is_low_stock')
                    ->label('Low Stock')
                    ->getStateUsing(fn ($record) => $record->inventoryStock?->isLow() ?? false)
                    ->boolean()
                    ->trueIcon('heroicon-o-exclamation-triangle')
                    ->falseIcon('heroicon-o-check-circle')
                    ->trueColor('warning')
                    ->falseColor('success'),

                TextColumn::make('price')
                    ->label('Price')
                    ->money('EUR')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('product')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->label('Product'),

                SelectFilter::make('stock_status')
                    ->label('Stock Status')
                    ->options([
                        'low'     => 'Low Stock',
                        'out'     => 'Out of Stock',
                        'healthy' => 'Healthy',
                    ])
                    ->query(function (Builder $query, array $data) {
                        return match ($data['value'] ?? null) {
                            'out'     => $query->whereHas('inventoryStock', fn ($q) => $q->where('quantity_on_hand', '<=', 0)),
                            'low'     => $query->whereHas('inventoryStock', fn ($q) => $q->whereColumn('quantity_on_hand', '<=', 'reorder_threshold')->where('quantity_on_hand', '>', 0)),
                            'healthy' => $query->whereHas('inventoryStock', fn ($q) => $q->whereColumn('quantity_on_hand', '>', 'reorder_threshold')),
                            default   => $query,
                        };
                    }),
            ])
            ->actions([
                TableAction::make('adjust')
                    ->label('Adjust Stock')
                    ->icon('heroicon-o-arrows-up-down')
                    ->color('primary')
                    ->form([
                        Select::make('type')
                            ->label('Adjustment Type')
                            ->options([
                                'restock'    => 'Restock (Add)',
                                'sale'       => 'Sale (Deduct)',
                                'return'     => 'Return (Add)',
                                'adjustment' => 'Set Exact Amount',
                                'wastage'    => 'Wastage (Deduct)',
                            ])
                            ->required()
                            ->live()
                            ->default('restock'),

                        TextInput::make('quantity')
                            ->label(fn ($get) => $get('type') === 'adjustment' ? 'New Stock Level' : 'Quantity')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(1),

                        Textarea::make('notes')
                            ->label('Notes (optional)')
                            ->rows(2)
                            ->maxLength(500),
                    ])
                    ->action(function ($record, array $data) {
                        app(InventoryService::class)->adjust(
                            saleUnitId: $record->id,
                            type: $data['type'],
                            quantity: (float) $data['quantity'],
                            notes: $data['notes'] ?? null,
                            performedBy: Auth::id(),
                        );

                        Notification::make()
                            ->title('Stock updated successfully')
                            ->success()
                            ->send();
                    }),

                TableAction::make('history')
                    ->label('History')
                    ->icon('heroicon-o-clock')
                    ->color('gray')
                    ->action(function ($record) {
                        $this->selectedUnitId = $record->id;
                        $this->selectedUnitLabel = $record->product->name . ' — ' . $record->label;
                        $this->transactionHistory = InventoryTransaction::where('product_sale_unit_id', $record->id)
                            ->orderByDesc('created_at')
                            ->limit(50)
                            ->get()
                            ->map(fn ($t) => [
                                'id'       => $t->id,
                                'type'     => $t->type,
                                'qty'      => $t->quantity,
                                'before'   => $t->quantity_before,
                                'after'    => $t->quantity_after,
                                'notes'    => $t->notes,
                                'date'     => $t->created_at->format('d M Y H:i'),
                            ])
                            ->toArray();
                    }),

                TableAction::make('edit_thresholds')
                    ->label('Set Thresholds')
                    ->icon('heroicon-o-adjustments-horizontal')
                    ->color('warning')
                    ->form([
                        TextInput::make('reorder_threshold')
                            ->label('Reorder Alert Threshold')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->step(1)
                            ->default(fn ($record) => $record->inventoryStock?->reorder_threshold ?? 10),

                        TextInput::make('reorder_quantity')
                            ->label('Default Reorder Quantity')
                            ->numeric()
                            ->minValue(0)
                            ->step(1)
                            ->default(fn ($record) => $record->inventoryStock?->reorder_quantity ?? 50),
                    ])
                    ->action(function ($record, array $data) {
                        InventoryStock::updateOrCreate(
                            ['product_sale_unit_id' => $record->id],
                            [
                                'reorder_threshold' => $data['reorder_threshold'],
                                'reorder_quantity'  => $data['reorder_quantity'],
                            ]
                        );

                        Notification::make()
                            ->title('Thresholds updated')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([])
            ->defaultSort('product.name')
            ->striped()
            ->poll('30s');
    }

    public function closeHistory(): void
    {
        $this->transactionHistory = null;
        $this->selectedUnitId = null;
        $this->selectedUnitLabel = '';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_low_stock')
                ->label('Export Low Stock Report')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('gray')
                ->action(function () {
                    $units = ProductSaleUnit::with(['product', 'inventoryStock'])
                        ->whereHas('inventoryStock', fn ($q) => $q->whereColumn('quantity_on_hand', '<=', 'reorder_threshold'))
                        ->get();

                    $csv = "Product,SKU,Label,Stock,Threshold\n";
                    foreach ($units as $unit) {
                        $csv .= implode(',', [
                            '"' . $unit->product->name . '"',
                            $unit->sku_code,
                            '"' . $unit->label . '"',
                            $unit->inventoryStock?->quantity_on_hand ?? 0,
                            $unit->inventoryStock?->reorder_threshold ?? 0,
                        ]) . "\n";
                    }

                    $filename = 'low-stock-' . now()->format('Y-m-d') . '.csv';
                    return response()->streamDownload(fn () => print($csv), $filename);
                }),
        ];
    }
}
