<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Pages\ListRecords\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListProducts extends ListRecords
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Add Product')
                ->icon('heroicon-o-plus'),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All')
                ->badge(fn() => \App\Models\Product::withTrashed()->count()),
            'active' => Tab::make('Active')
                ->modifyQueryUsing(fn(Builder $q) => $q->where('is_active', true)->whereNull('deleted_at'))
                ->badge(fn() => \App\Models\Product::where('is_active', true)->count())
                ->badgeColor('success'),
            'featured' => Tab::make('Featured')
                ->modifyQueryUsing(fn(Builder $q) => $q->where('is_featured', true)->whereNull('deleted_at'))
                ->badge(fn() => \App\Models\Product::where('is_featured', true)->count())
                ->badgeColor('warning'),
            'out_of_stock' => Tab::make('Out of Stock')
                ->modifyQueryUsing(fn(Builder $q) => $q->where('in_stock', false)->whereNull('deleted_at'))
                ->badge(fn() => \App\Models\Product::where('in_stock', false)->count())
                ->badgeColor('danger'),
            'archived' => Tab::make('Archived')
                ->modifyQueryUsing(fn(Builder $q) => $q->onlyTrashed())
                ->badge(fn() => \App\Models\Product::onlyTrashed()->count())
                ->badgeColor('gray'),
        ];
    }
}
