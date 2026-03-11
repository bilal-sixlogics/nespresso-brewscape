<?php
namespace App\Filament\Resources;
use App\Models\PromoCode;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\PromoCodeResource\Pages;

class PromoCodeResource extends Resource {
    protected static ?string $model = PromoCode::class;
    protected static ?string $navigationIcon = 'heroicon-o-ticket';
    protected static ?string $navigationGroup = 'Commerce';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Tabs::make('PromoCode')->tabs([
                Forms\Components\Tabs\Tab::make('Basic')->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('code')
                            ->required()->unique(PromoCode::class,'code',ignoreRecord:true)
                            ->placeholder('SUMMER20')->helperText('Customer-facing promo code, uppercase'),
                        Forms\Components\Select::make('type')
                            ->options(['percent'=>'Percentage (%)','fixed'=>'Fixed Amount (€)'])->required(),
                    ]),
                    Forms\Components\Grid::make(3)->schema([
                        Forms\Components\TextInput::make('value')->numeric()->required()->prefix('%/€'),
                        Forms\Components\TextInput::make('max_discount_amount')
                            ->label('Max Discount Cap (€)')->numeric()->prefix('€')->nullable()
                            ->helperText('Cap the max discount even if % is high'),
                        Forms\Components\TextInput::make('usage_limit')
                            ->numeric()->nullable()->placeholder('Unlimited'),
                    ]),
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\DateTimePicker::make('expires_at')->nullable(),
                        Forms\Components\Toggle::make('is_active')->default(true),
                    ]),
                    Forms\Components\Textarea::make('description')
                        ->label('Admin Note')->rows(2)->nullable()
                        ->placeholder('Internal note about this promo code'),
                ]),

                Forms\Components\Tabs\Tab::make('Conditions')->schema([
                    Forms\Components\Section::make('Order Conditions')->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('min_order_amount')
                                ->label('Minimum Order Amount (€)')->numeric()->prefix('€')->nullable()
                                ->helperText('Cart subtotal must be at least this amount'),
                            Forms\Components\Toggle::make('first_order_only')
                                ->label('First Order Only')->inline(false)
                                ->helperText('Only valid for a customer\'s first completed order'),
                        ]),
                        Forms\Components\TextInput::make('customer_email')
                            ->label('Restrict to Customer Email')->email()->nullable()
                            ->helperText('Leave blank to allow any customer'),
                    ]),
                ]),

                Forms\Components\Tabs\Tab::make('Targeting')->schema([
                    Forms\Components\Section::make('What Does This Promo Apply To?')->schema([
                        Forms\Components\Select::make('applies_to')
                            ->options([
                                'all'        => 'All Products (entire cart)',
                                'products'   => 'Specific Products',
                                'categories' => 'Specific Categories',
                            ])
                            ->default('all')->reactive(),
                        Forms\Components\Select::make('included_ids')
                            ->label('Categories')
                            ->options(fn() => \App\Models\Category::active()->pluck('name', 'id'))
                            ->multiple()->nullable()
                            ->visible(fn($get) => $get('applies_to') === 'categories')
                            ->helperText('Promo applies only to products in these categories'),
                        Forms\Components\Select::make('products')
                            ->label('Specific Products')
                            ->relationship('products', 'name')
                            ->multiple()->searchable()->preload()->nullable()
                            ->visible(fn($get) => $get('applies_to') === 'products')
                            ->helperText('Promo applies only to these products'),
                    ]),
                    Forms\Components\Section::make('Exclusions')->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Toggle::make('exclude_discounted_products')
                                ->label('Exclude Already-Discounted Products')->inline(false)
                                ->helperText('Skip products with original_price or unit-level discount'),
                            Forms\Components\Toggle::make('exclude_on_sale_products')
                                ->label('Exclude On-Sale Products')->inline(false)
                                ->helperText('Skip products with is_on_sale = true'),
                        ]),
                    ]),
                ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('code')->searchable()->copyable()->weight('bold'),
            Tables\Columns\TextColumn::make('type')->badge()->color(fn($state)=>$state==='percent'?'success':'warning'),
            Tables\Columns\TextColumn::make('value')->formatStateUsing(fn($state,$record)=>$record->type==='percent'?"{$state}%":"€{$state}"),
            Tables\Columns\TextColumn::make('used_count')->label('Used'),
            Tables\Columns\TextColumn::make('usage_limit')->label('Limit')->default('∞'),
            Tables\Columns\TextColumn::make('expires_at')->dateTime()->sortable(),
            Tables\Columns\ToggleColumn::make('is_active'),
            Tables\Columns\TextColumn::make('min_order_amount')
                ->label('Min Order')->money('EUR')->default('—'),
            Tables\Columns\IconColumn::make('first_order_only')
                ->label('1st Order Only')->boolean(),
        ])
        ->filters([Tables\Filters\TernaryFilter::make('is_active')])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListPromoCodes::route('/'),
            'create' => Pages\CreatePromoCode::route('/create'),
            'edit'   => Pages\EditPromoCode::route('/{record}/edit'),
        ];
    }
}
