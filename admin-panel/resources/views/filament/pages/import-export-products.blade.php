<x-filament-panels::page>
    <div class="space-y-6">

        {{-- Import Form --}}
        <x-filament::section>
            <x-slot name="heading">Import Products from CSV</x-slot>
            <x-slot name="description">
                Upload a CSV with product data. Missing optional fields use defaults.
                <a href="{{ url('/admin/import-export-products?action=template') }}"
                   class="text-primary-600 underline">Download template</a>
            </x-slot>

            <form wire:submit.prevent="importCsv">
                {{ $this->form }}
            </form>
        </x-filament::section>

        {{-- Results --}}
        @if($showResults)
        <x-filament::section>
            <x-slot name="heading">Import Results</x-slot>
            <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="bg-green-50 dark:bg-green-950 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-green-600">{{ $importResults['created'] }}</div>
                    <div class="text-sm text-green-700 mt-1">Created</div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-blue-600">{{ $importResults['updated'] }}</div>
                    <div class="text-sm text-blue-700 mt-1">Updated</div>
                </div>
                <div class="bg-red-50 dark:bg-red-950 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-red-600">{{ $importResults['skipped'] }}</div>
                    <div class="text-sm text-red-700 mt-1">Skipped / Errors</div>
                </div>
            </div>

            @if(!empty($importResults['errors']))
            <div class="mt-4">
                <h4 class="font-semibold text-red-600 mb-2">Errors:</h4>
                <ul class="list-disc list-inside space-y-1 text-sm text-red-600">
                    @foreach($importResults['errors'] as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
            @endif
        </x-filament::section>
        @endif

        {{-- CSV Column Reference --}}
        <x-filament::section>
            <x-slot name="heading">CSV Column Reference</x-slot>
            <x-slot name="description">Required columns are marked with *. All others are optional.</x-slot>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b dark:border-gray-700">
                            <th class="text-left py-2 px-3 font-semibold">Column</th>
                            <th class="text-left py-2 px-3 font-semibold">Description</th>
                            <th class="text-left py-2 px-3 font-semibold">Example</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y dark:divide-gray-700">
                        @foreach([
                            ['name *', 'Product name in French', 'Café Espresso Bio'],
                            ['name_en', 'Product name in English', 'Bio Espresso Coffee'],
                            ['slug', 'URL slug (auto-generated if blank)', 'cafe-espresso-bio'],
                            ['category', 'Category name (created if new)', 'Café en Grains'],
                            ['brand', 'Brand name (created if new)', 'Cafrezzo'],
                            ['price *', 'Base selling price in EUR', '12.90'],
                            ['original_price', 'Original price if on sale', '15.90'],
                            ['weight', 'Product weight string', '250g'],
                            ['origin', 'Country of origin', 'Éthiopie'],
                            ['roast_level', 'light | medium | dark | espresso', 'medium'],
                            ['intensity', 'Intensity 0–13', '8'],
                            ['is_on_sale', 'Is product on sale? 1/0', '1'],
                            ['sale_discount_percent', 'Sale discount % to all units', '15'],
                            ['is_featured', '1 or 0', '1'],
                            ['in_stock', '1 or 0', '1'],
                            ['is_active', '1 or 0', '1'],
                            ['sku_code', 'SKU for default sale unit', 'CAF-ESP-250'],
                            ['unit_label', 'Sale unit label FR', '250g'],
                            ['unit_price', 'Sale unit price (defaults to price)', '12.90'],
                            ['base_unit', 'Base measurement unit', 'g'],
                            ['base_quantity', 'Quantity in base units', '250'],
                        ] as [$col, $desc, $ex])
                        <tr>
                            <td class="py-2 px-3 font-mono text-xs {{ str_contains($col, '*') ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-400' }}">{{ $col }}</td>
                            <td class="py-2 px-3">{{ $desc }}</td>
                            <td class="py-2 px-3 font-mono text-xs text-gray-500">{{ $ex }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </x-filament::section>

    </div>
</x-filament-panels::page>
