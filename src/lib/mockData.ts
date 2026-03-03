import { Product } from '@/types';

export const mockProducts: Product[] = [
    {
        id: 1,
        name: "ISPIRAZIONE",
        namePart2: "ARPEGGIO",
        price: 0.75,
        intensity: 9,
        brewSizes: ['Ristretto', 'Espresso'],
        image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "ISPIRAZIONE",
        namePart2: "ROMA",
        price: 0.75,
        intensity: 8,
        brewSizes: ['Ristretto', 'Espresso'],
        image: "https://images.unsplash.com/photo-1587049352843-02fceb38520f?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "BARISTA",
        namePart2: "CHIARO",
        price: 0.85,
        intensity: 6,
        brewSizes: ['Ristretto', 'Espresso'],
        image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "CAPE",
        namePart2: "TOWN ENVIVO",
        price: 0.80,
        intensity: 10,
        brewSizes: ['Espresso', 'Lungo'],
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 5,
        name: "STOCKHOLM",
        namePart2: "LUNGO",
        price: 0.80,
        intensity: 8,
        brewSizes: ['Lungo'],
        image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 6,
        name: "VIENNA",
        namePart2: "LINIZIO",
        price: 0.80,
        intensity: 6,
        brewSizes: ['Lungo'],
        image: "https://images.unsplash.com/photo-1507133750073-10ebdb9fc85d?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 7,
        name: "GENOVA",
        namePart2: "LIVANTO",
        price: 0.75,
        intensity: 6,
        brewSizes: ['Espresso'],
        image: "https://images.unsplash.com/photo-1620640329431-1551bbed96e8?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 8,
        name: "COLOMBIA",
        price: 0.85,
        intensity: 6,
        brewSizes: ['Espresso', 'Lungo'],
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop"
    }
];

// Reusable array to generate many products for testing load-more
export const generateProducts = (category: string, baseId: number, count: number): Product[] => {
    const templates = mockProducts;
    const result: Product[] = [];

    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        result.push({
            ...template,
            id: baseId + i,
            name: `${category.toUpperCase()} ${template.name}`,
            price: +(template.price + ((i % 5) * 0.1)).toFixed(2),
            intensity: template.intensity,
        });
    }
    return result;
};

// Generate 40 products per tab as requested by the user
export const productDatabase = {
    'All Products': [
        ...generateProducts('Mix', 100, 40)
    ],
    'Espresso': [
        ...generateProducts('Espresso', 200, 40)
    ],
    'Blonde': [
        ...generateProducts('Blonde', 300, 40)
    ],
    'Dark Roast': [
        ...generateProducts('Dark', 400, 40)
    ],
    'Decaf': [
        ...generateProducts('Decaf', 500, 40)
    ],
};

export const machinesData: Product[] = [
    { id: 101, name: "VERTUO", namePart2: "POP+", price: 129.00, intensity: 0, brewSizes: ['Espresso', 'Coffee', 'Alto'], image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=400&auto=format&fit=crop" },
    { id: 102, name: "ESSENZA", namePart2: "MINI", price: 179.00, intensity: 0, brewSizes: ['Espresso', 'Lungo'], image: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?q=80&w=400&auto=format&fit=crop" },
    { id: 103, name: "VERTUO", namePart2: "NEXT", price: 179.00, intensity: 0, brewSizes: ['Espresso', 'Coffee', 'Carafe'], image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=400&auto=format&fit=crop" },
    { id: 104, name: "CITIZ", namePart2: "PLATINUM", price: 299.00, intensity: 0, brewSizes: ['Espresso', 'Lungo', 'Americano'], image: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?q=80&w=400&auto=format&fit=crop" }
];

export const accessoriesData: Product[] = [
    { id: 201, name: "AEROCCINO 3", namePart2: "MILK FROTHER", price: 99.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400&auto=format&fit=crop" },
    { id: 202, name: "LUME", namePart2: "MUG SET", price: 29.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=400&auto=format&fit=crop" },
    { id: 203, name: "RECYCLING", namePart2: "BIN", price: 15.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400&auto=format&fit=crop" },
    { id: 204, name: "NOMAD", namePart2: "TRAVEL MUG", price: 35.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=400&auto=format&fit=crop" }
];

export const apparelData: Product[] = [
    { id: 301, name: "BARISTA", namePart2: "APRON", price: 45.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop" },
    { id: 302, name: "TOTE", namePart2: "BAG", price: 25.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop" }
];

export const giftsData: Product[] = [
    { id: 401, name: "DISCOVERY", namePart2: "BOX", price: 55.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop" },
    { id: 402, name: "FESTIVE", namePart2: "ASSORTMENT", price: 42.00, intensity: 0, brewSizes: [], image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop" }
];
