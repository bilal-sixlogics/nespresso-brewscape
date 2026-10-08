import type { Metadata } from 'next';

import NotFoundContent from './not-found-content';

/**
 * Overrides what the locale layout would otherwise hand down.
 *
 * The layout's base metadata carries `index, follow`, a canonical pointing at
 * the locale homepage and a full hreflang cluster. Inherited here, a 404 page
 * said both "noindex" (Next adds that itself) and "index", and declared itself
 * a copy of the homepage. The 404 status was doing all the work; these make
 * the page agree with it.
 */
export const metadata: Metadata = {
	title: 'Page introuvable',
	description: 'La page que vous cherchez n’existe pas ou a été déplacée.',
	robots: {
		index: false,
		follow: true,
		googleBot: { index: false, follow: true },
	},
	alternates: null,
};

export default function NotFound() {
	return <NotFoundContent />;
}
