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
