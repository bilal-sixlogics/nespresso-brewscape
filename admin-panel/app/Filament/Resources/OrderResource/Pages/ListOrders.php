<?php
namespace App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Pages\ListRecords\Tab;
use Illuminate\Database\Eloquent\Builder;
class ListOrders extends ListRecords {
    protected static string $resource = OrderResource::class;
    public function getTabs(): array {
        return [
            'all'        => Tab::make('All'),
            'pending'    => Tab::make('Pending')->modifyQueryUsing(fn(Builder $q) => $q->where('status','pending'))->badge(fn()=>\App\Models\Order::where('status','pending')->count())->badgeColor('warning'),
            'processing' => Tab::make('Processing')->modifyQueryUsing(fn(Builder $q) => $q->where('status','processing'))->badgeColor('info'),
            'shipped'    => Tab::make('Shipped')->modifyQueryUsing(fn(Builder $q) => $q->where('status','shipped'))->badgeColor('primary'),
            'delivered'  => Tab::make('Delivered')->modifyQueryUsing(fn(Builder $q) => $q->where('status','delivered'))->badgeColor('success'),
            'cancelled'  => Tab::make('Cancelled')->modifyQueryUsing(fn(Builder $q) => $q->where('status','cancelled'))->badgeColor('danger'),
        ];
    }
}
