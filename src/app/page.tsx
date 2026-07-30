"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppConfig } from "@/lib/config";
import { ArrowRight, Leaf, Award } from "lucide-react";

import { ProductCard } from "@/components/ui/ProductCard";
import { ProductDetailPanel } from "@/components/ui/ProductDetailPanel";
import { MobileCarousel } from "@/components/ui/MobileCarousel";
import { TestimonialsSection } from '@/components/ui/TestimonialsSection';
import { useLanguage } from "@/context/LanguageContext";
import { Product, getProductImage } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { ProductSkeleton } from "@/components/ui/ProductSkeleton";
import { Endpoints } from "@/lib/api/endpoints";

interface ApiBrand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

function BrandsMarqueeSection() {
  const { language } = useLanguage();
  const [apiBrands, setApiBrands] = useState<ApiBrand[]>([]);

  useEffect(() => {
    fetch(Endpoints.featuredBrands)
      .then(r => r.json())
      .then(json => {
        const data: ApiBrand[] = Array.isArray(json) ? json : (json?.data ?? []);
        if (data.length > 0) setApiBrands(data);
      })
      .catch(() => { /* keep empty, fallback renders nothing */ });
  }, []);


  return (
    <section className="bg-ink py-12 relative overflow-hidden grain-overlay">
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(ellipse_at_50%_50%,_#C9A05A,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-6 sm:mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-px bg-gold/40" />
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-sand/50">
                {language === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-sand uppercase leading-tight">
              {language === 'fr' ? 'Marques de Confiance' : 'Trusted Brands'}
            </h2>
          </div>
          <p className="text-sand/60 text-xs max-w-xs leading-relaxed">
            {language === 'fr'
              ? 'Les grandes marques du café, toutes réunies sur notre plateforme.'
              : 'World-renowned coffee brands, all available on our platform.'}
          </p>
        </div>
      </div>

      {apiBrands.length > 0 && (() => {
        // Duplicate brands enough times so each track fills at least the viewport width.
        // Each card is ~212px (w-48 + gap-5 = 192+20). For 1600px viewport we need ceil(1600/212) ≈ 8 items per track.
        const itemWidth = 212;
        const minItemsPerTrack = Math.max(apiBrands.length, Math.ceil(1600 / itemWidth) + 1);
        const repeatCount = Math.ceil(minItemsPerTrack / apiBrands.length);
        const filledBrands: ApiBrand[] = [];
        for (let r = 0; r < repeatCount; r++) filledBrands.push(...apiBrands);

        return (
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-ink to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-ink to-transparent" />

          {/* Two identical tracks: each track is 50% of total width. Animation moves -50% for seamless loop. */}
          <div className="flex marquee-track">
            {[0, 1].map(trackIdx => (
              <div key={trackIdx} className="flex gap-5 shrink-0 pr-5" aria-hidden={trackIdx === 1}>
                {filledBrands.map((brand, i) => (
                  <div
                    key={`${trackIdx}-${i}`}
                    className="shrink-0 w-48 h-24 rounded-2xl bg-sand shadow-[0_2px_20px_rgba(0,0,0,0.25)] flex items-center justify-center group hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all duration-500 cursor-pointer overflow-hidden relative border border-sand/60"
                  >
                    {brand.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain p-5 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Premium typographic fallback — luxury brand wordmark style */}
                    <div
                      className="absolute inset-0 flex items-center justify-center px-4"
                      style={{ display: brand.logo ? 'none' : 'flex' }}
                    >
                      <span
                        className="text-[13px] font-black uppercase tracking-[0.25em] text-ink text-center leading-snug group-hover:text-gold transition-colors duration-500"
                        style={{ fontVariant: 'small-caps', letterSpacing: brand.name.length > 10 ? '0.15em' : '0.25em' }}
                      >
                        {brand.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        );
      })()}
    </section>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products: featuredProducts, isLoading: featuredLoading } = useProducts({ featured: true, per_page: 20 });

  // Daily pick — fetched from admin-configured section config
  const [dailyPick, setDailyPick] = useState<{ product: Product | null; label: string | null }>({ product: null, label: null });
  useEffect(() => {
    fetch(Endpoints.dailyPick)
      .then(r => r.json())
      .then(json => {
        if (json?.data) {
          setDailyPick({ product: json.data, label: json.label || null });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct]);

  return (
    <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
      <motion.div
        key="home"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      >

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative w-full pt-16 pb-12 sm:pb-20 lg:pb-32 z-10 overflow-visible min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] flex flex-col justify-center">
          {/* Coffee Beans Decoration */}

          <div
            className="absolute left-0 top-0 bottom-0 w-[300px] lg:w-[500px] pointer-events-none z-0"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at left center, black 20%, transparent 70%)',
              maskImage: 'radial-gradient(ellipse at left center, black 20%, transparent 70%)'
            }}
          >
            <img src="/coffee-beans.png" alt="" className="w-full h-full object-cover opacity-30" />
          </div>

          <div className="max-w-[1700px] mx-auto px-4 sm:px-8 relative mb-6 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center items-center w-full relative z-0 mt-8 mb-4"
            >
              <img
                src="/assets/logo.svg"
                alt={AppConfig.brand.name}
                className="w-[80vw] sm:w-[78vw] lg:w-[75vw] xl:w-[72rem] opacity-[0.97]"
              />
            </motion.div>

            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end -mt-10 sm:-mt-16 lg:-mt-40 xl:-mt-52 relative z-10 w-full px-4 lg:px-12">

              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start mb-6 lg:mb-0 space-y-4 sm:space-y-6">
             

                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-sand/60 max-w-[280px] text-sm leading-relaxed z-10 relative"
                >
                  {t('heroSubtitle')}
                </motion.p>
              </div>

              {/* HERO CUP AND GLOW - Cup floats over a soft gold glow instead of a flat color circle */}
              <div className="w-full lg:w-1/3 flex justify-center items-center relative z-[40] mt-2 sm:mt-4 lg:mt-0 h-[260px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
                {/* Gold ambient glow — BEHIND the cup (z-1) */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                  className="absolute left-1/2 transform -translate-x-1/2 rounded-full z-[1] w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:h-[380px] md:w-[380px] lg:w-[460px] lg:h-[460px] blur-2xl"
                  style={{
                    top: '50%',
                    marginTop: '-60px',
                    background: 'radial-gradient(circle, rgba(201,160,90,0.45) 0%, rgba(201,160,90,0.15) 55%, transparent 75%)',
                  }}
                />
                {/* The Cup - ABOVE the glow (z-2), transparent PNG floating */}
                <motion.img
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  src="/cup5.png"
                  alt="Iced Coffee Cup"
                  className="absolute left-1/2 transform -translate-x-1/2 z-[2] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] w-[150px] sm:w-[210px] md:w-[250px] lg:w-[460px] h-auto top-[50px] sm:top-[40px] lg:top-[80px]"
                />
              </div>

              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end mb-6 lg:mb-0 space-y-5 sm:space-y-8 z-[50]">
                <motion.div
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                  onClick={() => setSelectedProduct(dailyPick.product || featuredProducts[0] || null)}
                  className="flex items-center space-x-6 mr-4 bg-sand/8 backdrop-blur-md p-4 rounded-3xl border border-sand/15 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] group cursor-pointer hover:bg-sand/14 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] transition-all duration-300"
                >
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-sm tracking-wide text-sand group-hover:text-gold transition-colors">{dailyPick.label || t('dailyPick')}</span>
                    <span className="text-xs text-sand/50 max-w-[120px] truncate">{dailyPick.product?.name || ' '}</span>
                  </div>
                  <div className="w-16 h-20 bg-[#E1CDA4] rounded-xl p-1 relative shadow-inner transform group-hover:rotate-12 transition-transform duration-500 overflow-hidden">
                    <div className="w-full h-full border border-ink/10 rounded-lg"></div>
                    {dailyPick.product && getProductImage(dailyPick.product) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getProductImage(dailyPick.product)!} alt={dailyPick.product.name} className="w-full h-full object-cover absolute top-0 left-0 scale-[0.8] drop-shadow-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 text-2xl">☕</div>
                    )}
                  </div>
                </motion.div>

                <Link href="/shop" className="inline-block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05, backgroundColor: "#b8914d" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gold text-ink px-10 py-5 rounded-full text-xs font-bold tracking-[0.2em] uppercase shadow-xl hover:shadow-gold/50 transition-all duration-300 flex items-center cursor-pointer"
                  >
                    {t('shopNow')}
                    <div className="w-1.5 h-1.5 ml-3 bg-ink rounded-full"></div>
                  </motion.div>
                </Link>
                <Link
                  href="/orders/track"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-sand/60 hover:text-gold transition-colors underline underline-offset-4"
                >
                  {t('footerTrackOrder')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── STORY / CRAFT SECTION ─────────────────────────────────────── */}
        <section className="relative bg-ink overflow-hidden grain-overlay">
          {/* Full-bleed background image with dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format&fit=crop"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/40" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

              {/* Left — text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
                className="w-full lg:w-1/2"
              >
                <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold text-[9px] font-black tracking-[0.4em] uppercase px-4 py-2 rounded-full mb-8">
                  <Leaf size={10} />
                  {language === 'fr' ? "L'esprit Cafrezzo" : 'The Cafrezzo Spirit'}
                </div>

                <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-sand uppercase leading-[0.85] tracking-tight mb-8">
                  {language === 'fr' ? (
                    <><span className="text-gold">Le café</span><br />créateur de<br />moments</>
                  ) : (
                    <><span className="text-gold">Coffee</span><br />the creator of<br />moments</>
                  )}
                </h2>

                <p className="text-sand/60 text-base lg:text-lg leading-relaxed max-w-md mb-10">
                  {language === 'fr'
                    ? 'Chaque détail compte. De la sélection des produits au service client, nous mettons notre passion pour le café au cœur de chaque expérience.'
                    : 'Every detail matters. From product selection to customer support, we put our passion for coffee at the heart of every experience.'}
                </p>

                {/* Pillar stats */}
                {/* <div className="flex gap-8 mb-12">
                  {[
                    { num: '46+', label: language === 'fr' ? 'Ans d\'expertise' : 'Years of expertise' },
                    { num: '84', label: language === 'fr' ? 'Pays servis' : 'Countries served' },
                    { num: '100%', label: language === 'fr' ? 'Durable' : 'Sustainable' },
                  ].map((s) => (
                    <div key={s.num}>
                      <div className="font-display text-3xl text-white">{s.num}</div>
                      <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                  ))}
                </div> */}

                <Link
                  href="/our-origins"
                  className="inline-flex items-center gap-3 text-gold border border-gold/40 hover:border-gold hover:bg-gold hover:text-ink px-7 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                >
                  {language === 'fr' ? 'Découvrir nos origines' : 'Discover Our Origins'} <ArrowRight size={12} />
                </Link>
              </motion.div>

              {/* Right — image grid */}
              <motion.div
                initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
                className="w-full lg:w-1/2 grid grid-cols-2 gap-3 sm:gap-4"
              >
                {/* Tall image left */}
                <div className="row-span-2 rounded-3xl overflow-hidden h-[340px] sm:h-[460px] lg:h-[540px]">
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
                    alt="Coffee being poured"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
                  />
                </div>
                {/* Top right */}
                <div className="rounded-3xl overflow-hidden h-[160px] sm:h-[218px] lg:h-[258px]">
                  <img
                    src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop"
                    alt="Coffee beans close up"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
                  />
                </div>
                {/* Bottom right — dark glass badge over image */}
                <div className="rounded-3xl overflow-hidden h-[160px] sm:h-[218px] lg:h-[258px] relative">
                  <img
                    src="https://images.unsplash.com/photo-1521302080334-4bebac2763a6?q=80&w=800&auto=format&fit=crop"
                    alt="Espresso extraction"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
                  />
                  {/* Floating badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-ink/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-sand/10">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-gold flex-shrink-0" />
                      <span className="text-sand text-[10px] font-bold uppercase tracking-wider">
                        {language === 'fr' ? 'Certifié 100% Arabica' : '100% Arabica Certified'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </section>

        {/* ── FEATURED COLLECTION ───────────────────────────────────────── */}
        <section className="bg-ink py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden grain-overlay">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(201,160,90,0.06),_transparent_60%)] pointer-events-none" />

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-16 px-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-gold" />
                  <span className="text-[9px] font-black tracking-[0.35em] uppercase text-gold">{t('premiumSelection')}</span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-sand uppercase tracking-tight leading-[0.88]">
                  {language === 'fr' ? 'Sélection' : 'Featured'}<br />
                  <span className="text-gold">{language === 'fr' ? 'Vedette' : 'Collection'}</span>
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold border border-gold hover:bg-gold hover:text-ink px-7 py-3.5 rounded-full transition-all duration-300"
              >
                {language === 'fr' ? 'Voir tout' : 'View All'} <ArrowRight size={11} />
              </Link>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <MobileCarousel>
                {featuredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={idx}
                    onClick={setSelectedProduct}
                  />
                ))}
              </MobileCarousel>
            )}

            <div className="flex md:hidden justify-center mt-10">
              <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold border border-gold px-7 py-3.5 rounded-full">
                {language === 'fr' ? 'Voir toute la collection' : 'View Entire Collection'} <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── BRANDS MARQUEE ───────────────────────────────────────────── */}
        <BrandsMarqueeSection />

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        <TestimonialsSection />

      </motion.div>

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
