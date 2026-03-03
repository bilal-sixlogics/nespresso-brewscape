"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Thermometer, Droplets, Clock, Plus, Minus, Check } from 'lucide-react';

const brewMethods = [
    {
        id: 'chemex',
        method: 'Chemex',
        title: 'The Pristine Pour',
        desc: 'Achieve a pristine, clean cup of coffee by mastering the classic pour-over method. The thick paper filter removes all oils, yielding a tea-like body with high clarity of flavor.',
        img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop',
        time: '4 mins',
        difficulty: 'Medium',
        specs: {
            grind: 'Medium-Coarse',
            ratio: '1:15 (Coffee to Water)',
            temp: '200°F / 93°C',
            dose: '30g Coffee / 450g Water'
        },
        steps: [
            'Place the filter in the Chemex with the thickest part covering the spout.',
            'Rinse the filter thoroughly with hot water to remove paper taste and preheat the vessel. Discard the rinse water.',
            'Add 30g of medium-coarse coffee and shake to level the bed.',
            'Start the timer and pour 60g of water in a spiral motion to wet all the grounds. Let it bloom for 45 seconds.',
            'Slowly pour the remaining water in concentric circles, maintaining a steady volume in the cone until reaching 450g.'
        ]
    },
    {
        id: 'french-press',
        method: 'French Press',
        title: 'Rich & Full Bodied',
        desc: 'The French Press produces the richest, most full-bodied cup. With no paper filter to absorb the oils, you get a heavy, textural coffee experience.',
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
        time: '4 mins',
        difficulty: 'Easy',
        specs: {
            grind: 'Coarse',
            ratio: '1:12 (Coffee to Water)',
            temp: '205°F / 96°C',
            dose: '35g Coffee / 420g Water'
        },
        steps: [
            'Grind 35g of coffee very coarsely (size of sea salt).',
            'Add coffee to the preheated French Press.',
            'Pour 420g of hot water aggressively to saturate all grounds.',
            'Wait 4 minutes. A crust will form at the top.',
            'Using a spoon, gently break the crust and stir. Skim off the foam and remaining floating grounds for a cleaner cup.',
            'Insert the plunger and press down gently just below the surface of the coffee, but do not compress the grounds at the bottom. Pour immediately.'
        ]
    },
    {
        id: 'espresso',
        method: 'Espresso',
        title: 'Mastering Crema',
        desc: 'Pull barista-quality espresso shots at home. This method requires precision, pressure, and the right grind to extract a concentrated, syrupy shot of liquid gold.',
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=1200&auto=format&fit=crop',
        time: '30 secs',
        difficulty: 'Advanced',
        specs: {
            grind: 'Very Fine',
            ratio: '1:2 (Coffee to Yield)',
            temp: '200°F / 93°C',
            dose: '18g In / 36g Out'
        },
        steps: [
            'Grind 18g of coffee to a very fine, powdery consistency.',
            'Distribute the grounds evenly in the portafilter using a distribution tool or gentle tapping.',
            'Tamp firmly and perfectly level with about 30 lbs of pressure.',
            'Lock the portafilter into the group head and immediately start the extraction and a timer simultaneously.',
            'Aim for 36g of liquid espresso in 25 to 30 seconds. The stream should look like warm honey.'
        ]
    },
    {
        id: 'cold-brew',
        method: 'Cold Brew',
        title: 'Smooth & Refreshing',
        desc: 'Create silky smooth cold brew concentrate at home. By replacing heat with time, cold brewing extracts fewer bitter compounds, resulting in a naturally sweet cup.',
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1200&auto=format&fit=crop',
        time: '12-24 hrs',
        difficulty: 'Easy',
        specs: {
            grind: 'Extra Coarse',
            ratio: '1:5 (Coffee to Water) for Concentrate',
            temp: 'Cold / Room Temp',
            dose: '100g Coffee / 500g Water'
        },
        steps: [
            'Grind 100g of coffee to an extra coarse setting.',
            'Add the coffee into a large mason jar or dedicated cold brew maker.',
            'Pour 500g of cold or room temperature filtered water over the grounds.',
            'Stir gently to ensure all coffee is fully saturated.',
            'Cover and steep at room temperature for 12-16 hours, or in the fridge for 20-24 hours.',
            'Strain the concentrate through a fine mesh sieve or paper filter. Serve diluted with ice and equal parts water or milk.'
        ]
    }
];

