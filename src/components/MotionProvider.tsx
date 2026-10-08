"use client";

import { MotionConfig } from 'framer-motion';

/**
 * Honours the operating system's "reduce motion" setting for every Framer
 * Motion animation on the site.
 *
 * With `reducedMotion="user"`, transform and layout animations are skipped for
 * visitors who ask for less motion, while opacity and colour transitions still
 * run. Without it, none of the site's ~40 animated components respected the
 * preference (WCAG 2.1 SC 2.3.3; required by the project conventions).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
