import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { AppConfig } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivo = Archivo_Black({
  variable: "--font-archivo",
  weight: "400",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${archivo.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
