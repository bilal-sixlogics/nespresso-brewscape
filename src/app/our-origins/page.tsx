"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { Endpoints } from "@/lib/api/endpoints";
import type { Brand } from "@/types";

interface OriginBrand {
    slug: string | null;
    name: string;
    country: string;
    history: string;
}

const ORIGIN_BRANDS: OriginBrand[] = [
    {
        slug: "bristot",
        name: "Bristot",
        country: "Italy",
        history:
            "Founded in 1919 in Belluno, Italy, Bristot is a historic roasting house that continues the tradition of Italian espresso. Thanks to its expertise in coffee selection and blending, the brand offers blends with rich and balanced aromatic profiles, suited to discerning coffee lovers.",
    },
    {
        slug: "lavazza",
        name: "Lavazza",
        country: "Italy",
        history:
            "Founded in Turin in 1895 by Luigi Lavazza, the brand has become a global reference in coffee. Its expertise is based on the art of blending coffees from the world's main producing regions to create unique aromatic profiles faithful to the Italian tradition.",
    },
    {
        slug: "carte-noir",
        name: "Carte Noire",
        country: "France",
        history:
            "Created in France in 1978, Carte Noire has established itself as an iconic premium coffee brand. Known for its elegant and aromatic coffees, it now offers a range of whole-bean, ground, capsule and pod coffees. Since 2016, the brand has been part of the Italian Lavazza Group.",
    },
    {
        slug: "covim",
        name: "Covim",
        country: "Italy",
        history:
            "Based in Genoa, Covim is an Italian company specialising in coffee roasting. Building on expertise developed over several decades, the brand offers blends inspired by the Italian espresso tradition, for both individuals and professionals.",
    },
    {
        slug: "kimbo",
        name: "Kimbo",
        country: "Italy",
        history:
            "Born in Naples, Italy, Kimbo is an iconic brand of Neapolitan espresso. Its story began in the 1960s with the Rubino brothers, who founded Cafè do Brasil S.p.A. in 1963, the company behind the Kimbo brand.",
    },
    {
        slug: null,
        name: "Cafés Mambo",
        country: "Portugal",
        history:
            "Originally from Portugal, Cafés Mambo perpetuates the Portuguese coffee culture through a selection of coffees suited to different moments of enjoyment. The brand offers balanced blends designed to provide an authentic coffee experience for both individuals and professionals.",
    },
    {
        slug: "ristora",
        name: "Ristora",
        country: "Italy",
        history:
            "Created by the Italian Prontofoods Group, Ristora is a brand specialising in instant beverage preparations and professional solutions. Its range includes coffee, cappuccino, chocolate and indulgent preparations designed for vending machines and professional environments.",
    },
    {
        slug: "prolait",
        name: "Prolait",
        country: "Prontofoods Italian Group (French origin)",
        history:
            "Created in France, Prolait is a brand specialising in dairy preparations for coffee professionals and indulgent beverage solutions. Integrated into the Italian Prontofoods Group since 2009, Prolait now benefits from the expertise of a recognised player in professional beverage solutions. The brand offers preparations suitable for automatic machines, enabling the preparation of cappuccinos, café au lait and other milk-based specialities with a smooth texture and consistent quality.",
    },
    {
        slug: "delta",
        name: "Delta Cafés",
        country: "Portugal",
        history:
            "Founded in 1961, Delta Cafés began in a modest warehouse before becoming Portugal's most iconic coffee brand. Faithful to the Portuguese roasting tradition, it combines artisanal expertise with technical excellence to offer coffees with a distinctive character, backed by decades of expertise and a strong connection to Iberian coffee culture.",
    },
];

