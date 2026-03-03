import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

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
  title: "Starbucks Brewscape",
  description: "A visually identical clone of the Dribbble Brewscape shot.",
};

import { CartProvider } from "@/store/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${archivo.variable} antialiased`}
      >
        <CartProvider>
          <div className="min-h-screen bg-sb-white text-sb-black overflow-x-hidden">
            <Header />
            {children}
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
