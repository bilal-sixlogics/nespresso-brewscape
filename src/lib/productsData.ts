
import { Product } from '@/types';

export const categoriesList = [
    "Café en Grains",
    "Café Moulu",
    "Capsules de Café",
    "Machines à Café",
    "Packs",
    "Vending",
    "Thé & Boissons",
    "Accessoires",
    "Friandises",
    "Blog CaféMalin"
];

export const productDatabase: Record<string, Product[]> = {
    "Café en Grains": [
        {
            "id": 2000,
            "name": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT", "nameEn": "COFFEE BEANS LAVAZZA CREMA & AROMA EXPERT",
            "namePart2": "1 KG",
            "price": 19.9,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2001,
            "name": "CAFÉ EN GRAINS DELTA CAFES GOLD 1KG", "nameEn": "COFFEE BEANS DELTA CAFES GOLD 1KG",
            "namePart2": "",
            "price": 25.5,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2002,
            "name": "CAFÉ EN GRAINS DELTA PLATINUM 1 KG", "nameEn": "COFFEE BEANS DELTA PLATINUM 1 KG",
            "namePart2": "",
            "price": 26.5,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2003,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 57.89,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2004,
            "name": "CAFÉ EN GRAIN COVIM", "nameEn": "COFFEE BEANS COVIM",
            "namePart2": "GRANBAR",
            "price": 15.5,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2005,
            "name": "20KG", "nameEn": "20KG",
            "namePart2": "CAFÉ EN GRAINS DELTA CAFES GOLD",
            "price": 0,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2006,
            "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
            "namePart2": "BIO COFFEE 1KG",
            "price": 18.8,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2007,
            "name": "6KG", "nameEn": "6KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 108.62,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2008,
            "name": "5KG", "nameEn": "5KG",
            "namePart2": "CAFÉ EN GRAINS DELTA CAFÉS GRAN CREMA",
            "price": 0,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2009,
            "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
            "namePart2": "COLOMBIA 500G",
            "price": 14.8,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2010,
            "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
            "namePart2": "BRAZIL 500G",
            "price": 13.75,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2011,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "GASTRONOMIQUE",
            "price": 4.9,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2012,
            "name": "PACK 6KG", "nameEn": "PACK 6KG",
            "namePart2": "CAFÉ EN GRAIN BRISTOT CLASSICO INTENSO E CREMOSO",
            "price": 101.85,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2013,
            "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
            "namePart2": "3×1 KG",
            "price": 62.57,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2014,
            "name": "20KG CAFÉ EN GRAINS CREMA ET AROMA", "nameEn": "20KG COFFEE BEANS CREMA ET AROMA",
            "namePart2": "LAVAZZA",
            "price": 480.87,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2015,
            "name": "KIMBO SUPERIOR BLEND", "nameEn": "KIMBO SUPERIOR BLEND",
            "namePart2": "CAFÉ EN GRAIN 1KG",
            "price": 16.3,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2016,
            "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 6X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 6X1KG",
            "namePart2": "",
            "price": 162.68,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2017,
            "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 12X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 12X1KG",
            "namePart2": "",
            "price": 318.65,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 2018,
            "name": "CAFÉ EN GRAINS LAVAZZA CREMA CLASSICA 3KG", "nameEn": "COFFEE BEANS LAVAZZA CREMA CLASSICA 3KG",
            "namePart2": "",
            "price": 64,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Café Moulu": [
        {
            "id": 3000,
            "name": "CAFÉ MOULU 250G GOLD", "nameEn": "GROUND COFFEE 250G GOLD",
            "namePart2": "DELTA",
            "price": 5.9,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 3001,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "PRESTIGE",
            "price": 4.9,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 3002,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "DÉGUSTATION",
            "price": 4.9,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 3003,
            "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
            "namePart2": "GASTRONOMIQUE",
            "price": 4.9,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Capsules de Café": [
        {
            "id": 4000,
            "name": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES",
            "namePart2": "",
            "price": 6.2,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4001,
            "name": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES",
            "namePart2": "",
            "price": 6.2,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4002,
            "name": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES", "nameEn": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES",
            "namePart2": "",
            "price": 28.7,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4003,
            "name": "DELTA Q QHARACTER N°9", "nameEn": "DELTA Q QHARACTER N°9",
            "namePart2": "10 CAPSULES",
            "price": 3.45,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4004,
            "name": "PACK CAPSULES LAVAZZA BLUE", "nameEn": "PACK CAPSULES LAVAZZA BLUE",
            "namePart2": "",
            "price": 5,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4005,
            "name": "LAVAZZA BLUE RICCO", "nameEn": "LAVAZZA BLUE RICCO",
            "namePart2": "X100 CAPSULES",
            "price": 32,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4006,
            "name": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®",
            "namePart2": "LAVAZZA",
            "price": 26.34,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4007,
            "name": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES",
            "namePart2": "",
            "price": 32.77,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4008,
            "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
            "namePart2": "",
            "price": 128.08,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4009,
            "name": "DELTA Q COLOMBIA", "nameEn": "DELTA Q COLOMBIA",
            "namePart2": "10 CAPSULES",
            "price": 4.4,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4010,
            "name": "DELTA Q VIETNAM", "nameEn": "DELTA Q VIETNAM",
            "namePart2": "10 CAPSULES",
            "price": 4.4,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4011,
            "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
            "namePart2": "40 CAPSULES",
            "price": 14.65,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4012,
            "name": "DELTA Q QHARISMA N°12", "nameEn": "DELTA Q QHARISMA N°12",
            "namePart2": "40 CAPSULES",
            "price": 11.3,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4013,
            "name": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES", "nameEn": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES",
            "namePart2": "",
            "price": 9.7,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4014,
            "name": "DELTA Q MENTHE CHOCOLAT", "nameEn": "DELTA Q MENTHE CHOCOLAT",
            "namePart2": "10 CAPSULES",
            "price": 3.65,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4015,
            "name": "DELTA Q", "nameEn": "DELTA Q",
            "namePart2": "PACK DÉCOUVERTE",
            "price": 8.08,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4016,
            "name": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES",
            "namePart2": "",
            "price": 14.78,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4017,
            "name": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES", "nameEn": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES",
            "namePart2": "",
            "price": 5,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4018,
            "name": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES", "nameEn": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES",
            "namePart2": "",
            "price": 5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4019,
            "name": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®",
            "namePart2": "LAVAZZA",
            "price": 27.63,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4020,
            "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
            "namePart2": "10 CAPSULES LUNGO",
            "price": 2.55,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4021,
            "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
            "namePart2": "PACK 10X10 CAPSULES",
            "price": 0,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4022,
            "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
            "namePart2": "",
            "price": 5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4023,
            "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE",
            "namePart2": "18 UNITÉS",
            "price": 8.79,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4024,
            "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA",
            "namePart2": "18 UNITÉS",
            "price": 8.79,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4025,
            "name": "KIMBO COMPATIBLE MODO MIO", "nameEn": "KIMBO COMPATIBLE MODO MIO",
            "namePart2": "CAPRI",
            "price": 16,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4026,
            "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO",
            "namePart2": "18 DOSETTES",
            "price": 8.05,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4027,
            "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA",
            "namePart2": "18 UNITÉS",
            "price": 8.79,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4028,
            "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES",
            "namePart2": "",
            "price": 5,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4029,
            "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ",
            "namePart2": "18 DOSETTES",
            "price": 8.05,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4030,
            "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4031,
            "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
            "namePart2": "10X10 CAPSULES LUNGO",
            "price": 0,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4032,
            "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4033,
            "name": "KIMBO COMPATIBLE NESPRESSO", "nameEn": "KIMBO COMPATIBLE NESPRESSO",
            "namePart2": "NAPOLI",
            "price": 0,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 4034,
            "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE",
            "namePart2": "180 DOSETTES",
            "price": 0,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Machines à Café": [
        {
            "id": 5000,
            "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
            "namePart2": "LAVAZZA BLUE LB900 COMPACT",
            "price": 199,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5001,
            "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
            "namePart2": "",
            "price": 128.08,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5002,
            "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
            "namePart2": "LAVAZZA BLUE LB1050 CLASSY MILK",
            "price": 239,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5003,
            "name": "MACHINE À CAFÉ LAVAZZA A MODO MIO", "nameEn": "MACHINE À CAFÉ LAVAZZA A MODO MIO",
            "namePart2": "JOLIE PLUS SILVER",
            "price": 119,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5004,
            "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5005,
            "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5006,
            "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
            "namePart2": "NOIR",
            "price": 199.5,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5007,
            "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
            "namePart2": "ROUGE",
            "price": 199.5,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5008,
            "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
            "namePart2": "INOX",
            "price": 699,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 5009,
            "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
            "namePart2": "ROUGE",
            "price": 699,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Packs": [
        {
            "id": 6000,
            "name": "6KG", "nameEn": "6KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 108.62,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6001,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
            "price": 57.89,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6002,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAINS GOLD SELECTION",
            "price": 84.38,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6003,
            "name": "3KG LAVAZZA CREMA CLASSICA", "nameEn": "3KG LAVAZZA CREMA CLASSICA",
            "namePart2": "",
            "price": 64,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6004,
            "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
            "namePart2": "",
            "price": 5,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6005,
            "name": "PACK CAFÉ EN GRAIN ORIGINE", "nameEn": "PACK COFFEE BEANS ORIGINE",
            "namePart2": "DELTA CAFÉS",
            "price": 27.9,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6006,
            "name": "3KG", "nameEn": "3KG",
            "namePart2": "CAFÉ EN GRAIN PRONTO CREMA LAVAZZA",
            "price": 57.89,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6007,
            "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
            "namePart2": "6×1 KG",
            "price": 122.55,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6008,
            "name": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6009,
            "name": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 32,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6010,
            "name": "ILLY COMPATIBLES NESPRESSO®", "nameEn": "ILLY COMPATIBLES NESPRESSO®",
            "namePart2": "10×10 CAPSULES CLASSICO LUNGO",
            "price": 44.52,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 6011,
            "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
            "namePart2": "",
            "price": 5,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Vending": [
        {
            "id": 7000,
            "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
            "namePart2": "1KG",
            "price": 8.44,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 7001,
            "name": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE",
            "namePart2": "RÉGILAIT",
            "price": 7.5,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 7002,
            "name": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG", "nameEn": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG",
            "namePart2": "VENDING",
            "price": 8,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 7003,
            "name": "LAIT ÉCRÉMÉ EN POUDRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE",
            "namePart2": "PROLAIT",
            "price": 12,
            "intensity": 6,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Thé & Boissons": [
        {
            "id": 8000,
            "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
            "namePart2": "1KG",
            "price": 8.44,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8001,
            "name": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES", "nameEn": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES",
            "namePart2": "",
            "price": 3.8,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8002,
            "name": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES", "nameEn": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES",
            "namePart2": "",
            "price": 17.5,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8003,
            "name": "CAPPUCINO VANILLE", "nameEn": "CAPPUCINO VANILLE",
            "namePart2": "1KG",
            "price": 8.44,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8004,
            "name": "THÉ AU CITRON INSTANTANÉ RISTORA", "nameEn": "THÉ AU CITRON INSTANTANÉ RISTORA",
            "namePart2": "1KG",
            "price": 5.49,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 8005,
            "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
            "namePart2": "10X1KG",
            "price": 93.05,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Accessoires": [
        {
            "id": 9000,
            "name": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50",
            "namePart2": "",
            "price": 1.5,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9001,
            "name": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500", "nameEn": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500",
            "namePart2": "",
            "price": 10.9,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9002,
            "name": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)", "nameEn": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)",
            "namePart2": "",
            "price": 6,
            "intensity": 9,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9003,
            "name": "SUCRE BÛCHETTE 4GR LAVAZZA X200", "nameEn": "SUCRE BÛCHETTE 4GR LAVAZZA X200",
            "namePart2": "",
            "price": 6.19,
            "intensity": 4,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9004,
            "name": "6.5 OZ (20CL) GOBELET CAFEMALIN X50", "nameEn": "6.5 OZ (20CL) GOBELET CAFEMALIN X50",
            "namePart2": "",
            "price": 1.92,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9005,
            "name": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50",
            "namePart2": "",
            "price": 2.04,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9006,
            "name": "SOUS", "nameEn": "SOUS",
            "namePart2": "LOT DE 12 POUR TASSES ESPRESSO 70 ML",
            "price": 30,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9007,
            "name": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST", "nameEn": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST",
            "namePart2": "",
            "price": 72,
            "intensity": 5,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 9008,
            "name": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST", "nameEn": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST",
            "namePart2": "",
            "price": 162,
            "intensity": 8,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Friandises": [
        {
            "id": 10000,
            "name": "LAVAZZA AMANDE CACAOTÉE", "nameEn": "LAVAZZA AMANDE CACAOTÉE",
            "namePart2": "500 CHOCOLATS",
            "price": 39,
            "intensity": 10,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 10001,
            "name": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL", "nameEn": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL",
            "namePart2": "",
            "price": 25.98,
            "intensity": 11,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
        },
        {
            "id": 10002,
            "name": "200 PETITES GALETTES PUR BEURRE", "nameEn": "200 PETITES GALETTES PUR BEURRE",
            "namePart2": "ST MICHEL",
            "price": 21.05,
            "intensity": 7,
            "brewSizes": [
                "Espresso",
                "Lungo"
            ],
            "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
        }
    ],
    "Blog CaféMalin": []
};

export const allProducts: Product[] = [
    {
        "id": 2000,
        "name": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT", "nameEn": "COFFEE BEANS LAVAZZA CREMA & AROMA EXPERT",
        "namePart2": "1 KG",
        "price": 19.9,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2001,
        "name": "CAFÉ EN GRAINS DELTA CAFES GOLD 1KG", "nameEn": "COFFEE BEANS DELTA CAFES GOLD 1KG",
        "namePart2": "",
        "price": 25.5,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2002,
        "name": "CAFÉ EN GRAINS DELTA PLATINUM 1 KG", "nameEn": "COFFEE BEANS DELTA PLATINUM 1 KG",
        "namePart2": "",
        "price": 26.5,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2003,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 57.89,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2004,
        "name": "CAFÉ EN GRAIN COVIM", "nameEn": "COFFEE BEANS COVIM",
        "namePart2": "GRANBAR",
        "price": 15.5,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2005,
        "name": "20KG", "nameEn": "20KG",
        "namePart2": "CAFÉ EN GRAINS DELTA CAFES GOLD",
        "price": 0,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2006,
        "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
        "namePart2": "BIO COFFEE 1KG",
        "price": 18.8,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2007,
        "name": "6KG", "nameEn": "6KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 108.62,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2008,
        "name": "5KG", "nameEn": "5KG",
        "namePart2": "CAFÉ EN GRAINS DELTA CAFÉS GRAN CREMA",
        "price": 0,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2009,
        "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
        "namePart2": "COLOMBIA 500G",
        "price": 14.8,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2010,
        "name": "DELTA CAFÉS EN GRAIN", "nameEn": "DELTA CAFÉS EN GRAIN",
        "namePart2": "BRAZIL 500G",
        "price": 13.75,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2011,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "GASTRONOMIQUE",
        "price": 4.9,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2012,
        "name": "PACK 6KG", "nameEn": "PACK 6KG",
        "namePart2": "CAFÉ EN GRAIN BRISTOT CLASSICO INTENSO E CREMOSO",
        "price": 101.85,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2013,
        "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
        "namePart2": "3×1 KG",
        "price": 62.57,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2014,
        "name": "20KG CAFÉ EN GRAINS CREMA ET AROMA", "nameEn": "20KG COFFEE BEANS CREMA ET AROMA",
        "namePart2": "LAVAZZA",
        "price": 480.87,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2015,
        "name": "KIMBO SUPERIOR BLEND", "nameEn": "KIMBO SUPERIOR BLEND",
        "namePart2": "CAFÉ EN GRAIN 1KG",
        "price": 16.3,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2016,
        "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 6X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 6X1KG",
        "namePart2": "",
        "price": 162.68,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2017,
        "name": "CAFÉ EN GRAINS BRISTOT AMERICANO DARK ROAST 12X1KG", "nameEn": "COFFEE BEANS BRISTOT AMERICANO DARK ROAST 12X1KG",
        "namePart2": "",
        "price": 318.65,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 2018,
        "name": "CAFÉ EN GRAINS LAVAZZA CREMA CLASSICA 3KG", "nameEn": "COFFEE BEANS LAVAZZA CREMA CLASSICA 3KG",
        "namePart2": "",
        "price": 64,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3000,
        "name": "CAFÉ MOULU 250G GOLD", "nameEn": "GROUND COFFEE 250G GOLD",
        "namePart2": "DELTA",
        "price": 5.9,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3001,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "PRESTIGE",
        "price": 4.9,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3002,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "DÉGUSTATION",
        "price": 4.9,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 3003,
        "name": "CAFÉ MOULU 250G MÉO", "nameEn": "GROUND COFFEE 250G MÉO",
        "namePart2": "GASTRONOMIQUE",
        "price": 4.9,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4000,
        "name": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA PASSIONALE A MODO MIO X16 CAPSULES",
        "namePart2": "",
        "price": 6.2,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4001,
        "name": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES", "nameEn": "LAVAZZA SOAVE A MODO MIO X16 CAPSULES",
        "namePart2": "",
        "price": 6.2,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4002,
        "name": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES", "nameEn": "LAVAZZA CREMA AROMA GRAN ESPRESSO POINT X100 CAPSULES",
        "namePart2": "",
        "price": 28.7,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4003,
        "name": "DELTA Q QHARACTER N°9", "nameEn": "DELTA Q QHARACTER N°9",
        "namePart2": "10 CAPSULES",
        "price": 3.45,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4004,
        "name": "PACK CAPSULES LAVAZZA BLUE", "nameEn": "PACK CAPSULES LAVAZZA BLUE",
        "namePart2": "",
        "price": 5,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4005,
        "name": "LAVAZZA BLUE RICCO", "nameEn": "LAVAZZA BLUE RICCO",
        "namePart2": "X100 CAPSULES",
        "price": 32,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4006,
        "name": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM RISTRETTO COMPATIBLES NESPRESSO®",
        "namePart2": "LAVAZZA",
        "price": 26.34,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4007,
        "name": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT DEK DÉCAFEINÉ X100 CAPSULES",
        "namePart2": "",
        "price": 32.77,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4008,
        "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
        "namePart2": "",
        "price": 128.08,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4009,
        "name": "DELTA Q COLOMBIA", "nameEn": "DELTA Q COLOMBIA",
        "namePart2": "10 CAPSULES",
        "price": 4.4,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4010,
        "name": "DELTA Q VIETNAM", "nameEn": "DELTA Q VIETNAM",
        "namePart2": "10 CAPSULES",
        "price": 4.4,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4011,
        "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
        "namePart2": "40 CAPSULES",
        "price": 14.65,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4012,
        "name": "DELTA Q QHARISMA N°12", "nameEn": "DELTA Q QHARISMA N°12",
        "namePart2": "40 CAPSULES",
        "price": 11.3,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4013,
        "name": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES", "nameEn": "CARTE NOIRE COMPATIBLE NESPRESSO ESPRESSO N°7 CLASSIQUE X30 CAPSULES",
        "namePart2": "",
        "price": 9.7,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4014,
        "name": "DELTA Q MENTHE CHOCOLAT", "nameEn": "DELTA Q MENTHE CHOCOLAT",
        "namePart2": "10 CAPSULES",
        "price": 3.65,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4015,
        "name": "DELTA Q", "nameEn": "DELTA Q",
        "namePart2": "PACK DÉCOUVERTE",
        "price": 8.08,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4016,
        "name": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES", "nameEn": "LAVAZZA ESPRESSO POINT BEVANDA BIANCA LAIT X50 CAPSULES",
        "namePart2": "",
        "price": 14.78,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4017,
        "name": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES", "nameEn": "KIT MACHINE LAVAZZA BLUE LB900 + 200 CAPSULES",
        "namePart2": "",
        "price": 5,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4018,
        "name": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES", "nameEn": "KIT MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES",
        "namePart2": "",
        "price": 5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4019,
        "name": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®", "nameEn": "100 CAPSULES ALUMINIUM DECAF COMPATIBLES NESPRESSO®",
        "namePart2": "LAVAZZA",
        "price": 27.63,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4020,
        "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
        "namePart2": "10 CAPSULES LUNGO",
        "price": 2.55,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4021,
        "name": "DELTA Q QALIDUS N°10", "nameEn": "DELTA Q QALIDUS N°10",
        "namePart2": "PACK 10X10 CAPSULES",
        "price": 0,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4022,
        "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
        "namePart2": "",
        "price": 5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4023,
        "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION COLOMBIE",
        "namePart2": "18 UNITÉS",
        "price": 8.79,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4024,
        "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION INDIA",
        "namePart2": "18 UNITÉS",
        "price": 8.79,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4025,
        "name": "KIMBO COMPATIBLE MODO MIO", "nameEn": "KIMBO COMPATIBLE MODO MIO",
        "namePart2": "CAPRI",
        "price": 16,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4026,
        "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES CLASSICO LUNGO",
        "namePart2": "18 DOSETTES",
        "price": 8.05,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4027,
        "name": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA", "nameEn": "CAPSULES ILLY IPERESPRESSO ARABICA SELECTION GUATEMALA",
        "namePart2": "18 UNITÉS",
        "price": 8.79,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4028,
        "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES",
        "namePart2": "",
        "price": 5,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4029,
        "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES DÉCAFÉINÉ",
        "namePart2": "18 DOSETTES",
        "price": 8.05,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4030,
        "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 + 200 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4031,
        "name": "BRISTOT COMPATIBLES NESPRESSO®", "nameEn": "BRISTOT COMPATIBLES NESPRESSO®",
        "namePart2": "10X10 CAPSULES LUNGO",
        "price": 0,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4032,
        "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4033,
        "name": "KIMBO COMPATIBLE NESPRESSO", "nameEn": "KIMBO COMPATIBLE NESPRESSO",
        "namePart2": "NAPOLI",
        "price": 0,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 4034,
        "name": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE", "nameEn": "DOSETTES ESPRESSO ILLY E.S.E MONODOSES FORTE",
        "namePart2": "180 DOSETTES",
        "price": 0,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5000,
        "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
        "namePart2": "LAVAZZA BLUE LB900 COMPACT",
        "price": 199,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5001,
        "name": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE", "nameEn": "GROSSE OFFRE : 120 CAPSULES DELTA Q + MACHINE DELTA Q MINI QOOL GRIS OFFERTE",
        "namePart2": "",
        "price": 128.08,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5002,
        "name": "MACHINE À CAFÉ", "nameEn": "MACHINE À CAFÉ",
        "namePart2": "LAVAZZA BLUE LB1050 CLASSY MILK",
        "price": 239,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5003,
        "name": "MACHINE À CAFÉ LAVAZZA A MODO MIO", "nameEn": "MACHINE À CAFÉ LAVAZZA A MODO MIO",
        "namePart2": "JOLIE PLUS SILVER",
        "price": 119,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5004,
        "name": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE À CAFÉ LAVAZZA BLUE LB1050 CLASSY MILK + 200 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5005,
        "name": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSOIRES", "nameEn": "KIT COMPLET MACHINE LAVAZZA ESPRESSO POINT EP MINI + 200 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5006,
        "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
        "namePart2": "NOIR",
        "price": 199.5,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5007,
        "name": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1", "nameEn": "MACHINE À CAPSULES ILLY IPERESPRESSO HOME X7.1",
        "namePart2": "ROUGE",
        "price": 199.5,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5008,
        "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
        "namePart2": "INOX",
        "price": 699,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 5009,
        "name": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE", "nameEn": "MACHINE À CAFÉ ILLY IPERESPRESSO X1 ANNIVERSARY ECO MODE",
        "namePart2": "ROUGE",
        "price": 699,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6000,
        "name": "6KG", "nameEn": "6KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 108.62,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6001,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAINS LAVAZZA CREMA & AROMA EXPERT",
        "price": 57.89,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6002,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAINS GOLD SELECTION",
        "price": 84.38,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6003,
        "name": "3KG LAVAZZA CREMA CLASSICA", "nameEn": "3KG LAVAZZA CREMA CLASSICA",
        "namePart2": "",
        "price": 64,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6004,
        "name": "PACK CAPSULES LAVAZZA NESPRESSO", "nameEn": "PACK CAPSULES LAVAZZA NESPRESSO",
        "namePart2": "",
        "price": 5,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6005,
        "name": "PACK CAFÉ EN GRAIN ORIGINE", "nameEn": "PACK COFFEE BEANS ORIGINE",
        "namePart2": "DELTA CAFÉS",
        "price": 27.9,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6006,
        "name": "3KG", "nameEn": "3KG",
        "namePart2": "CAFÉ EN GRAIN PRONTO CREMA LAVAZZA",
        "price": 57.89,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6007,
        "name": "CAFÉ EN GRAIN ESPRESSO MIX", "nameEn": "COFFEE BEANS ESPRESSO MIX",
        "namePart2": "6×1 KG",
        "price": 122.55,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6008,
        "name": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA BLUE 1000 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6009,
        "name": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 600 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 32,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6010,
        "name": "ILLY COMPATIBLES NESPRESSO®", "nameEn": "ILLY COMPATIBLES NESPRESSO®",
        "namePart2": "10×10 CAPSULES CLASSICO LUNGO",
        "price": 44.52,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 6011,
        "name": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSOIRES", "nameEn": "KIT LAVAZZA POINT 300 CAPSULES + ACCESSORIES",
        "namePart2": "",
        "price": 5,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7000,
        "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
        "namePart2": "1KG",
        "price": 8.44,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7001,
        "name": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE SANS SUCRE",
        "namePart2": "RÉGILAIT",
        "price": 7.5,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7002,
        "name": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG", "nameEn": "BOISSON AU THÉ CITRON SOLUBLE SATRO 1KG",
        "namePart2": "VENDING",
        "price": 8,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 7003,
        "name": "LAIT ÉCRÉMÉ EN POUDRE", "nameEn": "LAIT ÉCRÉMÉ EN POUDRE",
        "namePart2": "PROLAIT",
        "price": 12,
        "intensity": 6,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8000,
        "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
        "namePart2": "1KG",
        "price": 8.44,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8001,
        "name": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES", "nameEn": "LAVAZZA EXPERT CAPPUCCINO CLASSIQUE X10 DOSES",
        "namePart2": "",
        "price": 3.8,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8002,
        "name": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES", "nameEn": "LAVAZZA BLUE CIOCCOLATO FONDENTE CHOCOLAT X50 CAPSULES",
        "namePart2": "",
        "price": 17.5,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8003,
        "name": "CAPPUCINO VANILLE", "nameEn": "CAPPUCINO VANILLE",
        "namePart2": "1KG",
        "price": 8.44,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8004,
        "name": "THÉ AU CITRON INSTANTANÉ RISTORA", "nameEn": "THÉ AU CITRON INSTANTANÉ RISTORA",
        "namePart2": "1KG",
        "price": 5.49,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 8005,
        "name": "CHOCOLAT INSTANTANÉ RISTORA", "nameEn": "CHOCOLAT INSTANTANÉ RISTORA",
        "namePart2": "10X1KG",
        "price": 93.05,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9000,
        "name": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "4 OZ (12CL) GOBELETS EN CARTON CAFEMALIN X50",
        "namePart2": "",
        "price": 1.5,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9001,
        "name": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500", "nameEn": "SUCRE BÛCHETTE 4GR SAINT LOUIS X500",
        "namePart2": "",
        "price": 10.9,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9002,
        "name": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)", "nameEn": "AGITATEUR CAFÉ EN BOIS (1000 PIÈCES)",
        "namePart2": "",
        "price": 6,
        "intensity": 9,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9003,
        "name": "SUCRE BÛCHETTE 4GR LAVAZZA X200", "nameEn": "SUCRE BÛCHETTE 4GR LAVAZZA X200",
        "namePart2": "",
        "price": 6.19,
        "intensity": 4,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9004,
        "name": "6.5 OZ (20CL) GOBELET CAFEMALIN X50", "nameEn": "6.5 OZ (20CL) GOBELET CAFEMALIN X50",
        "namePart2": "",
        "price": 1.92,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9005,
        "name": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50", "nameEn": "8 OZ (24CL) GOBELETS EN CARTON CAFEMALIN X50",
        "namePart2": "",
        "price": 2.04,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9006,
        "name": "SOUS", "nameEn": "SOUS",
        "namePart2": "LOT DE 12 POUR TASSES ESPRESSO 70 ML",
        "price": 30,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9007,
        "name": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST", "nameEn": "CARTOUCHE FILTRE BRITA PURITY C150 QUELL ST",
        "namePart2": "",
        "price": 72,
        "intensity": 5,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 9008,
        "name": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST", "nameEn": "CARTOUCHE FILTRANTE BRITA PURITY C500 FINEST",
        "namePart2": "",
        "price": 162,
        "intensity": 8,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 10000,
        "name": "LAVAZZA AMANDE CACAOTÉE", "nameEn": "LAVAZZA AMANDE CACAOTÉE",
        "namePart2": "500 CHOCOLATS",
        "price": 39,
        "intensity": 10,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 10001,
        "name": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL", "nameEn": "LAVAZZA SPECULOOS 400 BISCUITS EMBALLAGE INDIVIDUEL",
        "namePart2": "",
        "price": 25.98,
        "intensity": 11,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=800&auto=format&fit=crop"
    },
    {
        "id": 10002,
        "name": "200 PETITES GALETTES PUR BEURRE", "nameEn": "200 PETITES GALETTES PUR BEURRE",
        "namePart2": "ST MICHEL",
        "price": 21.05,
        "intensity": 7,
        "brewSizes": [
            "Espresso",
            "Lungo"
        ],
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
    }
];
