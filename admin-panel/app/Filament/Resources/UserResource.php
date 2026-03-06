<?php
namespace App\Filament\Resources;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Filament\Resources\UserResource\Pages;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource {
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Orders';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make('Profile')->schema([
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('name')->required(),
                    Forms\Components\TextInput::make('email')->email()->required()
                        ->unique(User::class, 'email', ignoreRecord: true),
                ]),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('phone')->nullable(),
                    Forms\Components\Select::make('locale')
                        ->options(['fr' => 'French', 'en' => 'English', 'de' => 'German', 'ru' => 'Russian', 'nl' => 'Dutch'])
                        ->default('fr'),
                ]),
                Forms\Components\TextInput::make('password')->password()->revealable()
                    ->dehydrateStateUsing(fn($s) => Hash::make($s))
                    ->dehydrated(fn($s) => filled($s))
                    ->nullable()
                    ->label('New Password (leave blank to keep current)'),
                Forms\Components\Select::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()->preload()
                    ->label('Admin Roles'),
                Forms\Components\Toggle::make('is_active')->default(true),
                Forms\Components\FileUpload::make('avatar_path')->label('Avatar')
                    ->image()->imageEditor()->directory('avatars')->circular(),
            ]),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ImageColumn::make('avatar_path')->label('')->circular(),
            Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('email')->searchable()->copyable(),
            Tables\Columns\TextColumn::make('roles.name')->label('Roles')->badge()->color('primary'),
            Tables\Columns\TextColumn::make('orders_count')->label('Orders')->counts('orders')->badge(),
            Tables\Columns\ToggleColumn::make('is_active')->label('Active'),
            Tables\Columns\TextColumn::make('created_at')->label('Joined')->date()->sortable(),
        ])
        ->filters([
            Tables\Filters\TernaryFilter::make('is_active'),
            Tables\Filters\SelectFilter::make('roles')
                ->relationship('roles', 'name')->multiple(),
        ])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
