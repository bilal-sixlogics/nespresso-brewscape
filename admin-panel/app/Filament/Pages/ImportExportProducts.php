<?php

namespace App\Filament\Pages;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSaleUnit;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Str;
use League\Csv\Reader;
use League\Csv\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportExportProducts extends Page
{
    protected static ?string $navigationIcon  = 'heroicon-o-arrows-up-down';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?string $navigationLabel = 'Import / Export';
    protected static ?int    $navigationSort  = 5;
    protected static string  $view            = 'filament.pages.import-export-products';

    public ?string $file = null;
    public array   $importResults = [];
    public bool    $showResults   = false;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['super_admin', 'manager']) ?? false;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_csv')
                ->label('Export Products CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('success')
                ->action('downloadCsv'),

            Action::make('export_pdf')
                ->label('Export Products PDF')
                ->icon('heroicon-o-document-arrow-down')
                ->color('warning')
                ->action('downloadPdf'),

            Action::make('download_template')
                ->label('Download CSV Template')
                ->icon('heroicon-o-document-text')
                ->color('gray')
                ->action('downloadTemplate'),
        ];
    }

    public function getFormSchema(): array
    {
        return [
            Forms\Components\Section::make('Import Products from CSV')
                ->description('Upload a CSV file to bulk-import products. Missing optional fields will use defaults. Download the template for the correct column format.')
                ->schema([
                    Forms\Components\FileUpload::make('file')
                        ->label('CSV File')
                        ->disk('local')
                        ->directory('imports')
                        ->acceptedFileTypes(['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel'])
                        ->maxSize(10240)
                        ->required(),
                    Forms\Components\Actions::make([
                        Forms\Components\Actions\Action::make('import')
                            ->label('Import Now')
                            ->icon('heroicon-o-arrow-up-tray')
                            ->action('importCsv'),
                    ]),
                ]),
        ];
    }

    public function importCsv(): void
    {
        if (!$this->file) {
            Notification::make()->title('No file selected')->danger()->send();
            return;
        }

        $path = storage_path('app/' . $this->file);
        if (!file_exists($path)) {
            Notification::make()->title('File not found')->danger()->send();
            return;
        }

        $csv     = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);
        $records = iterator_to_array($csv->getRecords());

        $results  = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];

        foreach ($records as $index => $row) {
            $rowNum = $index + 2; // 1-based, header is row 1

            try {
                $row = array_map('trim', $row);

                // Required: name
                if (empty($row['name'])) {
                    $results['errors'][] = "Row {$rowNum}: 'name' is required";
                    $results['skipped']++;
                    continue;
                }

                // Resolve category
                $categoryId = null;
                if (!empty($row['category'])) {
                    $cat = Category::firstOrCreate(
                        ['name' => $row['category']],
                        ['name_en' => $row['category_en'] ?? $row['category'], 'slug' => Str::slug($row['category']), 'is_active' => true]
                    );
                    $categoryId = $cat->id;
                }

                // Resolve brand
                $brandId = null;
                if (!empty($row['brand'])) {
                    $brand   = Brand::firstOrCreate(['name' => $row['brand']], ['is_active' => true]);
                    $brandId = $brand->id;
                }

                $slug = $row['slug'] ?? Str::slug($row['name']);

                $productData = array_filter([
                    'slug'               => $slug,
                    'name'               => $row['name'],
                    'name_en'            => $row['name_en']            ?? null,
                    'tagline'            => $row['tagline']            ?? null,
                    'tagline_en'         => $row['tagline_en']         ?? null,
                    'description'        => $row['description']        ?? null,
                    'description_en'     => $row['description_en']     ?? null,
                    'price'              => isset($row['price'])       ? (float) $row['price'] : null,
                    'original_price'     => isset($row['original_price']) && $row['original_price'] !== '' ? (float) $row['original_price'] : null,
                    'weight'             => $row['weight']             ?? null,
                    'origin'             => $row['origin']             ?? null,
                    'roast_level'        => $row['roast_level']        ?? null,
                    'processing_method'  => $row['processing_method']  ?? null,
                    'intensity'          => isset($row['intensity'])   ? (int) $row['intensity'] : null,
                    'is_featured'        => isset($row['is_featured'])  ? (bool) $row['is_featured'] : false,
                    'is_new'             => isset($row['is_new'])       ? (bool) $row['is_new']      : false,
                    'in_stock'           => isset($row['in_stock'])     ? filter_var($row['in_stock'], FILTER_VALIDATE_BOOLEAN) : true,
                    'is_active'          => isset($row['is_active'])    ? filter_var($row['is_active'], FILTER_VALIDATE_BOOLEAN) : true,
                    'is_on_sale'         => isset($row['is_on_sale'])   ? filter_var($row['is_on_sale'], FILTER_VALIDATE_BOOLEAN) : false,
                    'sale_discount_percent' => isset($row['sale_discount_percent']) && $row['sale_discount_percent'] !== '' ? (float) $row['sale_discount_percent'] : null,
                    'category_id'        => $categoryId,
                    'brand_id'           => $brandId,
                ], fn($v) => $v !== null && $v !== '');

                $existing = Product::where('slug', $slug)->first();

                if ($existing) {
                    $existing->update($productData);
                    $product = $existing;
                    $results['updated']++;
                } else {
                    if (!isset($productData['price'])) {
                        $results['errors'][] = "Row {$rowNum}: 'price' is required for new products";
                        $results['skipped']++;
                        continue;
                    }
                    $product = Product::create($productData);
                    $results['created']++;
                }

                // Sale unit (sku_code, unit_label, unit_price, unit_original_price, unit_quantity)
                if (!empty($row['sku_code'])) {
                    ProductSaleUnit::updateOrCreate(
                        ['sku_code' => $row['sku_code']],
                        [
                            'product_id'     => $product->id,
                            'label'          => $row['unit_label']          ?? $row['name'],
                            'label_en'       => $row['unit_label_en']       ?? null,
                            'price'          => (float) ($row['unit_price'] ?? $productData['price'] ?? 0),
                            'original_price' => isset($row['unit_original_price']) && $row['unit_original_price'] !== '' ? (float) $row['unit_original_price'] : null,
                            'quantity'       => (int) ($row['unit_quantity']        ?? 1),
                            'base_unit'      => $row['base_unit']           ?? null,
                            'base_quantity'  => isset($row['base_quantity']) && $row['base_quantity'] !== '' ? (float) $row['base_quantity'] : null,
                            'is_default'     => true,
                            'sort_order'     => 0,
                        ]
                    );
                }

            } catch (\Throwable $e) {
                $results['errors'][] = "Row {$rowNum}: " . $e->getMessage();
                $results['skipped']++;
            }
        }

        $this->importResults = $results;
        $this->showResults   = true;

        $total = $results['created'] + $results['updated'];
        Notification::make()
            ->title("Import complete: {$results['created']} created, {$results['updated']} updated, {$results['skipped']} skipped")
            ->color($results['skipped'] > 0 ? 'warning' : 'success')
            ->send();
    }

    public function downloadCsv(): StreamedResponse
    {
        $products = Product::with(['category', 'brand', 'saleUnits'])->get();

        $filename = 'products-export-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($products) {
            $out = fopen('php://output', 'w');
            // Header
            fputcsv($out, [
                'slug','name','name_en','tagline','tagline_en','description','description_en',
                'category','category_en','brand',
                'price','original_price','weight','origin','roast_level','processing_method',
                'intensity','is_featured','is_new','in_stock','is_active',
                'is_on_sale','sale_discount_percent',
                'sku_code','unit_label','unit_label_en','unit_price','unit_original_price',
                'unit_quantity','base_unit','base_quantity',
            ]);

            foreach ($products as $product) {
                $unit = $product->saleUnits->where('is_default', true)->first()
                    ?? $product->saleUnits->first();

                fputcsv($out, [
                    $product->slug,
                    $product->name,
                    $product->name_en,
                    $product->tagline,
                    $product->tagline_en,
                    $product->description,
                    $product->description_en,
                    $product->category?->name,
                    $product->category?->name_en,
                    $product->brand?->name,
                    $product->price,
                    $product->original_price,
                    $product->weight,
                    $product->origin,
                    $product->roast_level,
                    $product->processing_method,
                    $product->intensity,
                    $product->is_featured ? '1' : '0',
                    $product->is_new      ? '1' : '0',
                    $product->in_stock    ? '1' : '0',
                    $product->is_active   ? '1' : '0',
                    $product->is_on_sale  ? '1' : '0',
                    $product->sale_discount_percent,
                    $unit?->sku_code,
                    $unit?->label,
                    $unit?->label_en,
                    $unit?->price,
                    $unit?->original_price,
                    $unit?->quantity,
                    $unit?->base_unit,
                    $unit?->base_quantity,
                ]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'slug','name','name_en','tagline','tagline_en','description','description_en',
                'category','category_en','brand',
                'price','original_price','weight','origin','roast_level','processing_method',
                'intensity','is_featured','is_new','in_stock','is_active',
                'is_on_sale','sale_discount_percent',
                'sku_code','unit_label','unit_label_en','unit_price','unit_original_price',
                'unit_quantity','base_unit','base_quantity',
            ]);
            // Sample row
            fputcsv($out, [
                'cafrezzo-espresso-bio','Cafrezzo Bio Espresso','Cafrezzo Bio Espresso',
                'Un café riche en saveur','A rich flavored coffee',
                'Description en français','Description in English',
                'Café en Grains','Whole Bean','Cafrezzo',
                '12.90','','250g','Ethiopie','medium','washed',
                '8','0','1','1','1',
                '0','',
                'CAF-ESP-BIO-250','250g','250g','12.90','','1','g','250',
            ]);
            fclose($out);
        }, 'products-import-template.csv', ['Content-Type' => 'text/csv']);
    }

    public function downloadPdf(): \Symfony\Component\HttpFoundation\Response
    {
        $products = Product::with(['category', 'brand', 'saleUnits'])->get();
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.products-catalog', compact('products'))
            ->setPaper('a4');
        return $pdf->download('products-catalog-' . now()->format('Y-m-d') . '.pdf');
    }
}
