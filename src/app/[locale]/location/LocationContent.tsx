'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, Mail, Navigation, Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatTime } from '@/lib/utils';
import { BusinessSettings } from '@/types/settings';

export default function LocationContent() {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="py-12 md:py-16 bg-negro min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amarillo animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-negro min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LocationHeader />

        <div className="grid lg:grid-cols-2 gap-12">
          <MapSection settings={settings} />
          <InfoSection settings={settings} />
        </div>
      </div>
    </div>
  );
}

function LocationHeader() {
  const t = useTranslations('location');

  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-verde text-white rounded mb-4">
        <MapPin className="w-4 h-4" />
        <span className="font-display text-sm uppercase">{t('findUs')}</span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
        {t('title')}
      </h1>
      {/* Mexican flag divider */}
      <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto mb-6">
        <div className="flex-1 h-full bg-verde" />
        <div className="flex-1 h-full bg-white" />
        <div className="flex-1 h-full bg-rojo" />
      </div>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        {t('locationDescription')}
      </p>
    </div>
  );
}

function MapSection({ settings }: { settings: BusinessSettings }) {
  const t = useTranslations('location');
  const addr = settings.address;
  const address = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="space-y-4">
      <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden border-2 border-gray-700">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="El Taco Chingon Location"
          className="w-full h-full"
        />
      </div>

      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
        <button className="w-full btn-order flex items-center justify-center gap-2">
          <Navigation className="w-5 h-5" />
          {t('getDirections')}
        </button>
      </a>
    </div>
  );
}

function InfoSection({ settings }: { settings: BusinessSettings }) {
  const t = useTranslations('location');
  const hours = settings.hours;

  const daysOfWeek = [
    { key: 'monday', label: t('monday'), hours: hours.monday },
    { key: 'tuesday', label: t('tuesday'), hours: hours.tuesday },
    { key: 'wednesday', label: t('wednesday'), hours: hours.wednesday },
    { key: 'thursday', label: t('thursday'), hours: hours.thursday },
    { key: 'friday', label: t('friday'), hours: hours.friday },
    { key: 'saturday', label: t('saturday'), hours: hours.saturday },
    { key: 'sunday', label: t('sunday'), hours: hours.sunday },
  ];

  return (
    <div className="space-y-6">
      {/* Address Card */}
      <div className="bg-negro-light rounded-lg border-2 border-gray-700 border-l-4 border-l-rojo p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-rojo/20 rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-rojo" />
          </div>
          <div>
            <h3 className="font-display text-lg text-white mb-1">{t('address')}</h3>
            <p className="text-gray-400">
              {settings.address.street}<br />
              {settings.address.city}, {settings.address.state} {settings.address.zip}
            </p>
          </div>
        </div>
      </div>

      {/* Phone Card */}
      <div className="bg-negro-light rounded-lg border-2 border-gray-700 border-l-4 border-l-verde p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-verde/20 rounded-lg flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6 text-verde" />
          </div>
          <div>
            <h3 className="font-display text-lg text-white mb-1">{t('phone')}</h3>
            <a
              href={`tel:${settings.phone}`}
              className="text-amarillo hover:text-amarillo-dark transition-colors text-lg"
            >
              {settings.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Email Card */}
      <div className="bg-negro-light rounded-lg border-2 border-gray-700 border-l-4 border-l-amarillo p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amarillo/20 rounded-lg flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-amarillo" />
          </div>
          <div>
            <h3 className="font-display text-lg text-white mb-1">{t('email')}</h3>
            <a
              href={`mailto:${settings.email}`}
              className="text-amarillo hover:text-amarillo-dark transition-colors"
            >
              {settings.email}
            </a>
          </div>
        </div>
      </div>

      {/* Hours Card */}
      <div className="bg-negro-light rounded-lg border-2 border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amarillo/20 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amarillo" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg text-white mb-3">{t('hours')}</h3>
            <div className="space-y-2">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex justify-between">
                  <span className="text-gray-400">{day.label}</span>
                  <span className={day.hours?.open ? 'text-white font-medium' : 'text-rojo font-medium'}>
                    {day.hours?.open && day.hours?.close
                      ? `${formatTime(day.hours.open)} - ${formatTime(day.hours.close)}`
                      : t('closedDay')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
