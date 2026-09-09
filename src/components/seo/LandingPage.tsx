import Link from 'next/link';

import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks, type RelatedLink } from '@/components/seo/RelatedLinks';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { generateBreadcrumbSchema, generateFaqSchema } from '@/lib/seo';
import { localePath, type Locale } from '@/lib/i18n';
import type { Product } from '@/types';
import { getProductImage, getDisplayPrice } from '@/types';

/**
 * Shared shell for the commercial landing pages
 * (/grossiste-cafe-paris, /grossiste-machines-a-cafe, ...).
 *
 * The *shell* is shared; the content never is. Each page passes its own
 * headings, prose, FAQ and product selection, because four pages built from
 * one paragraph template with the place name swapped is the definition of the
 * doorway page Google penalises. What is shared here is only layout, schema
 * wiring and the visual language already used across the site.
 */

export interface LandingSection {
    heading: string;
    /** Body paragraphs. */
    body?: string[];
    /** Optional card grid, rendered after the paragraphs. */
    cards?: { name: string; body: string }[];
    /** Optional inline links closing out the section. */
    links?: { href: string; label: string }[];
}

export interface LandingFaq {
    question: string;
    answer: string;
}

export interface LandingContent {
    h1: string;
    /** Lead paragraphs. Written to be quotable in isolation. */
    intro: string[];
    sections: LandingSection[];
    faqHeading: string;
    faqs: LandingFaq[];
    ctaHeading: string;
    ctaBody: string;
    ctaLabel: string;
    relatedHeading: string;
    related: RelatedLink[];
    /** Heading for the product grid; omitted when no products are passed. */
    productsHeading?: string;
    productsIntro?: string;
    productsLinkLabel?: string;
    /** Locale-free path the "see all" link under the grid points at. */
    productsLinkHref?: string;
    /** Breadcrumb label for this page. */
    breadcrumbLabel: string;
}

export function LandingPage({
    locale,
    path,
    content,
    products = [],
}: {
    locale: Locale;
    /** Locale-free path of this page, for the breadcrumb trail. */
    path: string;
    content: LandingContent;
    /** Real catalogue items, so the page is a shop entry point, not just prose. */
    products?: Product[];
}) {
    const schemas: object[] = [
        generateBreadcrumbSchema(locale, [
            { name: locale === 'en' ? 'Home' : 'Accueil', url: '/' },
            { name: content.breadcrumbLabel, url: path },
        ]),
    ];

    // Only emit FAQPage when there are genuine questions on the page. An empty
    // mainEntity array is an invalid FAQPage and Search Console flags it.
    if (content.faqs.length) schemas.push(generateFaqSchema(content.faqs));

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <JsonLd schema={schemas} />

            <section className="pt-20 pb-12 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto">
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight mb-8 leading-[1.05] text-center">
                        {content.h1}
                    </h1>
                    <div className="max-w-xs mx-auto mb-10">
                        <CupSeparator tone="gold" />
                    </div>
                    <div className="space-y-5">
                        {content.intro.map(p => (
                            <p key={p.slice(0, 40)} className="text-sand/70 text-lg leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {content.sections.map(section => (
                <section key={section.heading} className="py-14 px-4 sm:px-8">
                    <div className="max-w-[1100px] mx-auto">
                        <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-6">
                            {section.heading}
                        </h2>

                        {section.body?.map(p => (
                            <p key={p.slice(0, 40)} className="text-sand/70 text-lg leading-relaxed mb-5 max-w-[900px]">
                                {p}
                            </p>
                        ))}

                        {section.cards && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {section.cards.map(card => (
                                    <div
                                        key={card.name}
                                        className="bg-sand p-8 rounded-[30px] border border-ink/10"
                                    >
                                        <h3 className="font-bold uppercase tracking-widest text-sm mb-3 text-ink">
                                            {card.name}
                                        </h3>
                                        <p className="text-ink/60 text-sm leading-relaxed">{card.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.links && (
                            <div className="flex flex-wrap gap-6 mt-8">
                                {section.links.map(link => (
                                    <Link
                                        key={link.href}
                                        href={localePath(locale, link.href)}
                                        className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ))}

            {/* Real products, server-rendered. Keeps the page a genuine entry
                point into the catalogue and gives every landing page crawlable
                links down to product detail pages. */}
            {products.length > 0 && content.productsHeading && (
                <section className="py-14 px-4 sm:px-8">
                    <div className="max-w-[1100px] mx-auto">
                        <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-6">
                            {content.productsHeading}
                        </h2>
                        {content.productsIntro && (
                            <p className="text-sand/70 text-lg leading-relaxed mb-10 max-w-[900px]">
                                {content.productsIntro}
                            </p>
                        )}
                        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map(product => {
                                const image = getProductImage(product);
                                return (
                                    <li key={product.slug ?? product.id}>
                                        <Link
                                            href={localePath(locale, `/shop/${product.slug}`)}
                                            className="group block"
                                        >
                                            <div className="rounded-[24px] overflow-hidden aspect-square bg-sand/5 mb-4 border border-sand/10">
                                                {image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={image}
                                                        // Descriptive alt built from the real product
                                                        // and brand names — no keyword stuffing, just
                                                        // what the image actually shows.
                                                        alt={
                                                            product.brand?.name
                                                                ? `${product.name} — ${product.brand.name}`
                                                                : product.name
                                                        }
                                                        loading="lazy"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                )}
                                            </div>
                                            <span className="block text-sm font-bold text-sand leading-snug group-hover:text-gold transition-colors">
                                                {product.name}
                                            </span>
                                            <span className="block mt-1 text-sm text-gold font-bold">
                                                {getDisplayPrice(product).toFixed(2).replace('.', ',')} €
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        {content.productsLinkHref && content.productsLinkLabel && (
                            <Link
                                href={localePath(locale, content.productsLinkHref)}
                                className="inline-block mt-10 text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                            >
                                {content.productsLinkLabel}
                            </Link>
                        )}
                    </div>
                </section>
            )}

            {content.faqs.length > 0 && (
                <section className="py-14 px-4 sm:px-8">
                    <div className="max-w-[900px] mx-auto">
                        <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-12">
                            {content.faqHeading}
                        </h2>
                        <div className="space-y-10">
                            {content.faqs.map(faq => (
                                <div key={faq.question}>
                                    <h3 className="font-display text-xl uppercase tracking-tight text-sand mb-3">
                                        {faq.question}
                                    </h3>
                                    <p className="text-sand/70 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[900px] mx-auto text-center">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-5">
                        {content.ctaHeading}
                    </h2>
                    <p className="text-sand/70 text-lg leading-relaxed mb-10">{content.ctaBody}</p>
                    <Link
                        href={localePath(locale, '/contact')}
                        className="inline-block bg-gold text-ink px-10 py-4 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-[#b8914d] transition-colors shadow-lg"
                    >
                        {content.ctaLabel}
                    </Link>
                </div>
            </section>

            <RelatedLinks
                locale={locale}
                heading={content.relatedHeading}
                links={content.related}
            />
        </div>
    );
}
