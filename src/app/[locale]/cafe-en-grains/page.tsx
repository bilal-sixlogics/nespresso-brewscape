// Commercial category page: "café en grains", "café en grains professionnel",
// "acheter café en grains", "café en grains 1kg".
//
// Replaces /shop?category=delta-caf-s-grain as the canonical target for this
// intent. A query-parameter facet carrying an auto-generated title was never
// going to own a head term like "café en grains" — and the facet's slug does
// not even name the category it filters (GRAINS is slugged
// `delta-caf-s-grain` in the backend). The facet now canonicalises here.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/cafe-en-grains';

const CONTENT: LandingContent = {
    h1: 'Café en Grains',
    breadcrumbLabel: 'Café en grains',
    intro: [
        'Le café en grains est le format de référence pour les machines expresso et les machines automatiques : la mouture se fait au moment de l’extraction, ce qui préserve les arômes et donne le coût par tasse le plus bas. Cafrezzo distribue des cafés en grains aux particuliers comme aux professionnels, depuis sa boutique de Gonesse, aux portes de Paris.',
        'Nos références sont conditionnées en 1 kg, le format utilisé en établissement, et couvrent plusieurs profils de torréfaction — des espressos italiens corsés aux profils plus ronds et équilibrés.',
    ],
    sections: [
        {
            heading: 'Choisir son café en grains',
            body: [
                'Le choix se fait sur trois critères : l’intensité recherchée, la machine qui va l’extraire, et le volume servi. Un bar qui sert plusieurs centaines de tasses par jour n’a pas les mêmes besoins qu’un bureau de dix personnes.',
            ],
            cards: [
                {
                    name: 'Pour un espresso corsé',
                    body: 'Les torréfactions italiennes, plus poussées, donnent une tasse dense avec une crema épaisse. C’est le profil attendu au comptoir.',
                },
                {
                    name: 'Pour un profil équilibré',
                    body: 'Une torréfaction moyenne convient mieux au service en salle et aux boissons lactées, où l’amertume ne doit pas dominer.',
                },
                {
                    name: 'Pour un usage intensif',
                    body: 'En volume soutenu, la régularité prime : une référence suivie évite de re-régler le moulin à chaque livraison.',
                },
            ],
        },
        {
            heading: 'Café en grains pour les professionnels',
            body: [
                'En tant que grossiste, Cafrezzo fournit les cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises en café en grains, au carton ou à la palette, avec des tarifs dégressifs selon les quantités.',
                'Nous distribuons notamment Lavazza, Delta Cafés, Bristot, Kimbo, Covim et Mambo. Le café peut être commandé avec la machine qui l’extrait, auprès du même fournisseur.',
            ],
            links: [
                { href: '/professionnels', label: 'Notre offre pour les professionnels' },
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
                { href: '/marques', label: 'Marques distribuées' },
            ],
        },
    ],
    productsHeading: 'Nos cafés en grains',
    productsIntro: 'Références disponibles, conditionnées en 1 kg.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Quelle différence entre café en grains et café moulu ?',
            answer:
                'Le café en grains est moulu au moment de l’extraction, ce qui préserve les arômes et permet d’ajuster la mouture à la machine. Le café moulu est prêt à l’emploi et convient aux machines à filtre et aux percolateurs, mais s’oxyde plus vite une fois le paquet ouvert.',
        },
        {
            question: 'Quel café en grains choisir pour un restaurant ?',
            answer:
                'Pour un restaurant, une torréfaction moyenne à poussée en conditionnement 1 kg est le choix courant : elle tient le service de fin de repas et reste régulière d’une livraison à l’autre. Le choix dépend aussi du volume servi et de la machine en place.',
        },
        {
            question: 'Vendez-vous du café en grains en gros ?',
            answer:
                'Oui. Cafrezzo est grossiste et distributeur de café : le café en grains est disponible au carton et à la palette, avec des tarifs professionnels dégressifs selon les quantités commandées.',
        },
        {
            question: 'Comment conserver le café en grains ?',
            answer:
                'À l’abri de l’air, de la lumière et de l’humidité, dans son emballage d’origine refermé. Le grain se conserve nettement mieux que le café moulu, ce qui est l’un de ses avantages en établissement.',
        },
    ],
    ctaHeading: 'Besoin de café en grains en volume ?',
    ctaBody:
        'Indiquez-nous votre activité, votre consommation et la machine en place : nous vous proposons les références adaptées et une offre tarifaire.',
    ctaLabel: 'Demander une offre professionnelle',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/cafe-moulu',
            label: 'Café moulu',
            hint: 'Pour les machines à filtre et les percolateurs.',
        },
        {
            href: '/capsules-cafe',
            label: 'Capsules de café',
            hint: 'Pour les chambres d’hôtel et les petits points de consommation.',
        },
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Café et machines pour les cafés, restaurants, hôtels et bureaux.',
        },
        {
            href: '/marques/lavazza',
            label: 'Café Lavazza',
            hint: 'La gamme Lavazza disponible chez Cafrezzo.',
        },
    ],
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    return pageMetadata({
        locale,
        title: 'Café en Grains — Grossiste & Vente en Ligne',
        description:
            'Café en grains en 1 kg : Lavazza, Delta Cafés, Bristot, Kimbo, Mambo. Cafrezzo, grossiste et distributeur à Gonesse près de Paris, livre particuliers et professionnels. Livraison offerte dès 150€.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function CafeEnGrainsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('GRAINS', 24);

    return (
        <LandingPage
            locale={locale}
            path={PATH}
            content={CONTENT}
            products={products}
            extraSchemas={[wholesalerSchema]}
        />
    );
}
