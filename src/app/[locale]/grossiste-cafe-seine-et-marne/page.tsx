// Local landing page: "grossiste café Seine-et-Marne", "fournisseur café 77".
//
// Angle: the 77 is half the surface of Île-de-France and the only department
// where distance is the governing constraint. Nobody in Melun or Provins is
// driving to Gonesse for two kilos of beans, so the whole page is built on
// the opposite logic to the Val-d'Oise one: fewer, larger, planned deliveries
// instead of proximity and Click & Collect. Its demand is also structurally
// different — the Marne-la-Vallée hospitality cluster, logistics platforms
// and large peri-urban sites rather than dense street-level CHR.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LandingPage, type LandingContent } from '@/components/seo/LandingPage';
import { getProductsInCategoryNamed } from '@/lib/api/server';
import { FRENCH_ONLY, pageMetadata, wholesalerSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

const PATH = '/grossiste-cafe-seine-et-marne';

const CONTENT: LandingContent = {
    h1: 'Grossiste Café en Seine-et-Marne (77)',
    breadcrumbLabel: 'Grossiste café Seine-et-Marne',
    intro: [
        'Cafrezzo est un grossiste et fournisseur de café professionnel qui livre les établissements de Seine-et-Marne : cafés en grains, cafés moulus, capsules, thés et machines à café professionnelles pour les restaurants, hôtels, bars, boulangeries, bases de loisirs, plateformes logistiques et entreprises du département.',
        'La Seine-et-Marne représente à elle seule près de la moitié de la superficie de l’Île-de-France. Un établissement de Meaux, Melun, Provins ou Fontainebleau ne fonctionne pas comme un comptoir parisien : les distances sont réelles, et un approvisionnement organisé autour du dépannage de dernière minute n’y tient pas.',
    ],
    sections: [
        {
            heading: 'Moins de livraisons, mieux planifiées',
            body: [
                'Dans un département étendu, la bonne organisation n’est pas le réassort fréquent mais le réassort suffisant. Nous calons donc des commandes plus volumineuses et plus espacées, dimensionnées pour couvrir la période sans rupture, plutôt que des passages rapprochés qui coûtent cher en logistique pour tout le monde.',
                'Cela suppose de connaître votre rotation réelle. Nous partons du nombre de tasses servies par semaine, de la saisonnalité de votre activité — une base de loisirs, un hôtel de séminaire ou un restaurant de centre-ville n’ont pas le même calendrier — et du stockage dont vous disposez, qui est généralement plus confortable qu’en petite couronne.',
                'Le café en grains se conserve bien s’il est stocké correctement : à l’abri de la lumière, au sec, et dans son conditionnement d’origine tant qu’il n’est pas ouvert. C’est ce qui rend ce modèle viable en 77 alors qu’il le serait mal pour un établissement parisien sans réserve.',
            ],
            cards: [
                {
                    name: 'Hôtellerie et séminaires',
                    body: 'Marne-la-Vallée, Fontainebleau, Provins : petits-déjeuners à fort volume, pauses séminaire, capsules en chambre.',
                },
                {
                    name: 'Restauration touristique',
                    body: 'Activité très saisonnière : volumes calés sur le calendrier plutôt que sur une moyenne annuelle.',
                },
                {
                    name: 'Plateformes logistiques',
                    body: 'Sites de Roissy-sud, Mitry-Mory, Moissy-Cramayel : salles de pause en 3×8, machines robustes et gros conditionnements.',
                },
                {
                    name: 'Restaurants de centre-ville',
                    body: 'Meaux, Melun, Chelles, Torcy : grains 1 kg, torréfaction constante, commandes planifiées.',
                },
                {
                    name: 'Boulangeries et snacks',
                    body: 'Formules boisson chaude, rotation matinale forte, matériel simple et fiable.',
                },
                {
                    name: 'Revendeurs et collectivités',
                    body: 'Achat au carton et à la palette, avec tarifs dégressifs selon les quantités commandées.',
                },
            ],
        },
        {
            heading: 'Un interlocuteur unique pour le café et le matériel',
            body: [
                'Sur un site éloigné, l’intérêt d’avoir un seul fournisseur pour le café et pour la machine est plus grand qu’ailleurs : chaque intervention représente un déplacement, et l’arbitrage entre un prestataire matériel et un prestataire café coûte du temps que personne ne récupère.',
                'Nous sommes grossiste en café et grossiste en machines à café professionnelles — machines à grains, automatiques et à capsules. Le dimensionnement se fait sur le volume en pointe et sur la dureté de l’eau locale, qui varie sensiblement dans le département et détermine l’entretien à prévoir.',
            ],
            links: [
                { href: '/machine-a-cafe-professionnelle', label: 'Machines à café professionnelles' },
                { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            ],
        },
        {
            heading: 'Marques distribuées et conditions',
            body: [
                'Nous distribuons Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo, en grains, moulu ou en capsules selon les gammes. Pour un établissement du 77, la constance de la référence compte particulièrement : changer de café sur un site éloigné suppose de refaire les réglages sans avoir quelqu’un sur place pour ajuster.',
                'L’achat au carton et à la palette est possible pour les professionnels, avec des tarifs dégressifs selon les quantités commandées. La livraison standard est offerte à partir de 150 € de commande.',
            ],
            links: [
                { href: '/marques', label: 'Toutes les marques distribuées' },
                { href: '/shipping', label: 'Livraison et délais' },
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
            question: 'Livrez-vous les professionnels en Seine-et-Marne ?',
            answer:
                'Oui. La Seine-et-Marne fait partie de notre zone de service en Île-de-France. Nous livrons notamment Meaux, Melun, Chelles, Torcy, Marne-la-Vallée, Fontainebleau, Provins, Coulommiers, Nemours et Moissy-Cramayel.',
        },
        {
            question: 'Quels délais de livraison en 77 ?',
            answer:
                'La livraison standard est facturée 5,99 €, offerte à partir de 150 € de commande, en 5 à 7 jours ouvrés. Une livraison express en 2 à 3 jours ouvrés est également disponible. Pour les comptes professionnels réguliers, nous calons un rythme de réassort planifié sur votre rotation réelle.',
        },
        {
            question: 'Puis-je commander en gros volumes ?',
            answer:
                'Oui, et c’est généralement l’organisation la plus adaptée en Seine-et-Marne. L’achat au carton et à la palette est possible, avec des tarifs dégressifs selon les quantités commandées. Le café en grains se conserve bien tant qu’il reste dans son conditionnement d’origine, à l’abri de la lumière et au sec.',
        },
        {
            question: 'Fournissez-vous aussi les machines à café ?',
            answer:
                'Oui. Nous sommes également grossiste en machines à café professionnelles : machines à grains, automatiques et à capsules. Le dimensionnement se fait sur le volume en pointe et tient compte de la dureté de l’eau locale, qui varie dans le département.',
        },
    ],
    ctaHeading: 'Un projet café en Seine-et-Marne ?',
    ctaBody:
        'Dites-nous votre activité, votre rotation hebdomadaire, votre saisonnalité et le matériel déjà en place : nous calons les références et un rythme de livraison qui évite les ruptures sans multiplier les passages.',
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
        title: 'Grossiste Café Seine-et-Marne (77) | Fournisseur Pro',
        description:
            'Cafrezzo, grossiste et fournisseur de café professionnel en Seine-et-Marne : Meaux, Melun, Marne-la-Vallée, Fontainebleau. Café en grains, capsules et machines à café. Achat à la palette.',
        path: PATH,
        locales: FRENCH_ONLY,
    });
}

export default async function GrossisteCafeSeineEtMarnePage({
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
