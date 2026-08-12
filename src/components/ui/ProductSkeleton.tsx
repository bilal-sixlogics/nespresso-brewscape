"use client";

export function ProductSkeleton() {
    return (
        <div className="bg-sand rounded-2xl sm:rounded-[40px] p-2.5 sm:p-4 border border-cocoa/15 shadow-sm flex flex-col w-full h-full max-w-lg mx-auto overflow-hidden relative">
            {/* Shimmer sweep */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite]"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,160,90,0.25) 50%, transparent 100%)' }}
                />
            </div>

            {/* Image zone — 1:1 matches ProductCard */}
            <div
                className="rounded-xl sm:rounded-[32px] bg-cocoa/10 shrink-0 w-full"
                style={{ aspectRatio: '1/1' }}
            />

            {/* Content — mirrors ProductCard content zone */}
            <div className="px-1.5 sm:px-3 pt-3 sm:pt-5 pb-1 sm:pb-2 flex flex-col flex-1 gap-1.5 sm:gap-2">
                {/* Title lines */}
                <div className="h-3 sm:h-[18px] bg-cocoa/10 rounded-full w-4/5" />
                <div className="h-3 sm:h-[18px] bg-cocoa/10 rounded-full w-3/5" />

                {/* Notes pills */}
                <div className="flex gap-1 sm:gap-1.5 mt-0.5">
                    <div className="h-4 sm:h-5 bg-cocoa/10 rounded-full w-16" />
                    <div className="h-4 sm:h-5 bg-cocoa/10 rounded-full w-12" />
                </div>

                {/* Intensity bar */}
                <div className="h-1 sm:h-1.5 bg-cocoa/10 rounded-full w-full" />

                {/* Price */}
                <div className="h-5 sm:h-7 bg-cocoa/10 rounded-full w-1/3 mt-auto" />
            </div>
        </div>
    );
}
