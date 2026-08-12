// StoreGallery.tsx
import React, { useState, useEffect  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface StoreImage {
    id: number;
    path: string;
    is_primary: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    store_location_id: number;
}

function Lightbox({
    images,
    index,
    onClose,
    onIndexChange,
}: {
    images: StoreImage[];
    index: number;
    onClose: () => void;
    onIndexChange: (i: number) => void;
}) {
    // Close on Escape, navigate with arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowLeft") {
                onIndexChange((index - 1 + images.length) % images.length);
            } else if (e.key === "ArrowRight") {
                onIndexChange((index + 1) % images.length);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [index, images.length, onClose, onIndexChange]);

    // Lock body scroll while open
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        onIndexChange((index - 1 + images.length) % images.length);
    };
    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        onIndexChange((index + 1) % images.length);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-ink/95 backdrop-blur-md flex flex-col"
            onClick={onClose}
        >
            <div className="flex items-center justify-between px-6 py-5 relative z-[1000]">
                <span className="text-sand/60 text-xs font-bold uppercase tracking-widest">
                    {index + 1} / {images.length}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="w-10 h-10 rounded-full bg-sand/10 hover:bg-sand/20 flex items-center justify-center text-sand transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>

            <div
                className="flex-1 flex items-center justify-center px-6 md:px-20 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {images.length > 1 && (
                    <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-3 md:left-8 w-11 h-11 rounded-full bg-sand/10 hover:bg-gold hover:text-ink flex items-center justify-center text-sand transition-colors cursor-pointer z-[1000]"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={images[index]?.id}
                        src={images[index]?.path}
                        alt=""
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                        className="max-h-[70vh] max-w-full object-contain rounded-2xl pointer-events-none"
                    />
                </AnimatePresence>
                {images.length > 1 && (
                    <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-3 md:right-8 w-11 h-11 rounded-full bg-sand/10 hover:bg-gold hover:text-ink flex items-center justify-center text-sand transition-colors cursor-pointer z-[1000]"
                        aria-label="Next image"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            {images.length > 1 && (
                <div
                    className="flex justify-center gap-2 pb-8 px-6 flex-wrap relative z-[1000]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((img, i) => (
                        <button
                            type="button"
                            key={img.id}
                            onClick={() => onIndexChange(i)}
                            className={`rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                                i === index ? "ring-2 ring-gold" : "opacity-40 hover:opacity-80"
                            }`}
                        >
                            <img src={img.path} alt="" className="w-14 h-11 object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export const StoreGallery = ({ images }: { images: StoreImage[] }) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!images?.length) {
        return (
            <div className="w-full aspect-[16/9] rounded-2xl bg-ink/5 border border-ink/10 flex flex-col items-center justify-center text-ink/30 gap-2">
                <ImageIcon size={32} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">No Photos</span>
            </div>
        );
    }

    const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
    const visible = sorted.slice(0, 5);
    const gridThumbs = visible.slice(1);
    const remaining = sorted.length - visible.length;
    const heroFull = visible.length === 1;

    const open = (i: number) => setLightboxIndex(i);

    return (
        <>
            <div className="grid grid-cols-4 grid-rows-2 gap-1.5 rounded-2xl overflow-hidden h-[620px] sm:h-[480px] md:h-[520px]">
                <button
                    onClick={() => open(0)}
                    className={`relative overflow-hidden group ${
                        heroFull ? "col-span-4 row-span-2" : "col-span-4 row-span-2 sm:col-span-2"
                    }`}
                >
                    <img
                        src={visible[0].path}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </button>

                {!heroFull &&
                    gridThumbs.map((img, i) => {
                        const isLast = i === gridThumbs.length - 1;
                        const showOverlay = isLast && remaining > 0;
                        return (
                            <button
                                key={img.id}
                                onClick={() => open(i + 1)}
                                className="hidden sm:block relative overflow-hidden group"
                            >
                                <img
                                    src={img.path}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {showOverlay && (
                                    <div className="absolute inset-0 bg-ink/65 flex flex-col items-center justify-center gap-1 text-sand">
                                        <Expand size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">
                                            +{remaining} photos
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}

                {!heroFull &&
                    Array.from({ length: Math.max(0, 4 - gridThumbs.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="hidden sm:block bg-ink/5" />
                    ))}
            </div>

            {images.length > 1 && (
                <button
                    onClick={() => open(0)}
                    className="sm:hidden mt-2 w-full py-2 rounded-full border border-ink/10 text-ink/60 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <ImageIcon size={12} /> View all {images.length} photos
                </button>
            )}

            <AnimatePresence>
                {lightboxIndex !== null && (
                    <Lightbox
                        images={sorted}
                        index={lightboxIndex}
                        onClose={() => setLightboxIndex(null)}
                        onIndexChange={setLightboxIndex}
                    />
                )}
            </AnimatePresence>
        </>
    );
};