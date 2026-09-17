// Local landing page: "grossiste café Hauts-de-Seine", "café pour entreprise 92".
//
// Angle: the 92 is where the office-coffee contract lives. La Défense, Issy,
// Boulogne and Nanterre are tertiary towers, not comptoirs — the buyer is an
// office manager or a facilities lead, the volume is in pause areas rather
// than at a bar, and the purchase is a recurring contract with an invoice
// trail rather than a case of beans. That is a different conversation from
// the 93 (volume peaks) and the 95 (proximity), which is why it is its own
// page rather than a variant of theirs.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-cafe-hauts-de-seine';

const CONTENT: LandingContent = {
    h1: 'Grossiste Café dans les Hauts-de-Seine (92)',
    breadcrumbLabel: 'Grossiste café Hauts-de-Seine',
    intro: [
        'Cafrezzo est un grossiste et fournisseur de café professionnel qui approvisionne les entreprises et les établissements des Hauts-de-Seine. Nous livrons café en grains, café moulu, capsules, thés, boissons solubles et machines à café professionnelles à La Défense, Nanterre, Boulogne-Billancourt, Issy-les-Moulineaux, Levallois-Perret, Neuilly-sur-Seine, Courbevoie, Clichy, Rueil-Malmaison et Antony.',
        'Le 92 est le département le plus tertiaire d’Île-de-France. L’essentiel du café qui s’y consomme ne se sert pas au comptoir d’un bar mais dans des espaces de pause d’entreprise — et cela change entièrement la manière dont l’approvisionnement doit être organisé.',
    ],
    sections: [
        {
            heading: 'Le café d’entreprise n’est pas le café de comptoir',
            body: [
                'Dans un restaurant, le café est un produit vendu : la rupture se voit tout de suite et se règle dans la journée. Dans un immeuble de bureaux, le café est un service rendu aux salariés : la rupture ne coûte rien directement, elle se paie en agacement collectif un lundi matin, et personne n’a pour mission de la surveiller.',
                'Le bon dispositif pour un site tertiaire est donc un réassort planifié plutôt qu’une commande à la demande. Nous calons un rythme sur la consommation réelle du site — nombre de salariés présents, machines installées, jours d’affluence — de façon que le stock de la salle de pause ne dépende pas de quelqu’un qui pense à commander.',
                'Pour les sièges sociaux répartis sur plusieurs étages ou plusieurs adresses, nous travaillons sur une référence unique, pour que le café soit le même partout et que les commandes se consolident au lieu de se multiplier.',
            ],
            cards: [
                {
                    name: 'Sièges sociaux et tours',
                    body: 'La Défense, Courbevoie, Puteaux : volumes élevés, plusieurs machines par plateau, réassort planifié et facturation consolidée.',
                },
                {
                    name: 'Campus tertiaires',
                    body: 'Issy-les-Moulineaux, Boulogne, Levallois : espaces de pause multiples, grains et solubles, thés en complément.',
                },
                {
                    name: 'Coworking et flex office',
                    body: 'Consommation continue sur toute la journée plutôt que par pics : machines automatiques et grains à rotation rapide.',
                },
                {
                    name: 'Hôtellerie d’affaires',
                    body: 'Neuilly, Rueil, La Défense : grains pour le petit-déjeuner, capsules pour les chambres, cohérence de gamme sur l’ensemble.',
                },
                {
                    name: 'Restauration d’entreprise',
                    body: 'Cantines et cafétérias internes : volumes prévisibles, conditionnements 1 kg, profil de torréfaction consensuel.',
                },
                {
                    name: 'Commerces et restaurants',
                    body: 'Pour les établissements classiques du département, les mêmes conditions professionnelles dégressives s’appliquent.',
                },
            ],
        },
        {
            heading: 'Équiper une salle de pause, machine comprise',
            body: [
                'Nous sommes également grossiste en machines à café professionnelles : machines à grains, machines automatiques et machines à capsules. Pour un espace de pause d’entreprise, le choix se joue moins sur la finesse d’extraction que sur trois points pratiques — le débit aux heures de pointe, la simplicité d’usage sans formation, et l’entretien, puisque personne n’est dédié à la machine.',
                'Une machine automatique sous-dimensionnée pour un plateau de cent personnes crée une file à 9h et finit par être contournée. Nous dimensionnons donc à partir du nombre de personnes réellement présentes sur site, pas de l’effectif théorique.',
                'Le café et la machine peuvent être commandés auprès du même fournisseur, ce qui évite d’avoir à arbitrer entre un prestataire matériel et un prestataire café le jour où le résultat en tasse n’est pas bon.',
            ],
            links: [
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
        {
            heading: 'Marques et conditions professionnelles',
            body: [
                'Nous distribuons Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo, en grains, moulu ou en capsules. Pour un site tertiaire, le critère déterminant est souvent la constance : une référence que l’on garde plusieurs années et que personne n’a besoin de réexpliquer.',
                'L’achat au carton et à la palette est possible, avec des tarifs dégressifs selon les quantités commandées et une facturation adaptée aux circuits achats des entreprises.',
            ],
            links: [
                { href: '/marques', label: 'Toutes les marques distribuées' },
                { href: '/professionnels', label: 'Conditions professionnelles' },
            ],
        },
    ],
    productsHeading: 'Café en grains professionnel 1 kg',
    productsIntro:
        'Une sélection de références disponibles en 1 kg, le format le plus utilisé en entreprise comme en établissement.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Fournissez-vous le café des entreprises dans les Hauts-de-Seine ?',
            answer:
                'Oui. Cafrezzo approvisionne les entreprises, sièges sociaux, campus tertiaires et espaces de coworking du 92 en café en grains, café moulu, capsules, thés et boissons solubles, avec un réassort planifié calé sur la consommation réelle du site.',
        },
        {
            question: 'Quelles villes des Hauts-de-Seine desservez-vous ?',
            answer:
                'L’ensemble du département, notamment La Défense, Nanterre, Courbevoie, Puteaux, Boulogne-Billancourt, Issy-les-Moulineaux, Levallois-Perret, Neuilly-sur-Seine, Clichy, Rueil-Malmaison, Antony et Montrouge.',
        },
        {
            question: 'Fournissez-vous aussi la machine à café ?',
            answer:
                'Oui. Nous sommes également grossiste en machines à café professionnelles : machines à grains, automatiques et à capsules. Nous dimensionnons la machine à partir du nombre de personnes réellement présentes sur site et du débit nécessaire aux heures de pointe.',
        },
        {
            question: 'Pouvez-vous livrer plusieurs sites d’une même entreprise ?',
            answer:
                'Oui. Pour les structures multi-sites, nous travaillons sur une référence identique pour toutes les adresses, afin que le café soit le même partout et que les commandes se consolident. La livraison couvre l’Île-de-France, toute la France, ainsi que la Belgique, le Luxembourg et la Suisse.',
        },
        {
            question: 'Proposez-vous des tarifs dégressifs pour les entreprises ?',
            answer:
                'Oui. L’achat au carton et à la palette est possible, avec des tarifs dégressifs selon les quantités commandées. Contactez-nous en précisant le nombre de sites, l’effectif présent et le matériel déjà installé pour recevoir une proposition.',
        },
    ],
    ctaHeading: 'Équiper vos espaces de pause dans le 92 ?',
    ctaBody:
        'Dites-nous le nombre de sites, l’effectif réellement présent et les machines déjà installées : nous vous proposons les références, le rythme de réassort et, si besoin, le matériel adapté.',
    ctaLabel: 'Demander une offre entreprise',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Notre offre complète pour les entreprises, bureaux, cafés, restaurants et hôtels.',
        },
        {
            href: '/grossiste-cafe-ile-de-france',
            label: 'Grossiste café en Île-de-France',
            hint: 'La couverture régionale, département par département.',
        },
        {
            href: '/grossiste-cafe-paris',
            label: 'Grossiste café à Paris',
            hint: 'Les établissements parisiens, de l’autre côté du périphérique.',
        },
        {
            href: '/machine-a-cafe-professionnelle',
            label: 'Machines à café professionnelles',
            hint: 'Machines à grains, automatiques et à capsules pour un usage intensif.',
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
        title: 'Grossiste Café Hauts-de-Seine (92) | Café pour Entreprise',
        description:
            'Cafrezzo, grossiste et fournisseur de café pour les entreprises des Hauts-de-Seine : La Défense, Boulogne, Issy, Levallois. Café en grains, capsules et machines à café. Tarifs dégressifs.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteCafeHautsDeSeinePage({
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
