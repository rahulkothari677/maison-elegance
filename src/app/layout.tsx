import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthProvider } from "@/components/next-auth-provider";
import { ActiveThemeLoader } from "@/components/active-theme-loader";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAISON ÉLÉGANCE — Premium Clothing & Apparel",
  description:
    "Discover handcrafted premium apparel from the world's finest ateliers. Timeless design, exceptional quality, sustainable craftsmanship.",
  keywords: [
    "premium clothing",
    "luxury fashion",
    "designer apparel",
    "MAISON ÉLÉGANCE",
    "sustainable fashion",
  ],
  authors: [{ name: "MAISON ÉLÉGANCE" }],
  openGraph: {
    title: "MAISON ÉLÉGANCE — Premium Clothing & Apparel",
    description: "Handcrafted premium apparel from the world's finest ateliers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload all available fonts for Theme Studio runtime switching */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Serif+Display&family=Bodoni+Moda:wght@400;500;600;700&family=Cormorant:wght@400;500;600;700&family=Libre+Bodoni:wght@400;500;600;700&family=EB+Garamond:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Crimson+Pro:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2c2418" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MAISON" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <ActiveThemeLoader />
            {children}
            <Toaster />
            <SonnerToaster position="top-center" richColors />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
