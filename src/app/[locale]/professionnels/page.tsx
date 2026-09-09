// The B2B hub — the strongest commercial page on the site.
//
// Replaces /wholesale, which ranked for nothing: its only heading was an <h2>
// reading "Devenez Partenaire" (no <h1> at all), it was a Client Component so
// the copy was invisible to non-JS crawlers, it never used the words
// "grossiste", "fournisseur", "CHR" or "professionnel" in a heading, and it
// linked nowhere except /contact. /wholesale now redirects here.
//
// Every claim below is drawn from data already published by the business: the
// shipping-methods API, the returns policy, the catalogue's real brand list,
// and the wholesale copy the client had already approved (roasted to order,
// account management, tiered pricing). Nothing is invented.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { getBrands } from '@/lib/api/server';
import { FR_EN, generateBreadcrumbSchema, generateFaqSchema, pageMetadata } from '@/lib/seo';
import { localePath, toLocale, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/professionnels';

// ── Copy ─────────────────────────────────────────────────────────────────────
// French and English only. A German or Russian translation of a French B2B
// landing page would be a near-duplicate with no audience, and hreflang is
// narrowed to match (FR_EN) so we never advertise a locale that 404s.

interface Block {
    name: string;
    body: string;
}

interface Faq {
    question: string;
    answer: string;
}

interface Copy {
    title: string;
    description: string;
    h1: string;
    intro: string[];
    segmentsHeading: string;
    segments: Block[];
    offerHeading: string;
    offerIntro: string;
    offer: Block[];
    catalogueLink: string;
    machinesHeading: string;
    machinesBody: string[];
    brandsHeading: string;
    brandsIntro: string;
    areaHeading: string;
    areaBody: string[];
    howHeading: string;
    howSteps: string[];
    ctaLabel: string;
    faqHeading: string;
    faqs: Faq[];
    relatedHeading: string;
}

const COPY: Record<'fr' | 'en', Copy> = {
    fr: {
        title: 'Grossiste Café & Machines à Café pour Professionnels',
        description:
            'Cafrezzo, grossiste et distributeur de café et de machines à café pour les professionnels : cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises. Service en Île-de-France, livraison en France et en Europe.',
        h1: 'Grossiste Café & Machines à Café pour Professionnels',
        // The opening paragraph is written to be quotable on its own: an answer
        // engine extracting two sentences about Cafrezzo should come away with
        // the activity, the offer, the customer types and the location.
        intro: [
            'Cafrezzo est un grossiste et distributeur de café et de machines à café, installé à Sarcelles, aux portes de Paris. Nous fournissons les professionnels en cafés en grains, cafés moulus, capsules et machines à café, ainsi qu’en thés, solubles et accessoires.',
            'Nous accompagnons les cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises qui cherchent un fournisseur de café unique, capable de livrer à la fois le café et le matériel qui va avec. Notre zone de service principale est Paris et l’Île-de-France, et nous livrons partout en France, en Belgique, au Luxembourg et en Suisse.',
        ],
        segmentsHeading: 'Les professionnels que nous approvisionnons',
        segments: [
            {
                name: 'Cafés et coffee shops',
                body: 'Cafés en grains pour machines expresso, avec des références régulières pour tenir une carte stable toute l’année. Nos torréfactions sont préparées à la commande et expédiées immédiatement.',
            },
            {
                name: 'Restaurants',
                body: 'Un café de fin de repas qui tient la comparaison avec la cuisine. Nous conseillons les torréfactions selon le volume servi et le type de machine déjà en place.',
            },
            {
                name: 'Hôtels',
                body: 'Solutions pour le petit-déjeuner, les étages et les espaces communs : grains pour les automatiques, capsules pour les chambres, solubles et thés en complément.',
            },
            {
                name: 'Bars et brasseries',
                body: 'Des cafés corsés adaptés au service rapide et aux volumes soutenus, avec un approvisionnement régulier et des conditions tarifaires dégressives.',
            },
            {
                name: 'Bureaux et entreprises',
                body: 'Équipement des espaces de pause : machines à grains ou à capsules, café, thés et solubles, avec un réassort planifié pour éviter les ruptures.',
            },
            {
                name: 'Collectivités et revendeurs',
                body: 'Volumes importants et références multi-marques pour les structures qui redistribuent ou consomment en grande quantité. Contactez-nous pour une étude tarifaire.',
            },
        ],
        offerHeading: 'Notre offre café pour les professionnels',
        offerIntro:
            'Toutes nos gammes sont disponibles aux professionnels, en conditionnements adaptés à un usage intensif.',
        offer: [
            {
                name: 'Café en grains',
                body: 'Le format de référence pour les machines expresso et les automatiques. Conditionnements de 1 kg, plusieurs profils de torréfaction, marques italiennes comme portugaises.',
            },
            {
                name: 'Café moulu',
                body: 'Pour les machines à filtre et les percolateurs, ou lorsqu’un moulin n’est pas disponible sur place.',
            },
            {
                name: 'Capsules',
                body: 'Capsules et dosettes compatibles avec les principaux systèmes, utiles pour les chambres d’hôtel, les petites salles de pause et les points de consommation isolés.',
            },
            {
                name: 'Thés et solubles',
                body: 'Thés, chocolats et boissons solubles pour compléter une offre de boissons chaudes sans multiplier les fournisseurs.',
            },
        ],
        catalogueLink: 'Voir tout le catalogue de cafés',
        machinesHeading: 'Machines à café professionnelles',
        machinesBody: [
            'Nous sommes également grossiste en machines à café : machines à grains, machines à capsules et machines automatiques, sélectionnées pour un usage professionnel et une utilisation soutenue.',
            'Fournir le café et la machine ensemble évite le problème le plus courant en CHR : une bonne torréfaction mal extraite par une machine qui n’est pas dimensionnée pour le volume servi. Nous conseillons l’association des deux selon le nombre de tasses par jour et l’espace disponible.',
        ],
        brandsHeading: 'Marques de café distribuées',
        brandsIntro:
            'Cafrezzo distribue plusieurs marques de café, disponibles aux tarifs professionnels :',
        areaHeading: 'Zone de service et livraison',
        areaBody: [
            'Notre boutique se trouve au 30 rue de l’Escouvrier, 95200 Sarcelles, dans le Val-d’Oise, aux portes de Paris. Cette implantation nous place à proximité immédiate de Paris et de la majeure partie de l’Île-de-France.',
            'Nous livrons en France, en Belgique, au Luxembourg et en Suisse. La livraison standard est facturée 5,99 € et offerte à partir de 150 € de commande, avec un acheminement en 5 à 7 jours ouvrés ; la livraison express est disponible en 2 à 3 jours ouvrés. Le retrait en boutique (Click & Collect) est également possible.',
        ],
        howHeading: 'Devenir client professionnel',
        howSteps: [
            'Contactez-nous par téléphone, par email ou via le formulaire, en précisant votre activité et les volumes envisagés.',
            'Nous vous proposons les références de café et, si besoin, les machines adaptées à votre établissement.',
            'Vous recevez une proposition tarifaire professionnelle, dégressive selon les quantités.',
            'Nous mettons en place l’approvisionnement et le réassort selon votre rythme de consommation.',
        ],
        ctaLabel: 'Demander une offre professionnelle',
        faqHeading: 'Questions fréquentes des professionnels',
        faqs: [
            {
                question: 'Cafrezzo est-il un grossiste en café ?',
                answer:
                    'Oui. Cafrezzo est grossiste et distributeur de café et de machines à café, basé à Sarcelles, aux portes de Paris. Nous fournissons les professionnels en cafés en grains, cafés moulus, capsules et machines à café, et nous vendons également aux particuliers.',
            },
            {
                question: 'Quels types de professionnels fournissez-vous ?',
                answer:
                    'Nous approvisionnons les cafés, restaurants, hôtels, bars, coffee shops, bureaux, entreprises, collectivités et revendeurs. Les besoins diffèrent selon l’activité, c’est pourquoi nous conseillons les références en fonction du volume servi et du matériel en place.',
            },
            {
                question: 'Livrez-vous à Paris et en Île-de-France ?',
                answer:
                    'Oui. Notre boutique est située à Sarcelles, dans le Val-d’Oise, ce qui fait de Paris et de l’Île-de-France notre zone de service principale. Nous livrons également partout en France, ainsi qu’en Belgique, au Luxembourg et en Suisse.',
            },
            {
                question: 'Fournissez-vous aussi les machines à café ?',
                answer:
                    'Oui. Nous sommes également grossiste en machines à café : machines à grains, à capsules et automatiques pour un usage professionnel. Il est possible de commander le café et la machine auprès du même fournisseur.',
            },
            {
                question: 'Quelles marques de café proposez-vous aux professionnels ?',
                answer:
                    'Nous distribuons notamment Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo, en grains, moulu ou en capsules selon les gammes.',
            },
            {
                question: 'Proposez-vous des tarifs dégressifs ?',
                answer:
                    'Oui. Nos conditions professionnelles sont dégressives selon les quantités commandées. Contactez-nous en indiquant vos volumes pour recevoir une proposition tarifaire adaptée.',
            },
            {
                question: 'Quel est le délai de livraison ?',
                answer:
                    'La livraison standard est assurée en 5 à 7 jours ouvrés pour 5,99 €, offerte à partir de 150 € de commande. Une livraison express en 2 à 3 jours ouvrés est disponible, ainsi que le retrait en boutique.',
            },
        ],
        relatedHeading: 'Aller plus loin',
    },
    en: {
        title: 'Coffee & Coffee Machine Wholesaler for Businesses',
        description:
            'Cafrezzo is a coffee and coffee machine wholesaler supplying cafés, restaurants, hotels, bars, coffee shops and offices. Based near Paris, delivering across France and Europe.',
        h1: 'Coffee & Coffee Machine Wholesaler for Businesses',
        intro: [
            'Cafrezzo is a coffee and coffee machine wholesaler and distributor based in Sarcelles, on the edge of Paris. We supply businesses with coffee beans, ground coffee, capsules and coffee machines, alongside teas, instant drinks and accessories.',
            'We work with cafés, restaurants, hotels, bars, coffee shops and offices looking for a single coffee supplier able to deliver both the coffee and the equipment to brew it. Paris and the Île-de-France region are our core service area, and we deliver throughout France, Belgium, Luxembourg and Switzerland.',
        ],
        segmentsHeading: 'The businesses we supply',
        segments: [
            {
                name: 'Cafés and coffee shops',
                body: 'Beans for espresso machines, with consistent references so a menu can stay stable year-round. Roasted to order and shipped immediately.',
            },
            {
                name: 'Restaurants',
                body: 'An end-of-meal coffee that holds up against the kitchen. We advise on roasts based on the volume served and the machine already installed.',
            },
            {
                name: 'Hotels',
                body: 'Breakfast service, floors and shared spaces: beans for bean-to-cup machines, capsules for rooms, instant drinks and teas alongside.',
            },
            {
                name: 'Bars and brasseries',
                body: 'Full-bodied coffees suited to fast service and sustained volume, with regular resupply and quantity-based pricing.',
            },
            {
                name: 'Offices and companies',
                body: 'Breakroom equipment: bean or capsule machines, coffee, teas and instant drinks, with planned resupply to avoid running dry.',
            },
            {
                name: 'Institutions and resellers',
                body: 'Larger volumes and multi-brand ranges for organisations that redistribute or consume at scale. Contact us for a pricing review.',
            },
        ],
        offerHeading: 'Our coffee range for businesses',
        offerIntro: 'Every range is available to trade customers in formats suited to heavy use.',
        offer: [
            {
                name: 'Coffee beans',
                body: 'The standard format for espresso and bean-to-cup machines. 1 kg packs, several roast profiles, Italian and Portuguese brands.',
            },
            {
                name: 'Ground coffee',
                body: 'For filter machines and percolators, or where no grinder is available on site.',
            },
            {
                name: 'Capsules',
                body: 'Capsules and pods compatible with the main systems — useful for hotel rooms, small breakrooms and isolated serving points.',
            },
            {
                name: 'Teas and instant drinks',
                body: 'Teas, chocolate and instant drinks to round out a hot-drinks offer without adding suppliers.',
            },
        ],
        catalogueLink: 'Browse the coffee catalogue',
        machinesHeading: 'Professional coffee machines',
        machinesBody: [
            'We are also a coffee machine wholesaler: bean-to-cup, capsule and fully automatic machines selected for professional use and sustained duty.',
            'Supplying the coffee and the machine together avoids the most common problem in hospitality — a good roast badly extracted by a machine that was never sized for the volume served. We advise on pairing the two based on cups per day and available space.',
        ],
        brandsHeading: 'Coffee brands we distribute',
        brandsIntro: 'Cafrezzo distributes a number of coffee brands, available at trade prices:',
        areaHeading: 'Service area and delivery',
        areaBody: [
            'Our shop is at 30 rue de l’Escouvrier, 95200 Sarcelles, in the Val-d’Oise, on the edge of Paris — putting us within immediate reach of Paris and most of the Île-de-France region.',
            'We deliver to France, Belgium, Luxembourg and Switzerland. Standard delivery is €5.99 and free above €150, arriving in 5–7 business days; express delivery is available in 2–3 business days. Click & Collect from the shop is also possible.',
        ],
        howHeading: 'Becoming a trade customer',
        howSteps: [
            'Get in touch by phone, email or the contact form, telling us your business type and the volumes involved.',
            'We propose coffee references and, if needed, machines suited to your site.',
            'You receive a trade pricing proposal, tiered by quantity.',
            'We set up supply and resupply around your consumption rate.',
        ],
        ctaLabel: 'Request a trade quote',
        faqHeading: 'Trade customer questions',
        faqs: [
            {
                question: 'Is Cafrezzo a coffee wholesaler?',
                answer:
                    'Yes. Cafrezzo is a coffee and coffee machine wholesaler and distributor based in Sarcelles, on the edge of Paris. We supply businesses with coffee beans, ground coffee, capsules and coffee machines, and also sell to private customers.',
            },
            {
                question: 'Which types of business do you supply?',
                answer:
                    'Cafés, restaurants, hotels, bars, coffee shops, offices, companies, institutions and resellers. Needs differ by activity, so we advise on references according to the volume served and the equipment in place.',
            },
            {
                question: 'Do you deliver to Paris and the Île-de-France?',
                answer:
                    'Yes. Our shop is in Sarcelles, Val-d’Oise, which makes Paris and the Île-de-France our core service area. We also deliver throughout France, as well as Belgium, Luxembourg and Switzerland.',
            },
            {
                question: 'Do you supply coffee machines as well?',
                answer:
                    'Yes. We are also a coffee machine wholesaler, covering bean-to-cup, capsule and automatic machines for professional use. Coffee and machine can be ordered from the same supplier.',
            },
            {
                question: 'Which coffee brands do you offer to businesses?',
                answer:
                    'These include Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim and Caprimo, as beans, ground coffee or capsules depending on the range.',
            },
            {
                question: 'Do you offer volume pricing?',
                answer:
                    'Yes. Trade terms are tiered by order quantity. Contact us with your volumes to receive a pricing proposal.',
            },
            {
                question: 'What are the delivery times?',
                answer:
                    'Standard delivery arrives in 5–7 business days for €5.99, free above €150. Express delivery in 2–3 business days is available, as is collection from the shop.',
            },
        ],
        relatedHeading: 'Related pages',
    },
};

function copyFor(locale: Locale): Copy {
    return locale === 'en' ? COPY.en : COPY.fr;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    const copy = copyFor(locale);

    return pageMetadata({
        locale,
        title: copy.title,
        description: copy.description,
        path: PATH,
        locales: FR_EN,
    });
}

export default async function ProfessionnelsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);

    // Written in French and English only. Rendering it under /de, /ru or /nl
    // would publish French copy beneath a German URL — an indexable duplicate
    // carrying the wrong `lang` attribute.
    if (!FR_EN.includes(locale)) notFound();

    const copy = copyFor(locale);
    const brands = await getBrands();

    const faqSchema = generateFaqSchema(copy.faqs);
    const breadcrumbSchema = generateBreadcrumbSchema(locale, [
        { name: locale === 'en' ? 'Home' : 'Accueil', url: '/' },
        { name: copy.h1, url: PATH },
    ]);

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <JsonLd schema={[faqSchema, breadcrumbSchema]} />

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="pt-20 pb-12 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto text-center">
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight mb-8 leading-[1.05]">
                        {copy.h1}
                    </h1>
                    <div className="max-w-xs mx-auto mb-10">
                        <CupSeparator tone="gold" />
                    </div>
                    <div className="space-y-5 text-left">
                        {copy.intro.map(p => (
                            <p key={p.slice(0, 40)} className="text-sand/70 text-lg leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </div>
                    <Link
                        href={localePath(locale, '/contact')}
                        className="inline-block mt-10 bg-gold text-ink px-10 py-4 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-[#b8914d] transition-colors shadow-lg"
                    >
                        {copy.ctaLabel}
                    </Link>
                </div>
            </section>

            {/* ── Who we supply ────────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[1200px] mx-auto">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-12 text-center">
                        {copy.segmentsHeading}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {copy.segments.map(s => (
                            <div key={s.name} className="bg-sand p-8 rounded-[30px] border border-ink/10">
                                <h3 className="font-bold uppercase tracking-widest text-sm mb-3 text-ink">
                                    {s.name}
                                </h3>
                                <p className="text-ink/60 text-sm leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Coffee range ─────────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-6">
                        {copy.offerHeading}
                    </h2>
                    <p className="text-sand/70 text-lg leading-relaxed mb-10">{copy.offerIntro}</p>
                    <dl className="space-y-8">
                        {copy.offer.map(o => (
                            <div key={o.name} className="border-l-2 border-gold pl-6">
                                <dt className="font-display text-xl uppercase tracking-tight text-sand mb-2">
                                    {o.name}
                                </dt>
                                <dd className="text-sand/70 leading-relaxed">{o.body}</dd>
                            </div>
                        ))}
                    </dl>
                    <Link
                        href={localePath(locale, '/shop')}
                        className="inline-block mt-10 text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                    >
                        {copy.catalogueLink}
                    </Link>
                </div>
            </section>

            {/* ── Machines ─────────────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-6">
                        {copy.machinesHeading}
                    </h2>
                    {copy.machinesBody.map(p => (
                        <p key={p.slice(0, 40)} className="text-sand/70 text-lg leading-relaxed mb-5">
                            {p}
                        </p>
                    ))}
                    <div className="flex flex-wrap gap-6 mt-8">
                        <Link
                            href={localePath(locale, '/machine-a-cafe-professionnelle')}
                            className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                        >
                            {locale === 'en'
                                ? 'Professional coffee machines'
                                : 'Machines à café professionnelles'}
                        </Link>
                        <Link
                            href={localePath(locale, '/machines')}
                            className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                        >
                            {locale === 'en' ? 'All machines in stock' : 'Toutes les machines en stock'}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Brands ───────────────────────────────────────────────── */}
            {brands.length > 0 && (
                <section className="py-16 px-4 sm:px-8">
                    <div className="max-w-[1000px] mx-auto">
                        <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-6">
                            {copy.brandsHeading}
                        </h2>
                        <p className="text-sand/70 text-lg leading-relaxed mb-8">{copy.brandsIntro}</p>
                        {/* Real links to real brand pages: this is the internal
                            path by which a "café Lavazza" style query reaches an
                            actual product listing. */}
                        <ul className="flex flex-wrap gap-3">
                            {brands.map(b => (
                                <li key={b.slug}>
                                    <Link
                                        href={localePath(locale, `/marques/${b.slug}`)}
                                        className="inline-block rounded-full border border-sand/20 px-5 py-2 text-sm font-bold uppercase tracking-widest text-sand hover:border-gold hover:text-gold transition-colors"
                                    >
                                        {locale === 'en' ? `${b.name} coffee` : `Café ${b.name}`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* ── Service area ─────────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-6">
                        {copy.areaHeading}
                    </h2>
                    {copy.areaBody.map(p => (
                        <p key={p.slice(0, 40)} className="text-sand/70 text-lg leading-relaxed mb-5">
                            {p}
                        </p>
                    ))}
                    <div className="flex flex-wrap gap-6 mt-8">
                        <Link
                            href={localePath(locale, '/grossiste-cafe-paris')}
                            className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                        >
                            {locale === 'en' ? 'Coffee wholesaler in Paris' : 'Grossiste café à Paris'}
                        </Link>
                        <Link
                            href={localePath(locale, '/grossiste-cafe-ile-de-france')}
                            className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                        >
                            {locale === 'en'
                                ? 'Coffee wholesaler in Île-de-France'
                                : 'Grossiste café en Île-de-France'}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-10">
                        {copy.howHeading}
                    </h2>
                    <ol className="space-y-6">
                        {copy.howSteps.map((step, i) => (
                            <li key={step.slice(0, 40)} className="flex gap-5">
                                <span
                                    aria-hidden="true"
                                    className="shrink-0 w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-sm"
                                >
                                    {i + 1}
                                </span>
                                <p className="text-sand/70 leading-relaxed pt-1.5">{step}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-8">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-tight mb-12">
                        {copy.faqHeading}
                    </h2>
                    {/* Plain, always-visible markup rather than a collapsed
                        accordion: these answers are the units an AI Overview
                        quotes, and each is paired with the FAQPage schema
                        emitted at the top of this page. */}
                    <div className="space-y-10">
                        {copy.faqs.map(faq => (
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

            <RelatedLinks
                locale={locale}
                heading={copy.relatedHeading}
                links={
                    locale === 'en'
                        ? [
                              {
                                  href: '/grossiste-machines-a-cafe',
                                  label: 'Coffee machine wholesaler',
                                  hint: 'Bean-to-cup, capsule and automatic machines for the trade.',
                              },
                              {
                                  href: '/marques',
                                  label: 'Coffee brands we distribute',
                                  hint: 'Lavazza, Delta Cafés, Bristot, Carte Noire and more.',
                              },
                              {
                                  href: '/journal',
                                  label: 'Coffee guides and advice',
                                  hint: 'How to choose coffee and machines for your business.',
                              },
                              {
                                  href: '/contact',
                                  label: 'Contact the trade team',
                                  hint: 'Sarcelles shop, phone, email and opening hours.',
                              },
                          ]
                        : [
                              {
                                  href: '/grossiste-machines-a-cafe',
                                  label: 'Grossiste machines à café',
                                  hint: 'Machines à grains, à capsules et automatiques pour les professionnels.',
                              },
                              {
                                  href: '/marques',
                                  label: 'Marques de café distribuées',
                                  hint: 'Lavazza, Delta Cafés, Bristot, Carte Noire et plus.',
                              },
                              {
                                  href: '/journal',
                                  label: 'Guides et conseils café',
                                  hint: 'Comment choisir son café et sa machine selon son établissement.',
                              },
                              {
                                  href: '/contact',
                                  label: 'Contacter le service professionnel',
                                  hint: 'Boutique de Sarcelles, téléphone, email et horaires.',
                              },
                          ]
                }
            />
        </div>
    );
}
