import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppConfig } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { baseMetadata } from '@/lib/seo';

export const metadata: Metadata = baseMetadata;

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-MNS5LYCQ5H" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MNS5LYCQ5H');
          `}
        </Script>
        <ThemeProvider>
          <SiteSettingsProvider>
          <AuthProvider>
            <LanguageProvider>
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
      </body>
    </html>
  );
}
