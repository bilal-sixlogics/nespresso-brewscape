// Legacy route. The journal used to live at /blog; keep the old URL alive as a
// permanent redirect so links and indexed pages do not 404.
import { permanentRedirect } from 'next/navigation';

import { toLocale } from '@/lib/i18n';

export default async function LegacyBlogIndex({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    permanentRedirect(`/${locale}/journal`);
}
