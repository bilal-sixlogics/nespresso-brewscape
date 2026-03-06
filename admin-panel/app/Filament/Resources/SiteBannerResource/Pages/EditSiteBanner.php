<?php
namespace App\Filament\Resources\SiteBannerResource\Pages;
use App\Filament\Resources\SiteBannerResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditSiteBanner extends EditRecord {
    protected static string $resource = SiteBannerResource::class;
    
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
