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
            Forms\Components\Section::make()->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('code')->required()->unique(PromoCode::class,'code',ignoreRecord:true)->placeholder('SUMMER20'),
                    Forms\Components\Select::make('type')->options(['percent'=>'Percentage %','fixed'=>'Fixed Amount €'])->required(),
                ]),
                Forms\Components\Grid::make(3)->schema([
                    Forms\Components\TextInput::make('value')->numeric()->required()->prefix('%/€'),
                    Forms\Components\TextInput::make('usage_limit')->numeric()->nullable()->placeholder('Unlimited'),
                    Forms\Components\DateTimePicker::make('expires_at')->nullable(),
                ]),
                Forms\Components\Toggle::make('is_active')->default(true),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('code')->searchable()->copyable()->weight('bold'),
            Tables\Columns\TextColumn::make('type')->badge()->color(fn($s)=>$s==='percent'?'success':'warning'),
            Tables\Columns\TextColumn::make('value')->formatStateUsing(fn($s,$r)=>$r->type==='percent'?"$s%":"€$s"),
            Tables\Columns\TextColumn::make('used_count')->label('Used'),
            Tables\Columns\TextColumn::make('usage_limit')->label('Limit')->default('∞'),
            Tables\Columns\TextColumn::make('expires_at')->dateTime()->sortable(),
            Tables\Columns\ToggleColumn::make('is_active'),
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
