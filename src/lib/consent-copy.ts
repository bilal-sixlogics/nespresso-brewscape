import type { Locale } from './i18n';

/**
 * Cookie-banner copy, kept in one file so it can be reviewed as a unit.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LEGAL REVIEW REQUIRED before this ships.
 *
 * This wording is deliberately plain and minimal, and matches what the code
 * actually does: analytics are not loaded until Accept is clicked. It has NOT
 * been reviewed by a lawyer. Cafrezzo is established in France and ships to
 * FR/BE/LU, so CNIL guidance applies — in particular that Reject must be as
 * easy as Accept, which is why both are equally prominent buttons rather than
 * an "Accept" button beside a buried link.
 *
 * Note also that the privacy policy (`legalPrivacySection5Content` in
 * translations.ts) still tells visitors to manage cookies "via their browser
 * settings". That statement predates this banner and is not an accurate
 * description of the mechanism any more; it should be updated in the same
 * review.
 * ─────────────────────────────────────────────────────────────────────────
 */
export interface ConsentCopy {
    message: string;
    accept: string;
    reject: string;
    /** Accessible label for the banner region. */
    ariaLabel: string;
    /** Link text to the full policy. */
    learnMore: string;
}

export const CONSENT_COPY: Record<Locale, ConsentCopy> = {
    fr: {
        message:
            'Nous utilisons des cookies de mesure d’audience pour comprendre comment le site est utilisé. Ils restent désactivés tant que vous ne les acceptez pas.',
        accept: 'Accepter',
        reject: 'Refuser',
        ariaLabel: 'Consentement aux cookies',
        learnMore: 'En savoir plus',
    },
    en: {
        message:
            'We use analytics cookies to understand how the site is used. They stay switched off unless you accept.',
        accept: 'Accept',
        reject: 'Reject',
        ariaLabel: 'Cookie consent',
        learnMore: 'Learn more',
    },
    de: {
        message:
            'Wir verwenden Analyse-Cookies, um zu verstehen, wie die Website genutzt wird. Sie bleiben deaktiviert, solange Sie nicht zustimmen.',
        accept: 'Akzeptieren',
        reject: 'Ablehnen',
        ariaLabel: 'Cookie-Einwilligung',
        learnMore: 'Mehr erfahren',
    },
    ru: {
        message:
            'Мы используем аналитические файлы cookie, чтобы понимать, как используется сайт. Они остаются отключёнными, пока вы не согласитесь.',
        accept: 'Принять',
        reject: 'Отклонить',
        ariaLabel: 'Согласие на использование cookie',
        learnMore: 'Подробнее',
    },
    nl: {
        message:
            'Wij gebruiken analytische cookies om te begrijpen hoe de site wordt gebruikt. Ze blijven uitgeschakeld totdat u accepteert.',
        accept: 'Accepteren',
        reject: 'Weigeren',
        ariaLabel: 'Cookietoestemming',
        learnMore: 'Meer informatie',
    },
};
