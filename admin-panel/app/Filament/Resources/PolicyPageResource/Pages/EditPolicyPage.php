<?php
namespace App\Filament\Resources\PolicyPageResource\Pages;

use App\Filament\Resources\PolicyPageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPolicyPage extends EditRecord
{
    protected static string $resource = PolicyPageResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['last_updated_at'] = now();
        return $data;
    }
}
