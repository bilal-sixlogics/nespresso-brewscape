<?php
namespace App\Filament\Resources\PolicyPageResource\Pages;

use App\Filament\Resources\PolicyPageResource;
use Filament\Resources\Pages\ListRecords;

class ListPolicyPages extends ListRecords
{
    protected static string $resource = PolicyPageResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
