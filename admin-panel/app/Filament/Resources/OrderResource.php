<?php
namespace App\Filament\Resources;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\OrderResource\Pages;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components;

class OrderResource extends Resource {
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Orders';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make('Order Details')->schema([
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('order_number')->disabled(),
                    Forms\Components\Select::make('status')->options([
                        'pending'    => 'Pending',
                        'processing' => 'Processing',
                        'shipped'    => 'Shipped',
                        'delivered'  => 'Delivered',
                        'cancelled'  => 'Cancelled',
                    ])->required(),
                    Forms\Components\TextInput::make('tracking_number')->nullable(),
                ]),
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('subtotal')->numeric()->disabled(),
                    Forms\Components\TextInput::make('shipping_cost')->numeric()->disabled(),
                    Forms\Components\TextInput::make('total')->numeric()->disabled(),
                ]),
                Forms\Components\Textarea::make('notes')->label('Internal Notes')->rows(3),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('order_number')->searchable()->copyable()->weight('bold'),
            Tables\Columns\TextColumn::make('user.name')->label('Customer')->searchable()
                ->default('Guest'),
            Tables\Columns\TextColumn::make('status')->badge()->color(fn($state) => match($state) {
                'pending'    => 'warning',
                'processing' => 'info',
                'shipped'    => 'primary',
                'delivered'  => 'success',
                'cancelled'  => 'danger',
                default      => 'gray',
            }),
            Tables\Columns\TextColumn::make('total')->money('EUR')->sortable(),
            Tables\Columns\TextColumn::make('items_count')->label('Items')->counts('items')->badge(),
            Tables\Columns\TextColumn::make('promo_code')->badge()->color('success'),
            Tables\Columns\TextColumn::make('created_at')->label('Ordered')->dateTime()->sortable(),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('status')->options([
                'pending'    => 'Pending',
                'processing' => 'Processing',
                'shipped'    => 'Shipped',
                'delivered'  => 'Delivered',
                'cancelled'  => 'Cancelled',
            ]),
            Tables\Filters\Filter::make('created_at')
                ->form([
                    Forms\Components\DatePicker::make('from'),
                    Forms\Components\DatePicker::make('until'),
                ])
                ->query(fn($q, $data) => $q
                    ->when($data['from'], fn($q, $d) => $q->whereDate('created_at', '>=', $d))
                    ->when($data['until'], fn($q, $d) => $q->whereDate('created_at', '<=', $d))
                ),
        ])
        ->actions([
            Tables\Actions\ViewAction::make(),
            Tables\Actions\EditAction::make(),
            Tables\Actions\Action::make('update_status')
                ->label('Update Status')
                ->icon('heroicon-o-arrow-path')
                ->form([
                    Forms\Components\Select::make('status')->options([
                        'pending' => 'Pending', 'processing' => 'Processing',
                        'shipped' => 'Shipped', 'delivered' => 'Delivered',
                        'cancelled' => 'Cancelled',
                    ])->required(),
                    Forms\Components\TextInput::make('tracking_number')->nullable(),
                ])
                ->action(fn($record, $data) => $record->update($data)),
        ])
        ->defaultSort('created_at', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist {
        return $infolist->schema([
            Components\Section::make('Order Summary')->schema([
                Components\Grid::make(4)->schema([
                    Components\TextEntry::make('order_number')->copyable()->weight(\Filament\Support\Enums\FontWeight::Bold),
                    Components\TextEntry::make('status')->badge(),
                    Components\TextEntry::make('total')->money('EUR'),
                    Components\TextEntry::make('created_at')->dateTime(),
                ]),
            ]),
            Components\Section::make('Customer')->schema([
                Components\Grid::make(3)->schema([
                    Components\TextEntry::make('user.name')->label('Name')->default('Guest'),
                    Components\TextEntry::make('user.email')->label('Email'),
                    Components\TextEntry::make('user.phone')->label('Phone'),
                ]),
            ]),
            Components\Section::make('Order Items')->schema([
                Components\RepeatableEntry::make('items')->schema([
                    Components\Grid::make(4)->schema([
                        Components\TextEntry::make('product.name')->label('Product'),
                        Components\TextEntry::make('saleUnit.label')->label('Unit'),
                        Components\TextEntry::make('quantity'),
                        Components\TextEntry::make('line_total')->money('EUR'),
                    ]),
                ]),
            ]),
            Components\Section::make('Audit History')->schema([
                Components\RepeatableEntry::make('activities')
                    ->getStateUsing(fn($record) =>
                        \Spatie\Activitylog\Models\Activity::forSubject($record)->orderByDesc('created_at')->limit(15)->get()->toArray()
                    )
                    ->schema([
                        Components\Grid::make(3)->schema([
                            Components\TextEntry::make('created_at')->since(),
                            Components\TextEntry::make('causer.name')->default('System'),
                            Components\TextEntry::make('description')->badge(),
                        ]),
                    ]),
            ])->collapsible(),
        ]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListOrders::route('/'),
            'view'   => Pages\ViewOrder::route('/{record}'),
            'edit'   => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
