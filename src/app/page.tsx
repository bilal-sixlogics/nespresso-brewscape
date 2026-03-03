"use client";

import { Search, ShoppingBag, ArrowLeft, X, Check, MapPin, Coffee, CreditCard } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AppConfig } from "@/lib/config";
import { useCart } from "@/store/CartContext";
import { allProducts, productDatabase } from "@/lib/productsData";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductDetailPanel } from "@/components/ui/ProductDetailPanel";
import { useLanguage } from "@/context/LanguageContext";

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

const allProductsCombined = allProducts;
// Navigation is now handled by Next.js router

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<typeof allProducts[0] | null>(null);
  // Navigation logic extracted to app router
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart, cartCount } = useCart();

  const [activeBeanIndex, setActiveBeanIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string>('description');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return allProducts.slice(0, 50);
    const catData = productDatabase[selectedCategory];
    if (catData) return catData;

    // Fallback for Nespresso-style filters
    if (selectedCategory === 'Espresso') return allProducts.filter(p => p.brewSizes?.includes('Espresso')).slice(0, 40);
    if (selectedCategory === 'Blonde') return allProducts.filter(p => (p.intensity || 0) < 7).slice(0, 40);
    if (selectedCategory === 'Dark Roast') return allProducts.filter(p => (p.intensity || 0) >= 8).slice(0, 40);

    return allProducts.slice(0, 40);
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
                  onClick={() => setSelectedProduct({
                    id: "999",
                    name: "DAILY",
                    nameEn: "DAILY",
                    namePart2: "PICK",
                    namePart2En: "PICK",
                    price: 5.50,
                    intensity: 0,
                    brewSizes: ['Cold'],
                    image: "https://www.starbucks.com/weblx/images/rewards/reward-tiers/400.png",
                    desc: "Un café glacé rafraîchissant, parfait pour l'après-midi.",
                    descEn: "A chilled coffee drink, perfect for a refreshing afternoon boost.",
                  })}
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

        {/* NEW ARRIVALS SECTION - PREMIUM LAYOUT */}
        <section className="bg-[#FAF9F6] py-32 px-4 lg:px-8 relative z-10 w-full overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            {/* Centered Header Layout for Premium Feel */}
            <div className="text-center mb-16 px-4">
              <div className="text-[10px] bg-sb-green/10 text-sb-green font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-4">Latest Additions</div>
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-sb-black uppercase tracking-tight mb-8">NEW ARRIVALS</h2>

              <div className="flex justify-center">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  {['All', 'Espresso', 'Blonde', 'Dark Roast'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedCategory(filter)}
                      className={`px-6 md:px-8 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap border ${selectedCategory === filter ? 'bg-sb-black text-white border-sb-black shadow-lg shadow-black/10' : 'bg-transparent text-gray-400 hover:text-sb-black border-gray-200 hover:border-sb-black'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">

              {filteredProducts.slice(0, 3).map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  onClick={setSelectedProduct}
                />
              ))}

            </div>

            <div className="flex justify-center mt-20">
              <Link href="/shop" className="group">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#000", borderColor: "#000", color: "#FFF" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border border-sb-black text-sb-black px-12 py-5 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all"
                >
                  View Entire Collection
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

        {/* WHOLE BEANS */}
        <section className="bg-sb-white py-32 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-4">
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-sb-green mb-4">{t('premiumSelection')}</div>
              <h2 className="font-display text-5xl md:text-6xl text-sb-black uppercase mb-4">{t('wholeBeans')}</h2>
              <p className="text-gray-400 max-w-md mx-auto text-sm">{t('wholeBeansSubtitle')}</p>
            </div>

            {/* Swipeable Cards + Details Layout */}
            <div className="flex flex-col lg:flex-row items-stretch gap-12 mt-16">

              {/* Left - Scrollable Product Cards */}
              <div className="w-full lg:w-1/2 relative overflow-hidden py-8 -my-8">
                <motion.div ref={carouselRef} className="cursor-grab active:cursor-grabbing px-4">
                  <motion.div drag="x" dragConstraints={carouselRef} className="flex gap-5 w-max">
                    {wholeBeans.map((bean, i) => (
                      <motion.div
                        key={`${bean.name}-${bean.namePart2}`}
                        whileHover={{ y: -8 }}
                        onClick={() => setActiveBeanIndex(i)}
                        className={`w-[240px] flex-shrink-0 cursor-pointer transition-all duration-300 ${activeBeanIndex === i ? 'ring-2 ring-sb-green ring-offset-4 rounded-[40px] scale-[1.02]' : 'opacity-70 hover:opacity-100 scale-[0.98]'}`}
                      >
                        <div className={`bg-gradient-to-b ${bean.color} rounded-[40px] p-6 h-[320px] flex flex-col justify-between relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500`}>
                          <div className="absolute -top-12 -right-12 w-32 h-32 border border-white/10 rounded-full" />
                          <div className="absolute -bottom-8 -left-8 w-24 h-24 border border-white/5 rounded-full" />

                          <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/10">
                              <Coffee className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/70 mb-2">{language === 'en' ? 'Medium' : 'Moyenne'} Roast</div>
                            <h4 className="font-display text-2xl text-white uppercase leading-none drop-shadow-md">
                              {language === 'en' && bean.nameEn ? bean.nameEn : bean.name}<br />
                              <span className="text-white/70">{language === 'en' && bean.namePart2En ? bean.namePart2En : bean.namePart2}</span>
                            </h4>
                          </div>

                          <div className="relative z-10">
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {bean.notes.map((note) => (
                                <span key={note} className="text-[9px] bg-white/20 backdrop-blur-sm border border-white/10 text-white px-3 py-1 rounded-full font-bold tracking-wider uppercase">{note}</span>
                              ))}
                            </div>
                            <div className="flex items-end justify-between">
                              <div className="text-[9px] text-white/70 uppercase tracking-widest">{bean.origin}</div>
                              <div className="font-display text-3xl text-white font-bold">${bean.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
                {/* Scroll indicator dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {wholeBeans.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeBeanIndex === i ? 'w-6 bg-sb-green' : 'w-1.5 bg-gray-200'}`} />
                  ))}
                </div>
                <div className="text-[10px] text-gray-400 text-center mt-3 font-bold tracking-[0.2em] uppercase">{t('dragExplore')}</div>
              </div>

              {/* Right - Product Detail (Reactive) */}
              <div className="w-full lg:w-1/2 max-w-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBeanIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-sb-green mb-2">{t('featuredBlend')}</div>
                    <h3 className="font-display text-3xl md:text-4xl text-sb-black uppercase leading-tight mb-2">
                      {language === 'en' && wholeBeans[activeBeanIndex].nameEn ? wholeBeans[activeBeanIndex].nameEn : wholeBeans[activeBeanIndex].name} {language === 'en' && wholeBeans[activeBeanIndex].namePart2En ? wholeBeans[activeBeanIndex].namePart2En : wholeBeans[activeBeanIndex].namePart2}
                    </h3>
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-[10px] bg-sb-green/10 text-sb-green font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">{wholeBeans[activeBeanIndex].roast} Roast</span>
                      <span className="text-[10px] bg-amber-50 text-amber-600 font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">100% Arabica</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">{wholeBeans[activeBeanIndex].origin}</span>
                    </div>

                    {/* Roast Level with Coffee Gradient Mapping */}
                    <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">{t('roastLevel')}</div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const isActive = level <= wholeBeans[activeBeanIndex].roastLevel;
                          // Colors from light coffee to dark espresso
                          const roastColors = ['#D4B594', '#C29B70', '#8D5B4C', '#5A3A31', '#2C1E16'];
                          return (
                            <div
                              key={level}
                              className={`flex-1 h-3 rounded-full transition-all duration-500 lg:hover:h-4 cursor-pointer`}
                              style={{
                                backgroundColor: isActive ? roastColors[level - 1] : '#E5E7EB',
                                opacity: isActive ? 1 : 0.5
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-3">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t('light')}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t('dark')}</span>
                      </div>
                    </div>

                    {/* Accordions */}
                    <div className="border-b border-gray-200 py-5">
                      <div
                        className="flex justify-between items-center cursor-pointer group"
                        onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                      >
                        <span className="font-bold text-sm tracking-widest uppercase">{t('description')}</span>
                        <span className="text-gray-400 group-hover:text-sb-green transition-colors text-lg">
                          {openAccordion === 'description' ? '−' : '+'}
                        </span>
                      </div>
                      <AnimatePresence>
                        {openAccordion === 'description' && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="text-gray-500 text-sm leading-relaxed mt-3 overflow-hidden"
                          >
                            {language === 'en' && wholeBeans[activeBeanIndex].descEn ? wholeBeans[activeBeanIndex].descEn : wholeBeans[activeBeanIndex].desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="border-b border-gray-200 py-5">
                      <div
                        className="flex justify-between items-center cursor-pointer group"
                        onClick={() => setOpenAccordion(openAccordion === 'origin' ? '' : 'origin')}
                      >
                        <span className="font-bold text-sm tracking-widest uppercase">{t('originSourcing')}</span>
                        <span className="text-gray-400 group-hover:text-sb-green transition-colors text-lg">
                          {openAccordion === 'origin' ? '−' : '+'}
                        </span>
                      </div>
                      <AnimatePresence>
                        {openAccordion === 'origin' && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="text-gray-500 text-sm leading-relaxed mt-3 overflow-hidden"
                          >
                            Sourced directly from high-altitude farms in {wholeBeans[activeBeanIndex].origin}. We work closely with local farmers to ensure sustainable practices and fair compensation.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="border-b border-gray-200 py-5">
                      <div
                        className="flex justify-between items-center cursor-pointer group"
                        onClick={() => setOpenAccordion(openAccordion === 'brewing' ? '' : 'brewing')}
                      >
                        <span className="font-bold text-sm tracking-widest uppercase">{t('brewTips')}</span>
                        <span className="text-gray-400 group-hover:text-sb-green transition-colors text-lg">
                          {openAccordion === 'brewing' ? '−' : '+'}
                        </span>
                      </div>
                      <AnimatePresence>
                        {openAccordion === 'brewing' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="text-gray-500 text-sm leading-relaxed mt-3 overflow-hidden space-y-2"
                          >
                            <li><strong>Best Method:</strong> Pour-over or French Press</li>
                            <li><strong>Water Temp:</strong> 92°C - 96°C (198°F - 205°F)</li>
                            <li><strong>Ratio:</strong> 1:15 (Coffee to Water)</li>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex justify-between items-center mt-10">
                      <div>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{t('priceTitle')}</div>
                        <div className="font-display text-4xl font-bold text-sb-black">${wholeBeans[activeBeanIndex].price}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-4 border border-gray-200 rounded-2xl px-4 py-3">
                          <button className="text-gray-400 hover:text-sb-black transition-colors font-bold text-lg active:scale-90">−</button>
                          <span className="font-bold w-4 text-center">1</span>
                          <button className="text-gray-400 hover:text-sb-black transition-colors font-bold text-lg active:scale-90">+</button>
                        </div>
                        <button className="bg-gradient-to-r from-sb-green to-[#2a7a4a] hover:shadow-xl hover:shadow-sb-green/40 text-white font-bold py-4 px-10 rounded-2xl text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg shadow-sb-green/25 active:scale-95">
                          {t('addToCart')}
                        </button>
                      </div>
                    </div>

                    <Link href="/shop" className="block w-full text-center mt-8 py-4 border-2 border-sb-green text-sb-green rounded-2xl text-xs font-bold tracking-[0.15em] uppercase hover:bg-sb-green hover:text-white transition-all duration-300">
                      {t('viewAllWholeBeans')}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
