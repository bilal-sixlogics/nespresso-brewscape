"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { Endpoints } from "@/lib/api/endpoints";
import type { Brand } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

interface OriginBrand {
    slug: string | null;
    name: string;
    country: string;
    historyKey: string;
}

const ORIGIN_BRANDS: OriginBrand[] = [
    {
        slug: "bristot",
        name: "Bristot",
        country: "Italy",
        historyKey: "originBristot",
    },
    {
        slug: "lavazza",
        name: "Lavazza",
        country: "Italy",
        historyKey: "originLavazza",
    },
    {
        slug: "carte-noir",
        name: "Carte Noire",
        country: "France",
        historyKey: "originCarteNoire",
    },
    {
        slug: "covim",
        name: "Covim",
        country: "Italy",
        historyKey: "originCovim",
    },
    {
        slug: "kimbo",
        name: "Kimbo",
        country: "Italy",
        historyKey: "originKimbo",
    },
    {
        slug: null,
        name: "Cafés Mambo",
        country: "Portugal",
        historyKey: "originCafesMambo",
    },
    {
        slug: "ristora",
        name: "Ristora",
        country: "Italy",
        historyKey: "originRistora",
    },
    {
        slug: "prolait",
        name: "Prolait",
        country: "Prontofoods Italian Group (French origin)",
        historyKey: "originProlait",
    },
    {
        slug: "delta",
        name: "Delta Cafés",
        country: "Portugal",
        historyKey: "originDeltaCafes",
    },
];

const LAVAZZA_MACHINE_SYSTEMS: OriginBrand[] = [
    {
        slug: "lavazza-point",
        name: "Lavazza Point",
        country: "Italy",
        historyKey: "originLavazzaSystem1",
    },
    {
        slug: "lavazza-blue",
        name: "Lavazza Blue",
        country: "Italy",
        historyKey: "originLavazzaSystem2",
    },
    {
        slug: "lavazza-a-modo-mio",
        name: "Lavazza A Modo Mio",
        country: "Italy",
        historyKey: "originLavazzaSystem3",
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
                className="text-center font-black uppercase text-ink"
                style={{ fontVariant: "small-caps", letterSpacing: "0.2em", fontSize: size === "large" ? "1.1rem" : "0.7rem" }}
            >
                {name}
            </span>
        </div>
    );
}

export default function OurOriginsPage() {
    const { t } = useLanguage();
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
        <div className="w-full bg-ink text-sand min-h-screen grain-overlay">
            {/* Hero */}
            <section className="bg-ink pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,160,90,0.15),_transparent_60%)] pointer-events-none" />
                <div className="max-w-[900px] mx-auto relative z-10 text-center">
                    <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {t("originHeroEyebrow")}
                    </p>
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-sand mb-6">
                        {t("originHeroHeading1")}<span className="text-gold block">{t("originHeroHeading2")}</span>
                    </h1>
                    <p className="text-sand/60 text-base max-w-2xl mx-auto">
                        {t("originHeroIntro")}
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
                                    <div className="aspect-[4/3] rounded-[24px] bg-sand border border-ink/10 shadow-[0_2px_24px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden">
                                        <BrandLogo logo={logo} name={brand.name} />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <span className="inline-block text-[9px] font-black tracking-[0.3em] uppercase text-gold mb-3">
                                        {brand.country}
                                    </span>
                                    <h2 className="font-display text-3xl sm:text-4xl uppercase mb-4 tracking-tight text-sand">
                                        {brand.name}
                                    </h2>
                                    <p className="text-sand/60 leading-relaxed max-w-xl mx-auto md:mx-0">
                                        {t(brand.historyKey as TranslationKey)}
                                    </p>
                                </div>
                            </div>

                            {/* Lavazza also powers a family of dedicated machine systems */}
                            {isLavazza && (
                                <div className="mt-10 sm:mt-12 pl-0 md:pl-[0px]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Coffee size={14} className="text-gold" />
                                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-cocoa">
                                            {t("originLavazzaSystemsLabel")}
                                        </p>
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-6">
                                        {LAVAZZA_MACHINE_SYSTEMS.map((system) => (
                                            <div key={system.name} className="bg-sand/8 rounded-2xl p-5 border border-sand/10">
                                                <div className="w-full aspect-square rounded-xl bg-sand border border-ink/10 flex items-center justify-center mb-4 overflow-hidden">
                                                    <BrandLogo logo={logos[system.slug!]} name={system.name} size="small" />
                                                </div>
                                                <h3 className="font-display text-lg uppercase mb-2 text-sand">{system.name}</h3>
                                                <p className="text-xs text-sand/60 leading-relaxed">{t(system.historyKey as TranslationKey)}</p>
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
