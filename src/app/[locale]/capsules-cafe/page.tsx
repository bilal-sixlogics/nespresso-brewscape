// Commercial category page: "capsules café", "capsules de café compatibles",
// "capsules café professionnel". Canonical target for the CAPSULES category,
// replacing /shop?category=capsule-delta-q.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/capsules-cafe';

const CONTENT: LandingContent = {
    h1: 'Capsules de Café',
    breadcrumbLabel: 'Capsules de café',
    intro: [
        'La capsule supprime le réglage, le nettoyage du moulin et la variabilité de dosage : chaque tasse sort identique, sans savoir-faire particulier. Le coût par tasse est plus élevé qu’en grain, mais c’est la solution pertinente partout où l’on sert quelques cafés par jour sans personnel formé à l’extraction.',
        'Cafrezzo distribue des capsules et dosettes compatibles avec les principaux systèmes, dont Nespresso, Lavazza A Modo Mio, Lavazza Blue, Lavazza Point et Delta Q.',
    ],
    sections: [
        {
            heading: 'Où la capsule est le bon choix',
            body: [
                'La capsule ne remplace pas le grain au comptoir, mais elle résout des situations où une machine à grains serait mal employée.',
            ],
            cards: [
                {
                    name: 'Chambres d’hôtel',
                    body: 'Un point de consommation par chambre, quelques tasses par jour, aucun entretien possible sur place : c’est le cas d’usage type.',
                },
                {
                    name: 'Petites salles de pause',
                    body: 'Pour un effectif réduit, une machine à capsules coûte moins cher à l’achat et ne demande aucune maintenance quotidienne.',
                },
                {
                    name: 'Points isolés',
                    body: 'Salles de réunion, accueils, espaces de direction — partout où l’on sert ponctuellement sans vouloir gérer un moulin.',
                },
            ],
        },
        {
            heading: 'Capsules pour les professionnels',
            body: [
                'Cafrezzo fournit les hôtels, bureaux, entreprises et petites structures en capsules, au carton, avec des tarifs dégressifs selon les quantités.',
                'Nous distribuons également les machines à capsules correspondantes, ce qui permet de vérifier la compatibilité du système avant de s’engager sur un approvisionnement.',
            ],
            links: [
                { href: '/professionnels', label: 'Notre offre pour les professionnels' },
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
            ],
        },
    ],
    productsHeading: 'Nos capsules de café',
    productsIntro: 'Références disponibles au catalogue.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Vos capsules sont-elles compatibles Nespresso ?',
            answer:
                'Nous distribuons des capsules compatibles avec les principaux systèmes du marché, dont Nespresso. Cafrezzo est un distributeur indépendant : les capsules compatibles ne sont ni fabriquées par Nespresso ni affiliées à Nestlé.',
        },
        {
            question: 'Capsules ou café en grains pour un hôtel ?',
            answer:
                'Les deux, en général. La capsule convient aux chambres, où l’on sert quelques tasses sans entretien possible. Le grain convient à la salle de petit-déjeuner, où le volume justifie une machine automatique et fait baisser le coût par tasse.',
        },
        {
            question: 'Vendez-vous des capsules en gros ?',
            answer:
                'Oui. Cafrezzo est grossiste et distributeur : les capsules sont disponibles au carton avec des tarifs professionnels dégressifs selon les quantités commandées.',
        },
    ],
    ctaHeading: 'Un besoin en capsules pour votre établissement ?',
    ctaBody:
        'Indiquez-nous le système de vos machines et vos volumes : nous vérifions la compatibilité et vous proposons une offre.',
    ctaLabel: 'Demander une offre professionnelle',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/cafe-en-grains',
            label: 'Café en grains',
            hint: 'Meilleure tasse et coût par tasse plus bas dès qu’il y a du volume.',
        },
        {
            href: '/cafe-moulu',
            label: 'Café moulu',
            hint: 'Pour les machines à filtre et les percolateurs.',
        },
        {
            href: '/machines',
            label: 'Machines à café',
            hint: 'Machines à grains, à capsules et automatiques en stock.',
        },
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Café et machines pour les cafés, restaurants, hôtels et bureaux.',
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
        title: 'Capsules de Café Compatibles — Grossiste',
        description:
            'Capsules et dosettes compatibles Nespresso, Lavazza A Modo Mio, Blue, Point et Delta Q. Cafrezzo, grossiste à Gonesse près de Paris, fournit hôtels, bureaux et entreprises.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function CapsulesCafePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('CAPSULES', 24);

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
