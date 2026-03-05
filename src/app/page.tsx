"use client";

import { Search, ShoppingBag, ArrowLeft, X, Check, MapPin, Coffee, CreditCard, ArrowRight, Zap, Star } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AppConfig } from "@/lib/config";
import { useCart } from "@/store/CartContext";
import { productDatabase, enrichedProducts } from "@/lib/productsData";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductDetailPanel } from "@/components/ui/ProductDetailPanel";
import { TestimonialsSection } from '@/components/ui/TestimonialsSection';
import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/types";

const BRANDS = [
  { name: 'Nespresso', logo: 'https://logo.clearbit.com/nespresso.com', bg: '#000000' },
  { name: 'Nescafé', logo: 'https://logo.clearbit.com/nescafe.com', bg: '#DA251C' },
  { name: 'Lavazza', logo: 'https://logo.clearbit.com/lavazza.com', bg: '#FFFFFF' },
  { name: 'illy', logo: 'https://logo.clearbit.com/illy.com', bg: '#FFFFFF' },
  { name: 'Starbucks', logo: 'https://logo.clearbit.com/starbucks.com', bg: '#00704A' },
  { name: 'Dolce Gusto', logo: 'https://logo.clearbit.com/dolce-gusto.com', bg: '#FFFFFF' },
  { name: 'Cadbury', logo: 'https://logo.clearbit.com/cadbury.com', bg: '#4B088A' },
  { name: 'Tassimo', logo: 'https://logo.clearbit.com/tassimo.com', bg: '#FFFFFF' },
  { name: 'Kimbo', logo: 'https://logo.clearbit.com/kimbo.it', bg: '#FFFFFF' },
  { name: "L'OR", logo: 'https://logo.clearbit.com/lorcoffee.com', bg: '#1A1A1A' },
  { name: 'Senseo', logo: 'https://logo.clearbit.com/senseo.com', bg: '#FFFFFF' },
  { name: 'Delta Q', logo: 'https://logo.clearbit.com/deltaq.com', bg: '#FFFFFF' },
  { name: 'Jacobs', logo: 'https://logo.clearbit.com/jacobsdouweegberts.com', bg: '#FFFFFF' },
  { name: 'Carte Noire', logo: 'https://logo.clearbit.com/cartenoire.fr', bg: '#1A1A1A' },
];

