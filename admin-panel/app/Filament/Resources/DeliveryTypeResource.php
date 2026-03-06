<?php
namespace App\Filament\Resources;
use App\Models\DeliveryType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\DeliveryTypeResource\Pages;

class DeliveryTypeResource extends Resource {
    protected static ?string $model = DeliveryType::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Commerce';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('name')->required(),
                    Forms\Components\TextInput::make('name_en')->label('Name (EN)'),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\Textarea::make('description')->label('Description (FR)')->rows(2),
                    Forms\Components\Textarea::make('description_en')->label('Description (EN)')->rows(2),
                ]),
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('price')->numeric()->prefix('€')->required(),
                    Forms\Components\TextInput::make('estimated_days')->placeholder('2-3 jours'),
                    Forms\Components\TextInput::make('icon')->placeholder('heroicon-o-truck'),
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
            Tables\Columns\TextColumn::make('name')->searchable(),
            Tables\Columns\TextColumn::make('price')->money('EUR'),
            Tables\Columns\TextColumn::make('estimated_days')->label('ETA'),
            Tables\Columns\ToggleColumn::make('is_active'),
            Tables\Columns\TextColumn::make('sort_order')->sortable(),
        ])
        ->reorderable('sort_order')
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListDeliveryTypes::route('/'),
            'create' => Pages\CreateDeliveryType::route('/create'),
            'edit'   => Pages\EditDeliveryType::route('/{record}/edit'),
        ];
    }
}
