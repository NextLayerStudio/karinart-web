import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "@/app/ClientLayout";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import StructuredData from "@/app/components/StructuredData";

// Load Geist fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Karin Art - Profesionálne Tetovanie Bratislava | Tattoo Studio Slovakia",
  description: "Profesionálne tetovanie Bratislava - tatérske štúdio s kvalitnými tetovaniami. Malé tetovanie, čiernobiele, farebné tetovania. Online rezervácia. Tattoo artist Slovakia - black and grey, color tattoos.",
  keywords: "tetovanie Bratislava, tatérske štúdio, malé tetovanie, čiernobiele tetovanie, farebné tetovanie, rezervácia tetovania, tattoo Bratislava, tattoo studio Slovakia, black and grey tattoo, color tattoo, small tattoo",
  authors: [{ name: "Karin Haizerová" }],
  creator: "Karin Art Tattoo Studio",
  publisher: "Karin Art",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://karinart.sk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Karin Art - Profesionálne Tetovanie Bratislava | Tattoo Studio",
    description: "Profesionálne tetovanie Bratislava - tatérske štúdio s kvalitnými tetovaniami. Malé tetovanie, čiernobiele, farebné tetovania. Online rezervácia.",
    url: 'https://karinart.sk',
    siteName: 'Karin Art Tattoo Studio',
    locale: 'sk_SK',
    type: 'website',
    images: [
      {
        url: '/images/karin.webp',
        width: 1200,
        height: 630,
        alt: 'Karin Art - Profesionálne Tetovanie Bratislava',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Karin Art - Profesionálne Tetovanie Bratislava",
    description: "Profesionálne tetovanie Bratislava - tatérske štúdio s kvalitnými tetovaniami. Malé tetovanie, čiernobiele, farebné tetovania.",
    images: ['/images/karin.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <StructuredData />
      </head>
      <body className="antialiased flex flex-col min-h-screen font-sans">
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}