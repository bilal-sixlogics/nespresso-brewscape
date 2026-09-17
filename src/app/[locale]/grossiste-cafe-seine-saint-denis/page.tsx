// Local landing page: "grossiste café Seine-Saint-Denis", "fournisseur café 93".
//
// Angle: the 93 is the department directly south of Gonesse, so this is the
// shortest run we do outside our own. Its distinguishing buying situation is
// volume volatility — Plaine Commune and the Stade de France corridor swing
// hard around events and match days, and Aubervilliers/Montreuil carry a dense
// independent CHR trade that buys on price per kilo. Neither of those is the
// Val-d'Oise story (proximity) nor the Hauts-de-Seine story (corporate
// contracts), so the three pages are not one page with a number swapped.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-cafe-seine-saint-denis';

const CONTENT: LandingContent = {
    h1: 'Grossiste Café en Seine-Saint-Denis (93)',
    breadcrumbLabel: 'Grossiste café Seine-Saint-Denis',
    intro: [
        'Cafrezzo est un grossiste et fournisseur de café professionnel qui approvisionne les établissements de Seine-Saint-Denis. Depuis notre base de Gonesse, à la limite nord du département, nous livrons cafés en grains, cafés moulus, capsules, thés et machines à café aux restaurants, bars, brasseries, hôtels, boulangeries, coffee shops et bureaux du 93.',
        'La Seine-Saint-Denis est le département le plus proche de notre boutique — Aubervilliers, Saint-Denis, La Courneuve, Le Blanc-Mesnil, Aulnay-sous-Bois et Le Bourget sont à quelques kilomètres. Pour un établissement du 93, cela se traduit par des délais courts et par la possibilité de venir retirer une commande plutôt que d’attendre un créneau de livraison.',
    ],
    sections: [
        {
            heading: 'Des volumes qui ne sont pas réguliers',
            body: [
                'Le 93 a une particularité que les autres départements franciliens ont moins : une grande partie de l’activité CHR y est rythmée par des pics. Un match ou un concert au Stade de France, un salon au Parc des expositions de Paris-Villepinte tout proche, une manifestation à la Plaine Saint-Denis — et la consommation d’un bar ou d’une brasserie du secteur double sur deux jours avant de retomber.',
                'Un approvisionnement calé sur une moyenne mensuelle gère mal ce profil : soit vous stockez pour le pic et vous immobilisez de la trésorerie sur du café qui perd en fraîcheur, soit vous êtes en rupture le soir où vous faites votre chiffre. Nous travaillons donc plutôt sur un socle régulier en 1 kg, complété par des commandes d’appoint courtes avant les dates que vous connaissez à l’avance.',
                'Notre proximité rend cette organisation praticable : un complément passé en début de semaine peut être retiré à Gonesse ou livré sans immobiliser une semaine de délai.',
            ],
            cards: [
                {
                    name: 'Bars et brasseries',
                    body: 'Torréfactions corsées qui tiennent le service rapide et les volumes soutenus des soirs d’événement.',
                },
                {
                    name: 'Restauration indépendante',
                    body: 'Grains 1 kg au meilleur rapport qualité-prix, avec une torréfaction constante d’une commande à l’autre.',
                },
                {
                    name: 'Boulangeries et snacks',
                    body: 'Formules boisson chaude à forte rotation : des cafés qui supportent une extraction rapide sans virer amers.',
                },
                {
                    name: 'Hôtels et résidences',
                    body: 'Grains pour les automatiques du petit-déjeuner et capsules pour les chambres, sur le corridor Roissy – Le Bourget.',
                },
                {
                    name: 'Bureaux de la Plaine',
                    body: 'Sièges sociaux et campus tertiaires de Saint-Denis et Saint-Ouen : espaces de pause équipés, réassort planifié.',
                },
                {
                    name: 'Grossistes et revendeurs',
                    body: 'Achat au carton et à la palette pour les structures du 93 qui redistribuent, notamment autour d’Aubervilliers.',
                },
            ],
        },
        {
            heading: 'Acheter au carton et à la palette',
            body: [
                'Le 93 concentre une part importante du commerce de gros alimentaire francilien. Nous travaillons donc aussi avec des revendeurs, des épiceries, des cash & carry et des structures qui redistribuent, et pas seulement avec des établissements qui servent la tasse.',
                'Pour ces volumes, l’achat se fait au carton et à la palette, avec des tarifs dégressifs selon les quantités commandées et des gammes multi-marques. Une étude tarifaire est faite sur demande à partir de vos références et de votre rotation.',
            ],
            links: [
                { href: '/professionnels', label: 'Conditions professionnelles' },
                { href: '/contact', label: 'Demander une étude tarifaire' },
            ],
        },
        {
            heading: 'Café et machine chez le même fournisseur',
            body: [
                'Nous sommes également grossiste en machines à café professionnelles. Pour un établissement du 93 qui tourne à fort volume, le dimensionnement du matériel compte autant que la torréfaction : une machine juste pour le service normal décroche le jour où le service double.',
                'Nous conseillons donc l’association café + machine à partir du nombre de tasses par jour en pointe, pas en moyenne — c’est la pointe qui casse une extraction et fait la réputation d’un comptoir.',
            ],
            links: [
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
    ],
    productsHeading: 'Café en grains professionnel 1 kg',
    productsIntro:
        'Une sélection de références disponibles en 1 kg, le format le plus utilisé en établissement.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Livrez-vous les professionnels en Seine-Saint-Denis ?',
            answer:
                'Oui. La Seine-Saint-Denis fait partie de notre zone de service principale. Depuis notre base de Gonesse, à la limite nord du département, nous livrons Saint-Denis, Aubervilliers, Montreuil, Aulnay-sous-Bois, Le Blanc-Mesnil, La Courneuve, Bobigny, Pantin, Le Bourget, Noisy-le-Grand et l’ensemble du 93.',
        },
        {
            question: 'Puis-je acheter du café au carton ou à la palette ?',
            answer:
                'Oui. L’achat au carton et à la palette est possible pour les professionnels et les revendeurs, avec des tarifs dégressifs selon les quantités commandées. Une étude tarifaire est réalisée sur demande à partir de vos références et de votre rotation.',
        },
        {
            question: 'Pouvez-vous suivre des volumes irréguliers ?',
            answer:
                'Oui. Nous fonctionnons avec un socle de réassort régulier calé sur votre consommation courante, complété par des commandes d’appoint avant les périodes de forte activité. Notre proximité permet un complément retiré en boutique à Gonesse ou livré sans délai long.',
        },
        {
            question: 'Où se trouve votre boutique par rapport au 93 ?',
            answer:
                'Notre boutique est au 41 rue d’Aulnay, 95500 Gonesse, immédiatement au nord de la Seine-Saint-Denis. Le retrait de commande (Click & Collect) y est gratuit, du lundi au vendredi de 9h à 17h.',
        },
    ],
    ctaHeading: 'Un projet café en Seine-Saint-Denis ?',
    ctaBody:
        'Dites-nous votre activité, votre volume en service courant et en pointe, et le matériel déjà en place : nous vous proposons les références et le rythme de réassort adaptés.',
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
            hint: 'La couverture régionale, département par département.',
        },
        {
            href: '/grossiste-cafe-val-d-oise',
            label: 'Grossiste café dans le Val-d’Oise',
            hint: 'Notre département, avec retrait en boutique à Gonesse.',
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
        title: 'Grossiste Café Seine-Saint-Denis (93) | Fournisseur Pro',
        description:
            'Cafrezzo, grossiste et fournisseur de café professionnel en Seine-Saint-Denis. Café en grains, moulu, capsules et machines à café. Achat au carton et à la palette, tarifs dégressifs.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteCafeSeineSaintDenisPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('GRAINS', 8);

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
