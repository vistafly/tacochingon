import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

export const metadata: Metadata = {
  title: "El Taco Chingon | Authentic Mexican Street Food",
  description: "Authentic Mexican street tacos in Fresno, CA. Hand-made tortillas, fresh ingredients, bold flavors. Order online for pickup.",
  keywords: ["tacos", "mexican food", "fresno", "street food", "burritos", "quesadillas"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Taco Chingon",
  },
  openGraph: {
    title: "El Taco Chingon | Authentic Mexican Street Food",
    description: "Authentic Mexican street tacos in Fresno, CA. Hand-made tortillas, fresh ingredients, bold flavors.",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.eltacochingonfresno.com/en",
    languages: {
      en: "https://www.eltacochingonfresno.com/en",
      es: "https://www.eltacochingonfresno.com/es",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "El Taco Chingón",
  image: "https://www.eltacochingonfresno.com/images/brand/logo.png",
  "@id": "https://www.eltacochingonfresno.com",
  url: "https://www.eltacochingonfresno.com",
  telephone: "+15594177907",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3649 N Blackstone Ave",
    addressLocality: "Fresno",
    addressRegion: "CA",
    postalCode: "93726",
    addressCountry: "US",
  },
  servesCuisine: "Mexican",
  priceRange: "$",
  menu: "https://www.eltacochingonfresno.com/en/menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-negro antialiased">
        <LoadingScreen />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
