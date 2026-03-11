<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Address;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['name' => 'Sophie Dubois',     'email' => 'sophie.dubois@gmail.com',     'phone' => '+32 470 12 34 56', 'locale' => 'fr'],
            ['name' => 'Thomas Martin',     'email' => 'thomas.martin@outlook.com',    'phone' => '+32 471 23 45 67', 'locale' => 'fr'],
            ['name' => 'Emma Lecomte',      'email' => 'emma.lecomte@hotmail.com',     'phone' => '+32 472 34 56 78', 'locale' => 'fr'],
            ['name' => 'Luc Fontaine',      'email' => 'luc.fontaine@gmail.com',       'phone' => '+32 473 45 67 89', 'locale' => 'fr'],
            ['name' => 'Marie Renard',      'email' => 'marie.renard@yahoo.fr',        'phone' => '+32 474 56 78 90', 'locale' => 'fr'],
            ['name' => 'Nicolas Lambert',   'email' => 'nicolas.lambert@gmail.com',    'phone' => '+32 475 67 89 01', 'locale' => 'fr'],
            ['name' => 'Isabelle Morel',    'email' => 'isabelle.morel@live.be',       'phone' => '+32 476 78 90 12', 'locale' => 'nl'],
            ['name' => 'Pierre Dumont',     'email' => 'pierre.dumont@gmail.com',      'phone' => '+32 477 89 01 23', 'locale' => 'fr'],
            ['name' => 'Claire Simon',      'email' => 'claire.simon@hotmail.be',      'phone' => '+32 478 90 12 34', 'locale' => 'fr'],
            ['name' => 'Laurent Petit',     'email' => 'laurent.petit@gmail.com',      'phone' => '+32 479 01 23 45', 'locale' => 'fr'],
            ['name' => 'Anne Schmitt',      'email' => 'anne.schmitt@gmx.de',          'phone' => '+49 151 23456789', 'locale' => 'de'],
            ['name' => 'Julien Lefebvre',   'email' => 'julien.lefebvre@gmail.com',    'phone' => '+32 470 23 45 67', 'locale' => 'fr'],
            ['name' => 'Nathalie Gilles',   'email' => 'nathalie.gilles@yahoo.fr',     'phone' => '+32 471 34 56 78', 'locale' => 'fr'],
            ['name' => 'Alex Van den Berg', 'email' => 'alex.vdb@gmail.com',           'phone' => '+32 472 45 67 89', 'locale' => 'nl'],
            ['name' => 'Mia Rossi',         'email' => 'mia.rossi@gmail.com',          'phone' => '+39 328 123 4567', 'locale' => 'en'],
        ];

        $addresses = [
            ['city' => 'Bruxelles',   'postal_code' => '1000', 'address' => 'Rue de la Loi 42',          'country' => 'BE'],
            ['city' => 'Liège',       'postal_code' => '4000', 'address' => 'Boulevard d\'Avroy 15',     'country' => 'BE'],
            ['city' => 'Gand',        'postal_code' => '9000', 'address' => 'Veldstraat 88',             'country' => 'BE'],
            ['city' => 'Anvers',      'postal_code' => '2000', 'address' => 'Meir 25',                   'country' => 'BE'],
            ['city' => 'Namur',       'postal_code' => '5000', 'address' => 'Rue de Fer 20',             'country' => 'BE'],
            ['city' => 'Mons',        'postal_code' => '7000', 'address' => 'Grand-Place 12',            'country' => 'BE'],
            ['city' => 'Bruges',      'postal_code' => '8000', 'address' => 'Markt 5',                   'country' => 'BE'],
            ['city' => 'Charleroi',   'postal_code' => '6000', 'address' => 'Place Charles II 7',        'country' => 'BE'],
            ['city' => 'Louvain',     'postal_code' => '3000', 'address' => 'Bondgenotenlaan 101',       'country' => 'BE'],
            ['city' => 'Hasselt',     'postal_code' => '3500', 'address' => 'Grote Markt 8',             'country' => 'BE'],
            ['city' => 'Berlin',      'postal_code' => '10115','address' => 'Unter den Linden 77',       'country' => 'DE'],
            ['city' => 'Tournai',     'postal_code' => '7500', 'address' => 'Grand Place 3',             'country' => 'BE'],
            ['city' => 'Arlon',       'postal_code' => '6700', 'address' => 'Rue de Mersch 11',          'country' => 'BE'],
            ['city' => 'Bruges',      'postal_code' => '8000', 'address' => 'Sint-Jakobsstraat 33',      'country' => 'BE'],
            ['city' => 'Paris',       'postal_code' => '75001','address' => 'Rue de Rivoli 120',         'country' => 'FR'],
        ];

        foreach ($customers as $i => $customerData) {
            $user = User::firstOrCreate(
                ['email' => $customerData['email']],
                [
                    'name'      => $customerData['name'],
                    'password'  => Hash::make('Customer2024!'),
                    'phone'     => $customerData['phone'],
                    'locale'    => $customerData['locale'],
                    'is_active' => true,
                ]
            );

            $addr = $addresses[$i];
            [$firstName, $lastName] = explode(' ', $customerData['name'], 2);

            Address::firstOrCreate(
                ['user_id' => $user->id, 'city' => $addr['city']],
                [
                    'label'       => 'Domicile',
                    'first_name'  => $firstName,
                    'last_name'   => $lastName,
                    'address'     => $addr['address'],
                    'city'        => $addr['city'],
                    'postal_code' => $addr['postal_code'],
                    'country'     => $addr['country'],
                    'phone'       => $customerData['phone'],
                    'is_default'  => true,
                ]
            );
        }

        $this->command->info('✅ Seeded 15 customers with addresses');
    }
}
