import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * A hook that enables mouse-drag-to-scroll functionality for a horizontal scroll container.
 * Also handles basic touch and wheel events for consistency.
 */
export function useDragScroll() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;

        setIsDragging(true);
        // PageX - offsetLeft gives the initial click position inside the container
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);

        // Disable text selection during drag
        scrollRef.current.style.userSelect = 'none';
        scrollRef.current.style.cursor = 'grabbing';
    }, []);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
        if (scrollRef.current) {
            scrollRef.current.style.userSelect = 'auto';
            scrollRef.current.style.cursor = 'grab';
        }
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;

        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    // Cleanup cursor on unmount just in case
    useEffect(() => {
        const ref = scrollRef.current;
        if (ref) {
            ref.style.cursor = 'grab';
        }
        return () => {
            if (ref) {
                ref.style.cursor = 'auto';
            }
        };
    }, []);

    return {
        scrollRef,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        isDragging
    };
}
