// Local landing page: "grossiste café Val-d'Oise", "fournisseur café 95",
// "torréfacteur grossiste 95".
//
// The strongest of the department pages, because it is the only one where the
// claim is physical rather than logistical: the shop is in Gonesse, in the 95.
// Its angle is therefore proximity you can act on — walk in, collect an order,
// see the machine before buying, get a same-department delivery — which is
// exactly what none of the other department pages can say.
//
// French-only (see FRENCH_ONLY): the query is French and local.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-cafe-val-d-oise';

const CONTENT: LandingContent = {
    h1: 'Grossiste Café dans le Val-d’Oise (95)',
    breadcrumbLabel: 'Grossiste café Val-d’Oise',
    intro: [
        'Cafrezzo est un grossiste et fournisseur de café professionnel installé dans le Val-d’Oise, au 41 rue d’Aulnay à Gonesse (95500). Nous approvisionnons les cafés, restaurants, hôtels, bars, boulangeries, coffee shops, bureaux et entreprises du département en café en grains, café moulu, capsules, thés et machines à café professionnelles.',
        'Le Val-d’Oise n’est pas une zone que nous livrons : c’est celle où nous sommes. La différence est concrète pour un établissement du 95 — vous pouvez passer chercher une commande le jour même, faire goûter une torréfaction avant de l’engager sur la carte, ou faire regarder une machine qui extrait mal sans attendre une intervention planifiée à la semaine.',
    ],
    sections: [
        {
            heading: 'Un fournisseur de café dans votre département',
            body: [
                'La plupart des grossistes qui répondent à une recherche « fournisseur café Val-d’Oise » desservent le département depuis un entrepôt situé ailleurs. Cela fonctionne pour une commande planifiée ; cela fonctionne beaucoup moins bien le jour où il manque deux kilos de grains pour finir la semaine.',
                'Notre boutique de Gonesse sert aussi de point de retrait. Les établissements de Sarcelles, Garges-lès-Gonesse, Villiers-le-Bel, Goussainville, Arnouville, Bonneuil-en-France ou Le Thillay sont à quelques minutes ; Cergy-Pontoise, Argenteuil, Ermont, Franconville, Taverny, Montmorency et Enghien-les-Bains sont sur la même logique départementale, avec une livraison qui ne quitte pas le 95.',
                'Concrètement, cela veut dire un réassort possible en dépannage, un interlocuteur qui connaît votre établissement, et la possibilité de régler en direct les questions qui se règlent mal par email — un moulin qui dérive, une eau trop calcaire, une référence à remplacer parce que le fournisseur précédent l’a arrêtée.',
            ],
            cards: [
                {
                    name: 'Restaurants et brasseries',
                    body: 'Café de fin de repas choisi selon le volume réel et la machine en place, en grains 1 kg, avec une torréfaction stable d’une commande à l’autre.',
                },
                {
                    name: 'Boulangeries et snacks',
                    body: 'Forte rotation sur des plages courtes, formules boisson chaude : des grains qui tiennent l’extraction rapide sans virer amers.',
                },
                {
                    name: 'Hôtels du 95',
                    body: 'Grains pour les automatiques du petit-déjeuner, capsules pour les chambres, thés et solubles en complément — un seul fournisseur pour l’ensemble.',
                },
                {
                    name: 'Bureaux et entreprises',
                    body: 'Zones d’activité de Roissy, Gonesse, Cergy et Saint-Ouen-l’Aumône : espaces de pause équipés, machine comprise, avec réassort planifié.',
                },
                {
                    name: 'Collectivités et associations',
                    body: 'Volumes réguliers, facturation simple, conditionnements adaptés aux salles de pause et aux permanences.',
                },
                {
                    name: 'Revendeurs et épiceries',
                    body: 'Achat au carton et à la palette, gammes multi-marques pour les commerces du département qui redistribuent.',
                },
            ],
        },
        {
            heading: 'Retrait en boutique à Gonesse, ou livraison dans le 95',
            body: [
                'Le retrait en boutique (Click & Collect) est gratuit et disponible à Gonesse aux horaires d’ouverture, du lundi au vendredi de 9h à 17h. C’est l’option la plus rapide pour un établissement du Val-d’Oise, et la seule qui permette de repartir avec la marchandise le jour de la commande.',
                'La livraison standard est facturée 5,99 €, offerte à partir de 150 € de commande, en 5 à 7 jours ouvrés. Une livraison express en 2 à 3 jours ouvrés est également disponible. Pour les comptes professionnels réguliers du département, le rythme de réassort se cale sur votre consommation réelle plutôt que sur des commandes ponctuelles.',
                'Nous livrons aussi dans le reste de l’Île-de-France, partout en France, ainsi qu’en Belgique, au Luxembourg et en Suisse — utile pour les structures du 95 dont les autres établissements sont hors département.',
            ],
            links: [
                { href: '/visit-shop', label: 'Venir à la boutique de Gonesse' },
                { href: '/contact', label: 'Nous contacter' },
                { href: '/shipping', label: 'Livraison et délais' },
            ],
        },
        {
            heading: 'Café et machine chez le même fournisseur',
            body: [
                'Nous sommes à la fois grossiste en café et grossiste en machines à café. Pour un établissement du Val-d’Oise, cela évite l’arbitrage classique entre deux prestataires quand l’extraction ne donne pas ce qu’elle devrait : le torréfacteur renvoie au matériel, l’installateur renvoie au café, et le problème reste entier.',
                'Une bonne torréfaction sur une machine sous-dimensionnée pour le volume servi donne un mauvais café — et l’inverse est vrai aussi. Nous conseillons donc l’association café + machine à partir du nombre de tasses par jour, de la place disponible derrière le comptoir et de la dureté de l’eau, qui est un vrai sujet dans une partie du département.',
            ],
            links: [
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
        {
            heading: 'Marques distribuées dans le Val-d’Oise',
            body: [
                'Nous distribuons Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo, en grains, moulu ou en capsules selon les gammes. Cela permet de couvrir des attentes très différentes — un espresso italien corsé pour une brasserie, un profil plus rond pour un hôtel, un café portugais intense pour un établissement qui a une clientèle habituée — sans changer de fournisseur.',
                'L’achat au carton et à la palette est possible pour les professionnels, avec des tarifs dégressifs selon les quantités commandées.',
            ],
            links: [
                { href: '/marques', label: 'Toutes les marques distribuées' },
                { href: '/marques/lavazza', label: 'Café Lavazza' },
                { href: '/marques/delta', label: 'Café Delta' },
                { href: '/marques/bristot', label: 'Café Bristot' },
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
            question: 'Cafrezzo est-il un grossiste en café dans le Val-d’Oise ?',
            answer:
                'Oui. Cafrezzo est un grossiste et distributeur de café établi au 41 rue d’Aulnay, 95500 Gonesse, dans le Val-d’Oise. Nous fournissons les professionnels du département en café en grains, café moulu, capsules, thés et machines à café professionnelles.',
        },
        {
            question: 'Puis-je retirer ma commande en boutique dans le 95 ?',
            answer:
                'Oui. Le retrait en boutique (Click & Collect) est gratuit à Gonesse, du lundi au vendredi de 9h à 17h. C’est l’option la plus rapide pour un établissement du Val-d’Oise, puisqu’elle permet de repartir avec la marchandise sans attendre une livraison.',
        },
        {
            question: 'Quelles villes du Val-d’Oise livrez-vous ?',
            answer:
                'Tout le département, notamment Gonesse, Sarcelles, Garges-lès-Gonesse, Villiers-le-Bel, Goussainville, Arnouville, Cergy-Pontoise, Argenteuil, Ermont, Franconville, Taverny, Montmorency, Enghien-les-Bains et Saint-Ouen-l’Aumône, ainsi que les zones d’activité de Roissy et de Gonesse.',
        },
        {
            question: 'Proposez-vous des tarifs professionnels dégressifs dans le 95 ?',
            answer:
                'Oui. Nos conditions professionnelles sont dégressives selon les quantités commandées, avec achat au carton et à la palette. Contactez-nous en précisant votre activité, votre volume de tasses et le matériel déjà en place pour recevoir une proposition tarifaire.',
        },
        {
            question: 'Fournissez-vous aussi les machines à café dans le Val-d’Oise ?',
            answer:
                'Oui. Nous sommes également grossiste en machines à café professionnelles : machines à grains, à capsules et automatiques. Le café et la machine peuvent être commandés auprès du même fournisseur, et la machine peut être vue en boutique à Gonesse avant l’achat.',
        },
    ],
    ctaHeading: 'Un projet café dans le Val-d’Oise ?',
    ctaBody:
        'Dites-nous votre activité, votre volume de tasses et le matériel déjà en place : nous vous proposons les références et, si besoin, la machine adaptée. Vous pouvez aussi simplement passer à la boutique de Gonesse.',
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
            hint: 'La couverture régionale, au-delà du Val-d’Oise.',
        },
        {
            href: '/grossiste-cafe-paris',
            label: 'Grossiste café à Paris',
            hint: 'Approvisionnement des établissements parisiens, aux portes du département.',
        },
        {
            href: '/visit-shop',
            label: 'La boutique de Gonesse',
            hint: 'Adresse, horaires et retrait des commandes professionnelles.',
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
        title: 'Grossiste Café Val-d’Oise (95) | Fournisseur Professionnel',
        description:
            'Cafrezzo, grossiste et fournisseur de café professionnel dans le Val-d’Oise, basé à Gonesse (95500). Café en grains, moulu, capsules et machines à café. Retrait en boutique, tarifs dégressifs.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteCafeValDOisePage({
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
