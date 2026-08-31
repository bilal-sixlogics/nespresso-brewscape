"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar, Loader2 } from 'lucide-react';
import Link from '@/components/LocaleLink';

import { Endpoints } from '@/lib/api/endpoints';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { useLanguage } from '@/context/LanguageContext';
import { CupSeparator } from '@/components/ui/CupSeparator';

interface ApiBlogPost {
    id: number; title: string; slug: string; category: string; excerpt: string | null;
    body: string | null; featured_image: string | null; status: string;
    is_featured: boolean; author_name: string | null; published_at: string | null;
}

export default function BlogPage() {
    const { t } = useLanguage();
    const [allPosts, setAllPosts] = useState<ApiBlogPost[]>([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const PER_PAGE = 6;

    useEffect(() => {
        fetch(Endpoints.blogPosts + '?per_page=50')
            .then(r => r.json())
            .then(json => setAllPosts(json?.data ?? []))
            .catch(() => setAllPosts([]))
            .finally(() => setApiLoading(false));
    }, []);

    // Map to display format
    const postsWithFeatured = allPosts.map((p, i) => ({
        id: p.id, title: p.title, slug: p.slug, category: p.category,
        excerpt: p.excerpt || '', image: p.featured_image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        date: p.published_at ? new Date(p.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        featured: i === 0, readTime: t('readTimeMinutes').replace('{{min}}', '5'), author_name: p.author_name,
    }));
    const featuredPost = postsWithFeatured.find(p => p.featured) || postsWithFeatured[0];
    const standardPosts = postsWithFeatured.filter(p => !p.featured);
    const categories = [...new Set(allPosts.map(p => p.category).filter(Boolean))];
    const filteredPosts = activeFilter
        ? standardPosts.filter(p => p.category === activeFilter)
        : standardPosts;
    const displayedItems = filteredPosts.slice(0, page * PER_PAGE);
    const hasMore = displayedItems.length < filteredPosts.length;
    const loadMore = () => setPage(p => p + 1);
    const totalCount = allPosts.length;

    if (apiLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        );
    }

    if (!featuredPost) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <p className="text-cocoa text-sm font-semibold tracking-widest uppercase">{t('noArticlesYet')}</p>
            </div>
        );
    }

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Section */}
                <section className="bg-ink pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 lg:px-8 relative text-sand">
                    <div className="max-w-[1400px] mx-auto text-center relative z-10">
                        <div className="text-[10px] bg-sand/10 text-sand font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-6 border border-sand/15 backdrop-blur-sm">{t('blogTitle')}</div>
                        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-4 sm:mb-6">
                            {t('blogTitle')}
                        </motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-sand/70 max-w-2xl mx-auto text-lg">
                            {t('blogSubtitle')}
                        </motion.p>
                        <div className="max-w-xs mx-auto mt-10 relative z-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-sand/5 rounded-full blur-3xl -mr-10 sm:-mr-20 -mt-10 sm:-mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-gold/10 rounded-full blur-3xl opacity-50 -ml-5 sm:-ml-10 -mb-5 sm:-mb-10"></div>

                </section>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 pb-16 sm:pb-24 md:pb-40">

                    {/* Featured Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="mb-32 group cursor-pointer"
                    >
                        <div className="text-xs font-bold tracking-widest uppercase text-gold mb-6 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-gold inline-block"></span>
                            {t('featuredEditorPick')}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 items-center relative">
                            {/* Image side */}
                            <div className="w-full lg:w-[65%] rounded-[28px] sm:rounded-[40px] overflow-hidden relative z-0 shadow-2xl h-[240px] sm:h-[360px] lg:h-[500px]">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 flex gap-3">
                                    <span className="bg-sand/90 backdrop-blur-md text-ink text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-lg">
                                        {featuredPost.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content side (overlaps image on desktop) */}
                            <div className="w-[92%] lg:w-[45%] bg-sand rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 lg:p-10 xl:p-14 shadow-2xl relative z-10 -mt-12 sm:-mt-20 lg:mt-0 lg:-ml-32 border border-ink/10 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-shadow duration-500">
                                <div className="flex items-center gap-4 text-xs font-semibold text-ink/50 mb-6 uppercase tracking-wider">
                                    <div className="flex items-center gap-1"><Calendar size={14} className="text-gold" /> {featuredPost.date}</div>
                                    <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                                    <div className="flex items-center gap-1"><Clock size={14} className="text-gold" /> {featuredPost.readTime}</div>
                                </div>

                                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase tracking-tight text-ink mb-4 sm:mb-6 leading-[1.1] group-hover:text-gold transition-colors">
                                    {featuredPost.title}
                                </h2>

                                <p className="text-ink/60 text-lg leading-relaxed mb-10">
                                    {featuredPost.excerpt}
                                </p>

                                <Link href={`/journal/${featuredPost.slug}`} className="inline-flex items-center justify-center bg-gold text-ink px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#b8914d] transition-colors group/btn">
                                    {t('readArticle')}
                                    <motion.div
                                        className="ml-3 bg-ink/15 rounded-full p-1"
                                        whileHover={{ x: 5 }}
                                    >
                                        <ArrowRight size={14} />
                                    </motion.div>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Latest Posts Grid */}
                    <div className="mb-12 flex justify-between items-end border-b border-sand/15 pb-6">
                        <h3 className="font-display text-4xl uppercase tracking-tight text-sand">{t('latestEntries')}</h3>
                        <div className="hidden md:flex gap-4">
                            <button
                                onClick={() => { setActiveFilter(null); setPage(1); }}
                                className={`text-xs font-bold tracking-widest uppercase pb-2 border-b-2 transition-colors ${!activeFilter ? 'border-gold text-gold' : 'border-transparent text-cocoa hover:text-sand'}`}
                            >
                                {t('all')}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveFilter(cat); setPage(1); }}
                                    className={`text-xs font-bold tracking-widest uppercase pb-2 border-b-2 transition-colors ${activeFilter === cat ? 'border-gold text-gold' : 'border-transparent text-cocoa hover:text-sand'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
                        {displayedItems.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group cursor-pointer flex flex-col h-full"
                            >
                                <Link href={`/journal/${post.slug}`} className="flex flex-col h-full w-full">
                                    <div className="rounded-[30px] overflow-hidden mb-8 aspect-[4/3] relative shadow-lg">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-sand/90 backdrop-blur-sm text-ink text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                                                {post.category}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors duration-500"></div>
                                    </div>

                                    <div className="flex flex-col flex-1 pl-2">
                                        <div className="flex items-center gap-4 text-[10px] font-semibold text-cocoa mb-4 uppercase tracking-widest">
                                            <span>{post.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-sand/20"></span>
                                            <span>{post.readTime}</span>
                                        </div>

                                        <h4 className="font-display text-2xl lg:text-3xl uppercase tracking-tight text-sand mb-4 leading-tight group-hover:text-gold transition-colors">
                                            {post.title}
                                        </h4>

                                        <p className="text-sand/60 leading-relaxed mb-6 flex-1 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gold group/link mt-auto">
                                            {t('readMore')}
                                            <ArrowRight size={14} className="transform group-hover/link:translate-x-2 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <LoadMoreButton
                        isLoading={false}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        totalCount={totalCount}
                        text={t('loadMoreArticles')}
                        noMoreText={t('youveReadEverything')}
                    />
                </div>
            </motion.div>
        </div>
    );
}
