<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductSaleUnit;
use App\Models\ProductImage;
use App\Models\ProductTasteProfile;
use App\Models\ProductTag;
use App\Models\ProductNote;
use App\Models\ProductBrewSize;
use App\Models\InventoryStock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // ── Categories ─────────────────────────────────────────────────────
            $categories = [
                ['name' => 'Café en Grains',    'name_en' => 'Whole Bean Coffee',    'slug' => 'cafe-en-grains',    'sort_order' => 1],
                ['name' => 'Café Moulu',         'name_en' => 'Ground Coffee',         'slug' => 'cafe-moulu',         'sort_order' => 2],
                ['name' => 'Capsules de Café',   'name_en' => 'Coffee Capsules',       'slug' => 'capsules-de-cafe',   'sort_order' => 3],
                ['name' => 'Machines à Café',    'name_en' => 'Coffee Machines',       'slug' => 'machines-a-cafe',    'sort_order' => 4],
                ['name' => 'Accessoires',        'name_en' => 'Accessories',           'slug' => 'accessoires',        'sort_order' => 5],
                ['name' => 'Friandises',         'name_en' => 'Sweet Treats',          'slug' => 'friandises',         'sort_order' => 6],
                ['name' => 'Vending',            'name_en' => 'Vending',               'slug' => 'vending',            'sort_order' => 7],
                ['name' => 'Thé & Boissons',     'name_en' => 'Tea & Beverages',       'slug' => 'the-boissons',       'sort_order' => 8],
            ];
            foreach ($categories as $cat) {
                Category::firstOrCreate(['slug' => $cat['slug']], array_merge($cat, ['is_active' => true]));
            }

            // ── Brands ─────────────────────────────────────────────────────────
            $brandNames = ['Lavazza', 'Delta Cafés', 'Marcilla', 'Nespresso', 'DeLonghi', 'Sage', 'Philips', 'Krups', 'Breville', 'Jura', 'Smeg', 'Melitta', 'Gaggia', 'Necta'];
            foreach ($brandNames as $name) {
                Brand::firstOrCreate(['name' => $name], ['is_active' => true]);
            }

            // ── Helper closures ────────────────────────────────────────────────
            $cat  = fn(string $slug) => Category::where('slug', $slug)->first();
            $brand = fn(string $name) => Brand::where('name', $name)->first();

            // ── Products ───────────────────────────────────────────────────────
            $products = [
                [
                    'data' => [
                        'slug' => 'lavazza-crema-aroma-expert-1kg',
                        'category_id' => $cat('cafe-en-grains')?->id,
                        'brand_id' => $brand('Lavazza')?->id,
                        'name' => 'LAVAZZA CREMA & AROMA EXPERT',
                        'name_en' => 'LAVAZZA CREMA & AROMA EXPERT',
                        'name_part2' => '1 KG',
                        'name_part2_en' => '1 KG',
                        'tagline' => "L'allié idéal des baristas professionnels.",
                        'tagline_en' => 'The ideal ally for professional baristas.',
                        'price' => 19.90,
                        'original_price' => 23.90,
                        'intensity' => 11,
                        'origin' => 'Brésil & Ouganda',
                        'roast_level' => 'dark',
                        'weight' => '1 kg',
                        'is_featured' => true,
                        'is_new' => false,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'LAV-CA-1KG', 'label' => '1 KG', 'label_en' => '1 KG', 'price' => 19.90, 'original_price' => 23.90, 'quantity' => 1, 'is_default' => true],
                        ['sku_code' => 'LAV-CA-3KG', 'label' => '3 KG', 'label_en' => '3 KG', 'price' => 57.89, 'quantity' => 3],
                        ['sku_code' => 'LAV-CA-6KG', 'label' => '6 KG', 'label_en' => '6 KG', 'price' => 108.62, 'quantity' => 6],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop'],
                    'taste' => ['bitterness' => 4, 'acidity' => 2, 'roastiness' => 4, 'body' => 5, 'sweetness' => 2],
                    'notes' => ['Caramel', 'Noix', 'Dark Chocolate'],
                    'brew_sizes' => ['Espresso', 'Lungo', 'Ristretto'],
                    'tags' => ['Best Seller'],
                ],
                [
                    'data' => [
                        'slug' => 'delta-cafes-gold-1kg',
                        'category_id' => $cat('cafe-en-grains')?->id,
                        'brand_id' => $brand('Delta Cafés')?->id,
                        'name' => 'DELTA CAFES GOLD',
                        'name_en' => 'DELTA CAFES GOLD',
                        'name_part2' => '1 KG',
                        'price' => 25.50,
                        'intensity' => 8,
                        'origin' => 'Brésil',
                        'roast_level' => 'medium',
                        'weight' => '1 kg',
                        'is_featured' => false,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'DEL-GOLD-1KG', 'label' => '1 KG', 'price' => 25.50, 'quantity' => 1, 'is_default' => true],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop'],
                    'taste' => ['bitterness' => 3, 'acidity' => 3, 'roastiness' => 3, 'body' => 4, 'sweetness' => 3],
                    'notes' => ['Caramel', 'Amande'],
                    'brew_sizes' => ['Espresso', 'Lungo'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'cafe-moulu-marcilla-natural-250g',
                        'category_id' => $cat('cafe-moulu')?->id,
                        'brand_id' => $brand('Marcilla')?->id,
                        'name' => 'CAFÉ MOULU MARCILLA NATURAL',
                        'price' => 6.20,
                        'original_price' => 7.90,
                        'weight' => '250g',
                        'roast_level' => 'medium',
                        'is_featured' => true,
                        'is_new' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'MAR-250G', 'label' => '250g', 'price' => 6.20, 'original_price' => 7.90, 'quantity' => 1, 'is_default' => true],
                        ['sku_code' => 'MAR-500G', 'label' => '500g', 'price' => 11.90, 'quantity' => 1],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Nouveau'],
                ],
                [
                    'data' => [
                        'slug' => 'capsules-nespresso-comp-intenso-10st',
                        'category_id' => $cat('capsules-de-cafe')?->id,
                        'brand_id' => $brand('Nespresso')?->id,
                        'name' => 'CAPSULES COMPATIBLES NESPRESSO — INTENSO',
                        'price' => 3.90,
                        'intensity' => 9,
                        'is_featured' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'CAP-N-10',  'label' => '10 Capsules',  'price' => 3.90,  'quantity' => 10,  'is_default' => true],
                        ['sku_code' => 'CAP-N-50',  'label' => '50 Capsules',  'price' => 18.00, 'quantity' => 50],
                        ['sku_code' => 'CAP-N-100', 'label' => '100 Capsules', 'price' => 33.00, 'quantity' => 100],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Best Seller'],
                ],
                [
                    'data' => [
                        'slug' => 'capsules-biodegradables-lungo-50st',
                        'category_id' => $cat('capsules-de-cafe')?->id,
                        'name' => 'CAPSULES BIODÉGRADABLES LUNGO',
                        'price' => 21.50,
                        'is_new' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'BIO-L-50',  'label' => 'Lot de 50',  'price' => 21.50, 'quantity' => 50,  'is_default' => true],
                        ['sku_code' => 'BIO-L-200', 'label' => 'Lot de 200', 'price' => 78.00, 'quantity' => 200],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Nouveau', 'Eco'],
                ],
                [
                    'data' => [
                        'slug' => 'delonghi-magnifica-evo-super-auto',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('DeLonghi')?->id,
                        'name' => 'DELONGHI MAGNIFICA EVO',
                        'price' => 549.00,
                        'original_price' => 649.00,
                        'is_featured' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'DL-MAG-EVO', 'label' => 'Machine', 'price' => 549.00, 'original_price' => 649.00, 'quantity' => 1, 'is_default' => true],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1518057111178-44a106bad636?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Best Seller'],
                ],
                [
                    'data' => [
                        'slug' => 'sage-barista-express-semi-auto',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Sage')?->id,
                        'name' => 'SAGE THE BARISTA EXPRESS',
                        'price' => 749.00,
                        'is_featured' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'SAGE-BE', 'label' => 'Machine', 'price' => 749.00, 'quantity' => 1, 'is_default' => true],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'nespresso-vertuo-pop',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Nespresso')?->id,
                        'name' => 'NESPRESSO VERTUO POP',
                        'price' => 99.00,
                        'is_new' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'NES-VP', 'label' => 'Machine', 'price' => 99.00, 'quantity' => 1, 'is_default' => true],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Nouveau'],
                ],
                [
                    'data' => [
                        'slug' => 'philips-lattego-2200',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Philips')?->id,
                        'name' => 'PHILIPS LATTEGO 2200',
                        'price' => 399.00,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'PHI-LG', 'label' => 'Machine', 'price' => 399.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1500353391678-d197b99ea5f2?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'krups-evidence-one',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Krups')?->id,
                        'name' => 'KRUPS EVIDENCE ONE',
                        'price' => 649.00,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'KRU-EVO', 'label' => 'Machine', 'price' => 649.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'breville-oracle-touch',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Breville')?->id,
                        'name' => "BREVILLE ORACLE TOUCH",
                        'price' => 2499.00,
                        'is_featured' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'BRE-OT', 'label' => 'Machine', 'price' => 2499.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1521302200778-33500795e128?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Best Seller'],
                ],
                [
                    'data' => [
                        'slug' => 'jura-ena-8',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Jura')?->id,
                        'name' => 'JURA ENA 8',
                        'price' => 1199.00,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'JUR-ENA8', 'label' => 'Machine', 'price' => 1199.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'smeg-50s-style-espresso',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Smeg')?->id,
                        'name' => "SMEG 50'S STYLE",
                        'price' => 349.00,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'SMEG-50S', 'label' => 'Machine', 'price' => 349.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'melitta-caffeo-barista-ts',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Melitta')?->id,
                        'name' => 'MELITTA CAFFEO BARISTA TS',
                        'price' => 899.00,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'MEL-BTS', 'label' => 'Machine', 'price' => 899.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'gaggia-classic-pro',
                        'category_id' => $cat('machines-a-cafe')?->id,
                        'brand_id' => $brand('Gaggia')?->id,
                        'name' => 'GAGGIA CLASSIC PRO',
                        'price' => 449.00,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [['sku_code' => 'GAG-CLP', 'label' => 'Machine', 'price' => 449.00, 'quantity' => 1, 'is_default' => true]],
                    'images' => ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'gobelets-carton-12cl-cafemalin-lot-50',
                        'category_id' => $cat('accessoires')?->id,
                        'name' => 'GOBELETS EN CARTON CAFÉMALIN 4 OZ (12 CL)',
                        'price' => 4.90,
                        'original_price' => 5.90,
                        'is_featured' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'GOB-50',  'label' => 'Lot de 50',  'price' => 4.90,  'original_price' => 5.90, 'quantity' => 50,  'is_default' => true],
                        ['sku_code' => 'GOB-200', 'label' => 'Lot de 200', 'price' => 17.00, 'quantity' => 200],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Best Seller'],
                ],
                [
                    'data' => [
                        'slug' => 'speculoos-biscuits-cafe-lot-200',
                        'category_id' => $cat('friandises')?->id,
                        'name' => 'SPÉCULOOS BISCUITS CAFÉ',
                        'price' => 18.50,
                        'is_featured' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'SPEC-200', 'label' => 'Lot de 200', 'price' => 18.50, 'quantity' => 200, 'is_default' => true],
                        ['sku_code' => 'SPEC-500', 'label' => 'Lot de 500', 'price' => 41.00, 'quantity' => 500],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Best Seller'],
                ],
                [
                    'data' => [
                        'slug' => 'distributeur-automatique-necta-brio',
                        'category_id' => $cat('vending')?->id,
                        'brand_id' => $brand('Necta')?->id,
                        'name' => 'DISTRIBUTEUR NECTA BRIO 3',
                        'price' => 0,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'NEC-BRIO', 'label' => 'Sur devis', 'label_en' => 'Price on request', 'price' => 0, 'quantity' => 1, 'is_default' => true],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1581243355645-0c4b2c4a2b27?q=80&w=800&auto=format&fit=crop'],
                    'tags' => [],
                ],
                [
                    'data' => [
                        'slug' => 'infusions-the-noir-english-breakfast',
                        'category_id' => $cat('the-boissons')?->id,
                        'name' => 'ENGLISH BREAKFAST THÉ NOIR',
                        'price' => 8.90,
                        'is_new' => true,
                        'in_stock' => true,
                        'is_active' => true,
                    ],
                    'units' => [
                        ['sku_code' => 'TEA-EB-50', 'label' => '50 sachets', 'price' => 8.90,  'quantity' => 50,  'is_default' => true],
                        ['sku_code' => 'TEA-EB-100','label' => '100 sachets','price' => 15.90, 'quantity' => 100],
                    ],
                    'images' => ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop'],
                    'tags' => ['Nouveau'],
                ],
            ];

            foreach ($products as $def) {
                $product = Product::firstOrCreate(
                    ['slug' => $def['data']['slug']],
                    array_merge($def['data'], ['average_rating' => 4.5, 'review_count' => rand(10, 200)])
                );

                // Sale units + inventory
                foreach ($def['units'] ?? [] as $unitData) {
                    $unit = ProductSaleUnit::firstOrCreate(
                        ['sku_code' => $unitData['sku_code']],
                        array_merge(['product_id' => $product->id, 'sort_order' => 0], $unitData)
                    );
                    InventoryStock::firstOrCreate(
                        ['product_sale_unit_id' => $unit->id],
                        ['quantity_on_hand' => rand(20, 200), 'reorder_threshold' => 5, 'reorder_quantity' => 20]
                    );
                }

                // Images
                foreach ($def['images'] ?? [] as $i => $path) {
                    ProductImage::firstOrCreate(
                        ['product_id' => $product->id, 'path' => $path],
                        ['is_primary' => $i === 0, 'sort_order' => $i]
                    );
                }

                // Taste profile
                if (!empty($def['taste'])) {
                    \App\Models\ProductTasteProfile::firstOrCreate(
                        ['product_id' => $product->id],
                        array_merge(['product_id' => $product->id], $def['taste'])
                    );
                }

                // Aromatic notes
                foreach ($def['notes'] ?? [] as $note) {
                    \App\Models\ProductNote::firstOrCreate(['product_id' => $product->id, 'note_text' => $note]);
                }

                // Brew sizes
                foreach ($def['brew_sizes'] ?? [] as $size) {
                    \App\Models\ProductBrewSize::firstOrCreate(['product_id' => $product->id, 'brew_size' => $size]);
                }

                // Tags
                foreach ($def['tags'] ?? [] as $tag) {
                    ProductTag::firstOrCreate(['product_id' => $product->id, 'tag' => $tag]);
                }
            }

            $this->command->info('✅ Seeded ' . count($products) . ' products with categories, brands, units, and inventory');
        });
    }
}
