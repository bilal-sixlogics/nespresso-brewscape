<?php
namespace App\Filament\Resources;

use App\Filament\Resources\NewsletterSubscriberResource\Pages;
use App\Models\NewsletterSubscriber;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Actions\BulkAction;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterSubscriberResource extends Resource
{
    protected static ?string $model = NewsletterSubscriber::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 11;

    public static function form(Form $form): Form
    {
        // Read-only: no create/edit from admin. Form is intentionally minimal.
        return $form->schema([
            Forms\Components\TextInput::make('email')->disabled(),
            Forms\Components\TextInput::make('name')->disabled(),
            Forms\Components\TextInput::make('locale')->disabled(),
            Forms\Components\DateTimePicker::make('subscribed_at')->disabled(),
            Forms\Components\DateTimePicker::make('unsubscribed_at')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->copyable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('locale')
                    ->badge()
                    ->color('primary'),
                Tables\Columns\TextColumn::make('subscribed_at')
                    ->label('Subscribed')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('unsubscribed_at')
                    ->label('Unsubscribed')
                    ->date()
                    ->sortable()
                    ->color(fn ($record) => $record?->unsubscribed_at ? 'danger' : null)
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->getStateUsing(fn ($record): string => $record->unsubscribed_at ? 'Unsubscribed' : 'Active')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Active' => 'success',
                        'Unsubscribed' => 'danger',
                        default => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('unsubscribed_at')
                    ->label('Subscription Status')
                    ->nullable()
                    ->trueLabel('Active subscribers')
                    ->falseLabel('Unsubscribed')
                    ->queries(
                        true: fn ($query) => $query->whereNull('unsubscribed_at'),
                        false: fn ($query) => $query->whereNotNull('unsubscribed_at'),
                        blank: fn ($query) => $query,
                    ),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export_all_active')
                    ->label('Export All Active')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->action(function (): StreamedResponse {
                        $subscribers = NewsletterSubscriber::active()->get();
                        return self::streamCsv('active-subscribers', $subscribers);
                    }),
            ])
            ->actions([])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    BulkAction::make('export_csv')
                        ->label('Export as CSV')
                        ->icon('heroicon-o-arrow-down-tray')
                        ->action(function (Collection $records): StreamedResponse {
                            return self::streamCsv('selected-subscribers', $records);
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    /**
     * Build a streamed CSV download response from a collection of subscribers.
     */
    public static function streamCsv(string $filename, \Illuminate\Support\Collection|Collection $records): StreamedResponse
    {
        $csvFilename = $filename . '-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'Email', 'Name', 'Locale', 'Subscribed At', 'Unsubscribed At', 'IP Address']);

            foreach ($records as $subscriber) {
                fputcsv($handle, [
                    $subscriber->id,
                    $subscriber->email,
                    $subscriber->name,
                    $subscriber->locale,
                    $subscriber->subscribed_at?->toDateTimeString() ?? '',
                    $subscriber->unsubscribed_at?->toDateTimeString() ?? '',
                    $subscriber->ip_address ?? '',
                ]);
            }

            fclose($handle);
        }, $csvFilename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListNewsletterSubscribers::route('/'),
        ];
    }
}
