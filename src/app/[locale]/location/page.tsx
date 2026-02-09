import { setRequestLocale } from 'next-intl/server';
import LocationContent from './LocationContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LocationContent />;
}
