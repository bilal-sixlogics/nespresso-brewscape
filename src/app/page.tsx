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
import { Product } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { ProductSkeleton } from "@/components/ui/ProductSkeleton";

const BRANDS = [
  { name: 'Nespresso', logo: 'https://logo.clearbit.com/nespresso.com' },
  { name: 'Nescafé', logo: 'https://logo.clearbit.com/nescafe.com' },
  { name: 'Lavazza', logo: 'https://logo.clearbit.com/lavazza.com' },
  { name: 'illy', logo: 'https://logo.clearbit.com/illy.com' },
  { name: 'Starbucks', logo: 'https://logo.clearbit.com/starbucks.com' },
  { name: 'Dolce Gusto', logo: 'https://logo.clearbit.com/dolce-gusto.com' },
  { name: 'Cadbury', logo: 'https://logo.clearbit.com/cadbury.com' },
  { name: 'Tassimo', logo: 'https://logo.clearbit.com/tassimo.com' },
  { name: 'Kimbo', logo: 'https://logo.clearbit.com/kimbo.it' },
  { name: "L'OR", logo: 'https://logo.clearbit.com/lorcoffee.com' },
  { name: 'Senseo', logo: 'https://logo.clearbit.com/senseo.com' },
  { name: 'Delta Q', logo: 'https://logo.clearbit.com/deltaq.com' },
  { name: 'Jacobs', logo: 'https://logo.clearbit.com/jacobsdouweegberts.com' },
  { name: 'Carte Noire', logo: 'https://logo.clearbit.com/cartenoire.fr' },
];

