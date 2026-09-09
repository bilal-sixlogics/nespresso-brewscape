// Local landing page: "grossiste café Île-de-France",
// "fournisseur café Île-de-France".
//
// Distinct from /grossiste-cafe-paris on purpose. That page is about the city
// — dense sites, no storage, short reassorts. This one is about the region:
// the départements we actually cover, business parks and office contracts,
// multi-site operators, and the fact that Sarcelles sits inside the region
// rather than serving it from outside. Same business, genuinely different
// buying situation, so neither page is a copy of the other.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-cafe-ile-de-france';

const CONTENT: LandingContent = {
    h1: 'Grossiste Café en Île-de-France',
    breadcrumbLabel: 'Grossiste café en Île-de-France',
    intro: [
        'Cafrezzo est un grossiste et distributeur de café basé en Île-de-France, au 30 rue de l’Escouvrier à Sarcelles, dans le Val-d’Oise. Nous fournissons les professionnels de la région en cafés en grains, cafés moulus, capsules, thés et machines à café.',
        'Nous ne desservons pas l’Île-de-France depuis l’extérieur : nous y sommes établis. Pour un établissement de la région, cela veut dire un interlocuteur proche, la possibilité de passer récupérer une commande en boutique, et un réassort qui ne dépend pas d’un acheminement longue distance.',
    ],
    sections: [
        {
            heading: 'Une zone de service qui couvre toute la région',
            body: [
                'Notre implantation à Sarcelles nous place au nord de la région, à proximité immédiate de Paris et bien positionnés pour le Val-d’Oise, la Seine-Saint-Denis, les Hauts-de-Seine, la Seine-et-Marne, les Yvelines, l’Essonne et le Val-de-Marne.',
                'Nous livrons également partout en France, ainsi qu’en Belgique, au Luxembourg et en Suisse — utile pour les groupes dont les établissements ne sont pas tous en Île-de-France.',
            ],
            cards: [
                {
                    name: 'Val-d’Oise',
                    body: 'Notre département. Boutique à Sarcelles pour le retrait des commandes et le conseil en direct sur les références et le matériel.',
                },
                {
                    name: 'Paris et petite couronne',
                    body: 'Établissements denses, peu de réserve, forte rotation : réassorts rapprochés sur des références suivies.',
                },
                {
                    name: 'Grande couronne',
                    body: 'Sites plus vastes, zones d’activité et hôtellerie de périphérie : volumes plus élevés, commandes plus espacées.',
                },
                {
                    name: 'Zones d’activité et bureaux',
                    body: 'Espaces de pause d’entreprise : machine, café, thés et solubles avec un réassort planifié.',
                },
                {
                    name: 'Établissements multi-sites',
                    body: 'Une référence identique sur plusieurs adresses, pour que le café soit le même d’un site à l’autre.',
                },
                {
                    name: 'Revendeurs régionaux',
                    body: 'Volumes de gros et gammes multi-marques pour les structures qui redistribuent en Île-de-France.',
                },
            ],
        },
        {
            heading: 'Ce que nous fournissons',
            body: [
                'Café en grains en conditionnement de 1 kg pour les machines expresso et les automatiques, café moulu pour les machines à filtre et les percolateurs, capsules pour les points de consommation isolés, et thés et boissons solubles pour compléter une offre de boissons chaudes.',
                'Nous sommes également grossiste en machines à café, ce qui permet de traiter le café et le matériel dans la même commande plutôt qu’auprès de deux fournisseurs distincts.',
            ],
            links: [
                { href: '/professionnels', label: 'Notre offre professionnelle complète' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
        {
            heading: 'Marques distribuées en Île-de-France',
            body: [
                'Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo sont disponibles aux conditions professionnelles, en grains, moulu ou en capsules selon les gammes.',
            ],
            links: [
                { href: '/marques', label: 'Toutes les marques distribuées' },
                { href: '/marques/lavazza', label: 'Café Lavazza' },
                { href: '/marques/carte-noir', label: 'Café Carte Noire' },
                { href: '/marques/mambo', label: 'Café Mambo' },
            ],
        },
    ],
    productsHeading: 'Cafés en grains disponibles',
    productsIntro:
        'Références en 1 kg, le conditionnement le plus utilisé par les établissements de la région.',
    productsLinkHref: '/shop',
    productsLinkLabel: 'Voir tout le catalogue',
    faqHeading: 'Questions fréquentes',
    faqs: [
        {
            question: 'Où est basé Cafrezzo en Île-de-France ?',
            answer:
                'Cafrezzo est établi au 30 rue de l’Escouvrier, 95200 Sarcelles, dans le Val-d’Oise, aux portes de Paris. La boutique est ouverte du lundi au vendredi de 9h à 17h.',
        },
        {
            question: 'Quels départements desservez-vous ?',
            answer:
                'Nous approvisionnons les professionnels de toute l’Île-de-France : Paris, Val-d’Oise, Seine-Saint-Denis, Hauts-de-Seine, Seine-et-Marne, Yvelines, Essonne et Val-de-Marne. Nous livrons aussi dans le reste de la France, en Belgique, au Luxembourg et en Suisse.',
        },
        {
            question: 'Peut-on retirer une commande sur place ?',
            answer:
                'Oui. Le retrait en boutique (Click & Collect) est disponible à Sarcelles, sans frais de livraison. La livraison standard est sinon facturée 5,99 €, offerte à partir de 150 € de commande.',
        },
        {
            question: 'Fournissez-vous les bureaux et les entreprises ?',
            answer:
                'Oui. Nous équipons les espaces de pause en machines à grains ou à capsules et assurons l’approvisionnement en café, thés et solubles, avec un réassort planifié selon la consommation du site.',
        },
        {
            question: 'Proposez-vous des conditions pour plusieurs établissements ?',
            answer:
                'Oui. Nos tarifs professionnels sont dégressifs selon les quantités, ce qui s’applique aux structures qui commandent pour plusieurs adresses. Contactez-nous en précisant le nombre de sites et les volumes.',
        },
    ],
    ctaHeading: 'Un besoin en café en Île-de-France ?',
    ctaBody:
        'Indiquez-nous votre activité, votre localisation et vos volumes : nous vous proposons les références adaptées et, si nécessaire, la machine correspondante.',
    ctaLabel: 'Demander une offre professionnelle',
    relatedHeading: 'Aller plus loin',
    related: [
        {
            href: '/grossiste-cafe-paris',
            label: 'Grossiste café à Paris',
            hint: 'L’approvisionnement des établissements parisiens en particulier.',
        },
        {
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Cafés, restaurants, hôtels, bars, bureaux et entreprises.',
        },
        {
            href: '/machine-a-cafe-professionnelle',
            label: 'Machines à café professionnelles',
            hint: 'Choisir une machine selon le volume servi.',
        },
        {
            href: '/contact',
            label: 'Contacter la boutique de Sarcelles',
            hint: 'Adresse, téléphone, email et horaires d’ouverture.',
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
        title: 'Grossiste Café en Île-de-France | Fournisseur Professionnel',
        description:
            'Cafrezzo, grossiste et distributeur de café en Île-de-France, basé à Sarcelles (Val-d’Oise). Cafés en grains, moulus, capsules et machines à café pour les professionnels de toute la région.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteCafeIdfPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    if (!FRENCH_ONLY.includes(locale)) notFound();

    const products = await getProductsInCategoryNamed('GRAINS', 8);

    return <LandingPage locale={locale} path={PATH} content={CONTENT} products={products} />;
}
