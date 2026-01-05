import type { Metadata } from "next";
import "./globals.css";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

export const metadata: Metadata = {
  title: "El Taco Chingon | Authentic Mexican Street Food",
  description: "Authentic Mexican street tacos in Fresno, CA. Hand-made tortillas, fresh ingredients, bold flavors. Order online for pickup.",
  keywords: ["tacos", "mexican food", "fresno", "street food", "burritos", "quesadillas"],
  openGraph: {
    title: "El Taco Chingon | Authentic Mexican Street Food",
    description: "Authentic Mexican street tacos in Fresno, CA. Hand-made tortillas, fresh ingredients, bold flavors.",
    type: "website",
    locale: "en_US",
  },
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
      </head>
      <body className="min-h-screen flex flex-col bg-negro antialiased">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
