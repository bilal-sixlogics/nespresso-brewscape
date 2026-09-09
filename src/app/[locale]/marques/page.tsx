// Brand hub. Gives the fourteen distributed brands a single crawlable parent
// and a place for "marques de café" / "quelles marques distribue Cafrezzo" to
// land. Also the page that makes each brand page reachable in two clicks from
// the homepage instead of only from the sitemap.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { getBrands } from '@/lib/api/server';
import {
    FR_EN,
    generateBreadcrumbSchema,
    generateFaqSchema,
    pageMetadata,
    SITE_URL,
} from '@/lib/seo';
import { localePath, toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/marques';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    const en = locale === 'en';

    return pageMetadata({
        locale,
        title: en
            ? 'Coffee Brands We Distribute'
            : 'Marques de Café Distribuées | Grossiste & Distributeur',
        description: en
            ? 'The coffee brands Cafrezzo distributes: Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim, Caprimo and more. Available to home and trade customers near Paris.'
            : 'Les marques de café distribuées par Cafrezzo : Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim, Caprimo et plus. Disponibles aux particuliers et aux professionnels.',
        path: PATH,
        locales: FR_EN,
    });
}

export default async function MarquesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FR_EN.includes(locale)) notFound();

    const en = locale === 'en';
    const brands = await getBrands();

    const faqs = [
        {
            question: en
                ? 'Which coffee brands does Cafrezzo distribute?'
                : 'Quelles marques de café Cafrezzo distribue-t-il ?',
            answer: en
                ? `Cafrezzo distributes Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim, Caprimo and others, as coffee beans, ground coffee and capsules depending on the range.`
                : `Cafrezzo distribue notamment Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo, en café en grains, café moulu et capsules selon les gammes.`,
        },
        {
            question: en
                ? 'Are these brands available to businesses?'
                : 'Ces marques sont-elles disponibles pour les professionnels ?',
            answer: en
                ? 'Yes. Cafrezzo is a coffee wholesaler and distributor and supplies every brand it carries to cafés, restaurants, hotels, bars, coffee shops, offices and companies, with pricing tiered by quantity.'
                : 'Oui. Cafrezzo est grossiste et distributeur de café et fournit l’ensemble de ses marques aux cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises, avec des tarifs dégressifs selon les quantités.',
        },
    ];

    const itemList = brands.length
        ? {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: en ? 'Coffee brands distributed by Cafrezzo' : 'Marques de café distribuées par Cafrezzo',
              itemListElement: brands.map((b, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: b.name,
                  url: `${SITE_URL}${localePath(locale, `/marques/${b.slug}`)}`,
              })),
          }
        : null;

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <JsonLd
                schema={[
                    generateBreadcrumbSchema(locale, [
                        { name: en ? 'Home' : 'Accueil', url: '/' },
                        { name: en ? 'Brands' : 'Marques', url: PATH },
                    ]),
                    generateFaqSchema(faqs),
                    ...(itemList ? [itemList] : []),
                ]}
            />

            <section className="pt-20 pb-10 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto text-center">
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight mb-8">
                        {en ? 'Coffee Brands We Distribute' : 'Marques de Café Distribuées'}
                    </h1>
                    <div className="max-w-xs mx-auto mb-10">
                        <CupSeparator tone="gold" />
                    </div>
                    <p className="text-sand/70 text-lg leading-relaxed text-left">
                        {en
                            ? 'Cafrezzo is a coffee wholesaler and distributor based in Sarcelles, on the edge of Paris. We distribute Italian, Portuguese and French coffee brands as beans, ground coffee and capsules — to private customers and to cafés, restaurants, hotels, bars, coffee shops, offices and companies.'
                            : 'Cafrezzo est grossiste et distributeur de café, installé à Sarcelles, aux portes de Paris. Nous distribuons des marques de café italiennes, portugaises et françaises, en grains, moulu et en capsules — aux particuliers comme aux cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises.'}
                    </p>
                </div>
            </section>

            {brands.length > 0 && (
                <section className="py-10 px-4 sm:px-8">
                    <div className="max-w-[1200px] mx-auto">
                        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {brands.map(brand => (
                                <li key={brand.slug}>
                                    <Link
                                        href={localePath(locale, `/marques/${brand.slug}`)}
                                        className="group flex flex-col items-center justify-center gap-4 h-full bg-sand rounded-[30px] border border-ink/10 p-8 hover:border-gold transition-colors"
                                    >
                                        {brand.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={brand.logo}
                                                alt={en ? `${brand.name} logo` : `Logo ${brand.name}`}
                                                loading="lazy"
                                                className="h-14 w-auto object-contain"
                                            />
                                        ) : null}
                                        <span className="text-sm font-bold uppercase tracking-widest text-ink text-center group-hover:text-gold transition-colors">
                                            {en ? `${brand.name} coffee` : `Café ${brand.name}`}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className="py-14 px-4 sm:px-8">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="font-display text-3xl uppercase tracking-tight mb-10">
                        {en ? 'Frequently asked questions' : 'Questions fréquentes'}
                    </h2>
                    <div className="space-y-10">
                        {faqs.map(faq => (
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
                heading={en ? 'Related pages' : 'Aller plus loin'}
                links={[
                    {
                        href: '/professionnels',
                        label: en
                            ? 'Coffee wholesale for businesses'
                            : 'Grossiste café pour professionnels',
                        hint: en
                            ? 'Coffee and machines for cafés, restaurants, hotels and offices.'
                            : 'Café et machines pour cafés, restaurants, hôtels et bureaux.',
                    },
                    {
                        href: '/machine-a-cafe-professionnelle',
                        label: en
                            ? 'Professional coffee machines'
                            : 'Machines à café professionnelles',
                        hint: en
                            ? 'Choosing a machine by the volume served.'
                            : 'Choisir une machine selon le volume servi.',
                    },
                    {
                        href: '/shop',
                        label: en ? 'Buy coffee online' : 'Acheter du café en ligne',
                        hint: en
                            ? 'The full catalogue: beans, ground coffee, capsules and teas.'
                            : 'Tout le catalogue : grains, moulu, capsules et thés.',
                    },
                ]}
            />
        </div>
    );
}
