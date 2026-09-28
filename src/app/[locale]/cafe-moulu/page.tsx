// Commercial category page: "café moulu", "café moulu professionnel",
// "acheter café moulu". Canonical target for the MOULU category, replacing
// /shop?category=moulu.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/cafe-moulu';

const CONTENT: LandingContent = {
    h1: 'Café Moulu',
    breadcrumbLabel: 'Café moulu',
    intro: [
        'Le café moulu est prêt à l’emploi : pas de moulin à régler, pas d’entretien quotidien, un dosage constant. C’est le format des machines à filtre, des percolateurs et des cafetières, et la solution pratique partout où personne n’est formé à ajuster une mouture.',
        'Cafrezzo distribue du café moulu aux particuliers comme aux professionnels depuis Gonesse, aux portes de Paris, avec les marques Carte Noire, Lavazza et Delta Cafés.',
    ],
    sections: [
        {
            heading: 'Quand préférer le café moulu',
            body: [
                'Le grain donne une meilleure tasse, mais il suppose un moulin, son réglage et son nettoyage. Le moulu échange un peu de qualité aromatique contre de la simplicité — un arbitrage qui a du sens dans plusieurs situations concrètes.',
            ],
            cards: [
                {
                    name: 'Machines à filtre',
                    body: 'Le format standard pour le café filtre en salle de réunion, en salle de petit-déjeuner ou en service continu.',
                },
                {
                    name: 'Percolateurs',
                    body: 'Pour les volumes servis d’un coup — séminaires, banquets, collectivités — où la régularité du dosage prime.',
                },
                {
                    name: 'Sans moulin sur place',
                    body: 'Quand l’équipe tourne beaucoup ou que personne n’est formé à régler une mouture, le moulu supprime une source d’irrégularité.',
                },
            ],
        },
        {
            heading: 'Café moulu pour les professionnels',
            body: [
                'Cafrezzo fournit les restaurants, hôtels, bureaux, entreprises et collectivités en café moulu, au carton ou à la palette, avec des tarifs dégressifs selon les quantités commandées.',
                'Le café moulu s’oxydant plus vite que le grain une fois le paquet ouvert, nous calons le réassort sur la consommation réelle plutôt que de livrer de gros volumes qui resteraient stockés.',
            ],
            links: [
                { href: '/professionnels', label: 'Notre offre pour les professionnels' },
                { href: '/cafe-en-grains', label: 'Café en grains' },
            ],
        },
    ],
    productsHeading: 'Nos cafés moulus',
    productsIntro: 'Références disponibles au catalogue.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Café moulu ou café en grains pour un restaurant ?',
            answer:
                'Le grain donne une meilleure tasse et un coût par tasse plus bas dès qu’il y a du volume, mais demande un moulin et son entretien. Le moulu convient aux machines à filtre et aux percolateurs, et là où personne n’est formé à régler une mouture. Beaucoup d’établissements utilisent les deux selon le service.',
        },
        {
            question: 'Combien de temps se conserve le café moulu ?',
            answer:
                'Le café moulu s’oxyde plus vite que le grain parce que sa surface de contact avec l’air est bien plus grande. Il se conserve à l’abri de l’air, de la lumière et de l’humidité, dans son emballage refermé, et gagne à être consommé dans les semaines qui suivent l’ouverture.',
        },
        {
            question: 'Vendez-vous du café moulu en gros ?',
            answer:
                'Oui. Cafrezzo est grossiste et distributeur de café : le café moulu est disponible en conditionnement professionnel, avec des tarifs dégressifs selon les quantités.',
        },
    ],
    ctaHeading: 'Un besoin en café moulu pour votre établissement ?',
    ctaBody:
        'Dites-nous votre activité, votre consommation et le matériel en place : nous vous proposons les références et une offre adaptée.',
    ctaLabel: 'Demander une offre professionnelle',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/cafe-en-grains',
            label: 'Café en grains',
            hint: 'Le format de référence pour les machines expresso et automatiques.',
        },
        {
            href: '/capsules-cafe',
            label: 'Capsules de café',
            hint: 'Dosage constant, sans moulin ni entretien.',
        },
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Café et machines pour les cafés, restaurants, hôtels et bureaux.',
        },
        {
            href: '/marques/carte-noir',
            label: 'Café Carte Noire',
            hint: 'La gamme Carte Noire disponible chez Cafrezzo.',
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
        title: 'Café Moulu — Grossiste & Vente en Ligne',
        description:
            'Café moulu pour machines à filtre, percolateurs et cafetières : Carte Noire, Lavazza, Delta Cafés. Cafrezzo, grossiste à Gonesse près de Paris. Vente aux particuliers et aux professionnels.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function CafeMouluPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('MOULU', 24);

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
