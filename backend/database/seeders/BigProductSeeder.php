<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InventoryStock;
use App\Models\Product;
use App\Models\ProductBrewSize;
use App\Models\ProductImage;
use App\Models\ProductNote;
use App\Models\ProductSaleUnit;
use App\Models\ProductTag;
use App\Models\ProductTasteProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BigProductSeeder extends Seeder
{
    // ─── Unsplash image pools by category ─────────────────────────────────────
    private array $imgBeans   = [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521302200778-33500795e128?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=800&auto=format&fit=crop',
    ];
    private array $imgGround  = [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521302200778-33500795e128?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500353391678-d197b99ea5f2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    ];
    private array $imgCapsules = [
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
    ];
    private array $imgMachines = [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542778098-87e909a29f0b?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518057111178-44a106bad636?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500353391678-d197b99ea5f2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=800&auto=format&fit=crop',
    ];
    private array $imgAcc = [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600871890700-a46ab2f94e26?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop',
    ];
    private array $imgTreats = [
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611293388250-580b08c4a145?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1486428128344-5413e434ad35?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?q=80&w=800&auto=format&fit=crop',
    ];

    private int $imgIdx = 0;
    private function img(array $pool): string
    {
        return $pool[$this->imgIdx++ % count($pool)];
    }

    public function run(): void
    {
        DB::transaction(function () {
            // ── Ensure categories exist ───────────────────────────────────────
            $catDefs = [
                ['name' => 'Café en Grains',  'name_en' => 'Whole Bean Coffee',  'slug' => 'cafe-en-grains',  'sort_order' => 1],
                ['name' => 'Café Moulu',       'name_en' => 'Ground Coffee',       'slug' => 'cafe-moulu',       'sort_order' => 2],
                ['name' => 'Capsules de Café', 'name_en' => 'Coffee Capsules',     'slug' => 'capsules-de-cafe', 'sort_order' => 3],
                ['name' => 'Machines à Café',  'name_en' => 'Coffee Machines',     'slug' => 'machines-a-cafe',  'sort_order' => 4],
                ['name' => 'Accessoires',      'name_en' => 'Accessories',         'slug' => 'accessoires',      'sort_order' => 5],
                ['name' => 'Friandises',       'name_en' => 'Sweet Treats',        'slug' => 'friandises',       'sort_order' => 6],
                ['name' => 'Vending',          'name_en' => 'Vending',             'slug' => 'vending',          'sort_order' => 7],
                ['name' => 'Thé & Boissons',   'name_en' => 'Tea & Beverages',     'slug' => 'the-boissons',     'sort_order' => 8],
            ];
            foreach ($catDefs as $c) {
                Category::firstOrCreate(['slug' => $c['slug']], array_merge($c, ['is_active' => true]));
            }

            // ── Ensure brands exist ───────────────────────────────────────────
            $brandNames = [
                'Lavazza','Delta Cafés','Marcilla','Nespresso','DeLonghi','Sage','Philips','Krups',
                'Breville','Jura','Smeg','Melitta','Gaggia','Necta','Illy','Segafredo','Pellini',
                'Douwe Egberts','Carte Noire','Malongo','Cafémalin','Kimbo','Jacobs','Bialetti',
                'Moka','De\'Longhi','Rancilio','Ascaso','Lelit','ECM',
            ];
            foreach ($brandNames as $n) {
                Brand::firstOrCreate(['name' => $n], ['is_active' => true]);
            }

            $cat   = fn(string $slug) => Category::where('slug', $slug)->first();
            $brand = fn(string $name) => Brand::where('name', $name)->first();

            // ══════════════════════════════════════════════════════════════════
            // CAFÉ EN GRAINS — 80 products
            // ══════════════════════════════════════════════════════════════════
            $grainProducts = $this->beansProducts($cat, $brand);

            // ══════════════════════════════════════════════════════════════════
            // CAFÉ MOULU — 70 products
            // ══════════════════════════════════════════════════════════════════
            $groundProducts = $this->groundProducts($cat, $brand);

            // ══════════════════════════════════════════════════════════════════
            // CAPSULES — 50 products
            // ══════════════════════════════════════════════════════════════════
            $capsuleProducts = $this->capsuleProducts($cat, $brand);

            // ══════════════════════════════════════════════════════════════════
            // MACHINES — 20 products
            // ══════════════════════════════════════════════════════════════════
            $machineProducts = $this->machineProducts($cat, $brand);

            // ══════════════════════════════════════════════════════════════════
            // ACCESSOIRES — 10 products
            // ══════════════════════════════════════════════════════════════════
            $accessoryProducts = $this->accessoryProducts($cat, $brand);

            // ══════════════════════════════════════════════════════════════════
            // FRIANDISES — 50 products
            // ══════════════════════════════════════════════════════════════════
            $treatProducts = $this->treatProducts($cat, $brand);

            $allProducts = array_merge(
                $grainProducts,
                $groundProducts,
                $capsuleProducts,
                $machineProducts,
                $accessoryProducts,
                $treatProducts
            );

            $count = 0;
            foreach ($allProducts as $def) {
                $product = Product::firstOrCreate(
                    ['slug' => $def['data']['slug']],
                    array_merge($def['data'], [
                        'average_rating' => round((mt_rand(38, 50) / 10), 1),
                        'review_count'   => mt_rand(8, 350),
                    ])
                );

                foreach ($def['units'] ?? [] as $unitData) {
                    $unit = ProductSaleUnit::firstOrCreate(
                        ['sku_code' => $unitData['sku_code']],
                        array_merge(['product_id' => $product->id, 'sort_order' => 0], $unitData)
                    );
                    InventoryStock::firstOrCreate(
                        ['product_sale_unit_id' => $unit->id],
                        ['quantity_on_hand' => mt_rand(10, 500), 'reorder_threshold' => 5, 'reorder_quantity' => 50]
                    );
                }

                foreach ($def['images'] ?? [] as $i => $path) {
                    ProductImage::firstOrCreate(
                        ['product_id' => $product->id, 'path' => $path],
                        ['is_primary' => $i === 0, 'sort_order' => $i]
                    );
                }

                if (!empty($def['taste'])) {
                    ProductTasteProfile::firstOrCreate(
                        ['product_id' => $product->id],
                        array_merge(['product_id' => $product->id], $def['taste'])
                    );
                }

                foreach ($def['notes'] ?? [] as $note) {
                    ProductNote::firstOrCreate(['product_id' => $product->id, 'note_text' => $note]);
                }

                foreach ($def['brew_sizes'] ?? [] as $size) {
                    ProductBrewSize::firstOrCreate(['product_id' => $product->id, 'brew_size' => $size]);
                }

                foreach ($def['tags'] ?? [] as $tag) {
                    ProductTag::firstOrCreate(['product_id' => $product->id, 'tag' => $tag]);
                }

                $count++;
            }

            $this->command->info("✅ BigProductSeeder: {$count} products seeded");
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BEANS (80)
    // ──────────────────────────────────────────────────────────────────────────
    private function beansProducts(callable $cat, callable $brand): array
    {
        $catId = $cat('cafe-en-grains')?->id;

        $data = [
            // Lavazza line
            ['LAVAZZA SUPER CREMA', 'lavazza-super-crema-1kg', 'Lavazza', 22.90, 26.90, 7, 'medium', 'Brésil & Inde', ['Miel','Amande','Crème'], ['Espresso','Cappuccino'], true, false, ['Best Seller'],
             ['bitterness'=>3,'acidity'=>2,'roastiness'=>3,'body'=>4,'sweetness'=>4]],
            ['LAVAZZA GRAN SELEZIONE', 'lavazza-gran-selezione-500g', 'Lavazza', 13.50, null, 8, 'medium-dark', 'Colombie & Brésil', ['Caramel','Fruits Secs','Chocolat'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>4,'body'=>4,'sweetness'=>3]],
            ['LAVAZZA QUALITÀ ROSSA', 'lavazza-qualita-rossa-1kg', 'Lavazza', 21.90, 24.90, 5, 'medium', 'Brésil & Amérique Centrale', ['Chocolat au Lait','Fruit'],['Espresso','Lungo','Americano'], true, false, ['Best Seller'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['LAVAZZA TOP CLASS', 'lavazza-top-class-1kg', 'Lavazza', 29.90, null, 10, 'dark', 'Afrique & Brésil', ['Caramel Brûlé','Tabac'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>2]],
            ['LAVAZZA GRAN ESPRESSO', 'lavazza-gran-espresso-1kg', 'Lavazza', 24.50, null, 9, 'dark', 'Brésil & Robusta', ['Amande Grillée','Cacao'], ['Espresso','Ristretto'], false, true, ['Nouveau'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['LAVAZZA TIERRA BIO ORGANIC', 'lavazza-tierra-bio-1kg', 'Lavazza', 26.90, null, 6, 'medium', 'Amérique Latine', ['Floral','Agrumes','Miel'], ['Espresso','Lungo','Filtre'], false, true, ['Bio','Nouveau'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            // Illy line
            ['ILLY CLASSICO ESPRESSO', 'illy-classico-espresso-250g', 'Illy', 14.90, 16.90, 8, 'medium', 'Blend 9 Arabicas', ['Caramel','Floral','Orange'], ['Espresso','Lungo'], true, false, ['Best Seller'],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['ILLY INTENSO ESPRESSO', 'illy-intenso-espresso-250g', 'Illy', 14.90, null, 11, 'dark', 'Brésil & Éthiopie', ['Cacao Amer','Bois','Épices'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['ILLY LUNGO ESPRESSO', 'illy-lungo-espresso-250g', 'Illy', 14.90, null, 5, 'medium', 'Blend Arabica', ['Noisette','Doux','Floral'], ['Lungo','Americano','Filtre'], false, false, [],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['ILLY DECAFFEINATO', 'illy-decaffeinato-250g', 'Illy', 16.90, null, 7, 'medium', 'Blend Arabica', ['Caramel','Doux'], ['Espresso','Lungo'], false, true, ['Nouveau','Décaféiné'],
             ['bitterness'=>2,'acidity'=>2,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            // Segafredo
            ['SEGAFREDO INTERMEZZO', 'segafredo-intermezzo-500g', 'Segafredo', 12.90, null, 8, 'dark', 'Brésil & Éthiopie', ['Réglisse','Caramel','Épicé'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['SEGAFREDO ZANETTI ESPRESSO', 'segafredo-zanetti-espresso-500g', 'Segafredo', 11.50, 13.90, 9, 'dark', 'Italie — Blend Traditionnel', ['Cacao','Fumé'], ['Espresso','Ristretto'], true, false, ['Best Seller'],
             ['bitterness'=>4,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['SEGAFREDO ORIGINS ETHIOPIA', 'segafredo-origins-ethiopia-250g', 'Segafredo', 17.90, null, 5, 'light', 'Éthiopie', ['Jasmin','Pêche','Bergamote'], ['Espresso','Lungo','Filtre'], false, true, ['Single Origin','Nouveau'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>1,'body'=>3,'sweetness'=>5]],
            ['SEGAFREDO ORIGINS COLOMBIA', 'segafredo-origins-colombia-250g', 'Segafredo', 17.90, null, 6, 'medium', 'Colombie', ['Caramel','Pomme','Noix'], ['Espresso','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            // Pellini
            ['PELLINI TOP 100% ARABICA', 'pellini-top-arabica-500g', 'Pellini', 14.90, null, 8, 'medium-dark', 'Blend Arabica', ['Caramel','Vanille','Floral'], ['Espresso','Cappuccino'], false, false, [],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['PELLINI NO.82 VIVACE', 'pellini-no82-vivace-500g', 'Pellini', 13.50, 15.90, 9, 'dark', 'Robusta & Arabica', ['Boisé','Épicé','Crème'], ['Espresso','Ristretto'], true, false, ['Best Seller'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            // Kimbo
            ['KIMBO EXTRA CREAM', 'kimbo-extra-cream-1kg', 'Kimbo', 20.90, null, 8, 'dark', 'Brésil & Robusta', ['Caramel','Noix','Crème'], ['Espresso','Cappuccino'], false, false, [],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['KIMBO AROMA GOLD', 'kimbo-aroma-gold-500g', 'Kimbo', 12.90, null, 7, 'medium', 'Blend Arabica', ['Noisette','Fruité','Doux'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['KIMBO ESPRESSO NAPOLETANO', 'kimbo-espresso-napoletano-500g', 'Kimbo', 13.50, null, 10, 'dark', 'Naples Tradition', ['Chocolat Noir','Fumé'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            // Jacobs
            ['JACOBS BARISTA ESPRESSO', 'jacobs-barista-espresso-500g', 'Jacobs', 10.90, 12.90, 8, 'dark', 'Blend Multi-origine', ['Caramel','Noix'], ['Espresso','Lungo'], true, false, ['Best Seller'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>2]],
            ['JACOBS BARISTA RISTRETTO', 'jacobs-barista-ristretto-500g', 'Jacobs', 10.90, null, 11, 'dark', 'Blend Intense', ['Cacao','Réglisse'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['JACOBS LUNGO MILD', 'jacobs-lungo-mild-500g', 'Jacobs', 10.50, null, 5, 'medium', 'Arabica Doux', ['Fruité','Doux','Caramel'], ['Lungo','Americano'], false, false, [],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            // Malongo
            ['MALONGO PUR ARABICA BIO', 'malongo-pur-arabica-bio-500g', 'Malongo', 14.90, null, 6, 'medium', 'Amérique Centrale', ['Floral','Agrumes','Miel'], ['Espresso','Lungo','Filtre'], false, false, ['Bio'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['MALONGO GRAND ARABICA', 'malongo-grand-arabica-1kg', 'Malongo', 28.90, null, 7, 'medium', 'Grand Cru Arabica', ['Caramel','Floral'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            // Carte Noire
            ['CARTE NOIRE EXPRESSO N°9', 'carte-noire-expresso-9-500g', 'Carte Noire', 12.90, null, 9, 'dark', 'Multi-Origine', ['Torréfié','Caramel'], ['Espresso','Lungo'], true, false, ['Best Seller'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>2]],
            ['CARTE NOIRE ARABICA INTENSE', 'carte-noire-arabica-intense-500g', 'Carte Noire', 13.50, null, 11, 'dark', 'Brésil & Éthiopie', ['Épicé','Réglisse'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            // Delta
            ['DELTA CAFES SUPERIOR ESPRESSO', 'delta-cafes-superior-espresso-1kg', 'Delta Cafés', 22.90, 26.90, 9, 'dark', 'Brésil & Robusta', ['Caramel','Noix','Chocolat'], ['Espresso','Lungo'], true, false, ['Best Seller'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['DELTA CAFES SILVER', 'delta-cafes-silver-500g', 'Delta Cafés', 14.50, null, 7, 'medium', 'Brésil', ['Doux','Fruité','Caramel'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['DELTA CAFES PLATINUM', 'delta-cafes-platinum-500g', 'Delta Cafés', 17.90, null, 10, 'dark', 'Brésil & Afrique', ['Épicé','Cacao','Réglisse'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>2,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['DELTA CAFES SPECIAL EDITION', 'delta-cafes-special-edition-250g', 'Delta Cafés', 11.90, null, 6, 'medium', 'Éthiopie', ['Floral','Pêche','Jasmin'], ['Lungo','Filtre'], false, true, ['Single Origin','Nouveau'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>1,'body'=>3,'sweetness'=>5]],
            ['DELTA CAFES EXPRESSO 1865', 'delta-cafes-expresso-1865-1kg', 'Delta Cafés', 24.90, 28.90, 11, 'dark', 'Multi-Origine', ['Cacao Amer','Épicé'], ['Espresso','Ristretto'], true, false, ['Best Seller'],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            // Marcilla
            ['MARCILLA RICA EN AROMA', 'marcilla-rica-en-aroma-500g', 'Marcilla', 8.90, null, 8, 'medium-dark', 'Brésil & Colombie', ['Caramel','Torréfié'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>3,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>3]],
            ['MARCILLA DESCAFEINADO', 'marcilla-descafeinado-500g', 'Marcilla', 9.90, null, 7, 'medium', 'Multi-Origine', ['Doux','Caramel'], ['Espresso','Lungo'], false, false, ['Décaféiné'],
             ['bitterness'=>2,'acidity'=>2,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            // Douwe Egberts
            ['DOUWE EGBERTS AROMA GOLD', 'douwe-egberts-aroma-gold-500g', 'Douwe Egberts', 11.90, 13.90, 6, 'medium', 'Multi-Origine', ['Floral','Doux','Fruité'], ['Lungo','Filtre','Americano'], true, false, ['Best Seller'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['DOUWE EGBERTS INTENSE', 'douwe-egberts-intense-500g', 'Douwe Egberts', 12.50, null, 9, 'dark', 'Multi-Origine Robuste', ['Caramel Brûlé','Bois'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['DOUWE EGBERTS PURE INDULGENCE', 'douwe-egberts-pure-indulgence-500g', 'Douwe Egberts', 12.90, null, 7, 'medium', 'Arabica Pur', ['Noisette','Vanille'], ['Lungo','Filtre'], false, false, [],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            // Additional Lavazza
            ['LAVAZZA CAFFÈ ESPRESSO CLASSICO', 'lavazza-caffe-espresso-classico-1kg', 'Lavazza', 20.90, null, 7, 'medium', 'Multi-Origine Arabica', ['Fruité','Floral','Doux'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['LAVAZZA ¡TIERRA! FOR PLANET BIO', 'lavazza-tierra-for-planet-500g', 'Lavazza', 15.90, null, 6, 'medium', 'Honduras & Pérou', ['Floral','Agrumes'], ['Espresso','Lungo','Filtre'], false, true, ['Bio','Eco'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['LAVAZZA CREMA E GUSTO GRAINS', 'lavazza-crema-e-gusto-grains-500g', 'Lavazza', 13.50, null, 10, 'dark', 'Brésil Robusta & Naturel', ['Épicé','Chocolat'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            // Single origin specials
            ['ÉTHIOPIE YIRGACHEFFE NATUREL', 'ethiopie-yirgacheffe-naturel-250g', 'Malongo', 19.90, null, 4, 'light', 'Éthiopie Yirgacheffe', ['Fruits Rouges','Jasmin','Bergamote'], ['Filtre','Lungo'], false, true, ['Single Origin','Nouveau'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>1,'body'=>2,'sweetness'=>5]],
            ['KENYA AA WASHED', 'kenya-aa-washed-250g', 'Malongo', 21.90, null, 5, 'medium', 'Kenya AA', ['Cassis','Pamplemousse','Floral'], ['Filtre','Espresso'], false, false, ['Single Origin'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['COLOMBIA HUILA WASHED', 'colombia-huila-washed-250g', 'Segafredo', 18.90, null, 6, 'medium', 'Colombie Huila', ['Caramel','Pomme Verte','Noisette'], ['Espresso','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['GUATEMALA ANTIGUA LAVÉ', 'guatemala-antigua-lave-250g', 'Illy', 19.90, null, 6, 'medium', 'Guatemala Antigua', ['Chocolat','Noisette','Épicé'], ['Espresso','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>2,'body'=>4,'sweetness'=>3]],
            ['PÉROU BIO ARABICA', 'perou-bio-arabica-250g', 'Malongo', 17.90, null, 5, 'medium', 'Pérou', ['Noix','Caramel','Léger'], ['Lungo','Filtre','Americano'], false, false, ['Bio','Single Origin'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['BRÉSIL SANTOS PULPED NATURAL', 'bresil-santos-pulped-natural-500g', 'Pellini', 14.90, null, 7, 'medium-dark', 'Brésil Santos', ['Caramel','Chocolat au Lait','Noix'], ['Espresso','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>3,'acidity'=>2,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['COSTA RICA TARRAZÚ', 'costa-rica-tarrazu-250g', 'Illy', 22.90, null, 5, 'medium', 'Costa Rica Tarrazú', ['Miel','Abricot','Fruits Secs'], ['Filtre','Lungo'], false, true, ['Single Origin','Nouveau'],
             ['bitterness'=>1,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>5]],
            ['JAVA SUMATRA MANDHELING', 'java-sumatra-mandheling-500g', 'Jacobs', 15.90, null, 8, 'dark', 'Indonésie Sumatra', ['Terreux','Épicé','Cèdre'], ['Espresso','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>4,'acidity'=>1,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['JAMAÏQUE BLUE MOUNTAIN', 'jamaique-blue-mountain-250g', 'Illy', 49.90, null, 6, 'medium', 'Jamaïque Blue Mountain', ['Chocolat Blanc','Floral','Léger'], ['Espresso'], false, true, ['Single Origin','Nouveau','Premium'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>4,'sweetness'=>4]],
            // More variety
            ['MALONGO EXPRESSO N°12', 'malongo-expresso-n12-500g', 'Malongo', 12.90, null, 12, 'dark', 'Robusta Intense', ['Caramel Brûlé','Cacao'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['PELLINI ESPRESSO BAR N°9', 'pellini-espresso-bar-n9-1kg', 'Pellini', 22.90, 26.90, 9, 'dark', 'Blend Bar Professionnel', ['Caramel','Épicé','Chocolat'], ['Espresso','Ristretto'], true, false, ['Best Seller'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['KIMBO PRESTIGE', 'kimbo-prestige-500g', 'Kimbo', 15.90, null, 10, 'dark', 'Napoli Premium', ['Cacao','Réglisse','Noix'], ['Espresso','Ristretto'], false, false, [],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['DOUWE EGBERTS ESPRESSO ORIGINS', 'douwe-egberts-espresso-origins-250g', 'Douwe Egberts', 11.90, null, 8, 'dark', 'Guatemala & Éthiopie', ['Chocolat','Fruits Rouges'], ['Espresso','Lungo'], false, true, ['Nouveau'],
             ['bitterness'=>3,'acidity'=>3,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['JACOBS BARISTA LUNGO', 'jacobs-barista-lungo-500g', 'Jacobs', 11.50, null, 6, 'medium', 'Arabica Multi-Origine', ['Doux','Floral','Noisette'], ['Lungo','Americano','Filtre'], false, false, [],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['SEGAFREDO ZAN ESPRESSO CASA', 'segafredo-zan-espresso-casa-500g', 'Segafredo', 11.90, null, 9, 'dark', 'Brésil & Robusta', ['Torréfié','Caramel'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>2]],
            ['LAVAZZA CREMA & AROMA EXPERT 3KG', 'lavazza-crema-aroma-expert-3kg', 'Lavazza', 57.89, null, 11, 'dark', 'Brésil & Ouganda', ['Caramel','Noix','Dark Chocolate'], ['Espresso','Lungo','Ristretto'], false, false, ['Pro'],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['CARTE NOIRE CAFÉ SOLUBLE', 'carte-noire-soluble-200g', 'Carte Noire', 8.90, null, 7, 'medium', 'Multi-Origine', ['Caramel','Chocolat'], ['Instantané'], false, false, [],
             ['bitterness'=>3,'acidity'=>2,'roastiness'=>3,'body'=>3,'sweetness'=>3]],
            ['MALONGO MOKA SIDAMO', 'malongo-moka-sidamo-250g', 'Malongo', 16.90, null, 5, 'medium', 'Éthiopie Sidamo', ['Agrumes','Floral','Cacao'], ['Espresso','Filtre'], false, false, ['Single Origin'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['PELLINI LUXURY COFFEE N°20', 'pellini-luxury-n20-500g', 'Pellini', 24.90, null, 7, 'medium', 'Arabica Premium', ['Miel','Noisette','Vanille'], ['Espresso','Lungo'], false, false, ['Premium'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>4,'sweetness'=>4]],
            ['KIMBO DECAFFEINATO', 'kimbo-decaffeinato-500g', 'Kimbo', 13.90, null, 7, 'medium', 'Blend Décaféiné', ['Caramel','Doux'], ['Espresso','Lungo'], false, false, ['Décaféiné'],
             ['bitterness'=>2,'acidity'=>2,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['DOUWE EGBERTS CAFÉ DÉCAFÉINÉ', 'douwe-egberts-decafeine-500g', 'Douwe Egberts', 13.50, null, 6, 'medium', 'Multi-Origine', ['Doux','Floral'], ['Lungo','Filtre'], false, false, ['Décaféiné'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['SEGAFREDO DECAFFEINATO', 'segafredo-decaffeinato-500g', 'Segafredo', 12.50, null, 8, 'dark', 'Multi-Origine', ['Caramel','Doux'], ['Espresso','Lungo'], false, false, ['Décaféiné'],
             ['bitterness'=>3,'acidity'=>2,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['ILLY ARABICA SELECTION BRASIL', 'illy-arabica-selection-brasil-250g', 'Illy', 18.90, null, 6, 'medium', 'Brésil Single Origin', ['Caramel','Orange Confite'], ['Espresso','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['ILLY ARABICA SELECTION ETHIOPIA', 'illy-arabica-selection-ethiopia-250g', 'Illy', 18.90, null, 4, 'light', 'Éthiopie Single Origin', ['Jasmin','Bergamote','Fruits Rouges'], ['Filtre','Lungo'], false, false, ['Single Origin'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>1,'body'=>2,'sweetness'=>5]],
            ['LAVAZZA QUALITÀ ORO MOUNTAIN GROWN', 'lavazza-qualita-oro-mountain-1kg', 'Lavazza', 25.90, 29.90, 7, 'medium', 'Amérique Centrale & Mexique', ['Fruité','Floral','Léger'], ['Espresso','Lungo'], true, false, ['Best Seller'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['LAVAZZA AROMAMORE', 'lavazza-aromamore-1kg', 'Lavazza', 23.90, null, 8, 'medium-dark', 'Multi-Origine', ['Caramel','Noix'], ['Espresso','Lungo'], false, false, [],
             ['bitterness'=>3,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>3]],
            ['MALONGO GRAND CRÉMANT', 'malongo-grand-cremant-500g', 'Malongo', 13.90, null, 9, 'dark', 'Brésil & Robusta', ['Crème','Épicé','Caramel'], ['Espresso','Cappuccino'], false, false, [],
             ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['KENYA KAPSOKISIO NATURAL', 'kenya-kapsokisio-natural-250g', 'Malongo', 23.90, null, 4, 'light', 'Kenya Kapsokisio', ['Cassis','Rose','Agrumes'], ['Filtre'], false, true, ['Single Origin','Premium','Nouveau'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>1,'body'=>2,'sweetness'=>5]],
            ['VIETNAM ROBUSTA SAIGON', 'vietnam-robusta-saigon-500g', 'Kimbo', 10.90, null, 13, 'dark', 'Vietnam Dak Lak', ['Terreux','Chocolat Noir','Fort'], ['Espresso'], false, false, ['Fort'],
             ['bitterness'=>5,'acidity'=>1,'roastiness'=>5,'body'=>5,'sweetness'=>1]],
            ['TANZANIE PEABERRY', 'tanzanie-peaberry-250g', 'Illy', 21.90, null, 5, 'medium', 'Tanzanie Peaberry', ['Agrumes','Miel','Épicé'], ['Espresso','Filtre'], false, true, ['Single Origin','Nouveau'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
            ['HAWAII KONA EXTRA FANCY', 'hawaii-kona-extra-fancy-200g', 'Illy', 59.90, null, 5, 'medium', 'Hawaï Kona', ['Noisette','Vanille','Léger'], ['Espresso','Filtre'], false, false, ['Single Origin','Premium'],
             ['bitterness'=>1,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>5]],
            ['PANAMA GEISHA LAVÉ', 'panama-geisha-lave-100g', 'Malongo', 89.90, null, 4, 'light', 'Panama Boquete', ['Jasmin','Pêche','The Vert'], ['Filtre','Lungo'], false, true, ['Single Origin','Premium','Nouveau'],
             ['bitterness'=>1,'acidity'=>5,'roastiness'=>1,'body'=>2,'sweetness'=>5]],
            ['RWANDA BOURBON WASHED', 'rwanda-bourbon-washed-250g', 'Segafredo', 19.90, null, 5, 'medium', 'Rwanda Nyungwe', ['Fruits Rouges','Floral','Cacao'], ['Filtre','Espresso'], false, false, ['Single Origin'],
             ['bitterness'=>2,'acidity'=>4,'roastiness'=>2,'body'=>3,'sweetness'=>4]],
        ];

        // Pad to 80
        $extra = [
            ['LAVAZZA PIENAROMA', 'lavazza-pienaroma-250g', 'Lavazza', 9.90, null, 8, 'dark', 'Brésil & Robusta', ['Caramel','Noix'], ['Espresso'], false, false, [], ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['ILLY ARABICA SELECTION INDIA', 'illy-arabica-selection-india-250g', 'Illy', 18.90, null, 9, 'dark', 'Inde Plantation AA', ['Épicé','Boisé','Cacao'], ['Espresso','Lungo'], false, false, ['Single Origin'], ['bitterness'=>4,'acidity'=>1,'roastiness'=>4,'body'=>5,'sweetness'=>2]],
            ['SEGAFREDO ORIGINS BRASIL', 'segafredo-origins-brasil-250g', 'Segafredo', 16.90, null, 7, 'medium', 'Brésil Cerrado', ['Caramel','Noix de Coco'], ['Espresso','Lungo'], false, false, ['Single Origin'], ['bitterness'=>3,'acidity'=>2,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['KIMBO BIO ARABICA', 'kimbo-bio-arabica-500g', 'Kimbo', 14.90, null, 6, 'medium', 'Amérique Centrale Bio', ['Floral','Caramel'], ['Espresso','Lungo'], false, true, ['Bio','Nouveau'], ['bitterness'=>2,'acidity'=>3,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['PELLINI BLU DECAFF', 'pellini-blu-decaff-500g', 'Pellini', 13.90, null, 7, 'medium', 'Multi-Origine', ['Doux','Noisette'], ['Espresso','Lungo'], false, false, ['Décaféiné'], ['bitterness'=>2,'acidity'=>2,'roastiness'=>3,'body'=>3,'sweetness'=>4]],
            ['JACOBS KRONUNG INTENSE', 'jacobs-kronung-intense-500g', 'Jacobs', 9.90, null, 9, 'dark', 'Multi-Origine', ['Fumé','Caramel'], ['Espresso','Lungo'], false, false, [], ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>2]],
            ['MALONGO CAFÉ RICO', 'malongo-cafe-rico-500g', 'Malongo', 13.50, null, 8, 'medium-dark', 'Blend Équitable', ['Caramel','Boisé'], ['Espresso','Lungo'], false, false, ['Équitable'], ['bitterness'=>3,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>3]],
            ['DOUWE EGBERTS VARIÉTÉS DOUCES', 'douwe-egberts-varietes-douces-500g', 'Douwe Egberts', 11.90, null, 5, 'medium', 'Arabica Doux', ['Floral','Doux','Léger'], ['Lungo','Filtre'], false, false, [], ['bitterness'=>2,'acidity'=>3,'roastiness'=>2,'body'=>3,'sweetness'=>5]],
            ['CARTE NOIRE CAFÉ NOIR 7', 'carte-noire-cafe-noir-7-500g', 'Carte Noire', 12.50, null, 7, 'medium', 'Multi-Origine', ['Caramel','Doux'], ['Espresso','Lungo'], false, false, [], ['bitterness'=>3,'acidity'=>2,'roastiness'=>3,'body'=>4,'sweetness'=>3]],
            ['KIMBO MACINATO FRESCO', 'kimbo-macinato-fresco-250g', 'Kimbo', 10.90, null, 9, 'dark', 'Brésil & Robusta', ['Épicé','Caramel'], ['Espresso'], false, false, [], ['bitterness'=>4,'acidity'=>2,'roastiness'=>4,'body'=>4,'sweetness'=>2]],
        ];
        $data = array_merge($data, $extra);

        $products = [];
        foreach ($data as $d) {
            [$name,$slug,$brandName,$price,$origPrice,$intensity,$roast,$origin,$notes,$brew,$featured,$isNew,$tags,$taste] = $d;
            $sku = strtoupper(str_replace('-','_', substr($slug, 0, 14)));
            $img = $this->img($this->imgBeans);
            $p = [
                'data' => [
                    'slug'          => $slug,
                    'category_id'   => $catId,
                    'brand_id'      => $brand($brandName)?->id,
                    'name'          => $name,
                    'price'         => $price,
                    'original_price'=> $origPrice,
                    'intensity'     => $intensity,
                    'roast_level'   => $roast,
                    'origin'        => $origin,
                    'is_featured'   => $featured,
                    'is_new'        => $isNew,
                    'in_stock'      => true,
                    'is_active'     => true,
                ],
                'units'     => [['sku_code' => $sku.'_1KG', 'label' => '1 KG', 'price' => $price, 'original_price' => $origPrice, 'quantity' => 1, 'is_default' => true]],
                'images'    => [$img],
                'taste'     => $taste,
                'notes'     => $notes,
                'brew_sizes'=> $brew,
                'tags'      => $tags,
            ];
            // Add 500g unit for some
            if (mt_rand(0,1)) {
                $p['units'][] = ['sku_code' => $sku.'_500G', 'label' => '500g', 'price' => round($price * 0.55, 2), 'quantity' => 1, 'is_default' => false];
            }
            $products[] = $p;
        }
        return $products;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GROUND COFFEE (70)
    // ──────────────────────────────────────────────────────────────────────────
    private function groundProducts(callable $cat, callable $brand): array
    {
        $catId = $cat('cafe-moulu')?->id;
        $data = [
            ['LAVAZZA CREMA E GUSTO MOULU', 'lavazza-crema-gusto-moulu-250g', 'Lavazza', 7.90, null, 10, 'dark', 'Brésil & Robusta', ['Caramel','Épicé'], ['Espresso','Moka'], true],
            ['LAVAZZA QUALITÀ ROSSA MOULU', 'lavazza-qualita-rossa-moulu-250g', 'Lavazza', 6.90, 8.50, 5, 'medium', 'Brésil & Amérique Centrale', ['Chocolat au Lait','Fruit'], ['Espresso','Filtre'], true],
            ['LAVAZZA ESPRESSO ITALIANO CLASSICO', 'lavazza-espresso-italiano-classico-250g', 'Lavazza', 5.90, null, 8, 'medium-dark', 'Multi-Origine', ['Caramel','Noix'], ['Espresso'], false],
            ['ILLY CLASSICO MOULU', 'illy-classico-moulu-250g', 'Illy', 11.90, 13.90, 8, 'medium', 'Blend 9 Arabicas', ['Caramel','Floral'], ['Espresso','Moka'], true],
            ['ILLY INTENSO MOULU', 'illy-intenso-moulu-250g', 'Illy', 11.90, null, 11, 'dark', 'Brésil & Éthiopie', ['Cacao Amer','Épicé'], ['Espresso','Ristretto'], false],
            ['ILLY LUNGO MOULU', 'illy-lungo-moulu-250g', 'Illy', 11.90, null, 5, 'medium', 'Blend Arabica', ['Noisette','Doux'], ['Lungo','Americano','Filtre'], false],
            ['ILLY DECAFFEINATO MOULU', 'illy-decaffeinato-moulu-250g', 'Illy', 13.90, null, 7, 'medium', 'Blend Arabica', ['Caramel','Doux'], ['Espresso'], false],
            ['SEGAFREDO INTERMEZZO MOULU', 'segafredo-intermezzo-moulu-250g', 'Segafredo', 9.90, null, 8, 'dark', 'Brésil & Éthiopie', ['Réglisse','Caramel'], ['Espresso'], false],
            ['SEGAFREDO ZANETTI MOULU', 'segafredo-zanetti-moulu-250g', 'Segafredo', 9.50, 11.90, 9, 'dark', 'Blend Traditionnel', ['Cacao','Fumé'], ['Espresso','Ristretto'], true],
            ['KIMBO AROMA GOLD MOULU', 'kimbo-aroma-gold-moulu-250g', 'Kimbo', 9.90, null, 7, 'medium', 'Blend Arabica', ['Noisette','Fruité'], ['Espresso','Moka'], false],
            ['KIMBO EXTRA CREAM MOULU', 'kimbo-extra-cream-moulu-250g', 'Kimbo', 10.90, null, 8, 'dark', 'Brésil & Robusta', ['Caramel','Crème'], ['Espresso','Cappuccino'], false],
            ['PELLINI TOP ARABICA MOULU', 'pellini-top-arabica-moulu-250g', 'Pellini', 11.50, null, 8, 'medium-dark', 'Blend Arabica', ['Caramel','Vanille'], ['Espresso'], false],
            ['PELLINI VIVACE MOULU', 'pellini-vivace-moulu-250g', 'Pellini', 10.50, 12.50, 9, 'dark', 'Robusta & Arabica', ['Épicé','Crème'], ['Espresso','Ristretto'], true],
            ['JACOBS BARISTA ESPRESSO MOULU', 'jacobs-barista-espresso-moulu-250g', 'Jacobs', 7.90, 9.50, 8, 'dark', 'Blend Multi-Origine', ['Caramel','Noix'], ['Espresso'], true],
            ['JACOBS KRONUNG MOULU', 'jacobs-kronung-moulu-500g', 'Jacobs', 8.90, null, 6, 'medium', 'Arabica Multi-Origine', ['Doux','Fruité'], ['Filtre','Americano'], false],
            ['DOUWE EGBERTS AROMA BRUN MOULU', 'douwe-egberts-aroma-brun-moulu-500g', 'Douwe Egberts', 10.90, 12.90, 6, 'medium', 'Multi-Origine', ['Floral','Doux'], ['Filtre','Lungo'], true],
            ['DOUWE EGBERTS ESPRESSO MOULU', 'douwe-egberts-espresso-moulu-250g', 'Douwe Egberts', 9.90, null, 9, 'dark', 'Robusta & Arabica', ['Caramel Brûlé','Bois'], ['Espresso','Ristretto'], false],
            ['CARTE NOIRE CAFÉ MOULU', 'carte-noire-cafe-moulu-250g', 'Carte Noire', 8.50, null, 9, 'dark', 'Multi-Origine', ['Torréfié','Caramel'], ['Espresso'], true],
            ['CARTE NOIRE ARABICA INTENSE MOULU', 'carte-noire-arabica-intense-moulu-250g', 'Carte Noire', 9.50, null, 11, 'dark', 'Brésil & Éthiopie', ['Épicé','Réglisse'], ['Espresso','Ristretto'], false],
            ['MALONGO BIO ARABICA MOULU', 'malongo-bio-arabica-moulu-250g', 'Malongo', 11.90, null, 6, 'medium', 'Amérique Centrale', ['Floral','Miel'], ['Espresso','Filtre'], false],
            ['MALONGO EXPRESSO N°12 MOULU', 'malongo-expresso-n12-moulu-250g', 'Malongo', 10.90, null, 12, 'dark', 'Robusta Intense', ['Cacao','Caramel Brûlé'], ['Espresso'], false],
            ['MARCILLA ESPRESSO MOULU', 'marcilla-espresso-moulu-250g', 'Marcilla', 6.20, 7.90, 9, 'dark', 'Amérique Latine', ['Fumé','Épices'], ['Espresso','Moka'], true],
            ['MARCILLA CACAO MOULU', 'marcilla-cacao-moulu-250g', 'Marcilla', 6.90, null, 7, 'medium', 'Multi-Origine', ['Cacao','Caramel'], ['Espresso'], false],
            ['MARCILLA DESCAFEINADO MOULU', 'marcilla-descafeinado-moulu-250g', 'Marcilla', 7.90, null, 7, 'medium', 'Multi-Origine', ['Doux','Caramel'], ['Espresso','Lungo'], false],
            ['DELTA CAFES SUPERIOR MOULU', 'delta-cafes-superior-moulu-250g', 'Delta Cafés', 8.90, 10.90, 9, 'dark', 'Brésil & Robusta', ['Caramel','Chocolat'], ['Espresso'], true],
            ['DELTA CAFES GOLD MOULU', 'delta-cafes-gold-moulu-250g', 'Delta Cafés', 9.90, null, 5, 'medium', 'Brésil', ['Doux','Fruité'], ['Lungo','Filtre'], false],
            ['LAVAZZA GRAN CAFFÈ MOULU', 'lavazza-gran-caffe-moulu-500g', 'Lavazza', 12.90, null, 9, 'dark', 'Multi-Origine', ['Caramel Amer','Noix'], ['Espresso','Lungo'], false],
            ['ILLY ARABICA BRASIL MOULU', 'illy-arabica-brasil-moulu-250g', 'Illy', 14.90, null, 6, 'medium', 'Brésil Single Origin', ['Caramel','Orange Confite'], ['Espresso','Lungo'], false],
            ['SEGAFREDO BUONO ESPRESSO', 'segafredo-buono-espresso-moulu-250g', 'Segafredo', 8.90, null, 7, 'medium', 'Multi-Origine', ['Caramel','Léger'], ['Espresso','Lungo'], false],
            ['KIMBO DECAFFEINATO MOULU', 'kimbo-decaffeinato-moulu-250g', 'Kimbo', 10.90, null, 7, 'medium', 'Décaféiné', ['Doux','Caramel'], ['Espresso','Lungo'], false],
            ['PELLINI DECAFFEINATO MOULU', 'pellini-decaffeinato-moulu-250g', 'Pellini', 11.90, null, 7, 'medium', 'Multi-Origine', ['Noisette','Doux'], ['Espresso'], false],
            ['CARTE NOIRE DÉCAFÉINÉ MOULU', 'carte-noire-decafeine-moulu-250g', 'Carte Noire', 9.90, null, 7, 'medium', 'Multi-Origine', ['Caramel','Doux'], ['Espresso','Lungo'], false],
            ['MALONGO MOKA SIDAMO MOULU', 'malongo-moka-sidamo-moulu-250g', 'Malongo', 13.90, null, 5, 'medium', 'Éthiopie', ['Agrumes','Floral'], ['Filtre','Lungo'], false],
            ['JACOBS DOUWE EGBERTS DARK MOULU', 'jacobs-de-dark-moulu-500g', 'Jacobs', 9.90, null, 10, 'dark', 'Robusta Blend', ['Fumé','Chocolat Amer'], ['Espresso','Ristretto'], false],
            ['LAVAZZA CAFFE ESPRESSO MOULU', 'lavazza-caffe-espresso-moulu-250g', 'Lavazza', 6.90, null, 7, 'medium', 'Multi-Origine', ['Fruité','Caramel'], ['Espresso','Lungo'], false],
            ['SEGAFREDO ESPRESSO HOUSE MOULU', 'segafredo-espresso-house-moulu-500g', 'Segafredo', 12.90, null, 8, 'dark', 'Multi-Origine', ['Caramel','Épicé'], ['Espresso'], false],
            ['KIMBO PRESTIGE MOULU', 'kimbo-prestige-moulu-250g', 'Kimbo', 12.90, null, 10, 'dark', 'Napoli', ['Cacao','Réglisse'], ['Espresso','Ristretto'], false],
            ['PELLINI ESPRESSO BAR N°9 MOULU', 'pellini-espresso-bar-n9-moulu-250g', 'Pellini', 10.90, null, 9, 'dark', 'Blend Bar', ['Caramel','Épicé'], ['Espresso','Ristretto'], false],
            ['DOUWE EGBERTS PURE GOLD MOULU', 'douwe-egberts-pure-gold-moulu-500g', 'Douwe Egberts', 11.50, null, 7, 'medium', 'Arabica', ['Noisette','Doux'], ['Lungo','Filtre'], false],
            ['CARTE NOIRE INTENSO MOULU', 'carte-noire-intenso-moulu-250g', 'Carte Noire', 9.90, null, 10, 'dark', 'Multi-Origine', ['Cacao','Caramel Brûlé'], ['Espresso','Ristretto'], false],
            ['MALONGO GRAND ARABICA MOULU', 'malongo-grand-arabica-moulu-250g', 'Malongo', 12.90, null, 7, 'medium', 'Grand Cru', ['Caramel','Floral'], ['Espresso','Lungo'], false],
            ['DELTA CAFES PLATINUM MOULU', 'delta-cafes-platinum-moulu-250g', 'Delta Cafés', 10.90, null, 10, 'dark', 'Brésil & Afrique', ['Épicé','Cacao'], ['Espresso','Ristretto'], false],
            ['LAVAZZA TIERRA MOULU BIO', 'lavazza-tierra-moulu-bio-250g', 'Lavazza', 9.90, null, 6, 'medium', 'Honduras & Pérou Bio', ['Floral','Agrumes'], ['Espresso','Lungo'], false],
            ['ILLY DECAFFEINATO MOULU 500G', 'illy-decaffeinato-moulu-500g', 'Illy', 22.90, null, 7, 'medium', 'Arabica Décaféiné', ['Caramel','Doux'], ['Espresso'], false],
            ['KIMBO ESPRESSO NAPOLETANO MOULU', 'kimbo-espresso-napoletano-moulu-250g', 'Kimbo', 9.90, null, 10, 'dark', 'Naples Tradition', ['Chocolat Noir','Fumé'], ['Espresso','Ristretto'], false],
            ['SEGAFREDO INTERMEZZO MOULU 500G', 'segafredo-intermezzo-moulu-500g', 'Segafredo', 16.90, null, 8, 'dark', 'Multi-Origine', ['Réglisse','Épicé'], ['Espresso'], false],
            ['JACOBS KRÖNUNG AROMA MOULU', 'jacobs-kronung-aroma-moulu-250g', 'Jacobs', 7.50, null, 7, 'medium', 'Arabica', ['Doux','Floral'], ['Lungo','Filtre'], false],
            ['PELLINI BLU DECAFF MOULU', 'pellini-blu-decaff-moulu-250g', 'Pellini', 11.90, null, 7, 'medium', 'Multi-Origine', ['Noisette'], ['Espresso','Lungo'], false],
            ['DOUWE EGBERTS CAFÉ CORSÉ', 'douwe-egberts-cafe-corse-500g', 'Douwe Egberts', 12.90, null, 9, 'dark', 'Multi-Origine', ['Caramel Brûlé'], ['Espresso','Ristretto'], false],
            ['CARTE NOIRE CAFÉ GRAINS TORRÉFIÉS', 'carte-noire-torrefies-500g', 'Carte Noire', 10.50, null, 8, 'dark', 'Multi-Origine', ['Torréfié','Caramel'], ['Espresso'], false],
            ['LAVAZZA ESPRESSO GUSTO PIENO', 'lavazza-espresso-gusto-pieno-250g', 'Lavazza', 7.50, null, 9, 'dark', 'Multi-Origine', ['Caramel','Amande'], ['Espresso','Ristretto'], false],
            ['MALONGO CAFÉ RICO MOULU', 'malongo-cafe-rico-moulu-250g', 'Malongo', 11.50, null, 8, 'medium-dark', 'Blend Équitable', ['Caramel','Boisé'], ['Espresso','Lungo'], false],
            ['SEGAFREDO CASA MOULU 500G', 'segafredo-casa-moulu-500g', 'Segafredo', 14.90, null, 9, 'dark', 'Multi-Origine', ['Caramel','Noix'], ['Espresso'], false],
            ['KIMBO AROMA BLU MOULU', 'kimbo-aroma-blu-moulu-250g', 'Kimbo', 10.50, null, 7, 'medium', 'Arabica', ['Doux','Noisette'], ['Espresso','Lungo'], false],
            ['PELLINI LUXURY N°20 MOULU', 'pellini-luxury-n20-moulu-250g', 'Pellini', 13.90, null, 7, 'medium', 'Arabica Premium', ['Miel','Vanille'], ['Espresso'], false],
            ['DELTA CAFES SILVER MOULU', 'delta-cafes-silver-moulu-250g', 'Delta Cafés', 8.90, null, 7, 'medium', 'Brésil', ['Doux','Caramel'], ['Espresso','Lungo'], false],
            ['LAVAZZA PIENAROMA MOULU', 'lavazza-pienaroma-moulu-250g', 'Lavazza', 7.90, null, 8, 'dark', 'Multi-Origine', ['Caramel','Amande'], ['Espresso'], false],
            ['ILLY CLASSICO MOULU 500G', 'illy-classico-moulu-500g', 'Illy', 21.90, null, 8, 'medium', 'Blend 9 Arabicas', ['Caramel','Floral'], ['Espresso'], true],
            ['SEGAFREDO DECAFFEINATO MOULU', 'segafredo-decaffeinato-moulu-250g', 'Segafredo', 10.90, null, 8, 'dark', 'Multi-Origine', ['Caramel','Doux'], ['Espresso'], false],
            ['JACOBS SELECTION MOULU', 'jacobs-selection-moulu-500g', 'Jacobs', 9.50, null, 7, 'medium', 'Multi-Origine', ['Doux','Floral'], ['Lungo','Filtre'], false],
            ['KIMBO NAPOLI MOULU 500G', 'kimbo-napoli-moulu-500g', 'Kimbo', 17.90, null, 10, 'dark', 'Naples', ['Cacao','Épicé'], ['Espresso'], false],
            ['DOUWE EGBERTS VARIÉTÉS ARÔME', 'douwe-egberts-varietes-arome-250g', 'Douwe Egberts', 9.90, null, 6, 'medium', 'Multi-Origine', ['Floral','Léger'], ['Lungo','Filtre'], false],
            ['MALONGO CAFÉ ÉQUITABLE MOULU', 'malongo-cafe-equitable-moulu-250g', 'Malongo', 12.50, null, 7, 'medium', 'Multi-Origine Équitable', ['Caramel','Noisette'], ['Espresso','Lungo'], false],
            ['CARTE NOIRE N°7 MOULU 500G', 'carte-noire-n7-moulu-500g', 'Carte Noire', 13.90, null, 7, 'medium', 'Multi-Origine', ['Doux','Caramel'], ['Espresso','Lungo'], false],
            ['LAVAZZA GRAN SELEZIONE MOULU', 'lavazza-gran-selezione-moulu-250g', 'Lavazza', 8.90, null, 8, 'medium-dark', 'Colombie & Brésil', ['Caramel','Fruits Secs'], ['Espresso'], false],
            ['DELTA CAFES 1865 MOULU', 'delta-cafes-1865-moulu-250g', 'Delta Cafés', 10.90, null, 11, 'dark', 'Multi-Origine', ['Cacao Amer'], ['Espresso','Ristretto'], false],
            ['PELLINI N°9 VIVACE MOULU 500G', 'pellini-n9-vivace-moulu-500g', 'Pellini', 18.90, null, 9, 'dark', 'Robusta & Arabica', ['Épicé','Crème'], ['Espresso','Ristretto'], false],
            ['SEGAFREDO TRADIZIONALE MOULU', 'segafredo-tradizionale-moulu-500g', 'Segafredo', 13.50, null, 8, 'dark', 'Italie Tradition', ['Caramel','Torréfié'], ['Espresso'], false],
            ['MALONGO SIDAMO GROUND', 'malongo-sidamo-ground-250g', 'Malongo', 14.90, null, 5, 'medium', 'Éthiopie Sidamo', ['Agrumes','Floral','Miel'], ['Filtre','Lungo'], false],
        ];

        $products = [];
        foreach ($data as $d) {
            [$name,$slug,$brandName,$price,$origPrice,$intensity,$roast,$origin,$notes,$brew,$featured] = $d;
            $sku = strtoupper(str_replace('-','_', substr($slug, 0, 15)));
            $img = $this->img($this->imgGround);
            $products[] = [
                'data' => [
                    'slug'          => $slug,
                    'category_id'   => $catId,
                    'brand_id'      => $brand($brandName)?->id,
                    'name'          => $name,
                    'price'         => $price,
                    'original_price'=> $origPrice,
                    'intensity'     => $intensity,
                    'roast_level'   => $roast,
                    'origin'        => $origin,
                    'is_featured'   => $featured,
                    'in_stock'      => true,
                    'is_active'     => true,
                ],
                'units' => [
                    ['sku_code' => $sku.'_250', 'label' => '250g', 'price' => $price, 'original_price' => $origPrice, 'quantity' => 1, 'is_default' => true],
                    ['sku_code' => $sku.'_500', 'label' => '500g', 'price' => round($price * 1.85, 2), 'quantity' => 1, 'is_default' => false],
                ],
                'images'    => [$img],
                'notes'     => $notes,
                'brew_sizes'=> $brew,
                'tags'      => $featured ? ['Best Seller'] : [],
            ];
        }
        return $products;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CAPSULES (50)
    // ──────────────────────────────────────────────────────────────────────────
    private function capsuleProducts(callable $cat, callable $brand): array
    {
        $catId = $cat('capsules-de-cafe')?->id;
        $lines = [
            // [name, slug, brand, price-10, intensity, notes, tags, isNew]
            ['NESPRESSO ORIGINAL RISTRETTO', 'nespresso-ristretto-10cap', 'Nespresso', 4.50, 10, ['Torréfié','Épicé'], ['Best Seller'], false],
            ['NESPRESSO ORIGINAL ARPEGGIO', 'nespresso-arpeggio-10cap', 'Nespresso', 4.50, 9, ['Crème','Cacao'], [], false],
            ['NESPRESSO ORIGINAL ROMA', 'nespresso-roma-10cap', 'Nespresso', 4.50, 8, ['Caramel','Boisé'], [], false],
            ['NESPRESSO ORIGINAL VOLLUTO', 'nespresso-volluto-10cap', 'Nespresso', 4.50, 4, ['Biscuité','Floral'], [], false],
            ['NESPRESSO ORIGINAL LIVANTO', 'nespresso-livanto-10cap', 'Nespresso', 4.50, 6, ['Caramel Rond','Doux'], [], false],
            ['NESPRESSO ORIGINAL CAPRICCIO', 'nespresso-capriccio-10cap', 'Nespresso', 4.50, 5, ['Noisette','Léger'], [], false],
            ['NESPRESSO ORIGINAL LUNGO LEGGERO', 'nespresso-lungo-leggero-10cap', 'Nespresso', 4.50, 6, ['Fruité','Céréale'], [], false],
            ['NESPRESSO VERTUO STORMIO', 'nespresso-vertuo-stormio-10cap', 'Nespresso', 5.50, 11, ['Torréfié Intense','Bois'], ['Nouveau'], true],
            ['NESPRESSO VERTUO ODACIO', 'nespresso-vertuo-odacio-10cap', 'Nespresso', 5.50, 7, ['Céréale','Fruité'], [], false],
            ['NESPRESSO VERTUO MELOZIO', 'nespresso-vertuo-melozio-10cap', 'Nespresso', 5.50, 6, ['Miel','Caramel'], ['Best Seller'], false],
            ['NESPRESSO VERTUO ALTISSIO', 'nespresso-vertuo-altissio-10cap', 'Nespresso', 5.50, 9, ['Torréfié','Crème'], [], false],
            ['NESPRESSO VERTUO ELVAZIO', 'nespresso-vertuo-elvazio-10cap', 'Nespresso', 5.50, 4, ['Floral','Fruité'], [], false],
            ['CAPSULES COMPATIBLES RISTRETTO', 'comp-ristretto-10cap', 'Cafémalin', 3.50, 12, ['Torréfié Amer','Épicé'], ['Best Seller'], false],
            ['CAPSULES COMPATIBLES LUNGO', 'comp-lungo-10cap', 'Cafémalin', 3.50, 5, ['Doux','Noisette'], [], false],
            ['CAPSULES COMPATIBLES ESPRESSO', 'comp-espresso-10cap', 'Cafémalin', 3.50, 8, ['Caramel','Noix'], [], false],
            ['CAPSULES COMPATIBLES DECAFF', 'comp-decaff-10cap', 'Cafémalin', 3.90, 7, ['Caramel','Doux'], ['Décaféiné'], false],
            ['CAPSULES BIO ARABICA LUNGO', 'bio-arabica-lungo-10cap', 'Cafémalin', 4.90, 5, ['Floral','Miel'], ['Bio','Nouveau'], true],
            ['CAPSULES BIO ESPRESSO INTENSE', 'bio-espresso-intense-10cap', 'Cafémalin', 4.90, 9, ['Caramel','Torréfié'], ['Bio'], false],
            ['CAPSULES ÉTHIOPIE SINGLE ORIGIN', 'ethiopie-single-origin-10cap', 'Malongo', 5.90, 4, ['Jasmin','Fruits Rouges'], ['Single Origin','Nouveau'], true],
            ['CAPSULES COLOMBIE SINGLE ORIGIN', 'colombie-single-origin-10cap', 'Malongo', 5.90, 6, ['Caramel','Pomme Verte'], ['Single Origin'], false],
            ['CAPSULES ILLY INTENSO', 'illy-intenso-capsules-10', 'Illy', 5.50, 11, ['Cacao Amer','Épicé'], [], false],
            ['CAPSULES ILLY CLASSICO', 'illy-classico-capsules-10', 'Illy', 5.50, 8, ['Caramel','Floral'], ['Best Seller'], false],
            ['CAPSULES LAVAZZA CREMA E GUSTO', 'lavazza-crema-gusto-10cap', 'Lavazza', 4.90, 10, ['Épicé','Caramel'], ['Best Seller'], false],
            ['CAPSULES LAVAZZA QUALITÀ ROSSA', 'lavazza-qualita-rossa-10cap', 'Lavazza', 4.90, 5, ['Fruité','Floral'], [], false],
            ['CAPSULES LAVAZZA DECA', 'lavazza-deca-10cap', 'Lavazza', 5.20, 7, ['Doux','Caramel'], ['Décaféiné'], false],
            ['CAPSULES SEGAFREDO ZANETTI', 'segafredo-zanetti-10cap', 'Segafredo', 4.50, 9, ['Cacao','Fumé'], [], false],
            ['CAPSULES SEGAFREDO INTERMEZZO', 'segafredo-intermezzo-10cap', 'Segafredo', 4.50, 8, ['Réglisse','Caramel'], [], false],
            ['CAPSULES KIMBO ESPRESSO NAPOLI', 'kimbo-espresso-napoli-10cap', 'Kimbo', 4.90, 10, ['Chocolat Noir'], [], false],
            ['CAPSULES KIMBO AROMA GOLD', 'kimbo-aroma-gold-10cap', 'Kimbo', 4.90, 7, ['Noisette','Fruité'], [], false],
            ['CAPSULES PELLINI VIVACE', 'pellini-vivace-10cap', 'Pellini', 4.50, 9, ['Épicé','Crème'], [], false],
            ['CAPSULES PELLINI TOP', 'pellini-top-10cap', 'Pellini', 4.90, 8, ['Caramel','Vanille'], ['Best Seller'], false],
            ['CAPSULES BIODÉGRADABLES LUNGO', 'bio-degr-lungo-50cap', 'Cafémalin', 21.50, 7, ['Noisette','Doux'], ['Eco'], false],
            ['CAPSULES BIODÉGRADABLES ESPRESSO', 'bio-degr-espresso-50cap', 'Cafémalin', 20.50, 9, ['Caramel','Torréfié'], ['Eco','Nouveau'], true],
            ['NESPRESSO ORIGINAL KAZAAR', 'nespresso-kazaar-10cap', 'Nespresso', 4.50, 12, ['Poivre','Cacao Amer'], ['Best Seller'], false],
            ['NESPRESSO ORIGINAL DHARKAN', 'nespresso-dharkan-10cap', 'Nespresso', 4.50, 11, ['Boisé','Épicé'], [], false],
            ['NESPRESSO ORIGINAL DULSÃO DO BRASIL', 'nespresso-dulsao-10cap', 'Nespresso', 4.50, 4, ['Biscuité','Caramel'], [], false],
            ['NESPRESSO ORIGINAL INDRIYA FROM INDIA', 'nespresso-indriya-10cap', 'Nespresso', 4.50, 10, ['Poivre','Épicé'], [], false],
            ['NESPRESSO VERTUO SCIROCCO', 'nespresso-vertuo-scirocco-10cap', 'Nespresso', 5.50, 11, ['Boisé Intense','Caramel'], [], false],
            ['NESPRESSO VERTUO GIORNIO', 'nespresso-vertuo-giornio-10cap', 'Nespresso', 5.50, 4, ['Fruité','Léger'], ['Nouveau'], true],
            ['CAPSULES CAFÉMALIN RISTRETTO 100', 'cafemalin-ristretto-100cap', 'Cafémalin', 32.00, 12, ['Torréfié','Amer'], ['Best Seller'], false],
            ['CAPSULES CAFÉMALIN LUNGO 100', 'cafemalin-lungo-100cap', 'Cafémalin', 29.00, 5, ['Doux','Noisette'], [], false],
            ['CAPSULES CAFÉMALIN DECAFF 100', 'cafemalin-decaff-100cap', 'Cafémalin', 34.00, 7, ['Doux','Caramel'], ['Décaféiné'], false],
            ['CAPSULES MALONGO BRÉSIL', 'malongo-bresil-10cap', 'Malongo', 5.50, 7, ['Caramel','Chocolat au Lait'], ['Single Origin'], false],
            ['CAPSULES MALONGO ÉTHIOPIE', 'malongo-ethiopie-10cap', 'Malongo', 5.90, 4, ['Fruité','Jasmin'], ['Single Origin'], false],
            ['CAPSULES CARTE NOIRE ESPRESSO', 'carte-noire-espresso-10cap', 'Carte Noire', 4.50, 9, ['Torréfié','Caramel'], [], false],
            ['CAPSULES JACOBS BARISTA', 'jacobs-barista-10cap', 'Jacobs', 4.20, 8, ['Caramel','Noix'], [], false],
            ['CAPSULES DOUWE EGBERTS ESPRESSO', 'douwe-egberts-espresso-10cap', 'Douwe Egberts', 4.30, 9, ['Caramel Brûlé'], [], false],
            ['CAPSULES DELTA CAFES EXPRESSO', 'delta-cafes-expresso-10cap', 'Delta Cafés', 4.80, 9, ['Caramel','Chocolat'], ['Best Seller'], false],
            ['CAPSULES KIMBO DECAFF', 'kimbo-decaff-10cap', 'Kimbo', 4.90, 7, ['Doux','Caramel'], ['Décaféiné'], false],
            ['CAPSULES SEGAFREDO DECA', 'segafredo-deca-10cap', 'Segafredo', 4.50, 8, ['Caramel','Léger'], ['Décaféiné'], false],
            ['CAPSULES PELLINI DECAFF', 'pellini-decaff-10cap', 'Pellini', 4.90, 7, ['Noisette','Doux'], ['Décaféiné'], false],
        ];

        $products = [];
        foreach ($lines as $d) {
            [$name,$slug,$brandName,$priceT,$intensity,$notes,$tags,$isNew] = $d;
            $sku = strtoupper(str_replace('-','_', substr($slug, 0, 16)));
            $img = $this->img($this->imgCapsules);
            $isMulti = str_contains($slug, '50cap') || str_contains($slug, '100cap');
            $qty = $isMulti ? (str_contains($slug,'100cap') ? 100 : 50) : 10;
            $price50 = round($priceT * 4.5, 2);
            $price100 = round($priceT * 8.5, 2);
            $products[] = [
                'data' => [
                    'slug'        => $slug,
                    'category_id' => $catId,
                    'brand_id'    => $brand($brandName)?->id,
                    'name'        => $name,
                    'price'       => $priceT,
                    'intensity'   => $intensity,
                    'is_featured' => in_array('Best Seller', $tags),
                    'is_new'      => $isNew,
                    'in_stock'    => true,
                    'is_active'   => true,
                ],
                'units' => $isMulti ? [
                    ['sku_code' => $sku.'_DEF', 'label' => $qty.' capsules', 'price' => $priceT, 'quantity' => $qty, 'is_default' => true],
                ] : [
                    ['sku_code' => $sku.'_10',  'label' => '10 capsules',  'price' => $priceT,          'quantity' => 10,  'is_default' => true],
                    ['sku_code' => $sku.'_50',  'label' => '50 capsules',  'price' => $price50,         'quantity' => 50,  'is_default' => false],
                    ['sku_code' => $sku.'_100', 'label' => '100 capsules', 'price' => $price100,        'quantity' => 100, 'is_default' => false],
                ],
                'images'    => [$img],
                'notes'     => $notes,
                'brew_sizes'=> ['Espresso','Ristretto'],
                'tags'      => $tags,
            ];
        }
        return $products;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MACHINES (20)
    // ──────────────────────────────────────────────────────────────────────────
    private function machineProducts(callable $cat, callable $brand): array
    {
        $catId = $cat('machines-a-cafe')?->id;
        $machines = [
            ['DELONGHI MAGNIFICA EVO', 'delonghi-magnifica-evo-super-auto', 'DeLonghi', 549.00, 649.00, true, false, ['Best Seller'], ['Espresso','Latte','Cappuccino']],
            ['SAGE THE BARISTA EXPRESS', 'sage-barista-express-semi-auto', 'Sage', 749.00, null, true, false, [], ['Espresso','Flat White','Lungo']],
            ['NESPRESSO VERTUO POP', 'nespresso-vertuo-pop', 'Nespresso', 99.00, null, true, true, ['Nouveau'], ['Espresso','Mug','Gran Lungo']],
            ['PHILIPS LATTEGO 2200', 'philips-lattego-2200', 'Philips', 399.00, null, true, false, [], ['Cappuccino','Espresso','Classic Coffee']],
            ['KRUPS EVIDENCE ONE', 'krups-evidence-one', 'Krups', 649.00, null, true, false, [], ['Espresso','Double Espresso','Lattes']],
            ['BREVILLE ORACLE TOUCH', 'breville-oracle-touch', 'Breville', 2499.00, null, true, false, ['Best Seller'], ['Flat White','Cappuccino','Long Black']],
            ['JURA ENA 8', 'jura-ena-8', 'Jura', 1199.00, null, false, false, [], ['Espresso','Macchiato','Cortado']],
            ["SMEG 50'S STYLE", 'smeg-50s-style-espresso', 'Smeg', 349.00, null, false, false, [], ['Espresso','Double Espresso']],
            ['MELITTA CAFFEO BARISTA TS', 'melitta-caffeo-barista-ts', 'Melitta', 899.00, null, false, false, [], ['21 Variétés','Espresso','Latte']],
            ['GAGGIA CLASSIC PRO', 'gaggia-classic-pro', 'Gaggia', 449.00, null, false, false, [], ['Espresso','Ristretto']],
            // 10 new machines
            ['DELONGHI ELETTA EXPLORE', 'delonghi-eletta-explore', 'DeLonghi', 999.00, 1199.00, true, true, ['Nouveau'], ['Espresso','Cappuccino','Cold Brew']],
            ['JURA E8 PIANO BLACK', 'jura-e8-piano-black', 'Jura', 1499.00, null, false, false, ['Premium'], ['Espresso','Lungo','Macchiato']],
            ['PHILIPS 3200 LATTEGO', 'philips-3200-lattego', 'Philips', 699.00, 799.00, true, false, ['Best Seller'], ['Cappuccino','Latte Macchiato','Espresso']],
            ['SAGE BAMBINO PLUS', 'sage-bambino-plus', 'Sage', 499.00, null, false, true, ['Nouveau'], ['Espresso','Cappuccino','Flat White']],
            ['KRUPS EA9000 EVIDENCE', 'krups-ea9000-evidence', 'Krups', 1199.00, null, false, false, [], ['Espresso','Lungo','21 Variétés']],
            ['LELIT MARA PL62X', 'lelit-mara-pl62x', 'Lelit', 1299.00, 1499.00, false, false, ['Pro'], ['Espresso','Ristretto','Americano']],
            ['RANCILIO SILVIA PRO X', 'rancilio-silvia-pro-x', 'Rancilio', 1699.00, null, false, false, ['Pro'], ['Espresso','Ristretto']],
            ['ASCASO STEEL DUO', 'ascaso-steel-duo', 'Ascaso', 899.00, null, false, true, ['Nouveau'], ['Espresso','Lungo','Cappuccino']],
            ['ECM CLASSIKA PID', 'ecm-classika-pid', 'ECM', 1999.00, null, false, false, ['Premium','Pro'], ['Espresso','Ristretto']],
            ['BIALETTI DAMA MOKA ÉLECTRIQUE', 'bialetti-dama-moka-electrique', 'Bialetti', 89.00, 109.00, false, true, ['Nouveau'], ['Café Allongé','Moka']],
        ];

        $products = [];
        foreach ($machines as $m) {
            [$name,$slug,$brandName,$price,$origPrice,$featured,$isNew,$tags,$brew] = $m;
            $sku = strtoupper(str_replace('-','_', substr($slug, 0, 16)));
            $img = $this->img($this->imgMachines);
            $products[] = [
                'data' => [
                    'slug'          => $slug,
                    'category_id'   => $catId,
                    'brand_id'      => $brand($brandName)?->id,
                    'name'          => $name,
                    'price'         => $price,
                    'original_price'=> $origPrice,
                    'is_featured'   => $featured,
                    'is_new'        => $isNew,
                    'in_stock'      => true,
                    'is_active'     => true,
                ],
                'units' => [
                    ['sku_code' => $sku.'_U', 'label' => 'Machine', 'price' => $price, 'original_price' => $origPrice, 'quantity' => 1, 'is_default' => true],
                ],
                'images'    => [$img],
                'brew_sizes'=> $brew,
                'tags'      => $tags,
            ];
        }
        return $products;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ACCESSORIES (10)
    // ──────────────────────────────────────────────────────────────────────────
    private function accessoryProducts(callable $cat, callable $brand): array
    {
        $catId = $cat('accessoires')?->id;
        $items = [
            ['GOBELETS EN CARTON CAFÉMALIN 4 OZ',  'gobelets-carton-12cl-cafemalin-lot-50',  'Cafémalin', 4.90,  5.90,  true,  false, ['Best Seller'], ['lot50'=>[50,4.90],'lot250'=>[250,21.00],'lot500'=>[500,38.00]]],
            ['COUVERCLES GOBELETS 12CL — LOT 50',   'couvercles-gobelets-12cl-lot-50',         'Cafémalin', 2.90,  null,  false, false, [], ['lot50'=>[50,2.90],'lot250'=>[250,11.00]]],
            ['TOUILLETTES EN BOIS 14CM — LOT 1000', 'touillettes-bois-14cm-lot-1000',          'Cafémalin', 7.50,  9.90,  false, false, ['Best Seller'], ['lot1000'=>[1000,7.50],'lot5000'=>[5000,33.00]]],
            ['SACHET SUCRE CASSONADE — LOT 150',    'sachet-sucre-cassonade-lot-150',           'Cafémalin', 6.90,  null,  false, false, [], ['lot150'=>[150,6.90],'lot500'=>[500,20.00]]],
            ['TAMPER INOX 58MM BARISTA',            'tamper-inox-58mm-barista',                 'Cafémalin', 24.90, 34.90, false, true,  ['Nouveau'], ['unit'=>[1,24.90]]],
            ['DISTRIBUTEUR NAPKINS LOT 200',        'distributeur-napkins-lot-200',             'Cafémalin', 8.90,  null,  false, false, [], ['lot200'=>[200,8.90],'lot500'=>[500,19.90]]],
            ['COMPRIMÉS DÉTARTRAGE 6 PCS',          'comprimes-detartrage-6pcs',                'Cafémalin', 9.90,  null,  false, false, ['Entretien'], ['unit6'=>[6,9.90],'unit12'=>[12,17.90]]],
            ['PLATEAU CAFÉ BOIS — LOT 5',           'plateau-cafe-bois-lot-5',                  'Cafémalin', 19.90, null,  false, true,  ['Nouveau'], ['lot5'=>[5,19.90]]],
            ['MOULIN À CAFÉ MANUEL',                'moulin-cafe-manuel',                       'Cafémalin', 34.90, 44.90, false, false, [], ['unit'=>[1,34.90]]],
            ['CAFETIÈRE À PISTON 1L',               'cafetiere-piston-1l',                      'Cafémalin', 29.90, 39.90, false, false, ['Best Seller'], ['unit'=>[1,29.90]]],
        ];

        $products = [];
        foreach ($items as [$name,$slug,$brandName,$price,$origPrice,$featured,$isNew,$tags,$unitSpec]) {
            $img = $this->img($this->imgAcc);
            $units = [];
            foreach ($unitSpec as $uKey => [$qty, $uPrice]) {
                $sku = strtoupper(str_replace('-','_', substr($slug, 0, 12))).'_'.strtoupper($uKey);
                $units[] = ['sku_code' => $sku, 'label' => $qty > 1 ? "Lot de {$qty}" : '1 unité', 'price' => $uPrice, 'quantity' => $qty, 'is_default' => $uKey === array_key_first($unitSpec)];
            }
            $products[] = [
                'data' => [
                    'slug'          => $slug,
                    'category_id'   => $catId,
                    'brand_id'      => $brand($brandName)?->id,
                    'name'          => $name,
                    'price'         => $price,
                    'original_price'=> $origPrice,
                    'is_featured'   => $featured,
                    'is_new'        => $isNew,
                    'in_stock'      => true,
                    'is_active'     => true,
                ],
                'units'  => $units,
                'images' => [$img],
                'tags'   => $tags,
            ];
        }
        return $products;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SWEET TREATS / FRIANDISES (50)
    // ──────────────────────────────────────────────────────────────────────────
    private function treatProducts(callable $cat, callable $brand): array
    {
        $catId = $cat('friandises')?->id;
        $treats = [
            ['SPÉCULOOS CAFÉ — LOT 200',           'speculoos-cafe-lot-200',             'Cafémalin', 18.50, null,  true,  false, ['Best Seller'], 200],
            ['BISCUITS AU CHOCOLAT NOIR — LOT 200', 'biscuits-choco-noir-lot-200',        'Cafémalin', 21.90, null,  false, false, [],              200],
            ['MACARONS CAFÉ ASSORTIS — LOT 24',    'macarons-cafe-assortis-lot-24',      'Cafémalin', 16.90, 19.90, false, false, [],               24],
            ['MINI-CHOCOLATS FOURRÉS — LOT 150',   'mini-chocolats-fourres-lot-150',     'Cafémalin', 19.90, null,  false, false, [],              150],
            ['SPÉCULOOS LU INDIVIDUAL — LOT 300',  'speculoos-lu-individual-lot-300',    'Cafémalin', 24.90, 29.90, true,  false, ['Best Seller'], 300],
            ['SABLÉS AU BEURRE — LOT 200',         'sables-beurre-lot-200',              'Cafémalin', 22.90, null,  false, false, [],              200],
            ['COCO ROCHERS — LOT 100',             'coco-rochers-lot-100',               'Cafémalin', 12.90, null,  false, false, [],              100],
            ['TRUFFES AU CAFÉ — LOT 50',           'truffes-cafe-lot-50',                'Cafémalin', 24.90, null,  false, true,  ['Nouveau'],     50],
            ['BROWNIE CHOCOLAT — LOT 24',          'brownie-chocolat-lot-24',            'Cafémalin', 18.50, null,  false, false, [],               24],
            ['FINANCIERS AMANDE — LOT 24',         'financiers-amande-lot-24',           'Cafémalin', 17.90, null,  false, false, [],               24],
            ['CANELÉS BORDEAUX — LOT 12',          'caneles-bordeaux-lot-12',            'Cafémalin', 14.90, null,  false, true,  ['Nouveau'],     12],
            ['GALETTES BRETONNES — LOT 100',       'galettes-bretonnes-lot-100',         'Cafémalin', 11.90, null,  false, false, [],              100],
            ['BISCUITS SÉSAME — LOT 200',          'biscuits-sesame-lot-200',            'Cafémalin', 16.90, null,  false, false, [],              200],
            ['PALMIERS CARAMEL — LOT 100',         'palmiers-caramel-lot-100',           'Cafémalin', 13.90, null,  false, false, [],              100],
            ['TUILES AUX AMANDES — LOT 100',       'tuiles-amandes-lot-100',             'Cafémalin', 14.50, null,  false, false, [],              100],
            ['MADELEINES INDIVIDUELLES — LOT 200', 'madeleines-individuelles-lot-200',   'Cafémalin', 19.90, null,  false, false, [],              200],
            ['MINI CROISSANTS — LOT 60',           'mini-croissants-lot-60',             'Cafémalin', 28.90, null,  false, true,  ['Nouveau'],     60],
            ['PÂTES DE FRUIT ASSORTIS — LOT 100',  'pates-fruit-assortis-lot-100',       'Cafémalin', 22.90, null,  false, false, [],              100],
            ['GUIMAUVES CAFÉ — LOT 100',           'guimauves-cafe-lot-100',             'Cafémalin', 15.90, null,  false, false, [],              100],
            ['BARQUETTES FRUITS ROUGES — LOT 200', 'barquettes-fruits-rouges-lot-200',   'Cafémalin', 24.90, null,  false, false, [],              200],
            ['LANGUES DE CHAT — LOT 200',          'langues-chat-lot-200',               'Cafémalin', 17.90, null,  false, false, [],              200],
            ['ROCHERS NOIX DE COCO — LOT 100',     'rochers-noix-coco-lot-100',          'Cafémalin', 13.50, null,  false, false, [],              100],
            ['AMARETTI ITALIENS — LOT 200',        'amaretti-italiens-lot-200',          'Cafémalin', 23.90, null,  true,  false, ['Best Seller'], 200],
            ['BISCOTTI AU CHOCOLAT — LOT 100',     'biscotti-chocolat-lot-100',          'Cafémalin', 16.90, null,  false, false, [],              100],
            ['NOUGAT MIEL — LOT 50',               'nougat-miel-lot-50',                 'Cafémalin', 18.90, null,  false, true,  ['Nouveau'],     50],
            ['CARAMELS SALÉS — LOT 100',           'caramels-sales-lot-100',             'Cafémalin', 14.90, null,  false, false, [],              100],
            ['SPÉCULOOS LOTUS INDIVIDUAL — LOT 200', 'speculoos-lotus-individual-lot-200', 'Cafémalin', 26.90, null, true, false, ['Best Seller'], 200],
            ['MINI DONUTS SUCRE — LOT 24',         'mini-donuts-sucre-lot-24',           'Cafémalin', 16.50, null,  false, false, [],               24],
            ['MADELEINE CHOCOLAT — LOT 200',       'madeleine-chocolat-lot-200',         'Cafémalin', 22.90, null,  false, false, [],              200],
            ['GUIMAUVES VANILLE — LOT 100',        'guimauves-vanille-lot-100',          'Cafémalin', 14.90, null,  false, false, [],              100],
            ['CIGARETTES RUSSES — LOT 200',        'cigarettes-russes-lot-200',          'Cafémalin', 18.90, null,  false, false, [],              200],
            ['FINANCIERS PISTACHE — LOT 24',       'financiers-pistache-lot-24',         'Cafémalin', 19.90, null,  false, true,  ['Nouveau'],     24],
            ['BEIGNETS CONFITURE — LOT 24',        'beignets-confiture-lot-24',          'Cafémalin', 21.90, null,  false, false, [],               24],
            ['MINI ECLAIRS CAFÉ — LOT 24',         'mini-eclairs-cafe-lot-24',           'Cafémalin', 24.90, null,  false, true,  ['Nouveau'],     24],
            ['CHOUQUETTES — LOT 100',              'chouquettes-lot-100',                'Cafémalin', 11.90, null,  false, false, [],              100],
            ['CHOCO WAFERS — LOT 200',             'choco-wafers-lot-200',               'Cafémalin', 16.90, null,  false, false, [],              200],
            ['PRALINS AMANDES — LOT 100',          'pralins-amandes-lot-100',            'Cafémalin', 19.90, null,  false, false, [],              100],
            ['TRUFFES PRALINÉ — LOT 50',           'truffes-praline-lot-50',             'Cafémalin', 22.90, null,  false, false, [],               50],
            ['MERINGUES FRANÇAISES — LOT 100',     'meringues-francaises-lot-100',       'Cafémalin', 13.90, null,  false, false, [],              100],
            ['MINI TARTE CITRON — LOT 12',         'mini-tarte-citron-lot-12',           'Cafémalin', 19.90, null,  false, true,  ['Nouveau'],     12],
            ['MUFFINS MYRTILLES — LOT 12',         'muffins-myrtilles-lot-12',           'Cafémalin', 17.90, null,  false, false, [],               12],
            ['BISCUITS PETITS BEURRE — LOT 200',   'biscuits-petits-beurre-lot-200',     'Cafémalin', 15.90, null,  false, false, [],              200],
            ['MINI MACARONS COLORÉS — LOT 48',     'mini-macarons-colores-lot-48',       'Cafémalin', 28.90, null,  false, false, [],               48],
            ['CANTUCCI TOSCANI — LOT 200',         'cantucci-toscani-lot-200',           'Cafémalin', 21.90, null,  false, false, [],              200],
            ['PAINS D\'ANIS — LOT 200',            'pains-anis-lot-200',                 'Cafémalin', 17.90, null,  false, false, [],              200],
            ['SACHET SUCRE BLANC — LOT 500',       'sachet-sucre-blanc-lot-500',         'Cafémalin', 4.90,  null,  false, false, [],              500],
            ['CAPSULES CHOCOLAT CHAUD 10',         'capsules-chocolat-chaud-10',         'Cafémalin', 6.90,  null,  false, false, [],               10],
            ['BISCUIT THINS CHOCOLAT — LOT 200',   'biscuit-thins-chocolat-lot-200',     'Cafémalin', 19.90, null,  false, false, [],              200],
            ['CONFISERIES CAFÉ DRAGÉES — LOT 500', 'confiseries-cafe-dragees-lot-500',   'Cafémalin', 29.90, null,  true,  false, ['Best Seller'], 500],
            ['BONBONS CARAMEL BEURRE SALÉ LOT 100', 'bonbons-caramel-beurre-sale-lot-100', 'Cafémalin', 16.90, null, false, true, ['Nouveau'], 100],
        ];

        $products = [];
        foreach ($treats as [$name,$slug,$brandName,$price,$origPrice,$featured,$isNew,$tags,$qty]) {
            $sku = strtoupper(str_replace(['-',"'"],'_', substr($slug, 0, 14)));
            $img = $this->img($this->imgTreats);
            $price2x = round($price * 1.85, 2);
            $products[] = [
                'data' => [
                    'slug'          => $slug,
                    'category_id'   => $catId,
                    'brand_id'      => $brand($brandName)?->id,
                    'name'          => $name,
                    'price'         => $price,
                    'original_price'=> $origPrice,
                    'is_featured'   => $featured,
                    'is_new'        => $isNew,
                    'in_stock'      => true,
                    'is_active'     => true,
                ],
                'units' => [
                    ['sku_code' => $sku.'_1X', 'label' => "Lot de {$qty}",        'price' => $price,  'original_price' => $origPrice, 'quantity' => $qty,     'is_default' => true],
                    ['sku_code' => $sku.'_2X', 'label' => "Lot de ".($qty*2), 'price' => $price2x, 'quantity' => $qty * 2, 'is_default' => false],
                ],
                'images'=> [$img],
                'tags'  => $tags,
            ];
        }
        return $products;
    }
}
