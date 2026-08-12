import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  // Cyrillic is needed for the Russian locale; without it the display font
  // silently falls back for every ru page.
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
});

import { buildBaseMetadata, organizationSchema, websiteSchema } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { ConsentProvider } from '@/context/ConsentContext';
import { CookieConsentBanner } from '@/components/ui/CookieConsentBanner';
import { LOCALES, LOCALE_META, isLocale, type Locale } from '@/lib/i18n';

import { CartProvider } from "@/store/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LoginModal } from "@/components/ui/LoginModal";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";

// Pre-render the shell for all five locales.
export function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildBaseMetadata(isLocale(locale) ? locale : 'fr');
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // An unknown two-letter segment must 404 rather than silently render French
  // under a bogus prefix — otherwise /xx/shop becomes an indexable duplicate
  // of every page on the site.
  if (!isLocale(locale)) notFound();

  const meta = LOCALE_META[locale as Locale];

  return (
    <html lang={meta.hreflang} suppressHydrationWarning>
      <head>
        {/*
          Google Consent Mode v2 defaults. Must execute before any tag, hence
          beforeInteractive. Everything starts denied; ConsentContext flips
          analytics_storage to granted only once the visitor accepts.

          This is the second layer of defence — the GA tag itself is not even
          mounted until consent is granted (see components/GoogleAnalytics.tsx),
          so nothing reaches googletagmanager.com before then.
        */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        {/* Site-wide structured data — identifies the brand and enables sitelinks search box */}
        <JsonLd schema={[organizationSchema, websiteSchema]} />

        <ConsentProvider>
        <ThemeProvider>
          <SiteSettingsProvider>
          <AuthProvider>
            <LanguageProvider locale={locale as Locale}>
              <CartProvider>
                <WishlistProvider>
                  <NotificationsProvider>
                    <RecentlyViewedProvider>
                      <SiteChrome>
                        {children}
                      </SiteChrome>
                      <LoginModal />
                    </RecentlyViewedProvider>
                  </NotificationsProvider>
                </WishlistProvider>
              </CartProvider>
            </LanguageProvider>
          </AuthProvider>
          </SiteSettingsProvider>
        </ThemeProvider>

        {/*
          Analytics and the consent banner, after the app so neither competes
          with hydration. GoogleAnalytics renders nothing at all until consent
          is granted, so on a first visit no request is made to Google.
        */}
        <GoogleAnalytics />
        <CookieConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