function BrandsMarqueeSection() {
  const { language } = useLanguage();
  const brands = [...BRANDS, ...BRANDS];

  return (
    <section className="bg-sb-green py-12 relative overflow-hidden">
      {/* Torn paper top — green tears into white above */}
      <div className="torn-paper-green-up z-30" />

      {/* Subtle radial highlight */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_50%_50%,_white,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-px bg-white/40" />
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/50">
                {language === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase leading-tight">
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

      {/* Single marquee row */}
      <div className="relative">
        {/* Left/Right fade gradients */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-sb-green to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-sb-green to-transparent" />

        <div className="flex gap-5 marquee-ltr">
          {brands.map((brand, i) => (
            <div
              key={`b-${i}`}
              className="shrink-0 w-40 h-22 rounded-2xl bg-white/95 shadow-lg shadow-black/10 flex flex-col items-center justify-center gap-1.5 group hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative px-4 py-5"
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
              <span
                className="text-[10px] font-black text-gray-700 uppercase tracking-widest text-center"
                style={{ display: 'none' }}
              >
                {brand.name}
              </span>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-sb-green/25 rounded-2xl transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Torn paper bottom — green tears into white below */}
      <div className="torn-paper-green-down z-30" />
    </section>
  );
}


function FeaturedMachinesSection({ onProductClick }: { onProductClick: (p: any) => void }) {
  const { t, language } = useLanguage();

  const displayMachines = (enrichedProducts as any[])
    .filter(p => p.category?.toLowerCase().includes('machine') || p.category?.toLowerCase().includes('cafetière'))
    .slice(0, 3);

  return (
    <section className="py-14 px-8 bg-white text-sb-black relative overflow-hidden border-t border-gray-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.04),_transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px bg-sb-green" />
              <span className="text-[9px] font-black tracking-[0.35em] uppercase text-sb-green">
                {t('featuredMachines')}
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.9] text-sb-black">
              {language === 'fr' ? 'Machines' : 'Featured'}<br />
              <span className="text-sb-green">{language === 'fr' ? 'Vedettes' : 'Machines'}</span>
            </h2>
            <p className="text-gray-400 text-sm mt-4 max-w-md">
              {language === 'fr'
                ? 'Des machines conçues pour sublimer chaque café, du barista débutant au professionnel exigeant.'
                : 'Machines designed to perfect every coffee, from beginner to seasoned barista.'}
            </p>
          </div>
          <Link
            href="/machines"
            className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-sb-green hover:text-white border border-sb-green hover:bg-sb-green px-8 py-4 rounded-full transition-all duration-300"
          >
            {t('viewAllMachines')} <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayMachines.map((machine: any, i: number) => (
            <ProductCard
              key={machine.id}
              product={machine}
              index={i}
              onClick={onProductClick}
            />
          ))}
        </div>

        <div className="flex md:hidden justify-center mt-10">
          <Link href="/machines" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-sb-green border border-sb-green px-8 py-4 rounded-full">
            {t('viewAllMachines')} <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}


const wholeBeans = [
  {
    name: 'Master Origin', nameEn: 'Master Origin',
    namePart2: 'Colombia', namePart2En: 'Colombia',
    roast: 'Medium', roastLevel: 3,
    origin: 'Colombia', price: 9.50,
    color: 'from-[#c4a36e] to-[#8a6d3b]',
    notes: ['Winey', 'Red Beans'],
    desc: 'Late harvest Arabica. A highly fermentative process creates a winey profile with notes of red fruits.',
    descEn: 'Late harvest Arabica. A highly fermentative process creates a winey profile with notes of red fruits.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=300&auto=format&fit=crop'
  },
  {
    name: 'Master Origin', nameEn: 'Master Origin',
    namePart2: 'India', namePart2En: 'India',
    roast: 'Dark', roastLevel: 5,
    origin: 'India', price: 9.50,
    color: 'from-[#5b8c5a] to-[#2d5a30]',
    notes: ['Intense', 'Spicy'],
    desc: 'Monsooned Robusta. Exposed to wet monsoon winds for intense, woody, and spicy aromatic notes.',
    descEn: 'Monsooned Robusta. Exposed to wet monsoon winds for intense, woody, and spicy aromatic notes.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=300&auto=format&fit=crop'
  },
  {
    name: 'Master Origin', nameEn: 'Master Origin',
    namePart2: 'Ethiopia', namePart2En: 'Ethiopia',
    roast: 'Light', roastLevel: 2,
    origin: 'Ethiopia', price: 9.50,
    color: 'from-[#e07a5f] to-[#b6533a]',
    notes: ['Fruit Jam', 'Orange Blossom'],
    desc: 'Sun-dried Arabica. Drying coffee inside the cherry brings decadent fruit jam aromas and orange blossom notes.',
    descEn: 'Sun-dried Arabica. Drying coffee inside the cherry brings decadent fruit jam aromas and orange blossom notes.',
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=300&auto=format&fit=crop'
  },
  {
    name: 'Master Origin', nameEn: 'Master Origin',
    namePart2: 'Indonesia', namePart2En: 'Indonesia',
    roast: 'Medium', roastLevel: 4,
    origin: 'Indonesia', price: 9.50,
    color: 'from-[#1a3a2a] to-[#0d1f16]',
    notes: ['Woody', 'Tobacco'],
    desc: 'Wet-hulled Arabica. The unique wet-hulling method in high humidity produces a rich, velvety body with woody notes.',
    descEn: 'Wet-hulled Arabica. The unique wet-hulling method in high humidity produces a rich, velvety body with woody notes.',
    image: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?q=80&w=300&auto=format&fit=crop'
  },
];

const allProductsCombined = enrichedProducts;
// Navigation is now handled by Next.js router

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Navigation logic extracted to app router
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart, cartCount } = useCart();

  const [activeBeanIndex, setActiveBeanIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string>('description');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return enrichedProducts.slice(0, 50);
    const catData = enrichedProducts.filter(p => p.category === selectedCategory);
    if (catData.length > 0) return catData;

    // Fallback for Nespresso-style filters
    if (selectedCategory === 'Espresso') return enrichedProducts.filter(p => p.brewSizes?.includes('Espresso')).slice(0, 40);
    if (selectedCategory === 'Blonde') return enrichedProducts.filter(p => (p.intensity || 0) < 7).slice(0, 40);
    if (selectedCategory === 'Dark Roast') return enrichedProducts.filter(p => (p.intensity || 0) >= 8).slice(0, 40);

    return enrichedProducts.slice(0, 40);
  }, [selectedCategory]);

  // Prevent scrolling when panel is open
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
      {/* MAIN HOME CONTENT */}
      <motion.div
        key="home"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      >
        {/* HERO SECTION */}
        <section className="relative w-full pt-16 pb-24 lg:pb-32 bg-sb-white z-10 overflow-visible min-h-[600px] lg:min-h-[800px] flex flex-col justify-center">
          {/* Coffee Beans Decoration - Left Side */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[300px] lg:w-[500px] pointer-events-none z-0"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at left center, black 20%, transparent 70%)',
              maskImage: 'radial-gradient(ellipse at left center, black 20%, transparent 70%)'
            }}
          >
            <img
              src="/coffee-beans.png"
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          <div className="max-w-[1700px] mx-auto px-4 sm:px-8 relative mb-12">

            {/* Massive Text sitting AT THE BACK */}
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display text-[11vw] sm:text-[12vw] lg:text-[13vw] xl:text-[14rem] leading-[0.7] text-center text-[#111111] uppercase tracking-tighter mb-4 w-full relative z-0 mt-8 whitespace-nowrap opacity-[0.97]"
            >
              {AppConfig.brand.name.toUpperCase()}
            </motion.h2>

            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end -mt-4 lg:-mt-16 xl:-mt-24 relative z-10 w-full px-4 lg:px-12">

              <div className="w-full lg:w-1/3 flex flex-col items-start mb-10 lg:mb-0 space-y-6">
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
              <div className="w-full lg:w-1/3 flex justify-center items-center relative z-[40] mt-10 lg:mt-0" style={{ height: '500px' }}>
                {/* The Green Circle - BEHIND the cup (z-10) */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                  className="absolute left-1/2 transform -translate-x-1/2 bg-[#439665] rounded-full z-[1]"
                  style={{ width: '420px', height: '420px', top: '50%', marginTop: '-80px' }}
                />
                {/* The Cup - ABOVE the circle (z-10), fixed size, transparent PNG */}
                <motion.img
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  src="/hero-cup.png"
                  alt="Iced Coffee Cup"
                  className="absolute left-1/2 transform -translate-x-1/2 z-[2] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.35)]"
                  style={{ width: '300px', height: '420px', top: '60px' }}
                />
              </div>

              <div className="w-full lg:w-1/3 flex flex-col items-end mb-10 lg:mb-0 space-y-8 z-30">
                <motion.div
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                  onClick={() => setSelectedProduct(enrichedProducts.find(p => p.category === 'Capsules de Café') || enrichedProducts[0])}
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

          {/* White torn paper cutting into the green story section below */}
          {/* <div className="torn-paper-white-down z-20"></div> */}
        </section>

        {/* STORY SECTION - ULTRA PREMIUM REDESIGN */}
        <section className="bg-sb-green pt-32 pb-32 px-4 lg:px-8 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto relative z-10 w-full px-2 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
              {/* Left Text Detail */}
              <motion.div
                initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 text-left"
              >
                <div className="text-[10px] bg-white/10 text-white font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-8 border border-white/20">{t('heritageSubtitle')}</div>
                <h2 className="font-display text-6xl md:text-7xl lg:text-8xl text-white uppercase tracking-tight mb-8 drop-shadow-md leading-[0.9]">
                  {language === 'en' ? 'THE ART OF' : "L'ART DU"}<br />
                  <span className="text-[#E5D5B8] opacity-90">{language === 'en' ? 'FRENCH' : "CAFÉ"}</span><br />
                  {language === 'en' ? 'COFFEE' : "FRANÇAIS"}
                </h2>
                <p className="text-[#E5D5B8] text-base lg:text-lg font-medium leading-relaxed max-w-lg opacity-80 mb-10">
                  {t('heritageDesc')}
                </p>
                <Link
                  href="/brew-guide"
                  className="inline-block text-white border-b border-white pb-1 font-bold text-xs uppercase tracking-[0.2em] hover:text-[#E5D5B8] hover:border-[#E5D5B8] transition-colors leading-loose"
                >
                  Discover Our Farms
                </Link>
              </motion.div>

              {/* Right Images (Asymmetrical Parallax Layout) */}
              <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[700px] flex items-center justify-center mt-10 lg:mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute top-0 right-10 w-[60%] lg:w-[50%] h-[70%] z-10 rounded-[40px] rounded-tr-[100px] rounded-bl-[100px] overflow-hidden shadow-2xl border border-white/10"
                >
                  <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]" alt="Pouring coffee" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -40, y: 50 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                  className="absolute bottom-10 left-0 w-[55%] h-[60%] z-20 rounded-[30px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-4 border-sb-green"
                >
                  <img src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]" alt="Roasting beans" />
                </motion.div>

                {/* Premium glass floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
                  className="absolute top-[40%] right-[-5%] lg:right-[-2%] z-30 bg-white/10 backdrop-blur-md rounded-full w-24 h-24 lg:w-32 lg:h-32 flex flex-col items-center justify-center border border-white/20 shadow-2xl"
                >
                  <span className="text-white font-display text-2xl lg:text-3xl">100%</span>
                  <span className="text-[#E5D5B8] text-[8px] font-bold uppercase tracking-widest mt-1">Sustainably</span>
                  <span className="text-[#E5D5B8] text-[8px] font-bold uppercase tracking-widest">Sourced</span>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED COLLECTION SECTION */}
        <section className="bg-[#FAF9F6] py-14 px-4 lg:px-8 relative z-10 w-full overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            {/* Compact Premium Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 px-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-px bg-sb-green" />
                  <span className="text-[9px] font-black tracking-[0.35em] uppercase text-sb-green">{t('premiumSelection')}</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-sb-black uppercase tracking-tight leading-[0.9]">
                  {language === 'fr' ? 'Sélection' : 'Featured'}<br />
                  <span className="text-sb-green">{language === 'fr' ? 'Vedette' : 'Collection'}</span>
                </h2>
              </div>
              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'All', label: t('all') },
                  { key: 'Espresso', label: 'Espresso' },
                  { key: 'Blonde', label: 'Blonde' },
                  { key: 'Dark Roast', label: language === 'fr' ? 'Torréfié' : 'Dark Roast' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-5 py-2.5 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap border ${selectedCategory === key
                      ? 'bg-sb-black text-white border-sb-black shadow-md'
                      : 'bg-transparent text-gray-400 hover:text-sb-black border-gray-200 hover:border-sb-black'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {filteredProducts.slice(0, 3).map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  onClick={setSelectedProduct}
                />
              ))}
            </div>

            <div className="flex justify-center mt-14">
              <Link href="/shop" className="group">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#000', borderColor: '#000', color: '#FFF' }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-transparent border border-sb-black text-sb-black px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all"
                >
                  {language === 'fr' ? 'Voir toute la collection' : 'View Entire Collection'}
                </motion.button>
              </Link>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="bg-sb-green py-20 px-8 relative">
          {/* Torn paper at top of stats - green tearing into white above */}
          <div className="torn-paper-green-up z-30"></div>
          <div className="max-w-[1200px] mx-auto flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16 w-full lg:w-2/3">
              {[
                { num: '46', label: t('statExperience') },
                { num: '1M+', label: t('statClients') },
                { num: '84', label: t('statCountries') },
                { num: '1K+', label: t('statProducts') },
              ].map((stat) => (
                <div key={stat.num} className="flex flex-col items-center lg:items-start text-center lg:text-left relative">
                  <motion.div
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.5 }}
                    className="font-display text-5xl lg:text-7xl mb-4 text-white drop-shadow-lg"
                  >
                    {stat.num}
                  </motion.div>
                  <div className="text-[11px] lg:text-xs font-bold tracking-[0.2em] uppercase whitespace-pre-line text-white/80 leading-relaxed">
                    {stat.label}
                  </div>
                  {/* Decorative line */}
                  <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/20 last:hidden"></div>
                </div>
              ))}
            </div>
          </div>
          {/* Torn paper at bottom of stats - green tearing into white below */}
          <div className="torn-paper-green-down z-30"></div>
        </section>

        {/* ── FEATURED MACHINES ──────────────────────────────────────── */}
        <FeaturedMachinesSection onProductClick={setSelectedProduct} />

        {/* ── BRANDS MARQUEE ─────────────────────────────────────────── */}
        <BrandsMarqueeSection />

        {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
        <TestimonialsSection />

      </motion.div>

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
