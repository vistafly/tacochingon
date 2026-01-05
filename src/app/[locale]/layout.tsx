import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { GSAPProvider } from '@/components/animations/GSAPProvider';
import { LoadingProvider } from '@/components/providers/LoadingProvider';
import { InnerLoader } from '@/components/loading/InnerLoader';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'en' | 'es')) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LoadingProvider>
        <GSAPProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <InnerLoader />
        </GSAPProvider>
      </LoadingProvider>
    </NextIntlClientProvider>
  );
}
