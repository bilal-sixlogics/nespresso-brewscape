// Landing page: "grossiste machine à café", "grossiste machines à café",
// "fournisseur machine à café professionnel".
//
// Angle: the *supply* side — buying machines as a trade customer, equipping
// several sites, pairing machines with the coffee, trade terms. The sibling
// page /machine-a-cafe-professionnelle takes the *selection* side (which
// machine for which volume), so the two answer different questions rather
// than restating one another.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-machines-a-cafe';

const CONTENT: LandingContent = {
    h1: 'Grossiste Machines à Café',
    breadcrumbLabel: 'Grossiste machines à café',
    intro: [
        'Cafrezzo est grossiste et distributeur de machines à café pour les professionnels. Nous proposons des machines à grains, des machines à capsules et des machines automatiques, aux côtés du café qui les alimente : grains, moulu et capsules.',
        'Notre particularité est de fournir les deux. Un établissement qui achète sa machine chez un fournisseur et son café chez un autre se retrouve sans interlocuteur unique le jour où la tasse n’est pas bonne — et le problème vient presque toujours de l’association des deux, rarement de l’un seul.',
    ],
    sections: [
        {
            heading: 'Les familles de machines que nous distribuons',
            body: [
                'Le choix se fait moins sur la marque que sur le mode de préparation, qui détermine le coût par tasse, le temps de service et l’entretien quotidien.',
            ],
            cards: [
                {
                    name: 'Machines à grains',
                    body: 'Mouture à la demande, coût par tasse le plus bas, meilleure qualité en tasse. Le choix courant dès qu’un volume régulier justifie l’entretien du moulin.',
                },
                {
                    name: 'Machines automatiques',
                    body: 'Préparation en un geste, du grain à la tasse. Adaptées aux bureaux et aux libres-services où personne n’est formé à l’extraction.',
                },
                {
                    name: 'Machines à capsules',
                    body: 'Aucun réglage, aucun nettoyage de moulin, dosage constant. Pertinentes pour les chambres d’hôtel et les petits points de consommation.',
                },
            ],
            links: [
                { href: '/machines', label: 'Toutes les machines en stock' },
                { href: '/machine-a-cafe-professionnelle', label: 'Choisir une machine professionnelle' },
            ],
        },
        {
            heading: 'Équiper plusieurs sites',
            body: [
                'Pour une structure multi-sites, l’enjeu est l’homogénéité : la même machine et la même référence de café d’une adresse à l’autre, pour que le résultat en tasse ne dépende pas du site et que le réassort se traite en une seule commande.',
                'Nos conditions professionnelles sont dégressives selon les quantités, ce qui s’applique aussi bien à une commande de plusieurs machines qu’à un approvisionnement en café réparti sur plusieurs établissements.',
            ],
        },
        {
            heading: 'Machine et café dans la même commande',
            body: [
                'Nous conseillons l’association de la machine et de la torréfaction selon le nombre de tasses servies par jour, l’espace disponible et le niveau de formation de l’équipe. Une machine surdimensionnée immobilise du budget ; une machine sous-dimensionnée s’usera vite et produira un café irrégulier aux heures de pointe.',
                'Le café, les capsules, les thés et les solubles se commandent ensuite auprès du même fournisseur, avec un réassort calé sur la consommation réelle.',
            ],
            links: [
                { href: '/professionnels', label: 'Notre offre pour les professionnels' },
                { href: '/marques', label: 'Marques de café distribuées' },
            ],
        },
    ],
    productsHeading: 'Machines à café disponibles',
    productsIntro: 'Une sélection de machines actuellement au catalogue.',
    productsLinkHref: '/machines',
    productsLinkLabel: 'Voir toutes les machines',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Cafrezzo est-il grossiste en machines à café ?',
            answer:
                'Oui. Cafrezzo est grossiste et distributeur de machines à café pour les professionnels : machines à grains, machines à capsules et machines automatiques. Nous distribuons également le café qui les alimente, en grains, moulu et en capsules.',
        },
        {
            question: 'Peut-on commander le café et la machine ensemble ?',
            answer:
                'Oui, c’est le principe de notre offre : un seul fournisseur pour la machine et pour le café. Nous conseillons l’association des deux selon le volume servi et le matériel déjà en place.',
        },
        {
            question: 'Quelle machine choisir pour un usage professionnel ?',
            answer:
                'Une machine à grains offre le coût par tasse le plus bas et la meilleure qualité en tasse dès qu’il y a du volume. Une machine automatique convient aux bureaux et aux libres-services. Une machine à capsules est adaptée aux chambres d’hôtel et aux petits points de consommation.',
        },
        {
            question: 'Proposez-vous des tarifs dégressifs sur les machines ?',
            answer:
                'Oui. Nos conditions professionnelles sont dégressives selon les quantités commandées, y compris pour l’équipement de plusieurs sites. Contactez-nous en précisant le nombre de machines et les volumes de café envisagés.',
        },
        {
            question: 'Livrez-vous les machines en Île-de-France et en France ?',
            answer:
                'Oui. Nous sommes basés à Sarcelles, aux portes de Paris, et livrons en Île-de-France, dans toute la France, ainsi qu’en Belgique, au Luxembourg et en Suisse. Le retrait en boutique est également possible.',
        },
    ],
    ctaHeading: 'Un projet d’équipement ?',
    ctaBody:
        'Indiquez-nous le nombre de tasses servies par jour, le nombre de sites à équiper et le café souhaité : nous vous proposons la configuration adaptée.',
    ctaLabel: 'Demander une offre professionnelle',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/machine-a-cafe-professionnelle',
            label: 'Machine à café professionnelle',
            hint: 'Le guide de choix selon le volume servi et le type d’établissement.',
        },
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Café et machines pour les cafés, restaurants, hôtels et bureaux.',
        },
        {
            href: '/machines',
            label: 'Machines à café en stock',
            hint: 'Le catalogue complet des machines disponibles.',
        },
        {
            href: '/grossiste-cafe-paris',
            label: 'Grossiste café à Paris',
            hint: 'Approvisionnement des établissements parisiens.',
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
        title: 'Grossiste Machines à Café pour Professionnels',
        description:
            'Cafrezzo, grossiste et fournisseur de machines à café professionnelles : machines à grains, à capsules et automatiques. Café et machine chez le même fournisseur, tarifs dégressifs.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteMachinesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('MACHINES', 8);

    return <LandingPage locale={locale} path={PATH} content={CONTENT} products={products} />;
}
