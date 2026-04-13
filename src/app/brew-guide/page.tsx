"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Thermometer, Droplets, Clock, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { Endpoints } from '@/lib/api/endpoints';

interface BrewStep {
    step_number: number;
    instruction: string;
}

interface BrewGuide {
    id: number;
    method: string;
    slug: string;
    title: string;
    description: string;
    image: string | null;
    time: string | null;
    difficulty: string | null;
    specs: {
        grind: string | null;
        ratio: string | null;
        temperature: string | null;
        dose: string | null;
    };
    pro_tip: string | null;
    steps: BrewStep[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop';

export default function BrewGuidePage() {
    const [guides, setGuides] = useState<BrewGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [activeSlug, setActiveSlug] = useState<string>('');

    useEffect(() => {
        fetch(Endpoints.brewGuides)
            .then(r => r.json())
            .then(json => {
                const data: BrewGuide[] = json?.data ?? [];
                setGuides(data);
                if (data.length > 0) setActiveSlug(data[0].slug);
            })
            .catch(() => setGuides([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sb-white">
                <Loader2 size={32} className="animate-spin text-sb-green" />
            </div>
        );
    }

    if (guides.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sb-white">
                <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase">No brew guides available</p>
            </div>
        );
    }

    return (
        <div className="w-full relative bg-sb-white text-sb-black pb-32">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-24 pb-40 px-8 relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.05] mix-blend-overlay"></div>

                    <div className="max-w-[1400px] mx-auto text-center relative z-10">
                        <div className="text-[10px] bg-white/10 text-white font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-8 border border-white/20 backdrop-blur-sm">
                            Equipment & Technique
                        </div>
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-8 drop-shadow-xl"
                        >
                            The Science of<br />Extraction
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed font-medium"
                        >
                            Master the art of coffee making at home. Explore our definitive guide to variables, ratios, and professional brewing techniques.
                        </motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20"></div>
                </section>

                {/* Sub-navigation */}
                <div className="sticky top-0 z-[45] bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-4 px-4 overflow-x-auto">
                    <div className="max-w-[1200px] mx-auto flex gap-4 lg:gap-8 justify-start lg:justify-center min-w-max">
                        {guides.map(guide => (
                            <button
                                key={guide.slug}
                                onClick={() => {
                                    setActiveSlug(guide.slug);
                                    document.getElementById(guide.slug)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 px-6 py-2.5 rounded-full ${
                                    activeSlug === guide.slug
                                        ? 'bg-sb-black text-white shadow-lg'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {guide.method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Guides */}
                <section className="bg-sb-white py-20 px-4 lg:px-8">
                    <div className="max-w-[1200px] mx-auto space-y-32">
                        {guides.map((guide) => {
                            const specItems = [
                                { icon: Settings, label: 'Grind Size', value: guide.specs.grind },
                                { icon: Droplets, label: 'Ratio', value: guide.specs.ratio },
                                { icon: Thermometer, label: 'Temperature', value: guide.specs.temperature },
                                { icon: Clock, label: 'Dose', value: guide.specs.dose },
                            ].filter(s => s.value);

                            return (
                                <motion.div
                                    id={guide.slug}
                                    key={guide.slug}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    onViewportEnter={() => setActiveSlug(guide.slug)}
                                >
                                    {/* Header */}
                                    <div className="text-center mb-16">
                                        <div className="flex items-center justify-center gap-3 mb-6">
                                            <span className="w-12 h-[1px] bg-sb-green/30"></span>
                                            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-sb-green">{guide.method}</h2>
                                            <span className="w-12 h-[1px] bg-sb-green/30"></span>
                                        </div>
                                        <h3 className="font-display text-5xl lg:text-7xl uppercase tracking-tight text-sb-black mb-8 px-4">{guide.title}</h3>
                                        <div className="flex justify-center gap-4 flex-wrap px-4">
                                            {guide.time && (
                                                <span className="bg-sb-green/10 text-sb-green text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-sb-green/20">
                                                    Time: {guide.time}
                                                </span>
                                            )}
                                            {guide.difficulty && (
                                                <span className="bg-sb-black/5 text-sb-black text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-gray-200">
                                                    Difficulty: {guide.difficulty}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Split layout */}
                                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">

                                        {/* Left: Image + Specs */}
                                        <div className="w-full lg:w-1/2 flex flex-col gap-8">
                                            <div className="rounded-[40px] overflow-hidden relative shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] h-[400px] lg:h-[500px] group cursor-pointer border border-gray-100">
                                                <img
                                                    src={guide.image || FALLBACK_IMAGE}
                                                    alt={guide.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                                    <p className="text-sm font-medium leading-relaxed opacity-90 backdrop-blur-sm bg-black/20 p-4 rounded-2xl border border-white/10">
                                                        {guide.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {specItems.length > 0 && (
                                                <div className={`grid gap-4 ${specItems.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                                    {specItems.map((spec, sIdx) => (
                                                        <div key={sIdx} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                                                            <div className="w-10 h-10 rounded-full bg-sb-green/10 flex items-center justify-center text-sb-green mb-4 group-hover:scale-110 group-hover:bg-sb-green group-hover:text-white transition-all duration-500">
                                                                <spec.icon size={18} />
                                                            </div>
                                                            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{spec.label}</span>
                                                            <span className="text-xs font-bold text-sb-black">{spec.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Steps */}
                                        <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                            <div className="text-xs font-bold tracking-[0.2em] uppercase text-sb-green mb-8 flex items-center gap-4">
                                                <span className="w-8 h-[1px] bg-sb-green"></span>
                                                Step by Step Procedure
                                            </div>

                                            <div className="space-y-4">
                                                {guide.steps.map((step) => {
                                                    const stepId = `${guide.slug}-step-${step.step_number}`;
                                                    const isExpanded = expandedStep === stepId;

                                                    return (
                                                        <div
                                                            key={stepId}
                                                            className={`border rounded-3xl transition-all duration-300 overflow-hidden ${
                                                                isExpanded
                                                                    ? 'bg-sb-green border-sb-green text-white shadow-xl shadow-sb-green/20 scale-[1.02]'
                                                                    : 'bg-white border-gray-200 text-sb-black hover:border-sb-green group'
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={() => setExpandedStep(isExpanded ? null : stepId)}
                                                                className="w-full text-left p-6 sm:p-8 flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`font-display text-4xl leading-none ${isExpanded ? 'text-white/50' : 'text-gray-200 group-hover:text-sb-green transition-colors'}`}>
                                                                        {step.step_number.toString().padStart(2, '0')}
                                                                    </div>
                                                                    <div className={`font-bold text-sm tracking-wider uppercase pr-4 ${isExpanded ? 'text-white' : 'text-sb-black'}`}>
                                                                        Step {step.step_number}
                                                                    </div>
                                                                </div>
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                                                    isExpanded
                                                                        ? 'bg-white/20 text-white'
                                                                        : 'bg-gray-50 text-gray-400 group-hover:bg-sb-green group-hover:text-white'
                                                                }`}>
                                                                    {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                                                                </div>
                                                            </button>

                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.3 }}
                                                                    >
                                                                        <div className="px-6 sm:px-8 pb-8 pt-0 flex gap-6">
                                                                            <div className="w-[45px] flex-shrink-0 flex justify-center pt-2">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-white/50 relative">
                                                                                    {step.step_number !== guide.steps.length && (
                                                                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-white/20"></div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-white/90 text-lg leading-relaxed font-medium">
                                                                                {step.instruction}
                                                                            </p>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {guide.pro_tip && (
                                                <div className="mt-12 p-8 bg-sb-offwhite rounded-[32px] border border-gray-100 flex items-start gap-6">
                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sb-green shadow-sm flex-shrink-0">
                                                        <Check size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-xs tracking-widest uppercase mb-2">Pro Tip</h4>
                                                        <p className="text-gray-500 text-sm leading-relaxed">{guide.pro_tip}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
