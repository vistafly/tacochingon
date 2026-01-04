import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { menuService } from '@/lib/menu-service';
import { ORDER_LINKS } from '@/lib/constants';
import { ExternalLink } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [items, categories] = await Promise.all([
    menuService.getMenuItems(),
    menuService.getCategories(),
  ]);

  return (
    <div className="py-12 md:py-16 bg-negro min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MenuHeader />
        <OrderingBanner />
        <MenuGrid items={items} categories={categories} />
      </div>
    </div>
  );
}

function MenuHeader() {
  const t = useTranslations('menu');

  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amarillo text-negro rounded mb-4">
        <span className="font-display text-sm">FRESNO'S BEST TACOS</span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
        {t('pageTitle')}
      </h1>
      {/* Mexican flag divider */}
      <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto mb-6">
        <div className="flex-1 h-full bg-verde" />
        <div className="flex-1 h-full bg-white" />
        <div className="flex-1 h-full bg-rojo" />
      </div>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        From classic street tacos to our signature Taco Chingon, every dish is made fresh with authentic flavors.
      </p>
    </div>
  );
}

function OrderingBanner() {
  return (
    <div className="mb-10 p-6 bg-negro-light border-2 border-gray-700 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-white mb-1">Order For Delivery or Pickup</h3>
          <p className="text-gray-400 text-sm">Add items to your cart below, or order through your favorite delivery app</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={ORDER_LINKS.doordash}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#FF3008] hover:bg-[#E02800] text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.071 8.409a6.09 6.09 0 0 0-5.396-3.228H.584A.589.589 0 0 0 .17 6.184L3.894 9.93a1.752 1.752 0 0 0 1.242.516h12.049a1.554 1.554 0 1 1 .031 3.108H8.91a.589.589 0 0 0-.415 1.003l3.725 3.747a1.752 1.752 0 0 0 1.242.516h3.757c4.887 0 8.584-5.225 5.852-10.411z"/>
            </svg>
            DoorDash
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={ORDER_LINKS.ubereats}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#06C167] hover:bg-[#05A857] text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 15.5c0 .276-.224.5-.5.5h-8c-.276 0-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5h8c.276 0 .5.224.5.5v7z"/>
            </svg>
            Uber Eats
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
