import React from 'react';
import { Typography } from '../atoms/Typography';
import { ProductCard } from './ProductCard';

const MOCK_PRODUCTS = [
    {
        id: '1',
        title: 'Bianco Piccolo',
        intensity: 5,
        price: 0.85,
        cupSize: 'espresso' as const,
        imageUrl: 'https://www.nespresso.com/ecom/medias/sys_master/public/15509930901534/C-0368-BiancoPiccolo-OL-2000x2000.png',
    },
    {
        id: '2',
        title: 'Melozio',
        intensity: 6,
        price: 1.15,
        cupSize: 'vertuo' as const,
        imageUrl: 'https://www.nespresso.com/ecom/medias/sys_master/public/13442656370718/C-0402-Melozio-VL-2000x2000.png',
    },
    {
        id: '3',
        title: 'Double Espresso Chiaro',
        intensity: 8,
        price: 1.05,
        cupSize: 'lungo' as const,
        imageUrl: 'https://www.nespresso.com/ecom/medias/sys_master/public/13442656960542/C-0406-DoubleEspressoChiaro-VL-2000x2000.png',
    },
    {
        id: '4',
        title: 'Ispirazione Palermo Kazaar',
        intensity: 12,
        price: 0.90,
        cupSize: 'espresso' as const,
        imageUrl: 'https://www.nespresso.com/ecom/medias/sys_master/public/15509929558046/C-0371-IspirazionePalermoKazaar-OL-2000x2000.png',
    }
];

export const NewArrivals = () => {
    return (
        <section className="py-24 bg-white relative z-10 w-full">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                    <div className="mb-8 md:mb-0">
                        <Typography variant="h2" className="text-brand-black mb-4">
                            New Arrivals
                        </Typography>
                        <Typography variant="body" className="text-brand-black/70 max-w-xl">
                            Discover the latest additions to our collection. Masterfully roasted to perfection for your morning ritual.
                        </Typography>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['All', 'Espresso', 'Lungo', 'Vertuo', 'Decaf'].map((filter, index) => (
                            <button
                                key={filter}
                                className={`py-2 px-5 rounded-full border text-sm font-semibold transition-colors duration-300 ${index === 0
                                        ? 'bg-brand-black text-white border-brand-black'
                                        : 'border-brand-beige text-brand-black hover:bg-brand-black hover:text-white hover:border-brand-black'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MOCK_PRODUCTS.map(product => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
};
