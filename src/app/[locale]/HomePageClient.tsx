"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from '@/components/LocaleLink';
import { AppConfig } from "@/lib/config";
import { ArrowRight, Truck, CreditCard, ShieldCheck, Headphones, BookOpen, Calendar } from "lucide-react";

import { ProductCard } from "@/components/ui/ProductCard";
import { ProductDetailPanel } from "@/components/ui/ProductDetailPanel";
import { MobileCarousel } from "@/components/ui/MobileCarousel";
import { TestimonialsSection } from '@/components/ui/TestimonialsSection';
import { useLanguage } from "@/context/LanguageContext";
import { Product, getProductImage } from "@/types";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductSkeleton } from "@/components/ui/ProductSkeleton";
import { Endpoints } from "@/lib/api/endpoints";

interface ApiBrand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

// Locale used for blog post dates, keyed by app language (all 5 supported languages).
const BLOG_DATE_LOCALE: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE', ru: 'ru-RU', nl: 'nl-NL' };

function CategoriesSection() {
  const { language } = useLanguage();
  const { categories } = useCategories();

  // Top-level, active categories, sorted for display — a handful is plenty for a homepage grid.
  const topCategories = useMemo(
    () => categories
      .filter(c => c.status === 'active' && !c.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 6),
    [categories]
  );

  if (topCategories.length === 0) return null;

  return (
    /* Lives inside the hero, so it deliberately paints no background, grain or
       side padding of its own: the hero already supplies all three, and an
       opaque band here would cover the coffee-bean wash bleeding in from the
       left. Type stays at eyebrow scale too — the logo is the hero's display
       heading, and a second 6xl headline under it just fights for the eye. */
    <div className="relative mt-10 sm:mt-14 lg:mt-16">
      {/* Hairline that fades out at both ends, rather than a hard border ruled
          straight across the middle of the hero. */}
      <div className="h-px w-full max-w-3xl mx-auto bg-gradient-to-r from-transparent via-sand/20 to-transparent" />

      <div className="flex items-center justify-center gap-3 mt-10 sm:mt-12 mb-8 sm:mb-10">
        <div className="w-6 h-px bg-gold/40" />
        <span className="text-[9px] font-black tracking-[0.4em] uppercase text-sand/50">
          {language === 'fr' ? 'Explorez Nos Catégories' : 'Shop by Category'}
        </span>
        <div className="w-6 h-px bg-gold/40" />
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-8 lg:gap-x-12">
        {topCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            /* Above the fold, so this animates on mount in sequence after the
               logo — not on scroll like the sections further down. */
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`${cat.storefront_page || '/shop'}?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 w-[4.75rem] sm:w-24 lg:w-28"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                {/* Gold bloom on hover — the same ambient glow language as the
                    hero cup, so the two read as one composition. */}
                <div className="absolute -inset-2 rounded-full bg-gold/25 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                {/* Frosted plate matching the hero's glass cards (sand/8 +
                    backdrop-blur + sand/15 hairline) instead of a solid beige
                    disc, which punched a bright hole in the dark hero. */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-sand/[0.07] backdrop-blur-md border border-sand/15 group-hover:border-gold/70 flex items-center justify-center shadow-[0_14px_34px_-14px_rgba(0,0,0,0.65)] transition-all duration-500 group-hover:-translate-y-1">
                  {cat.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.icon_url}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl lg:text-4xl">{cat.icon || '☕'}</span>
                  )}
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-sand/70 group-hover:text-gold transition-colors text-center leading-snug">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Same curated roster shown on /our-origins (ORIGIN_BRANDS there) — keep in sync with that page.
const CURATED_BRAND_SLUGS = ["bristot", "lavazza", "carte-noir", "covim", "kimbo", "ristora", "prolait", "delta"];

// A single collage tile — brand logo (or wordmark fallback) in a softly rotated card
// that straightens and lifts on hover. Shared by the left/right collage columns and
// the compact mobile grid below.
function BrandTile({ brand, className = '' }: { brand: ApiBrand; className?: string }) {
  const { language } = useLanguage();

  // Point at the brand's own page where one exists.
  //
  // These tiles used to link to /shop?brand=<slug>, which is a filtered view
  // of the catalogue: it carries no brand copy, and now canonicalises to
  // /marques/<slug> and is marked noindex. Linking the tile straight to the
  // brand page instead means the homepage passes authority to the page built
  // to rank for "café Lavazza" rather than to a URL asking not to be indexed.
  //
  // Brand pages are published in French and English only, so the other three
  // locales keep the filtered-catalogue link — a working page beats a 404.
  const href =
    language === 'fr' || language === 'en'
      ? `/marques/${brand.slug}`
      : `/shop?brand=${brand.slug}`;

  return (
    <Link
      href={href}
      className={`group relative block rounded-2xl bg-sand border border-sand/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_40px_-10px_rgba(201,160,90,0.4)] transition-all duration-500 cursor-pointer overflow-hidden hover:z-20 hover:rotate-0 hover:scale-[1.06] ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl border border-gold/0 group-hover:border-gold/50 transition-colors duration-500 pointer-events-none z-10" />
      <div className="absolute inset-0 flex items-center justify-center">
        {brand.logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={brand.logo}
            // Says what the image is. A bare brand name reads as the tile's
            // label rather than a description of the logo itself.
            alt={language === 'fr' ? `Logo ${brand.name}` : `${brand.name} logo`}
            className="w-full h-full object-contain p-4 sm:p-5 opacity-85 group-hover:opacity-100 transition-opacity duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Premium typographic fallback — luxury brand wordmark style */}
        <div
          className="absolute inset-0 flex items-center justify-center px-3"
          style={{ display: brand.logo ? 'none' : 'flex' }}
        >
          <span
            className="text-[11px] font-black uppercase tracking-[0.2em] text-ink text-center leading-snug group-hover:text-gold transition-colors duration-500"
            style={{ fontVariant: 'small-caps' }}
          >
            {brand.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

function BrandsShowcaseSection() {
  const { language } = useLanguage();
  const [apiBrands, setApiBrands] = useState<ApiBrand[]>([]);

  useEffect(() => {
    fetch(Endpoints.brands)
      .then(r => r.json())
      .then(json => {
        const data: ApiBrand[] = Array.isArray(json) ? json : (json?.data ?? []);
        // Show the same curated roster as /our-origins, in that page's order.
        const curated = CURATED_BRAND_SLUGS
          .map(slug => data.find(b => b.slug === slug))
          .filter((b): b is ApiBrand => !!b);
        if (curated.length > 0) setApiBrands(curated);
        else if (data.length > 0) setApiBrands(data); // fallback: show whatever brands exist
      })
      .catch(() => { /* keep empty, fallback renders nothing */ });
  }, []);

  if (apiBrands.length === 0) return null;

  const left = apiBrands.slice(0, 4);
  const right = apiBrands.slice(4, 8);
  // Alternating tilt per tile, mirrored on the right column, for a hand-arranged collage feel.
  const tiltFor = (i: number, mirrored = false) => {
    const deg = i % 2 === 0 ? -4 : 3;
    return mirrored ? -deg : deg;
  };

  return (
    <section className="bg-ink py-20 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden grain-overlay">
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(ellipse_at_50%_50%,_#C9A05A,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left collage — desktop only */}
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-4 w-full lg:w-1/3 h-[420px]">
            {left.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: tiltFor(i) }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={i === 0 ? 'row-span-2' : ''}
              >
                <BrandTile brand={brand} className="w-full h-full" />
              </motion.div>
            ))}
          </div>

          {/* Center content */}
          <div className="w-full lg:w-1/3 text-center px-2 sm:px-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-5 h-px bg-gold/40" />
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-sand/50">
                {language === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
              </span>
              <div className="w-5 h-px bg-gold/40" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-sand uppercase leading-[0.95] mb-5">
              {language === 'fr' ? (
                <>Marques de<br /><span className="text-gold">Confiance</span></>
              ) : (
                <>Trusted<br /><span className="text-gold">Brands</span></>
              )}
            </h2>
            <p className="text-sand/60 text-sm leading-relaxed max-w-xs mx-auto mb-8">
              {language === 'fr'
                ? 'Les grandes marques du café, toutes réunies sur notre plateforme.'
                : 'World-renowned coffee brands, all available on our platform.'}
            </p>
            {/* Was /our-origins, which is about coffee origins rather than the
                brands this section is showing. /marques is the brand hub and
                the correct destination for this anchor text; the other locales
                keep the origins page, which is translated. */}
            <Link
              href={language === 'fr' || language === 'en' ? '/marques' : '/our-origins'}
              className="inline-flex items-center gap-3 text-gold border border-gold/40 hover:border-gold hover:bg-gold hover:text-ink px-7 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300"
            >
              {language === 'fr' ? 'Découvrir Nos Marques' : 'Discover Our Brands'} <ArrowRight size={12} />
            </Link>
          </div>

          {/* Right collage — desktop only, mirrored */}
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-4 w-full lg:w-1/3 h-[420px]">
            {right.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: tiltFor(i, true) }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={i === 3 ? 'row-span-2 row-start-1' : ''}
              >
                <BrandTile brand={brand} className="w-full h-full" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Compact grid — mobile/tablet, no room for the flanking collage columns */}
        <div className="grid lg:hidden grid-cols-3 sm:grid-cols-4 gap-3 mt-12">
          {apiBrands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            >
              <BrandTile brand={brand} className="w-full h-24 sm:h-28" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ApiBlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
}

function BlogSection() {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);

  useEffect(() => {
    fetch(Endpoints.blogPosts + '?per_page=8')
      .then(r => r.json())
      .then(json => {
        const data: ApiBlogPost[] = json?.data ?? [];
        if (data.length > 0) setPosts(data.slice(0, 8));
      })
      .catch(() => { /* keep empty, section renders nothing */ });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="bg-ink py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden grain-overlay border-t border-sand/10">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={14} className="text-gold" />
              <span className="text-[9px] font-black tracking-[0.35em] uppercase text-gold">
                {t('blogTitle')}
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-sand uppercase tracking-tight leading-[0.9]">
              {language === 'fr' ? 'Nos Derniers' : 'Latest'}<br />
              <span className="text-gold">{language === 'fr' ? 'Articles' : 'Stories'}</span>
            </h2>
          </div>
          <Link
            href="/journal"
            className="hidden md:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold border border-gold hover:bg-gold hover:text-ink px-7 py-3.5 rounded-full transition-all duration-300"
          >
            {language === 'fr' ? 'Voir tout' : 'View All'} <ArrowRight size={11} />
          </Link>
        </div>

        {/* Four across on desktop so eight posts fill two complete rows; two on
            tablet, one on mobile — every breakpoint divides evenly into eight. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-y-12">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              // Stagger within the row, not across all eight — otherwise the
              // last card is still animating three-quarters of a second in.
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              className="h-full"
            >
              <Link href={`/journal/${post.slug}`} className="group flex flex-col h-full">
                <div className="rounded-[20px] overflow-hidden mb-4 aspect-[4/3] relative shadow-lg">
                  {post.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-sand flex items-center justify-center text-4xl">☕</div>
                  )}
                  <div className="absolute top-3 left-3 right-3">
                    <span className="inline-block max-w-full truncate bg-sand/90 backdrop-blur-sm text-ink text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors duration-500" />
                </div>

                {post.published_at && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-cocoa mb-2 uppercase tracking-widest">
                    <Calendar size={11} />
                    {new Date(post.published_at).toLocaleDateString(BLOG_DATE_LOCALE[language] ?? 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}

                <h3 className="font-display text-lg sm:text-xl uppercase tracking-tight text-sand mb-2 leading-tight line-clamp-2 min-h-[2.75rem] sm:min-h-[3.1rem] group-hover:text-gold transition-colors">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-sand/60 text-[13px] leading-relaxed line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                )}

                {/* mt-auto, not flex-1 on the excerpt: a post without one still
                    pins its link to the bottom, so all four CTAs align. */}
                <div className="flex items-center gap-2 mt-auto text-[11px] font-bold tracking-widest uppercase text-gold">
                  {t('readMore')}
                  <ArrowRight size={13} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex md:hidden justify-center mt-10">
          <Link href="/journal" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold border border-gold px-7 py-3.5 rounded-full">
            {language === 'fr' ? 'Voir tous les articles' : 'View All Articles'} <ArrowRight size={11} />
          </Link>
        </div>
      </div>
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
        <section className="relative w-full pt-16 pb-10 sm:pb-14 lg:pb-20 z-10 overflow-visible min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] flex flex-col justify-center">
          {/* The hero renders the brand as an SVG image, so the homepage had no
              <h1> at all — crawlers saw a page with no primary heading. This is
              visually hidden (sr-only), so nothing on screen changes. Copy is
              product/category-focused rather than the brand tagline: the title
              tag already states the brand, the H1 is what tells search engines
              what Cafrezzo actually sells. */}
          <h1 className="sr-only">{t('homeH1')}</h1>
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

            {/* Category strip — part of the hero composition, not its own band. */}
            <CategoriesSection />
          </div>
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

        {/* ── VALUE PROPS ──────────────────────────────────────────────── */}
        <section className="relative bg-ink py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 grain-overlay overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,160,90,0.06),_transparent_60%)] pointer-events-none" />
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="text-center mb-10 sm:mb-14">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-6 h-px bg-gold/40" />
                <span className="text-[9px] font-black tracking-[0.35em] uppercase text-sand/50">
                  {language === 'fr' ? 'Pourquoi Cafrezzo' : 'Why Shop With Us'}
                </span>
                <div className="w-6 h-px bg-gold/40" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-sand uppercase tracking-tight">
                {language === 'fr' ? 'Une Expérience Sans Compromis' : 'An Experience You Can Trust'}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Truck, title: t('freeShipping'), desc: t('freeShippingDesc') },
                { icon: CreditCard, title: t('securePayment'), desc: t('securePaymentDesc') },
                { icon: ShieldCheck, title: t('moneyBack'), desc: t('moneyBackDesc') },
                { icon: Headphones, title: t('customerService'), desc: t('customerServiceDesc') },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative bg-sand rounded-[28px] p-6 sm:p-9 flex flex-col items-center text-center gap-1 hover:-translate-y-2 transition-all duration-500 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_60px_-15px_rgba(201,160,90,0.35)] overflow-hidden"
                >
                  {/* Faint decorative rings — depth without noise */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-ink/[0.06] pointer-events-none" />
                  <div className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full border border-ink/[0.06] pointer-events-none" />

                  {/* Icon badge with a slow orbiting ring + accent dot */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 16 + i * 2, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-gold/25"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 16 + i * 2, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,160,90,0.7)]" />
                    </motion.div>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold/15 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ink group-hover:scale-110 transition-all duration-500">
                      <item.icon size={26} />
                    </div>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-ink mb-1">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-ink/60 leading-relaxed">{item.desc}</p>

                  {/* Accent underline that draws in on hover */}
                  <div className="h-[3px] w-0 group-hover:w-14 bg-gold transition-all duration-500 rounded-full mt-3" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRANDS MARQUEE ───────────────────────────────────────────── */}
        <BrandsShowcaseSection />

        {/* ── DAILY PICK / SHOP CTA ────────────────────────────────────── */}
        {/* This composition used to live in the hero, where the logo above it
            served as its headline and negative top margins pulled it up over
            the beans. Standing on its own it needs its own heading and top
            rule, and no margin hacks — the cup is now centred inside its
            column rather than hanging out of it, which the section's
            overflow-hidden was clipping. */}
        <section className="bg-ink py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden grain-overlay border-t border-sand/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,160,90,0.05),_transparent_65%)] pointer-events-none" />

          <div className="max-w-[1500px] mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6">

              {/* Copy */}
              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-10 h-px bg-gold mb-5 mx-auto lg:mx-0" />
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-sand uppercase tracking-tight leading-[0.95] mb-5">
                    {t('homeH1')}
                  </h2>
                  <p className="text-sand/60 text-sm leading-relaxed max-w-md lg:max-w-[320px]">
                    {t('heroSubtitle')}
                  </p>
                </motion.div>
              </div>

              {/* Cup + gold ambient glow */}
              <div className="w-full lg:w-1/3 relative flex items-center justify-center py-4">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl pointer-events-none w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] lg:w-[420px] lg:h-[420px]"
                  style={{ background: 'radial-gradient(circle, rgba(201,160,90,0.45) 0%, rgba(201,160,90,0.15) 55%, transparent 75%)' }}
                />
                {/* Reveal and float are separate layers: one transform per
                    element, so the looping y-float can't overwrite the
                    entrance animation. */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <motion.img
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    src="/cup5.png"
                    alt={t('icedCoffeeAlt')}
                    className="relative object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] w-[210px] sm:w-[280px] lg:w-[350px] xl:w-[400px] h-auto"
                  />
                </motion.div>
              </div>

              {/* Daily pick + CTAs */}
              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end gap-6 sm:gap-7">
                {/* A button, not a clickable div: it opens the product panel,
                    so it has to be reachable by keyboard. */}
                <motion.button
                  type="button"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  onClick={() => setSelectedProduct(dailyPick.product || featuredProducts[0] || null)}
                  className="w-full max-w-[300px] flex items-center justify-between gap-5 bg-sand/8 backdrop-blur-md p-4 rounded-3xl border border-sand/15 hover:border-gold/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] group cursor-pointer hover:bg-sand/14 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] transition-all duration-300"
                >
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold mb-1.5">
                      {dailyPick.label || t('dailyPick')}
                    </span>
                    <span className="text-sm font-bold text-sand truncate group-hover:text-gold transition-colors">
                      {dailyPick.product?.name || ' '}
                    </span>
                  </div>
                  <div className="w-16 h-20 shrink-0 bg-[#E1CDA4] rounded-xl p-1 relative shadow-inner transform group-hover:rotate-12 transition-transform duration-500 overflow-hidden">
                    <div className="w-full h-full border border-ink/10 rounded-lg"></div>
                    {dailyPick.product && getProductImage(dailyPick.product) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getProductImage(dailyPick.product)!} alt={dailyPick.product.name} className="w-full h-full object-cover absolute top-0 left-0 scale-[0.8] drop-shadow-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 text-2xl">☕</div>
                    )}
                  </div>
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="flex flex-col items-center lg:items-end gap-5"
                >
                  <Link
                    href="/shop"
                    className="bg-gold text-ink px-10 py-5 rounded-full text-xs font-bold tracking-[0.2em] uppercase shadow-xl hover:bg-[#b8914d] hover:shadow-gold/50 hover:scale-[1.04] active:scale-95 transition-all duration-300 flex items-center"
                  >
                    {t('shopNow')}
                    <div className="w-1.5 h-1.5 ml-3 bg-ink rounded-full" />
                  </Link>
                  <Link
                    href="/orders/track"
                    className="text-[10px] font-bold tracking-[0.15em] uppercase text-sand/60 hover:text-gold transition-colors underline underline-offset-4"
                  >
                    {t('footerTrackOrder')}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BLOG ─────────────────────────────────────────────────────── */}
        <BlogSection />

        {/* ── ABOUT / CONTENT ──────────────────────────────────────────── */}
        {/* Prose section. The homepage was almost entirely nav, imagery and
            product tiles, which reads as thin to crawlers and answers none of
            the questions a first-time visitor actually arrives with. Kept out
            of the hero deliberately: that paragraph is a 280px column. */}
        <section className="bg-ink py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden grain-overlay border-t border-sand/10">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-sand uppercase tracking-tight leading-[0.95] mb-8">
              {t('homeAboutHeading')}
            </h2>
            <div className="space-y-5 text-sand/70 text-sm sm:text-base leading-relaxed">
              <p>{t('homeAboutBody1')}</p>
              <p>{t('homeAboutBody2')}</p>
              {/* Third paragraph states who Cafrezzo sells to and where it
                  operates. Written to stand alone: this is the passage an AI
                  answer engine is most likely to quote when asked what
                  Cafrezzo is, and previously the homepage never said the
                  business serves the trade at all. */}
              <p>{t('homeAboutBody3')}</p>
            </div>

            {/* The homepage's only route into the B2B cluster. Before this the
                sole link was a generic "Professionnels" entry buried in the
                footer's Quick Links. */}
            {(language === 'fr' || language === 'en') && (
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                <Link
                  href="/professionnels"
                  className="text-gold font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  {t('homeAboutProCta')}
                </Link>
                {language === 'fr' && (
                  <>
                    <Link
                      href="/grossiste-cafe-paris"
                      className="text-gold font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                      Grossiste café à Paris
                    </Link>
                    <Link
                      href="/machine-a-cafe-professionnelle"
                      className="text-gold font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                      Machines à café professionnelles
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        {/* <TestimonialsSection /> */}

      </motion.div>

      <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
