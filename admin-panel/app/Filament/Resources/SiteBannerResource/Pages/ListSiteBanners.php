<?php
namespace App\Filament\Resources\SiteBannerResource\Pages;
use App\Filament\Resources\SiteBannerResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListSiteBanners extends ListRecords {
    protected static string $resource = SiteBannerResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
    
}
