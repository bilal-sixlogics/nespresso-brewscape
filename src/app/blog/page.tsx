"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Endpoints } from '@/lib/api/endpoints';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { useLanguage } from '@/context/LanguageContext';

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
        featured: i === 0, readTime: '5 min read', author_name: p.author_name,
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
            <div className="min-h-screen flex items-center justify-center bg-sb-offwhite">
                <Loader2 size={32} className="animate-spin text-sb-green" />
            </div>
        );
    }

    if (!featuredPost) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sb-offwhite">
                <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase">No articles yet</p>
            </div>
        );
    }

    return (
        <div className="w-full relative bg-sb-offwhite text-sb-black overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Section */}
                <section className="bg-sb-green pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center relative z-10">
                        <div className="text-[10px] bg-white/10 text-white font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-6 border border-white/20 backdrop-blur-sm">{t('blogTitle')}</div>
                        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-4 sm:mb-6">
                            {t('blogTitle')}
                        </motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/70 max-w-2xl mx-auto text-lg">
                            {t('blogSubtitle')}
                        </motion.p>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl -mr-10 sm:-mr-20 -mt-10 sm:-mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-[#1A4531] rounded-full blur-3xl opacity-50 -ml-5 sm:-ml-10 -mb-5 sm:-mb-10"></div>

                    {/* Torn Paper effect transitioning to offwhite */}
                    <div className="torn-paper-offwhite-down z-20 absolute bottom-[-29px] left-0 w-full h-[30px]"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'300\\\' height=\\\'30\\\'%3E%3Cpath d=\\\'M0,0 L0,10 L15,18 L30,8 L45,22 L55,10 L70,25 L85,12 L100,28 L110,15 L125,25 L140,8 L155,20 L165,12 L180,25 L195,5 L210,22 L225,10 L240,28 L255,15 L270,22 L285,8 L300,18 L300,0 Z\\\' fill=\\\'%23Fafaf7\\\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', backgroundSize: '300px 30px' }}>
                    </div>
                </section>

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 pb-16 sm:pb-24 md:pb-40">

                    {/* Featured Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="mb-32 group cursor-pointer"
                    >
                        <div className="text-xs font-bold tracking-widest uppercase text-sb-green mb-6 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-sb-green inline-block"></span>
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 flex gap-3">
                                    <span className="bg-white/90 backdrop-blur-md text-sb-black text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-lg">
                                        {featuredPost.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content side (overlaps image on desktop) */}
                            <div className="w-[92%] lg:w-[45%] bg-white rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 lg:p-10 xl:p-14 shadow-2xl relative z-10 -mt-12 sm:-mt-20 lg:mt-0 lg:-ml-32 border border-gray-100 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-shadow duration-500">
                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
                                    <div className="flex items-center gap-1"><Calendar size={14} className="text-sb-green" /> {featuredPost.date}</div>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <div className="flex items-center gap-1"><Clock size={14} className="text-sb-green" /> {featuredPost.readTime}</div>
                                </div>

                                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase tracking-tight text-sb-black mb-4 sm:mb-6 leading-[1.1] group-hover:text-sb-green transition-colors">
                                    {featuredPost.title}
                                </h2>

                                <p className="text-gray-500 text-lg leading-relaxed mb-10">
                                    {featuredPost.excerpt}
                                </p>

                                <Link href={`/blog/${featuredPost.id}`} className="inline-flex items-center justify-center bg-sb-black text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-sb-green transition-colors group/btn">
                                    {t('readArticle')}
                                    <motion.div
                                        className="ml-3 bg-white/20 rounded-full p-1"
                                        whileHover={{ x: 5 }}
                                    >
                                        <ArrowRight size={14} />
                                    </motion.div>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Latest Posts Grid */}
                    <div className="mb-12 flex justify-between items-end border-b border-gray-200 pb-6">
                        <h3 className="font-display text-4xl uppercase tracking-tight text-sb-black">{t('latestEntries')}</h3>
                        <div className="hidden md:flex gap-4">
                            <button
                                onClick={() => { setActiveFilter(null); setPage(1); }}
                                className={`text-xs font-bold tracking-widest uppercase pb-2 border-b-2 transition-colors ${!activeFilter ? 'border-sb-green text-sb-green' : 'border-transparent text-gray-400 hover:text-sb-black'}`}
                            >
                                {t('all')}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveFilter(cat); setPage(1); }}
                                    className={`text-xs font-bold tracking-widest uppercase pb-2 border-b-2 transition-colors ${activeFilter === cat ? 'border-sb-green text-sb-green' : 'border-transparent text-gray-400 hover:text-sb-black'}`}
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
                                <Link href={`/blog/${post.id}`} className="flex flex-col h-full w-full">
                                    <div className="rounded-[30px] overflow-hidden mb-8 aspect-[4/3] relative shadow-lg">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-sm text-sb-black text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                                                {post.category}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                    </div>

                                    <div className="flex flex-col flex-1 pl-2">
                                        <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-400 mb-4 uppercase tracking-widest">
                                            <span>{post.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{post.readTime}</span>
                                        </div>

                                        <h4 className="font-display text-2xl lg:text-3xl uppercase tracking-tight text-sb-black mb-4 leading-tight group-hover:text-sb-green transition-colors">
                                            {post.title}
                                        </h4>

                                        <p className="text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-sb-green group/link mt-auto">
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
