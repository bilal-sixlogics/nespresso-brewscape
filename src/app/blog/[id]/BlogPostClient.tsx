"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Endpoints } from '@/lib/api/endpoints';

interface BlogPost {
    id: number; title: string; slug: string; category: string; excerpt: string | null;
    body: string | null; featured_image: string | null; author_name: string | null;
    published_at: string | null;
}

export default function BlogPostClient({ id }: { id: string }) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(Endpoints.blogPost(id))
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(json => setPost(json?.data ?? null))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sb-white">
                <Loader2 size={32} className="animate-spin text-sb-green" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-sb-white">
                <h2 className="font-display text-3xl uppercase text-sb-black">Post Not Found</h2>
                <Link href="/blog" className="text-sb-green font-bold hover:underline text-sm">Back to Journal</Link>
            </div>
        );
    }

    const publishDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden min-h-screen">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="pt-20 lg:pt-32 px-4 lg:px-8 max-w-[1000px] mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-sb-green transition-colors mb-12 group">
                        <ArrowLeft size={16} className="mr-3 transform group-hover:-translate-x-2 transition-transform" />
                        Back to Journal
                    </Link>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-8 uppercase tracking-widest flex-wrap">
                        <span className="text-sb-green bg-sb-green/10 px-3 py-1 rounded-full">{post.category}</span>
                        {publishDate && <div className="flex items-center gap-1"><Calendar size={14} className="text-gray-300" /> {publishDate}</div>}
                        {post.author_name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                <span>{post.author_name}</span>
                            </>
                        )}
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sb-black mb-12 leading-[1.05]">
                        {post.title}
                    </h1>
                </div>

                {post.featured_image && (
                    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
                        className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 mb-16">
                        <div className="rounded-[40px] overflow-hidden aspect-[21/9] lg:aspect-[3/1] bg-gray-100 relative shadow-2xl">
                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                )}

                <div className="max-w-[800px] mx-auto px-4 lg:px-8 pb-32">
                    <div className="flex items-start gap-8">
                        <div className="hidden lg:flex flex-col gap-4 sticky top-40 text-gray-400">
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-sb-green hover:text-white hover:border-sb-green transition-all shadow-sm">
                                <Share2 size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-sb-black hover:text-white hover:border-sb-black transition-all shadow-sm">
                                <Bookmark size={16} />
                            </button>
                        </div>

                        <div className="flex-1">
                            {post.excerpt && (
                                <p className="text-2xl lg:text-3xl text-sb-black font-display uppercase tracking-tight leading-tight mb-12">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Render HTML body from admin */}
                            {post.body ? (
                                <div
                                    className="prose prose-lg max-w-none text-gray-600 leading-[1.9] prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-sb-black prose-a:text-sb-green prose-blockquote:border-sb-green prose-blockquote:font-display prose-blockquote:italic prose-li:marker:text-sb-green"
                                    dangerouslySetInnerHTML={{ __html: post.body }}
                                />
                            ) : (
                                <p className="text-gray-400 italic">This post has no content yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-sb-black">
                                <span>Share Article</span>
                                <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-sb-green hover:text-white transition-colors"><Share2 size={16} /></button>
                            </div>
                            <Link href="/blog" className="bg-sb-black text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-sb-green transition-colors">
                                More Articles
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
