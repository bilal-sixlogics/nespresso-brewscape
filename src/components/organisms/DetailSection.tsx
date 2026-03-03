import React from 'react';
import Image from 'next/image';
import { Typography } from '../atoms/Typography';
import { AccordionItem } from '../molecules/Accordion';

export const DetailSection = () => {
    return (
        <section className="py-32 bg-brand-offwhite relative z-10 w-full overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-center">

                    {/* Image Side */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-[4/5] w-full rounded-[40px] overflow-hidden relative shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=2600&auto=format&fit=crop"
                                alt="Coffee Beans Pouring"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-brand-green/20 mix-blend-multiply transition-opacity hover:opacity-0 duration-500"></div>
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-10 -right-6 md:-right-10 bg-brand-green text-brand-offwhite p-8 rounded-full shadow-2xl w-48 h-48 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-500 hover:rotate-6">
                            <Typography variant="h2" className="leading-none text-brand-offwhite font-black mb-0 pb-0">
                                100%
                            </Typography>
                            <Typography variant="small" className="text-brand-offwhite/90 uppercase font-bold tracking-widest text-center mt-2">
                                Arabica
                            </Typography>
                        </div>
                    </div>

                    {/* Content Side with Accordions */}
                    <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
                        <Typography variant="small" className="uppercase tracking-[0.2em] text-brand-green font-bold mb-4 block">
                            Origin Story
                        </Typography>
                        <Typography variant="h2" className="text-brand-black mb-6">
                            Sustainably Sourced,<br />Masterfully Roasted.
                        </Typography>
                        <Typography variant="body" className="text-brand-black/70 mb-12 text-lg">
                            Every bean tells a story of its origin. We partner directly with farmers to ensure the highest quality while maintaining strict sustainability standards.
                        </Typography>

                        <div className="w-full border-t border-brand-beige">
                            <AccordionItem title="Aromatic Profile" defaultOpen>
                                A complex and vibrant profile with distinct notes of wild berries and a subtle cocoa finish. The light roast preserves the delicate floral properties of the bean.
                            </AccordionItem>
                            <AccordionItem title="Roasting Process">
                                We use a split-roasting technique. One part is roasted lighter and shorter to reveal the floral notes, while the second part is roasted longer and darker to add body and character.
                            </AccordionItem>
                            <AccordionItem title="Sustainability Impact">
                                100% of this coffee comes from AAA Sustainable Quality™ Program farms. By purchasing this capsule, you're contributing to pension funds for farmers in Colombia.
                            </AccordionItem>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
