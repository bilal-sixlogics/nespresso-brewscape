import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, generateFaqSchema, pageMetadata } from '@/lib/seo';
import { toLocale, type Locale } from '@/lib/i18n';
import { translations } from '@/lib/translations';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    return pageMetadata({
        locale,
        title: 'Questions Fréquentes',
        description: 'Réponses aux questions fréquentes sur les commandes, la livraison, les retours et les produits Cafrezzo.',
        path: '/faq',
        titleKey: 'faqPageHeadingLine1',
        titleKey2: 'faqPageHeadingLine2',
        descriptionKey: 'faqPageSubtitle',
    });
}

// The page renders these same pairs from `faqPageQ<n>` / `faqPageA<n>` via the
// language context. Reading them from the dictionary for the active locale
// keeps the structured data in step with the visible copy and — importantly —
// emits the FAQ in the language of the page, so each locale is independently
// citable by an answer engine.
const FAQ_COUNT = 12;

function faqItemsFor(locale: Locale) {
    const dict = translations[locale] as Record<string, string> | undefined;
    const fr = translations.fr as Record<string, string>;
    return Array.from({ length: FAQ_COUNT }, (_, i) => ({
        question: dict?.[`faqPageQ${i + 1}`] ?? fr[`faqPageQ${i + 1}`],
        answer: dict?.[`faqPageA${i + 1}`] ?? fr[`faqPageA${i + 1}`],
    })).filter(item => item.question && item.answer);
}

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);

    return (
        <>
            <JsonLd
                schema={[
                    generateFaqSchema(faqItemsFor(locale)),
                    generateBreadcrumbSchema(locale, [
                        { name: 'Accueil', url: '/' },
                        { name: 'FAQ', url: '/faq' },
                    ]),
                ]}
            />
            {children}
        </>
    );
}
