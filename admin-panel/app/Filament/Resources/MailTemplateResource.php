<?php
namespace App\Filament\Resources;

use App\Filament\Resources\MailTemplateResource\Pages;
use App\Models\MailTemplate;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\HtmlString;

class MailTemplateResource extends Resource
{
    protected static ?string $model = MailTemplate::class;
    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('mail_template_tabs')
                ->tabs([
                    Forms\Components\Tabs\Tab::make('General')
                        ->schema([
                            Forms\Components\TextInput::make('name')
                                ->required()
                                ->maxLength(255),
                            Forms\Components\TextInput::make('key')
                                ->required()
                                ->maxLength(255)
                                ->unique(MailTemplate::class, 'key', ignoreRecord: true)
                                ->disabled(fn ($operation) => $operation === 'edit')
                                ->dehydrated(fn ($operation) => $operation !== 'edit'),
                            Forms\Components\Toggle::make('is_active')
                                ->label('Active')
                                ->default(true),
                        ]),
                    Forms\Components\Tabs\Tab::make('FR Content')
                        ->schema([
                            Forms\Components\TextInput::make('subject_fr')
                                ->label('Subject (FR)')
                                ->required()
                                ->maxLength(255),
                            Forms\Components\RichEditor::make('body_fr')
                                ->label('Body (FR)')
                                ->toolbarButtons([
                                    'bold',
                                    'italic',
                                    'link',
                                    'bulletList',
                                    'orderedList',
                                    'blockquote',
                                ])
                                ->columnSpanFull(),
                        ]),
                    Forms\Components\Tabs\Tab::make('EN Content')
                        ->schema([
                            Forms\Components\TextInput::make('subject_en')
                                ->label('Subject (EN)')
                                ->maxLength(255),
                            Forms\Components\RichEditor::make('body_en')
                                ->label('Body (EN)')
                                ->toolbarButtons([
                                    'bold',
                                    'italic',
                                    'link',
                                    'bulletList',
                                    'orderedList',
                                    'blockquote',
                                ])
                                ->columnSpanFull(),
                        ]),
                    Forms\Components\Tabs\Tab::make('Variables')
                        ->schema([
                            Forms\Components\Placeholder::make('variables_hint')
                                ->label('Available Merge Tags')
                                ->content(function ($record): string {
                                    if (! $record || empty($record->variables)) {
                                        return 'No variables defined yet. Add variable names in the JSON field below (e.g. ["name","email","order_id"]) and they will appear here as {name}, {email}, {order_id}.';
                                    }
                                    $vars = is_array($record->variables) ? $record->variables : [];
                                    $tags = array_map(fn ($v) => '{' . $v . '}', $vars);
                                    return 'Available tags: ' . implode(', ', $tags);
                                }),
                            Forms\Components\Textarea::make('variables')
                                ->label('Variables (JSON array)')
                                ->helperText('Enter a JSON array of variable names, e.g. ["name","email","order_id"]')
                                ->rows(4)
                                ->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state, JSON_PRETTY_PRINT) : $state)
                                ->dehydrateStateUsing(function ($state) {
                                    if (is_string($state)) {
                                        $decoded = json_decode($state, true);
                                        return json_last_error() === JSON_ERROR_NONE ? $decoded : $state;
                                    }
                                    return $state;
                                }),
                        ]),
                ])
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('key')
                    ->badge()
                    ->color('gray')
                    ->searchable(),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->since(),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\Action::make('preview')
                    ->label('Preview')
                    ->icon('heroicon-o-eye')
                    ->modalHeading(fn ($record) => 'Preview: ' . $record->name)
                    ->modalContent(function ($record): HtmlString {
                        $subject = e($record->subject_fr ?? '(no subject)');
                        $body = $record->body_fr ?? '<em>No body content.</em>';
                        return new HtmlString(
                            '<div class="space-y-4">'
                            . '<div class="text-sm font-semibold text-gray-500 dark:text-gray-400">Subject (FR)</div>'
                            . '<div class="rounded border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">' . $subject . '</div>'
                            . '<div class="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-4">Body (FR)</div>'
                            . '<div class="rounded border border-gray-200 dark:border-gray-700 p-4 prose dark:prose-invert max-w-none text-sm">' . $body . '</div>'
                            . '</div>'
                        );
                    })
                    ->modalSubmitAction(false),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListMailTemplates::route('/'),
            'create' => Pages\CreateMailTemplate::route('/create'),
            'edit'   => Pages\EditMailTemplate::route('/{record}/edit'),
        ];
    }
}
