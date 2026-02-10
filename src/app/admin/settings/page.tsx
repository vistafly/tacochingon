'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Save,
  Loader2,
  Power,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Timer,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AdminNav, NavGuardResult } from '@/components/admin/AdminNav';
import { BusinessSettings, BusinessHours, DayHours } from '@/types/settings';

const DAY_KEYS: (keyof BusinessHours)[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

// Generate time options in 30-min increments — module-level constant
const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const label = `${h12}:${m.toString().padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
})();

export default function AdminSettingsPage() {
  const router = useRouter();
  const t = useTranslations('admin');
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [pauseMessage, setPauseMessage] = useState('');

  // Hours state
  const [defaultOpen, setDefaultOpen] = useState('17:30');
  const [defaultClose, setDefaultClose] = useState('23:30');
  const [hours, setHours] = useState<BusinessHours>({
    monday: null,
    tuesday: { open: '17:30', close: '23:30' },
    wednesday: { open: '17:30', close: '23:30' },
    thursday: { open: '17:30', close: '23:30' },
    friday: { open: '17:30', close: '23:30' },
    saturday: { open: '17:30', close: '23:30' },
    sunday: { open: '17:30', close: '23:30' },
  });

  // Buffer time state
  const [prepTime, setPrepTime] = useState(30);

  // Unsaved-changes modal state
  const [showModal, setShowModal] = useState(false);
  const modalResolverRef = useRef<((result: NavGuardResult) => void) | null>(null);

  // Dirty state tracking — memoized snapshot comparison
  const savedRef = useRef<string>('');
  const currentSnapshot = useMemo(
    () => JSON.stringify({ street, city, state, zip, isOpen, statusMessage, isAcceptingOrders, pauseMessage, hours, prepTime }),
    [street, city, state, zip, isOpen, statusMessage, isAcceptingOrders, pauseMessage, hours, prepTime]
  );
  const hasChanges = savedRef.current !== '' && currentSnapshot !== savedRef.current;

  // Open modal and return a promise that resolves when user picks an action
  const openUnsavedModal = useCallback((): Promise<NavGuardResult> => {
    return new Promise((resolve) => {
      modalResolverRef.current = resolve;
      setShowModal(true);
    });
  }, []);

  const closeModal = useCallback((result: NavGuardResult) => {
    setShowModal(false);
    modalResolverRef.current?.(result);
    modalResolverRef.current = null;
  }, []);

  // Warn on browser close / reload with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const s: BusinessSettings = data.settings;
          setSettings(s);
          setStreet(s.address.street);
          setCity(s.address.city);
          setState(s.address.state);
          setZip(s.address.zip);
          setIsOpen(s.isOpen ?? true);
          setStatusMessage(s.statusMessage || '');
          setIsAcceptingOrders(s.isAcceptingOrders);
          setPauseMessage(s.pauseMessage || '');
          setPrepTime(s.prepTime ?? 30);

          // Load hours
          const loadedHours = s.hours || hours;
          if (s.hours) {
            setHours(s.hours);
            // Detect default hours from the first open day
            const firstOpen = Object.values(s.hours).find(
              (h): h is DayHours => h !== null && h.open !== null
            );
            if (firstOpen) {
              setDefaultOpen(firstOpen.open);
              setDefaultClose(firstOpen.close);
            }
          }

          // Snapshot saved state for dirty detection
          savedRef.current = JSON.stringify({
            street: s.address.street,
            city: s.address.city,
            state: s.address.state,
            zip: s.address.zip,
            isOpen: s.isOpen ?? true,
            statusMessage: s.statusMessage || '',
            isAcceptingOrders: s.isAcceptingOrders,
            pauseMessage: s.pauseMessage || '',
            hours: loadedHours,
            prepTime: s.prepTime ?? 30,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            street,
            city,
            state,
            zip,
            coordinates: settings?.address.coordinates || { lat: 0, lng: 0 },
          },
          isOpen,
          statusMessage: statusMessage || null,
          isAcceptingOrders,
          pauseMessage: pauseMessage || null,
          hours,
          prepTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        // Snapshot current values as saved
        savedRef.current = currentSnapshot;
        setSaveMessage({ type: 'success', text: t('saveSuccess') });
      } else {
        setSaveMessage({ type: 'error', text: t('saveError') });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: t('saveErrorGeneric') });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    if (hasChanges) {
      const result = await openUnsavedModal();
      if (result === 'stay') return;
      if (result === 'save') await handleSave();
    }
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Apply default hours to all currently open days
  const applyDefaultToAll = () => {
    const updated = { ...hours };
    for (const key of DAY_KEYS) {
      if (updated[key] !== null) {
        updated[key] = { open: defaultOpen, close: defaultClose };
      }
    }
    setHours(updated);
  };

  // Toggle a day open/closed
  const toggleDay = (key: keyof BusinessHours) => {
    setHours((prev) => ({
      ...prev,
      [key]: prev[key] ? null : { open: defaultOpen, close: defaultClose },
    }));
  };

  // Update a specific day's open or close time
  const updateDayTime = (key: keyof BusinessHours, field: 'open' | 'close', value: string) => {
    setHours((prev) => ({
      ...prev,
      [key]: prev[key] ? { ...prev[key]!, [field]: value } : { open: defaultOpen, close: defaultClose, [field]: value },
    }));
  };

  // Memoize time option elements to avoid re-rendering 48 options on every render
  const timeOptionElements = useMemo(() => (
    TIME_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))
  ), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-negro flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amarillo animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-negro">
      {/* Header */}
      <header className="bg-negro-light border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="font-display text-amarillo text-lg sm:text-xl whitespace-nowrap">
            <span className="sm:hidden">{t('settings')}</span>
            <span className="hidden sm:inline">{t('pageSettings')}</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`relative p-2.5 rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-verde text-white hover:bg-verde/90'
                  : 'bg-gray-700 text-gray-400'
              }`}
              title={saving ? t('saving') : t('saveChanges')}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {hasChanges && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amarillo rounded-full" />
              )}
            </button>
            <AdminNav
              onLogout={handleLogout}
              confirmNavigation={async () => {
                if (!hasChanges) return 'discard';
                const result = await openUnsavedModal();
                if (result === 'save') await handleSave();
                return result;
              }}
            />
          </div>
        </div>
        {saveMessage && (
          <div className={`max-w-4xl mx-auto px-4 pb-2 flex items-center gap-1.5 text-xs ${
            saveMessage.type === 'success' ? 'text-verde' : 'text-rojo'
          }`}>
            {saveMessage.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {saveMessage.text}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Location Section */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rojo/20 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rojo" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg text-white">{t('location')}</h2>
              <p className="text-xs sm:text-sm text-gray-400">{t('locationDesc')}</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">{t('streetAddress')}</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-negro border border-gray-600 rounded-lg px-3 py-3 text-sm text-white focus:border-amarillo focus:outline-none transition-colors"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">{t('city')}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-3 py-3 text-sm text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="Fresno"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">{t('state')}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-3 py-3 text-sm text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">{t('zipCode')}</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-3 py-3 text-sm text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="93726"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Accepting Orders — Master Control */}
        <section className={`rounded-lg border-2 p-4 sm:p-6 transition-colors ${
          isOpen ? 'bg-negro-light border-verde/40' : 'bg-negro-light border-rojo/40'
        }`}>
          {/* Big master toggle */}
          <button
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              setIsAcceptingOrders(next);
            }}
            className="w-full"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isOpen ? 'bg-verde' : 'bg-rojo'
                }`}>
                  <Power className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <h2 className="font-display text-base sm:text-2xl text-white truncate">
                    {isOpen ? t('acceptingOrders') : t('notAcceptingOrders')}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                    {isOpen ? t('acceptingDesc') : t('notAcceptingDesc')}
                  </p>
                </div>
              </div>
              <div className={`relative inline-flex h-8 w-14 sm:h-10 sm:w-18 shrink-0 items-center rounded-full transition-colors ${
                isOpen ? 'bg-verde' : 'bg-gray-600'
              }`}>
                <span className={`inline-block h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white shadow transition-transform ${
                  isOpen ? 'translate-x-7 sm:translate-x-9' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </button>

          {/* Status / Pause message */}
          <div className="mt-4 pt-4 sm:mt-5 sm:pt-5 border-t border-gray-700">
            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-1">
              <MessageSquare className="w-4 h-4 shrink-0" />
              {isOpen ? t('statusMessageLabel') : t('customerMessageLabel')}
            </label>
            <input
              type="text"
              value={isOpen ? statusMessage : pauseMessage}
              onChange={(e) => isOpen ? setStatusMessage(e.target.value) : setPauseMessage(e.target.value)}
              className="w-full bg-negro border border-gray-600 rounded-lg px-3 py-3 text-sm text-white focus:border-amarillo focus:outline-none transition-colors"
              placeholder={isOpen ? t('statusPlaceholder') : t('pausePlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isOpen ? t('statusHint') : t('pauseHint')}
            </p>
          </div>
        </section>

        {/* Schedule & Hours */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amarillo/20 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amarillo" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg text-white">{t('schedule')}</h2>
              <p className="text-xs sm:text-sm text-gray-400">{t('scheduleDesc')}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4 sm:mb-5">
            {t('scheduleNote')}
          </p>

          {/* Default Hours */}
          <div className="bg-negro rounded-lg px-3 sm:px-4 py-3 sm:py-4 border border-gray-600 mb-4">
            <p className="text-white font-medium text-sm sm:text-base mb-3">{t('defaultHours')}</p>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm text-gray-400 shrink-0">{t('open')}</label>
                <select
                  value={defaultOpen}
                  onChange={(e) => setDefaultOpen(e.target.value)}
                  className="w-full sm:w-auto bg-negro border border-gray-600 rounded-lg px-2 py-2.5 text-white focus:border-amarillo focus:outline-none text-xs sm:text-sm"
                >
                  {timeOptionElements}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm text-gray-400 shrink-0">{t('closed')}</label>
                <select
                  value={defaultClose}
                  onChange={(e) => setDefaultClose(e.target.value)}
                  className="w-full sm:w-auto bg-negro border border-gray-600 rounded-lg px-2 py-2.5 text-white focus:border-amarillo focus:outline-none text-xs sm:text-sm"
                >
                  {timeOptionElements}
                </select>
              </div>
              <button
                onClick={applyDefaultToAll}
                className="col-span-2 sm:col-span-1 sm:ml-auto text-xs sm:text-sm px-3 py-2.5 bg-amarillo/20 text-amarillo rounded-lg hover:bg-amarillo/30 transition-colors"
              >
                {t('applyToAll')}
              </button>
            </div>
          </div>

          {/* Per-Day Schedule */}
          <div className="space-y-2">
            {DAY_KEYS.map((key) => {
              const dayHours = hours[key];
              const isOpenDay = dayHours !== null;

              return (
                <div
                  key={key}
                  className={`rounded-lg px-3 sm:px-4 py-3 sm:py-3 border ${
                    isOpenDay ? 'bg-negro border-gray-600' : 'bg-negro/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => toggleDay(key)}
                      className={`relative inline-flex h-6 w-10 sm:h-6 sm:w-11 shrink-0 items-center rounded-full transition-colors ${
                        isOpenDay ? 'bg-verde' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white shadow transition-transform ${
                          isOpenDay ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                        }`}
                      />
                    </button>

                    <span className={`w-16 sm:w-24 text-xs sm:text-sm font-medium truncate ${isOpenDay ? 'text-white' : 'text-gray-500'}`}>
                      {t(key)}
                    </span>

                    {isOpenDay ? (
                      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                        <select
                          value={dayHours!.open}
                          onChange={(e) => updateDayTime(key, 'open', e.target.value)}
                          className="flex-1 min-w-0 bg-negro border border-gray-600 rounded px-1 sm:px-2 py-2 sm:py-1.5 text-white text-xs sm:text-sm focus:border-amarillo focus:outline-none"
                        >
                          {timeOptionElements}
                        </select>
                        <span className="text-gray-500 text-xs shrink-0">–</span>
                        <select
                          value={dayHours!.close}
                          onChange={(e) => updateDayTime(key, 'close', e.target.value)}
                          className="flex-1 min-w-0 bg-negro border border-gray-600 rounded px-1 sm:px-2 py-2 sm:py-1.5 text-white text-xs sm:text-sm focus:border-amarillo focus:outline-none"
                        >
                          {timeOptionElements}
                        </select>
                      </div>
                    ) : (
                      <span className="text-rojo text-xs sm:text-sm font-medium">{t('closed')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Extra Buffer Section */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rojo/20 rounded-lg flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-rojo" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg text-white">{t('extraBuffer')}</h2>
              <p className="text-xs sm:text-sm text-gray-400">{t('extraBufferDesc')}</p>
            </div>
          </div>

          <div className="bg-negro rounded-lg px-3 sm:px-4 py-3 sm:py-4 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium text-sm sm:text-base">{t('extraBuffer')}</p>
              <span className="text-amarillo font-display text-xl sm:text-2xl">+{prepTime} min</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amarillo"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 min</span>
              <span>60 min</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('extraBufferHint')}
            </p>
          </div>
        </section>

      </main>

      {/* Unsaved Changes Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => closeModal('stay')}
          />
          {/* Dialog */}
          <div className="relative bg-negro-light border border-gray-600 rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => closeModal('stay')}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 sm:p-6 text-center">
              {/* Icon */}
              <div className="mx-auto w-12 h-12 bg-amarillo/20 rounded-full flex items-center justify-center mb-4">
                <TriangleAlert className="w-6 h-6 text-amarillo" />
              </div>

              <h3 className="font-display text-lg text-white mb-1">
                {t('unsavedTitle')}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {t('unsavedBody')}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => closeModal('save')}
                  className="w-full py-3 bg-verde hover:bg-verde/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('saveAndLeave')}
                </button>
                <button
                  onClick={() => closeModal('discard')}
                  className="w-full py-3 bg-rojo/20 hover:bg-rojo/30 text-rojo text-sm font-medium rounded-lg transition-colors"
                >
                  {t('discardAndLeave')}
                </button>
                <button
                  onClick={() => closeModal('stay')}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                  {t('stayOnPage')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