const LAVAZZA_MACHINE_SYSTEMS: OriginBrand[] = [
    {
        slug: "lavazza-point",
        name: "Lavazza Point",
        country: "Italy",
        history:
            "One of Lavazza's earliest single-serve systems, Espresso Point was created for professional and office environments — bringing consistent, barista-style espresso to the workplace long before capsule coffee became mainstream.",
    },
    {
        slug: "lavazza-blue",
        name: "Lavazza Blue",
        country: "Italy",
        history:
            "Launched in 2004, Lavazza BLUE is the brand's professional capsule system, designed for offices and the food service industry. It pairs dedicated machines with a wide range of blends to deliver quality espresso at scale.",
    },
    {
        slug: "lavazza-a-modo-mio",
        name: "Lavazza A Modo Mio",
        country: "Italy",
        history:
            "Introduced in 2008, A Modo Mio brought Lavazza's capsule expertise into the home. Compact, simple machines paired with a dedicated capsule range make authentic Italian espresso accessible for everyday use.",
    },
];

function BrandLogo({ logo, name, size = "large" }: { logo?: string | null; name: string; size?: "large" | "small" }) {
    const dims = size === "large" ? "w-full h-full p-8 sm:p-10" : "w-full h-full p-5";
    return logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className={`${dims} object-contain`} />
    ) : (
        <div className="w-full h-full flex items-center justify-center px-4">
            <span
                className="text-center font-black uppercase text-gray-700"
                style={{ fontVariant: "small-caps", letterSpacing: "0.2em", fontSize: size === "large" ? "1.1rem" : "0.7rem" }}
            >
                {name}
            </span>
        </div>
    );
}

export default function OurOriginsPage() {
    const [logos, setLogos] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(Endpoints.brands)
            .then((r) => r.json())
            .then((json) => {
                const list: Brand[] = Array.isArray(json) ? json : json?.data ?? [];
                const map: Record<string, string> = {};
                list.forEach((b) => {
                    if (b.logo) map[b.slug] = b.logo;
                });
                setLogos(map);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* Hero */}
            <section className="bg-sb-black pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.2),_transparent_60%)] pointer-events-none" />
                <div className="max-w-[900px] mx-auto relative z-10 text-center">
                    <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        Our Heritage
                    </p>
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-white mb-6">
                        Discover Our<span className="text-sb-green block">Origins</span>
                    </h1>
                    <p className="text-white/50 text-base max-w-2xl mx-auto">
                        At Cafrezzo, we have chosen coffee brands recognised for their expertise, history and
                        commitment to quality. Each brand has a unique identity, inspired by European coffee
                        traditions and the world&apos;s major coffee-producing regions.
                    </p>
                </div>
            </section>

            {/* Brand stories */}
            <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 space-y-14 sm:space-y-20">
                {ORIGIN_BRANDS.map((brand, idx) => {
                    const logo = brand.slug ? logos[brand.slug] : null;
                    const reversed = idx % 2 === 1;
                    const isLavazza = brand.slug === "lavazza";

                    return (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-14`}>
                                <div className="w-full md:w-[280px] flex-shrink-0">
                                    <div className="aspect-[4/3] rounded-[24px] bg-white border border-gray-100 shadow-[0_2px_24px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden">
                                        <BrandLogo logo={logo} name={brand.name} />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <span className="inline-block text-[9px] font-black tracking-[0.3em] uppercase text-sb-green mb-3">
                                        {brand.country}
                                    </span>
                                    <h2 className="font-display text-3xl sm:text-4xl uppercase mb-4 tracking-tight">
                                        {brand.name}
                                    </h2>
                                    <p className="text-gray-500 leading-relaxed max-w-xl mx-auto md:mx-0">
                                        {brand.history}
                                    </p>
                                </div>
                            </div>

                            {/* Lavazza also powers a family of dedicated machine systems */}
                            {isLavazza && (
                                <div className="mt-10 sm:mt-12 pl-0 md:pl-[0px]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Coffee size={14} className="text-sb-green" />
                                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-gray-400">
                                            Lavazza Machine Systems
                                        </p>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-6">
                                        {LAVAZZA_MACHINE_SYSTEMS.map((system) => (
                                            <div key={system.name} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                                <div className="w-full aspect-square rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                                                    <BrandLogo logo={logos[system.slug!]} name={system.name} size="small" />
                                                </div>
                                                <h3 className="font-display text-lg uppercase mb-2">{system.name}</h3>
                                                <p className="text-xs text-gray-500 leading-relaxed">{system.history}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </section>
        </div>
    );
}
