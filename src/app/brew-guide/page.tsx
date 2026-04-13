"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Thermometer, Droplets, Clock, Check, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
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

const DIFFICULTY_COLOR: Record<string, string> = {
    Easy:     'bg-emerald-500/20 text-emerald-700 border-emerald-300',
    Medium:   'bg-amber-500/20 text-amber-700 border-amber-300',
    Advanced: 'bg-red-500/20 text-red-700 border-red-300',
};

export default function BrewGuidePage() {
    const [guides, setGuides] = useState<BrewGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        fetch(Endpoints.brewGuides)
            .then(r => r.json())
            .then(json => {
                const data: BrewGuide[] = json?.data ?? [];
                setGuides(data);
            })
            .catch(() => setGuides([]))
            .finally(() => setLoading(false));
    }, []);

    // Reset step to 0 whenever guide changes
    const selectGuide = (index: number) => {
        setActiveIndex(index);
        setActiveStep(0);
    };

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

    const guide = guides[activeIndex];
    const totalSteps = guide.steps.length;
    const currentStep = guide.steps[activeStep];
    const specItems = [
        { icon: Settings,    label: 'Grind',  value: guide.specs.grind },
        { icon: Droplets,    label: 'Ratio',  value: guide.specs.ratio },
        { icon: Thermometer, label: 'Temp',   value: guide.specs.temperature },
        { icon: Clock,       label: 'Dose',   value: guide.specs.dose },
    ].filter(s => s.value);

    return (
        <div className="w-full relative bg-sb-offwhite text-sb-black overflow-x-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                {/* ── Hero ── */}
                <section className="bg-sb-green pt-20 sm:pt-24 pb-36 sm:pb-44 px-4 sm:px-8 relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.05]" />
                    <div className="max-w-[1200px] mx-auto text-center relative z-10">
                        <div className="text-[10px] bg-white/10 font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-6 border border-white/20 backdrop-blur-sm">
                            Equipment & Technique
                        </div>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="font-display text-4xl sm:text-6xl lg:text-8xl uppercase tracking-tight mb-4 drop-shadow-xl"
                        >
                            Brew Guide
                        </motion.h1>
                        <motion.p
                            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-white/70 max-w-xl mx-auto text-base sm:text-lg"
                        >
                            Pick your method. Follow the steps. Make the perfect cup.
                        </motion.p>
                    </div>
                    <div className="torn-paper-offwhite-down" />
                </section>

                {/* ── Method Selector ── */}
                <div className="sticky top-0 z-40 bg-sb-offwhite/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
                    <div className="max-w-[1200px] mx-auto px-4 py-3 overflow-x-auto">
                        <div className="flex gap-2 min-w-max mx-auto justify-start lg:justify-center">
                            {guides.map((g, i) => (
                                <button
                                    key={g.slug}
                                    onClick={() => selectGuide(i)}
                                    className={`relative px-5 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap ${
                                        i === activeIndex
                                            ? 'bg-sb-black text-white shadow-lg shadow-black/20'
                                            : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {g.method}
                                    {i === activeIndex && (
                                        <motion.span
                                            layoutId="method-pill"
                                            className="absolute inset-0 rounded-full bg-sb-black -z-10"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Guide Content ── */}
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={guide.slug}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                        >
                            {/* Guide header */}
                            <div className="text-center mb-12 sm:mb-16">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="w-10 h-[1px] bg-sb-green/40" />
                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-sb-green">{guide.method}</span>
                                    <span className="w-10 h-[1px] bg-sb-green/40" />
                                </div>
                                <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-sb-black mb-5">
                                    {guide.title}
                                </h2>
                                <div className="flex items-center justify-center flex-wrap gap-3">
                                    {guide.time && (
                                        <span className="bg-sb-green/10 text-sb-green text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-sb-green/20">
                                            {guide.time}
                                        </span>
                                    )}
                                    {guide.difficulty && (
                                        <span className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border ${DIFFICULTY_COLOR[guide.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {guide.difficulty}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Main split */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

                                {/* Left — image + specs */}
                                <div className="flex flex-col gap-6">
                                    <div className="rounded-[36px] overflow-hidden relative shadow-2xl h-[300px] sm:h-[400px] lg:h-[480px] group">
                                        <img
                                            src={guide.image || FALLBACK_IMAGE}
                                            alt={guide.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <p className="text-white/90 text-sm leading-relaxed backdrop-blur-sm bg-black/25 px-5 py-4 rounded-2xl border border-white/10">
                                                {guide.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Specs grid */}
                                    {specItems.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {specItems.map((spec, i) => (
                                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center group hover:shadow-lg hover:border-sb-green/20 transition-all duration-300">
                                                    <div className="w-9 h-9 rounded-full bg-sb-green/10 flex items-center justify-center text-sb-green mb-3 group-hover:bg-sb-green group-hover:text-white transition-all duration-300">
                                                        <spec.icon size={16} />
                                                    </div>
                                                    <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">{spec.label}</span>
                                                    <span className="text-xs font-bold text-sb-black leading-tight">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right — stepper */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="w-6 h-[1px] bg-sb-green" />
                                        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-sb-green">Step by Step</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                Step {activeStep + 1} of {totalSteps}
                                            </span>
                                            <span className="text-xs font-bold text-sb-green">
                                                {Math.round(((activeStep + 1) / totalSteps) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-sb-green rounded-full"
                                                animate={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}
                                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Step dots */}
                                    <div className="flex gap-2 mb-8 flex-wrap">
                                        {guide.steps.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveStep(i)}
                                                className={`transition-all duration-300 rounded-full font-bold text-[10px] ${
                                                    i === activeStep
                                                        ? 'w-8 h-8 bg-sb-green text-white shadow-lg shadow-sb-green/30'
                                                        : i < activeStep
                                                        ? 'w-8 h-8 bg-sb-green/20 text-sb-green border border-sb-green/30'
                                                        : 'w-8 h-8 bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                            >
                                                {i < activeStep ? <Check size={12} className="mx-auto" /> : i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active step card */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${guide.slug}-step-${activeStep}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.25 }}
                                            className="bg-sb-green rounded-[32px] p-8 sm:p-10 text-white shadow-2xl shadow-sb-green/20 flex-1 mb-6"
                                        >
                                            <div className="font-display text-7xl sm:text-8xl text-white/15 leading-none mb-4 select-none">
                                                {(activeStep + 1).toString().padStart(2, '0')}
                                            </div>
                                            <p className="text-white text-lg sm:text-xl leading-relaxed font-medium">
                                                {currentStep?.instruction}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Prev / Next navigation */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                                            disabled={activeStep === 0}
                                            className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-gray-200 bg-white text-sb-black text-xs font-bold uppercase tracking-widest hover:border-sb-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={14} /> Previous
                                        </button>

                                        {activeStep < totalSteps - 1 ? (
                                            <button
                                                onClick={() => setActiveStep(s => Math.min(totalSteps - 1, s + 1))}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-sb-black text-white text-xs font-bold uppercase tracking-widest hover:bg-sb-green transition-all shadow-lg"
                                            >
                                                Next Step <ChevronRight size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-sb-green/10 text-sb-green border border-sb-green/30 text-xs font-bold uppercase tracking-widest">
                                                <Check size={14} /> Complete!
                                            </div>
                                        )}
                                    </div>

                                    {/* Pro tip */}
                                    {guide.pro_tip && (
                                        <div className="mt-6 p-6 bg-white rounded-[24px] border border-gray-100 flex items-start gap-4 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-sb-green/10 flex items-center justify-center text-sb-green flex-shrink-0">
                                                <Check size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest uppercase text-sb-green mb-1">Pro Tip</p>
                                                <p className="text-gray-500 text-sm leading-relaxed">{guide.pro_tip}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
