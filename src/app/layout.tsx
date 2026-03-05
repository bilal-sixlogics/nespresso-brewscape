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

export const metadata: Metadata = {
  title: AppConfig.brand.seoTitle,
  description: AppConfig.brand.seoDescription,
};

import { CartProvider } from "@/store/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { LoginModal } from "@/components/ui/LoginModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${archivo.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <WishlistProvider>
                  <NotificationsProvider>
                    <div className="bg-sb-white text-sb-black overflow-x-hidden">
                      <PromoStrip />
                      <Header />
                      <main className="min-h-screen">
                        {children}
                      </main>
                      <Footer />
                    </div>
                    <LoginModal />
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
