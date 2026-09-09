// Landing page: "machine à café professionnelle",
// "machine à café professionnelle Paris", "machine à café entreprise".
//
// Angle: *selection*. This page answers "which machine do I need", sized by
// cups per day and establishment type. The sibling /grossiste-machines-a-cafe
// answers "who supplies them and on what terms". Keeping the two questions on
// separate pages is what stops them competing for the same query.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/machine-a-cafe-professionnelle';

const CONTENT: LandingContent = {
    h1: 'Machine à Café Professionnelle',
    breadcrumbLabel: 'Machine à café professionnelle',
    intro: [
        'Cafrezzo distribue des machines à café professionnelles : machines à grains, machines à capsules et machines automatiques, pour les cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises. Nous sommes basés à Sarcelles, aux portes de Paris, et livrons en Île-de-France et dans toute la France.',
        'Le critère décisif n’est ni la marque ni le prix d’achat, mais le nombre de tasses servies par jour. C’est lui qui détermine le mode de préparation, la taille du groupe et, au bout du compte, le coût par tasse.',
    ],
    sections: [
        {
            heading: 'Choisir selon le volume servi',
            body: [
                'Une machine tenue au-dessus de sa capacité s’use prématurément et donne un café irrégulier aux heures de pointe. À l’inverse, immobiliser le budget d’une machine de bar dans un bureau de dix personnes n’apporte rien en tasse.',
            ],
            cards: [
                {
                    name: 'Faible volume',
                    body: 'Petites salles de pause, chambres d’hôtel, points de consommation isolés : machine à capsules ou petite automatique. Dosage constant, aucun réglage, entretien minimal.',
                },
                {
                    name: 'Volume moyen',
                    body: 'Bureaux, restaurants, petits établissements : machine automatique à grains. Mouture à la demande, préparation en un geste, pas de formation nécessaire.',
                },
                {
                    name: 'Volume élevé',
                    body: 'Cafés, bars, brasseries, hôtellerie en service continu : machine à grains avec groupe dimensionné pour un usage soutenu et une équipe formée à l’extraction.',
                },
            ],
        },
        {
            heading: 'Machine à grains, à capsules ou automatique ?',
            body: [
                'Une machine à grains moud à la demande : c’est ce qui donne la meilleure tasse et le coût par kilo le plus bas, au prix d’un nettoyage quotidien du moulin et d’un minimum de savoir-faire. C’est le choix par défaut dès qu’il y a du volume et quelqu’un derrière le comptoir.',
                'Une machine automatique fait le même travail sans intervention : elle convient là où le café est servi en libre-service et où personne n’est formé à régler une mouture.',
                'Une machine à capsules supprime le réglage, le nettoyage du moulin et la variabilité de dosage. Le coût par tasse est plus élevé, mais c’est la solution pertinente pour une chambre d’hôtel ou un point de consommation qui sert quelques cafés par jour.',
            ],
            links: [
                { href: '/machines', label: 'Voir les machines disponibles' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
        {
            heading: 'Associer la machine et le café',
            body: [
                'Une machine ne produit jamais mieux que le café qu’on y met, et une bonne torréfaction mal extraite donne un mauvais résultat. Nous fournissons les deux : machines à café et cafés en grains, moulus ou en capsules des marques Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo.',
                'Commander la machine et le café auprès du même fournisseur permet de faire régler l’ensemble une fois pour toutes, plutôt que d’arbitrer entre deux prestataires quand la tasse n’est pas au niveau attendu.',
            ],
            links: [
                { href: '/professionnels', label: 'Notre offre pour les professionnels' },
                { href: '/marques', label: 'Marques de café distribuées' },
            ],
        },
    ],
    productsHeading: 'Machines à café au catalogue',
    productsIntro: 'Machines actuellement disponibles, livrées en France et en Europe.',
    productsLinkHref: '/machines',
    productsLinkLabel: 'Voir toutes les machines',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Quelle machine à café professionnelle choisir ?',
            answer:
                'Le choix dépend du nombre de tasses servies par jour. Pour un volume élevé (café, bar, brasserie), une machine à grains avec un groupe dimensionné pour un usage soutenu. Pour un volume moyen (bureau, restaurant), une machine automatique à grains. Pour un faible volume (chambre d’hôtel, petite salle de pause), une machine à capsules.',
        },
        {
            question: 'Quelle différence entre machine à grains et machine à capsules ?',
            answer:
                'Une machine à grains moud le café à la demande : meilleure qualité en tasse et coût par tasse plus bas, mais elle demande un nettoyage quotidien du moulin. Une machine à capsules ne demande aucun réglage et garantit un dosage constant, pour un coût par tasse plus élevé.',
        },
        {
            question: 'Où acheter une machine à café professionnelle à Paris ?',
            answer:
                'Cafrezzo distribue des machines à café professionnelles depuis sa boutique du 30 rue de l’Escouvrier, 95200 Sarcelles, aux portes de Paris. Nous livrons en Île-de-France et dans toute la France, et le retrait en boutique est possible.',
        },
        {
            question: 'Fournissez-vous aussi le café pour la machine ?',
            answer:
                'Oui. Nous sommes grossiste en café et en machines à café : cafés en grains, moulus et capsules des marques Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo et d’autres, commandés auprès du même fournisseur que la machine.',
        },
        {
            question: 'Quelle machine à café pour un bureau ou une entreprise ?',
            answer:
                'Pour un espace de pause en entreprise, une machine automatique à grains est généralement le meilleur compromis : elle prépare le café en un geste, sans formation, tout en gardant un coût par tasse bas. Une machine à capsules reste pertinente pour les très petits effectifs.',
        },
    ],
    ctaHeading: 'Besoin d’un conseil sur le choix d’une machine ?',
    ctaBody:
        'Dites-nous le nombre de tasses servies par jour, le type d’établissement et la place disponible : nous vous orientons vers la machine et le café adaptés.',
    ctaLabel: 'Demander conseil',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/grossiste-machines-a-cafe',
            label: 'Grossiste machines à café',
            hint: 'Conditions professionnelles et équipement de plusieurs sites.',
        },
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Café et machines pour les cafés, restaurants, hôtels et bureaux.',
        },
        {
            href: '/machines',
            label: 'Machines à café en stock',
            hint: 'Le catalogue complet, avec prix et disponibilité.',
        },
        {
            href: '/grossiste-cafe-ile-de-france',
            label: 'Grossiste café en Île-de-France',
            hint: 'Notre zone de service et les départements couverts.',
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
        title: 'Machine à Café Professionnelle | Paris & Île-de-France',
        description:
            'Machines à café professionnelles chez Cafrezzo : machines à grains, à capsules et automatiques pour cafés, restaurants, hôtels et bureaux. Conseil selon le volume servi, livraison en Île-de-France et en France.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function MachineProPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('MACHINES', 8);

    return <LandingPage locale={locale} path={PATH} content={CONTENT} products={products} />;
}
