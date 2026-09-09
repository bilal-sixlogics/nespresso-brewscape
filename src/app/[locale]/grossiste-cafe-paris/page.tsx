// Local landing page: "grossiste café Paris", "fournisseur café Paris".
//
// French-only by design (see FRENCH_ONLY). The query is French and local; an
// English or Russian translation of it would be an indexable near-duplicate
// serving nobody.
//
// The angle here is deliberately *the city*: dense sites, small back-of-house,
// frequent small deliveries, high cups-per-day. The Île-de-France page next to
// it takes the regional angle instead (larger sites, business parks, office
// contracts) so the two are not the same page with a place name swapped.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-cafe-paris';

const CONTENT: LandingContent = {
    h1: 'Grossiste Café à Paris',
    breadcrumbLabel: 'Grossiste café à Paris',
    intro: [
        'Cafrezzo est un grossiste et distributeur de café qui approvisionne les professionnels de Paris. Installés au 30 rue de l’Escouvrier à Sarcelles, aux portes de Paris, nous fournissons cafés en grains, cafés moulus, capsules et machines à café aux cafés, restaurants, hôtels, bars, coffee shops et bureaux parisiens.',
        'Être implanté en limite nord de Paris plutôt qu’en province change une chose concrète : les réassorts sont courts. C’est ce qui compte pour un établissement parisien, où l’on stocke peu faute de place et où une rupture de café se voit dès le service suivant.',
    ],
    sections: [
        {
            heading: 'Approvisionner un établissement parisien',
            body: [
                'Les contraintes d’un établissement parisien sont particulières : peu de réserve, un volume de tasses élevé sur des plages courtes, et une rotation du personnel qui rend précieuse une référence de café stable qu’on n’a pas à réexpliquer à chaque service.',
                'Nous travaillons donc sur des références suivies plutôt que sur des lots ponctuels, avec des conditionnements de 1 kg pour les grains et un réassort calé sur votre consommation réelle. Nos torréfactions sont préparées à la commande et expédiées immédiatement.',
            ],
            cards: [
                {
                    name: 'Cafés et coffee shops',
                    body: 'Grains pour machines expresso, profils de torréfaction constants d’une commande à l’autre pour ne pas avoir à re-régler le moulin.',
                },
                {
                    name: 'Restaurants',
                    body: 'Un café de fin de repas à la hauteur de la carte, choisi selon le volume servi et la machine déjà installée.',
                },
                {
                    name: 'Hôtels',
                    body: 'Grains pour les automatiques du petit-déjeuner, capsules pour les chambres, thés et solubles en complément.',
                },
                {
                    name: 'Bars et brasseries',
                    body: 'Torréfactions corsées qui tiennent le service rapide et les volumes soutenus de fin de journée.',
                },
                {
                    name: 'Bureaux',
                    body: 'Espaces de pause équipés machine comprise, avec un réassort planifié pour éviter la rupture du lundi matin.',
                },
                {
                    name: 'Revendeurs',
                    body: 'Volumes importants et références multi-marques pour les structures qui redistribuent. Étude tarifaire sur demande.',
                },
            ],
        },
        {
            heading: 'Café et machine chez le même fournisseur',
            body: [
                'Nous sommes à la fois grossiste en café et grossiste en machines à café. Pour un établissement parisien, cela évite d’avoir un fournisseur pour le café et un autre pour le matériel — et surtout d’avoir à arbitrer entre les deux quand l’extraction ne donne pas ce qu’elle devrait.',
                'Une bonne torréfaction sur une machine sous-dimensionnée pour le volume servi donne un mauvais café. Nous conseillons donc l’association café + machine selon le nombre de tasses par jour et la place disponible derrière le comptoir.',
            ],
            links: [
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
        {
            heading: 'Marques de café disponibles à Paris',
            body: [
                'Nous distribuons Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo, en grains, moulu ou en capsules selon les gammes. Cela permet de couvrir des attentes très différentes — un espresso italien corsé pour un bar, un profil plus rond pour un hôtel — sans changer de fournisseur.',
            ],
            links: [
                { href: '/marques', label: 'Toutes les marques distribuées' },
                { href: '/marques/lavazza', label: 'Café Lavazza' },
                { href: '/marques/delta', label: 'Café Delta' },
                { href: '/marques/bristot', label: 'Café Bristot' },
            ],
        },
    ],
    productsHeading: 'Cafés en grains pour les professionnels',
    productsIntro:
        'Une sélection de références disponibles en 1 kg, le format le plus utilisé en établissement.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Cafrezzo est-il un grossiste en café à Paris ?',
            answer:
                'Cafrezzo est un grossiste et distributeur de café installé à Sarcelles, aux portes de Paris, et approvisionne les professionnels parisiens en cafés en grains, cafés moulus, capsules et machines à café. La boutique se trouve au 30 rue de l’Escouvrier, 95200 Sarcelles.',
        },
        {
            question: 'Livrez-vous dans Paris intra-muros ?',
            answer:
                'Oui. Paris et l’Île-de-France constituent notre zone de service principale. La livraison standard est facturée 5,99 €, offerte à partir de 150 € de commande, en 5 à 7 jours ouvrés ; une livraison express en 2 à 3 jours ouvrés est disponible, ainsi que le retrait en boutique.',
        },
        {
            question: 'Quel type de café fournissez-vous aux professionnels parisiens ?',
            answer:
                'Cafés en grains (le format le plus courant, en 1 kg), cafés moulus pour les machines à filtre et les percolateurs, capsules pour les chambres d’hôtel et les petites salles de pause, ainsi que thés et boissons solubles.',
        },
        {
            question: 'Fournissez-vous aussi les machines à café ?',
            answer:
                'Oui. Nous sommes également grossiste en machines à café : machines à grains, à capsules et automatiques pour un usage professionnel. Le café et la machine peuvent être commandés auprès du même fournisseur.',
        },
        {
            question: 'Proposez-vous des tarifs professionnels dégressifs ?',
            answer:
                'Oui, nos conditions professionnelles sont dégressives selon les quantités commandées. Contactez-nous en précisant votre activité et vos volumes pour recevoir une proposition tarifaire.',
        },
    ],
    ctaHeading: 'Un projet café à Paris ?',
    ctaBody:
        'Dites-nous votre activité, votre volume de tasses et le matériel déjà en place : nous vous proposons les références et, si besoin, la machine adaptée.',
    ctaLabel: 'Demander une offre professionnelle',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Notre offre complète pour les cafés, restaurants, hôtels, bureaux et entreprises.',
        },
        {
            href: '/grossiste-cafe-ile-de-france',
            label: 'Grossiste café en Île-de-France',
            hint: 'Approvisionnement des établissements du Val-d’Oise et de toute la région.',
        },
        {
            href: '/journal/grossiste-cafe-a-paris-et-en-ile-de-france-comment-choisir-son-fournisseur',
            label: 'Comment choisir son fournisseur de café',
            hint: 'Les critères à comparer avant de s’engager avec un grossiste.',
        },
        {
            href: '/shop',
            label: 'Acheter du café en ligne',
            hint: 'Cafés en grains, moulus, capsules et thés.',
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
        title: 'Grossiste Café à Paris | Fournisseur pour Professionnels',
        description:
            'Cafrezzo, grossiste et distributeur de café à Paris et en Île-de-France. Cafés en grains, moulus, capsules et machines à café pour cafés, restaurants, hôtels, bars et bureaux. Tarifs professionnels.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteCafeParisPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    // Real beans from the catalogue, so the page links down to product pages
    // instead of being prose with a contact form at the bottom.
    const products = await getProductsInCategoryNamed('GRAINS', 8);

    return <LandingPage locale={locale} path={PATH} content={CONTENT} products={products} />;
}