export default function BrewGuidePage() {
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [activeMethodId, setActiveMethodId] = useState<string>(brewMethods[0].id);

    return (
        <div className="w-full relative bg-sb-white text-sb-black pb-32">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-24 pb-40 px-8 relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.05] mix-blend-overlay"></div>

                    <div className="max-w-[1400px] mx-auto text-center relative z-10">
                        <div className="text-[10px] bg-white/10 text-white font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-flex mb-8 border border-white/20 backdrop-blur-sm">Equipment & Technique</div>
                        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-8 drop-shadow-xl">
                            The Science of<br />Extraction
                        </motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                            Master the art of coffee making at home. Explore our definitive guide to variables, ratios, and professional brewing techniques.
                        </motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20"></div>
                </section>

                {/* Sub-navigation Anchor Links */}
                <div className="sticky top-0 z-[45] bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-4 px-4 overflow-x-auto">
                    <div className="max-w-[1200px] mx-auto flex gap-4 lg:gap-8 justify-start lg:justify-center min-w-max">
                        {brewMethods.map(method => (
                            <button
                                key={method.id}
                                onClick={() => {
                                    setActiveMethodId(method.id);
                                    document.getElementById(method.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 px-6 py-2.5 rounded-full ${activeMethodId === method.id
                                        ? 'bg-sb-black text-white shadow-lg'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {method.method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Guides Container */}
                <section className="bg-sb-white py-20 px-4 lg:px-8">
                    <div className="max-w-[1200px] mx-auto space-y-32">
                        {brewMethods.map((guide, i) => (
                            <motion.div
                                id={guide.id}
                                key={guide.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                onViewportEnter={() => setActiveMethodId(guide.id)}
                            >
                                {/* Header Section */}
                                <div className="text-center mb-16">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <span className="w-12 h-[1px] bg-sb-green/30"></span>
                                        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-sb-green">{guide.method}</h2>
                                        <span className="w-12 h-[1px] bg-sb-green/30"></span>
                                    </div>
                                    <h3 className="font-display text-5xl lg:text-7xl uppercase tracking-tight text-sb-black mb-8 px-4">{guide.title}</h3>

                                    <div className="flex justify-center gap-4 flex-wrap px-4">
                                        <span className="bg-sb-green/10 text-sb-green text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-sb-green/20">
                                            Time: {guide.time}
                                        </span>
                                        <span className="bg-sb-black/5 text-sb-black text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-gray-200">
                                            Difficulty: {guide.difficulty}
                                        </span>
                                    </div>
                                </div>

                                {/* Premium Split Layout */}
                                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">

                                    {/* Left Side: Imagery & Specs */}
                                    <div className="w-full lg:w-1/2 flex flex-col gap-8">
                                        {/* Main Image with Parallax mask effect */}
                                        <div className="rounded-[40px] overflow-hidden relative shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] h-[400px] lg:h-[500px] group cursor-pointer border border-gray-100">
                                            <img
                                                src={guide.img}
                                                alt={guide.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                                <p className="text-sm font-medium leading-relaxed opacity-90 backdrop-blur-sm bg-black/20 p-4 rounded-2xl border border-white/10">
                                                    {guide.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Specs Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { icon: Settings, label: 'Grind Size', value: guide.specs.grind },
                                                { icon: Droplets, label: 'Ratio', value: guide.specs.ratio },
                                                { icon: Thermometer, label: 'Temperature', value: guide.specs.temp },
                                                { icon: Clock, label: 'Dose', value: guide.specs.dose },
                                            ].map((spec, sIdx) => (
                                                <div key={sIdx} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                                                    <div className="w-10 h-10 rounded-full bg-sb-green/10 flex items-center justify-center text-sb-green mb-4 group-hover:scale-110 group-hover:bg-sb-green group-hover:text-white transition-all duration-500">
                                                        <spec.icon size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{spec.label}</span>
                                                    <span className="text-xs font-bold text-sb-black">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Side: Step-by-Step Interactive Guide */}
                                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                        <div className="text-xs font-bold tracking-[0.2em] uppercase text-sb-green mb-8 flex items-center gap-4">
                                            <span className="w-8 h-[1px] bg-sb-green"></span>
                                            Step by Step Procedure
                                        </div>

                                        <div className="space-y-4">
                                            {guide.steps.map((step, sIdx) => {
                                                const stepId = `${guide.id}-step-${sIdx}`;
                                                const isExpanded = expandedStep === stepId;

                                                return (
                                                    <div
                                                        key={stepId}
                                                        className={`border rounded-3xl transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-sb-green border-sb-green text-white shadow-xl shadow-sb-green/20 scale-[1.02]' : 'bg-white border-gray-200 text-sb-black hover:border-sb-green group'}`}
                                                    >
                                                        <button
                                                            onClick={() => setExpandedStep(isExpanded ? null : stepId)}
                                                            className="w-full text-left p-6 sm:p-8 flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-6">
                                                                <div className={`font-display text-4xl leading-none ${isExpanded ? 'text-white/50' : 'text-gray-200 group-hover:text-sb-green transition-colors'}`}>
                                                                    {(sIdx + 1).toString().padStart(2, '0')}
                                                                </div>
                                                                <div className={`font-bold text-sm tracking-wider uppercase pr-4 ${isExpanded ? 'text-white' : 'text-sb-black'}`}>
                                                                    Step {(sIdx + 1)}
                                                                </div>
                                                            </div>

                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isExpanded ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-sb-green group-hover:text-white'}`}>
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
                                                                                {sIdx !== guide.steps.length - 1 && (
                                                                                    <div className="absolute top-4 left-1/2 -translateX-1/2 w-[1px] h-20 bg-white/20"></div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-white/90 text-lg leading-relaxed font-medium">
                                                                            {step}
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-12 p-8 bg-sb-offwhite rounded-[32px] border border-gray-100 flex items-start gap-6">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sb-green shadow-sm flex-shrink-0">
                                                <Check size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs tracking-widest uppercase mb-2">Pro Tip</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Always pre-heat your brewing equipment and rinse your paper filters with hot water before adding coffee grounds. This prevents paper taste and temperature loss.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
