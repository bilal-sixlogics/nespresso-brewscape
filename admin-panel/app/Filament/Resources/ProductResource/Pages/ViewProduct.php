<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\RepeatableEntry;

class ViewProduct extends ViewRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make()->icon('heroicon-o-pencil'),
            Actions\DeleteAction::make()->icon('heroicon-o-trash'),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            // Hero card
            Section::make()->schema([
                Grid::make(3)->schema([
                    // Product image
                    ImageEntry::make('images.0.path')
                        ->label('Primary Image')
                        ->height(200)->width(200)
                        ->columnSpan(1),
                    // Core info
                    Grid::make(1)->schema([
                        TextEntry::make('name')
                            ->label('Product Name')
                            ->size(TextEntry\TextEntrySize::Large)
                            ->weight(\Filament\Support\Enums\FontWeight::Bold),
                        TextEntry::make('tagline')->label('Tagline')->color('gray'),
                        Grid::make(3)->schema([
                            TextEntry::make('price')->money('EUR')->label('Price')
                                ->icon('heroicon-o-currency-euro')->color('success'),
                            TextEntry::make('original_price')->money('EUR')->label('Original Price')
                                ->icon('heroicon-o-currency-euro')->color('gray'),
                            TextEntry::make('sale_discount_percent')
                                ->label('Discount')
                                ->getStateUsing(fn($record) => $record->sale_discount_percent ? $record->sale_discount_percent . '%' : '—')
                                ->color('danger'),
                        ]),
                        Grid::make(4)->schema([
                            IconEntry::make('is_active')->label('Active')->boolean(),
                            IconEntry::make('is_featured')->label('Featured')->boolean(),
                            IconEntry::make('is_new')->label('New')->boolean(),
                            IconEntry::make('in_stock')->label('In Stock')->boolean(),
                        ]),
                    ])->columnSpan(2),
                ]),
            ]),
            // Details
            Grid::make(2)->schema([
                Section::make('Classification')->schema([
                    TextEntry::make('category.name')->label('Category')->badge()->color('gray'),
                    TextEntry::make('brand.name')->label('Brand')->badge()->color('info'),
                    TextEntry::make('slug')->label('Slug')->copyable(),
                    TextEntry::make('weight')->label('Weight'),
                    TextEntry::make('origin')->label('Origin'),
                    TextEntry::make('roast_level')->label('Roast Level')->badge(),
                    TextEntry::make('intensity')->label('Intensity')
                        ->getStateUsing(fn($record) => $record->intensity ? "Level {$record->intensity}/13" : '—'),
                ]),
                Section::make('Performance')->schema([
                    TextEntry::make('average_rating')
                        ->label('Average Rating')
                        ->getStateUsing(fn($record) => "⭐ {$record->average_rating} ({$record->review_count} reviews)"),
                    TextEntry::make('created_at')->label('Created')->dateTime(),
                    TextEntry::make('updated_at')->label('Last Updated')->dateTime()->since(),
                ]),
            ]),
            // Sale Units
            Section::make('Sale Units')->schema([
                RepeatableEntry::make('saleUnits')->schema([
                    Grid::make(4)->schema([
                        TextEntry::make('sku_code')->label('SKU')->copyable()->badge(),
                        TextEntry::make('label')->label('Label'),
                        TextEntry::make('price')->money('EUR')->label('Price')->color('success'),
                        IconEntry::make('is_default')->label('Default')->boolean(),
                    ]),
                ]),
            ]),
            // Taste profile
            Section::make('Taste Profile')->schema([
                Grid::make(5)->schema([
                    TextEntry::make('tasteProfile.bitterness')->label('Bitterness')
                        ->getStateUsing(fn($r) => $r->tasteProfile?->bitterness . '/5'),
                    TextEntry::make('tasteProfile.acidity')->label('Acidity')
                        ->getStateUsing(fn($r) => $r->tasteProfile?->acidity . '/5'),
                    TextEntry::make('tasteProfile.roastiness')->label('Roastiness')
                        ->getStateUsing(fn($r) => $r->tasteProfile?->roastiness . '/5'),
                    TextEntry::make('tasteProfile.body')->label('Body')
                        ->getStateUsing(fn($r) => $r->tasteProfile?->body . '/5'),
                    TextEntry::make('tasteProfile.sweetness')->label('Sweetness')
                        ->getStateUsing(fn($r) => $r->tasteProfile?->sweetness . '/5'),
                ]),
            ]),
            // Activity / Audit history
            Section::make('Change History')->schema([
                RepeatableEntry::make('activities')
                    ->getStateUsing(fn($record) =>
                        \Spatie\Activitylog\Models\Activity::forSubject($record)
                            ->orderBy('created_at', 'desc')
                            ->limit(20)
                            ->get()
                            ->toArray()
                    )
                    ->schema([
                        Grid::make(4)->schema([
                            TextEntry::make('created_at')->label('When')->since(),
                            TextEntry::make('causer.name')->label('By')->default('System'),
                            TextEntry::make('description')->label('Action')->badge(),
                            TextEntry::make('properties')->label('Changes')
                                ->getStateUsing(fn($s) => is_array($s) ? json_encode($s['attributes'] ?? []) : '—')
                                ->limit(80),
                        ]),
                    ]),
            ])->collapsible(),
        ]);
    }
}
