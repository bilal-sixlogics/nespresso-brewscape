<?php
namespace App\Filament\Resources;
use App\Models\Deal;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\DealResource\Pages;

class DealResource extends Resource {
    protected static ?string $model = Deal::class;
    protected static ?string $navigationIcon = 'heroicon-o-fire';
    protected static ?string $navigationGroup = 'Commerce';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Deals';

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\Select::make('product_id')->relationship('product','name')->required()->searchable()->preload(),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('deal_price')->numeric()->prefix('€')->required(),
                    Forms\Components\DateTimePicker::make('expires_at')->nullable(),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('label')->placeholder('Promo été'),
                    Forms\Components\TextInput::make('label_en')->placeholder('Summer deal'),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                    Forms\Components\Toggle::make('is_active')->default(true),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('product.name')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('deal_price')->money('EUR')->sortable(),
            Tables\Columns\TextColumn::make('label'),
            Tables\Columns\TextColumn::make('expires_at')->dateTime()->sortable(),
            Tables\Columns\ToggleColumn::make('is_active'),
        ])
        ->reorderable('sort_order')
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListDeals::route('/'),
            'create' => Pages\CreateDeal::route('/create'),
            'edit'   => Pages\EditDeal::route('/{record}/edit'),
        ];
    }
}