function BrandsMarqueeSection() {
  const { language } = useLanguage();
  const brands = [...BRANDS, ...BRANDS];

  return (
    <section className="bg-sb-green py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_50%_50%,_white,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-6 sm:mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-px bg-white/40" />
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/50">
                {language === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white uppercase leading-tight">
              {language === 'fr' ? 'Marques de Confiance' : 'Trusted Brands'}
            </h2>
          </div>
          <p className="text-white/50 text-xs max-w-xs leading-relaxed">
            {language === 'fr'
              ? 'Les grandes marques du café, toutes réunies sur notre plateforme.'
              : 'World-renowned coffee brands, all available on our platform.'}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-sb-green to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-sb-green to-transparent" />

        <div className="flex gap-5 marquee-ltr">
          {brands.map((brand, i) => (
            <div
              key={`b-${i}`}
              className="shrink-0 w-40 rounded-2xl bg-white/95 shadow-lg shadow-black/10 flex flex-col items-center justify-center gap-1.5 group hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative px-4 py-5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-20 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const span = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (span) span.style.display = 'block';
                }}
              />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest text-center" style={{ display: 'none' }}>
                {brand.name}
              </span>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-sb-green/25 rounded-2xl transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products: featuredProducts, isLoading: featuredLoading } = useProducts({ featured: true, per_page: 20 });

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct]);

  return (
    <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden">
      <motion.div
        key="home"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      >

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative w-full pt-16 pb-12 sm:pb-20 lg:pb-32 bg-sb-white z-10 overflow-visible min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] flex flex-col justify-center">
          {/* Coffee Beans Decoration */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[300px] lg:w-[500px] pointer-events-none z-0"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at left center, black 20%, transparent 70%)',
              maskImage: 'radial-gradient(ellipse at left center, black 20%, transparent 70%)'
            }}
          >
            <img src="/coffee-beans.png" alt="" className="w-full h-full object-cover opacity-50" />
          </div>

          <div className="max-w-[1700px] mx-auto px-4 sm:px-8 relative mb-6 sm:mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display text-[11vw] sm:text-[12vw] lg:text-[13vw] xl:text-[14rem] leading-[0.7] text-center text-[#111111] uppercase tracking-tighter mb-4 w-full relative z-0 mt-8 whitespace-nowrap opacity-[0.97]"
            >
              {AppConfig.brand.name.toUpperCase()}
            </motion.h2>

            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end -mt-2 sm:-mt-4 lg:-mt-16 xl:-mt-24 relative z-10 w-full px-4 lg:px-12">

              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start mb-6 lg:mb-0 space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2 bg-white/70 backdrop-blur-md p-3 pr-5 rounded-[30px] border border-white/80 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] transition-shadow duration-300"
                >
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden shadow-sm"><img src="https://i.pravatar.cc/100?img=1" alt="User" /></div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white overflow-hidden shadow-sm"><img src="https://i.pravatar.cc/100?img=2" alt="User" /></div>
                    <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white overflow-hidden shadow-sm"><img src="https://i.pravatar.cc/100?img=3" alt="User" /></div>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="font-display text-2xl lg:text-3xl leading-tight">1M+</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{t('satisfiedCustomers')}</span>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-gray-500 max-w-[280px] text-sm leading-relaxed z-10 relative"
                >
                  {t('heroSubtitle')}
                </motion.p>
              </div>

              {/* HERO CUP AND CIRCLE - Cup sits ON the circle, bottom in, top out */}
              <div className="w-full lg:w-1/3 flex justify-center items-center relative z-[40] mt-2 sm:mt-4 lg:mt-0 h-[260px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
                {/* The Green Circle - BEHIND the cup (z-1) */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                  className="absolute left-1/2 transform -translate-x-1/2 bg-[#439665] rounded-full z-[1] w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:h-[350px] md:w-[350px] lg:w-[420px] lg:h-[420px]"
                  style={{ top: '50%', marginTop: '-60px' }}
                />
                {/* The Cup - ABOVE the circle (z-2), transparent PNG floating */}
                <motion.img
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  src="/hero-cup.png"
                  alt="Iced Coffee Cup"
                  className="absolute left-1/2 transform -translate-x-1/2 z-[2] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.35)] w-[150px] sm:w-[210px] md:w-[250px] lg:w-[300px] h-auto top-[30px] sm:top-[40px] lg:top-[60px]"
                />
              </div>

              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end mb-6 lg:mb-0 space-y-5 sm:space-y-8 z-[50]">
                <motion.div
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                  onClick={() => setSelectedProduct(featuredProducts.find(p => p.category?.name?.includes('Capsule')) || featuredProducts[0] || null)}
                  className="flex items-center space-x-6 mr-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] group cursor-pointer hover:bg-white/90 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] transition-all duration-300"
                >
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-sm tracking-wide text-sb-black group-hover:text-sb-green transition-colors">{t('dailyPick')}</span>
                    <span className="text-xs text-gray-500">{language === 'en' ? 'Chilled Coffee Drink' : 'Boisson au café glacé'}</span>
                  </div>
                  <div className="w-16 h-20 bg-[#E1CDA4] rounded-xl p-1 relative shadow-inner transform group-hover:rotate-12 transition-transform duration-500">
                    <div className="w-full h-full border border-black/5 rounded-lg"></div>
                    <img src="https://www.starbucks.com/weblx/images/rewards/reward-tiers/400.png" className="w-full h-full object-cover absolute top-0 left-0 scale-[0.8] drop-shadow-md" />
                  </div>
                </motion.div>

                <Link href="/shop" className="inline-block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05, backgroundColor: "#2D5F41" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#3C7A58] text-white px-10 py-5 rounded-full text-xs font-bold tracking-[0.2em] uppercase shadow-xl hover:shadow-[#3C7A58]/50 transition-all duration-300 flex items-center cursor-pointer"
                  >
                    {t('shopNow')}
                    <div className="w-1.5 h-1.5 ml-3 bg-white rounded-full"></div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── STORY / CRAFT SECTION ─────────────────────────────────────── */}
        <section className="relative bg-[#0D1F14] overflow-hidden">
          {/* Full-bleed background image with dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format&fit=crop"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1F14]/95 via-[#0D1F14]/70 to-[#0D1F14]/40" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

              {/* Left — text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
                className="w-full lg:w-1/2"
              >
                <div className="inline-flex items-center gap-2 bg-sb-green/20 border border-sb-green/30 text-sb-green text-[9px] font-black tracking-[0.4em] uppercase px-4 py-2 rounded-full mb-8">
                  <Leaf size={10} />
                  {language === 'fr' ? 'Notre Savoir-Faire' : 'Our Craft'}
                </div>

                <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase leading-[0.85] tracking-tight mb-8">
                  {language === 'fr' ? (
                    <><span className="text-sb-green">L'Art</span><br />Du Café<br />Français</>
                  ) : (
                    <><span className="text-sb-green">The Art</span><br />Of French<br />Coffee</>
                  )}
                </h2>

                <p className="text-white/60 text-base lg:text-lg leading-relaxed max-w-md mb-10">
                  {language === 'fr'
                    ? 'Chaque tasse raconte une histoire — de la sélection rigoureuse des grains aux terres fertiles d\'Éthiopie, de Colombie et d\'Indonésie, jusqu\'à votre table.'
                    : 'Every cup tells a story — from the careful selection of beans across the fertile lands of Ethiopia, Colombia, and Indonesia, to your table.'}
                </p>

                {/* Pillar stats */}
                <div className="flex gap-8 mb-12">
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
                </div>

                <Link
                  href="/brew-guide"
                  className="inline-flex items-center gap-3 text-sb-green border border-sb-green/40 hover:border-sb-green hover:bg-sb-green hover:text-white px-7 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300"
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
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-sb-green flex-shrink-0" />
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                        {language === 'fr' ? 'Certifié 100% Arabica' : '100% Arabica Certified'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sb-green/40 to-transparent" />
        </section>

        {/* ── FEATURED COLLECTION ───────────────────────────────────────── */}
        <section className="bg-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,126,90,0.04),_transparent_60%)] pointer-events-none" />

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-16 px-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-sb-green" />
                  <span className="text-[9px] font-black tracking-[0.35em] uppercase text-sb-green">{t('premiumSelection')}</span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-sb-black uppercase tracking-tight leading-[0.88]">
                  {language === 'fr' ? 'Sélection' : 'Featured'}<br />
                  <span className="text-sb-green">{language === 'fr' ? 'Vedette' : 'Collection'}</span>
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sb-green border border-sb-green hover:bg-sb-green hover:text-white px-7 py-3.5 rounded-full transition-all duration-300"
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
                {featuredProducts.slice(0, 5).map((product, idx) => (
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
              <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sb-green border border-sb-green px-7 py-3.5 rounded-full">
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
