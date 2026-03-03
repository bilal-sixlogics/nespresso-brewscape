"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';

export default function BlogPostClient({ id }: { id: string }) {
    const postData = {
        title: id === '1' ? 'The Art of the Perfect Crema: Science and Passion' : 'Discover the Depth of Modern Coffee Roasting',
        category: id === '1' ? 'Coffee Science' : 'Journal',
        date: id === '1' ? 'Oct 12, 2024' : 'Nov 05, 2024',
        readTime: id === '1' ? '4 min read' : '7 min read',
        image: id === '1' ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=2000&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2000&auto=format&fit=crop',
    };

    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden min-h-screen">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                <div className="pt-20 lg:pt-32 px-4 lg:px-8 max-w-[1000px] mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-sb-green transition-colors mb-12 group">
                        <ArrowLeft size={16} className="mr-3 transform group-hover:-translate-x-2 transition-transform" />
                        Back to Journal
                    </Link>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-8 uppercase tracking-widest">
                        <span className="text-sb-green bg-sb-green/10 px-3 py-1 rounded-full">{postData.category}</span>
                        <div className="flex items-center gap-1"><Calendar size={14} className="text-gray-300" /> {postData.date}</div>
                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                        <div className="flex items-center gap-1"><Clock size={14} className="text-gray-300" /> {postData.readTime}</div>
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sb-black mb-12 leading-[1.05]">
                        {postData.title}
                    </h1>
                </div>

                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 mb-16"
                >
                    <div className="rounded-[40px] overflow-hidden aspect-[21/9] lg:aspect-[3/1] bg-gray-100 relative shadow-2xl">
                        <img
                            src={postData.image}
                            alt={postData.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </motion.div>

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

                        <div className="flex-1 text-lg text-gray-600 leading-[1.9] space-y-8 font-serif">
                            <p className="text-2xl lg:text-3xl text-sb-black font-display uppercase tracking-tight leading-tight mb-12">
                                In the world of specialty coffee, the pursuit of the perfect cup is an endless journey. It is a harmonious blend of art, science, precision, and passion.
                            </p>

                            <p>
                                The golden layer resting atop a perfectly pulled shot of espresso—known as the crema—is often considered the holy grail of coffee extraction. But what exactly is it, and why does it matter so much to baristas and enthusiasts alike?
                            </p>

                            <p>
                                Crema is a flavorful, aromatic, reddish-brown froth that rests on top of a shot of espresso. It is formed when water under high pressure dissolves more carbon dioxide, which is a natural byproduct of the coffee roasting process. When the brewed liquid hits the normal atmospheric pressure of your cup, the liquid can no longer hold all of that gas, resulting in tiny, beautiful micro-bubbles.
                            </p>

                            <h3 className="font-display text-3xl uppercase text-sb-black tracking-tight mt-12 mb-6">The Indicators of Quality</h3>

                            <p>
                                A rich, tiger-striped crema is a strong indicator of several crucial factors in the brewing process:
                            </p>

                            <ul className="list-disc pl-6 space-y-4 my-8 marker:text-sb-green">
                                <li><strong>Freshness of the Roast:</strong> Coffee beans degas over time. A thick crema is a sign that the beans were roasted recently and still retain their essential oils and gases.</li>
                                <li><strong>Proper Grinding and Tamping:</strong> If the crema is too thin, it may indicate under-extraction (water flowing too quickly through coarse grounds). If it is too dark or dispersed, it might signify over-extraction.</li>
                                <li><strong>The Perfect Pressure:</strong> Traditional espresso machines use 9 bars of pressure to force water through the tamped grounds. This intense pressure is what creates the emulsion of coffee oils and water.</li>
                            </ul>

                            <blockquote className="border-l-4 border-sb-green pl-8 py-4 my-12 text-2xl italic font-display text-sb-black tracking-tight">
                                &quot;The crema is the signature of the barista, a tangible reflection of the care taken in every step of the process.&quot;
                            </blockquote>

                            <p>
                                Next time you order an espresso or pull a shot at home, take a moment to admire the crema before taking a sip. Notice its texture, its color, and its longevity. It is more than just foam; it is the physical manifestation of the coffee&apos;s journey from seed to cup.
                            </p>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-sb-black">
                                <span>Share Article</span>
                                <div className="flex gap-2 text-gray-400">
                                    <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-sb-green hover:text-white transition-colors"><Share2 size={16} /></button>
                                </div>
                            </div>

                            <button className="bg-sb-black text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-sb-green transition-colors">
                                Subscribe for Updates
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
