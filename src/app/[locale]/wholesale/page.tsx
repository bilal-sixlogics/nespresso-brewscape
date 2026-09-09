// Legacy route. The B2B page used to live at /wholesale; it is now
// /professionnels, which is a French URL for a French-primary market and
// carries the target keyword ("professionnels") in the path.
//
// Kept as a permanent redirect rather than deleted: /wholesale is linked from
// the footer of every indexed page and is already in Google's index, so a 404
// would throw away whatever authority it has instead of passing it on.
import { permanentRedirect } from 'next/navigation';

import { FR_EN, toLocale } from '@/lib/i18n';

export default async function LegacyWholesalePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);

    // /professionnels is published in French and English only. The German,
    // Russian and Dutch locales had a /wholesale page before this change, so
    // redirecting them to a URL that does not exist would turn a working page
    // into a 404. They go to the English B2B page instead — the right
    // destination for a non-francophone trade enquiry, and a consolidation
    // rather than a dead end.
    const target = FR_EN.includes(locale) ? locale : 'en';
    permanentRedirect(`/${target}/professionnels`);
}
