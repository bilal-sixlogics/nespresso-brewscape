"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

const blogPosts = [
    {
        id: '1',
        title: 'The Art of the Perfect Crema: Science and Passion',
        excerpt: 'Discover why that golden layer on top of your espresso is the ultimate indicator of quality, freshness, and expert extraction.',
        category: 'Coffee Science',
        date: 'Oct 12, 2024',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=1200&auto=format&fit=crop',
        featured: true
    },
    {
        id: '2',
        title: 'Sustainably Sourced: Our Journey to Colombia',
        excerpt: 'Travel with us to the high-altitude farms of Colombia where our Master Origin beans are meticulously cultivated.',
        category: 'Sustainability',
        date: 'Sep 28, 2024',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
        featured: false
    },
    {
        id: '3',
        title: 'Decoding Coffee Tasting Notes',
        excerpt: 'From jasmine and bergamot to dark chocolate and tobacco. Here is your definitive guide to developing a barista palate.',
        category: 'Tasting',
        date: 'Sep 15, 2024',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=800&auto=format&fit=crop',
        featured: false
    },
    {
        id: '4',
        title: 'The Evolution of the Espresso Machine',
        excerpt: 'Trace the history of the machines that revolutionized our mornings, from early steam pressure to modern micro-boilers.',
        category: 'History',
        date: 'Aug 30, 2024',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?q=80&w=800&auto=format&fit=crop',
        featured: false
    },
    {
        id: '5',
        title: 'Pairing Coffee with Pastries',
        excerpt: 'Elevate your afternoon fika by learning which roast profiles perfectly complement your favorite baked goods.',
        category: 'Lifestyle',
        date: 'Aug 14, 2024',
        readTime: '3 min read',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
        featured: false
    }
];

import { usePagination } from '@/hooks/usePagination';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';

export default function BlogPage() {
    const featuredPost = blogPosts.find(p => p.featured) || blogPosts[0];
    const standardPosts = blogPosts.filter(p => !p.featured);
    const { displayedItems, hasMore, isLoading, loadMore, totalCount } = usePagination(standardPosts, 6);

    return (
        <div className="w-full relative bg-sb-offwhite text-sb-black overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Section */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center relative z-10">
                        <div className="text-[10px] bg-white/10 text-white font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-6 border border-white/20 backdrop-blur-sm">The Journal</div>
                        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
                            Coffee Notes
                        </motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/70 max-w-2xl mx-auto text-lg">
                            Read our latest thoughts on coffee sourcing, roasting, brewing, and the culture that surrounds it.
                        </motion.p>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1A4531] rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>

                    {/* Torn Paper effect transitioning to offwhite */}
                    <div className="torn-paper-offwhite-down z-20 absolute bottom-[-29px] left-0 w-full h-[30px]"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'300\\\' height=\\\'30\\\'%3E%3Cpath d=\\\'M0,0 L0,10 L15,18 L30,8 L45,22 L55,10 L70,25 L85,12 L100,28 L110,15 L125,25 L140,8 L155,20 L165,12 L180,25 L195,5 L210,22 L225,10 L240,28 L255,15 L270,22 L285,8 L300,18 L300,0 Z\\\' fill=\\\'%23Fafaf7\\\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', backgroundSize: '300px 30px' }}>
                    </div>
                </section>

                <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-24 pb-40">

                    {/* Featured Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="mb-32 group cursor-pointer"
                    >
                        <div className="text-xs font-bold tracking-widest uppercase text-sb-green mb-6 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-sb-green inline-block"></span>
                            Featured Editor\\'s Pick
                        </div>

                        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 items-center relative">
                            {/* Image side */}
                            <div className="w-full lg:w-[65%] rounded-[40px] overflow-hidden relative z-0 shadow-2xl h-[400px] lg:h-[600px]">
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
                            <div className="w-[90%] lg:w-[45%] bg-white rounded-[40px] p-10 lg:p-14 shadow-2xl relative z-10 -mt-20 lg:mt-0 lg:-ml-32 border border-gray-100 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-shadow duration-500">
                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
                                    <div className="flex items-center gap-1"><Calendar size={14} className="text-sb-green" /> {featuredPost.date}</div>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <div className="flex items-center gap-1"><Clock size={14} className="text-sb-green" /> {featuredPost.readTime}</div>
                                </div>

                                <h2 className="font-display text-4xl lg:text-5xl uppercase tracking-tight text-sb-black mb-6 leading-[1.1] group-hover:text-sb-green transition-colors">
                                    {featuredPost.title}
                                </h2>

                                <p className="text-gray-500 text-lg leading-relaxed mb-10">
                                    {featuredPost.excerpt}
                                </p>

                                <Link href={`/blog/${featuredPost.id}`} className="inline-flex items-center justify-center bg-sb-black text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-sb-green transition-colors group/btn">
                                    Read Article
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
                        <h3 className="font-display text-4xl uppercase tracking-tight text-sb-black">Latest Entries</h3>
                        <div className="hidden md:flex gap-4">
                            {['All', 'Science', 'Origins', 'Culture'].map((filter, i) => (
                                <button key={filter} className={`text-xs font-bold tracking-widest uppercase pb-2 border-b-2 transition-colors ${i === 0 ? 'border-sb-green text-sb-green' : 'border-transparent text-gray-400 hover:text-sb-black'}`}>
                                    {filter}
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
                                            Read More
                                            <ArrowRight size={14} className="transform group-hover/link:translate-x-2 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <LoadMoreButton
                        isLoading={isLoading}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        totalCount={totalCount + 1} // +1 for the featured post
                        text="Load More Articles"
                        noMoreText="You've read everything!"
                    />
                </div>
            </motion.div>
        </div>
    );
}
