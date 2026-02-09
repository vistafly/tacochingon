'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Save,
  Loader2,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Timer,
} from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';
import { BusinessSettings, BusinessHours, DayHours } from '@/types/settings';

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

// Generate time options in 30-min increments
function generateTimeOptions(): { value: string; label: string }[] {
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
}

const TIME_OPTIONS = generateTimeOptions();

export default function AdminSettingsPage() {
  const router = useRouter();
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

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [router]);

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
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Apply default hours to all currently open days
  const applyDefaultToAll = () => {
    const updated = { ...hours };
    for (const day of DAYS) {
      if (updated[day.key] !== null) {
        updated[day.key] = { open: defaultOpen, close: defaultClose };
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display text-amarillo">
            El Taco Chingon - Settings
          </h1>
          <AdminNav onLogout={handleLogout} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Location Section */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rojo/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-rojo" />
            </div>
            <div>
              <h2 className="font-display text-lg text-white">Location</h2>
              <p className="text-sm text-gray-400">Update the truck&apos;s current address</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-negro border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-amarillo focus:outline-none transition-colors"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="Fresno"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="93726"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-verde/20 rounded-lg flex items-center justify-center">
              {isOpen ? (
                <ToggleRight className="w-5 h-5 text-verde" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="font-display text-lg text-white">Truck Status</h2>
              <p className="text-sm text-gray-400">Control the truck&apos;s open/closed status</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Open/Closed Toggle */}
            <div className="flex items-center justify-between bg-negro rounded-lg px-4 py-3 border border-gray-600">
              <div>
                <p className="text-white font-medium">Truck is {isOpen ? 'Open' : 'Closed'}</p>
                <p className="text-sm text-gray-400">
                  {isOpen ? 'Customers can see the truck is open' : 'Customers will see the truck is closed'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
                  isOpen ? 'bg-verde' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    isOpen ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Status Message */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                Status Message (optional)
              </label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                className="w-full bg-negro border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-amarillo focus:outline-none transition-colors"
                placeholder="e.g., Moving to new spot, back in 30 min"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be shown on the public site when set
              </p>
            </div>

            {/* Accepting Orders Toggle */}
            <div className="flex items-center justify-between bg-negro rounded-lg px-4 py-3 border border-gray-600">
              <div>
                <p className="text-white font-medium">Accepting Orders: {isAcceptingOrders ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-400">
                  {isAcceptingOrders ? 'Online ordering is enabled' : 'Online ordering is paused'}
                </p>
              </div>
              <button
                onClick={() => setIsAcceptingOrders(!isAcceptingOrders)}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
                  isAcceptingOrders ? 'bg-verde' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    isAcceptingOrders ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Pause Message */}
            {!isAcceptingOrders && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Pause Message (shown to customers)
                </label>
                <input
                  type="text"
                  value={pauseMessage}
                  onChange={(e) => setPauseMessage(e.target.value)}
                  className="w-full bg-negro border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-amarillo focus:outline-none transition-colors"
                  placeholder="e.g., We're taking a short break, back soon!"
                />
              </div>
            )}
          </div>
        </section>

        {/* Business Hours Section */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amarillo/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amarillo" />
            </div>
            <div>
              <h2 className="font-display text-lg text-white">Business Hours</h2>
              <p className="text-sm text-gray-400">Set default hours, then adjust individual days</p>
            </div>
          </div>

          {/* Default Hours */}
          <div className="bg-negro rounded-lg px-4 py-4 border border-gray-600 mb-4">
            <p className="text-white font-medium mb-3">Default Hours</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Open</label>
                <select
                  value={defaultOpen}
                  onChange={(e) => setDefaultOpen(e.target.value)}
                  className="bg-negro border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amarillo focus:outline-none text-sm"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Close</label>
                <select
                  value={defaultClose}
                  onChange={(e) => setDefaultClose(e.target.value)}
                  className="bg-negro border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amarillo focus:outline-none text-sm"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={applyDefaultToAll}
                className="ml-auto text-sm px-4 py-2 bg-amarillo/20 text-amarillo rounded-lg hover:bg-amarillo/30 transition-colors"
              >
                Apply to All Open Days
              </button>
            </div>
          </div>

          {/* Per-Day Schedule */}
          <div className="space-y-2">
            {DAYS.map((day) => {
              const dayHours = hours[day.key];
              const isOpenDay = dayHours !== null;

              return (
                <div
                  key={day.key}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                    isOpenDay ? 'bg-negro border-gray-600' : 'bg-negro/50 border-gray-700'
                  }`}
                >
                  {/* Day Toggle */}
                  <button
                    onClick={() => toggleDay(day.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      isOpenDay ? 'bg-verde' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        isOpenDay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Day Name */}
                  <span className={`w-24 text-sm font-medium ${isOpenDay ? 'text-white' : 'text-gray-500'}`}>
                    {day.label}
                  </span>

                  {isOpenDay ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={dayHours!.open}
                        onChange={(e) => updateDayTime(day.key, 'open', e.target.value)}
                        className="bg-negro border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:border-amarillo focus:outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <span className="text-gray-500 text-sm">to</span>
                      <select
                        value={dayHours!.close}
                        onChange={(e) => updateDayTime(day.key, 'close', e.target.value)}
                        className="bg-negro border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:border-amarillo focus:outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-rojo text-sm font-medium">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Buffer Time Section */}
        <section className="bg-negro-light rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rojo/20 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-rojo" />
            </div>
            <div>
              <h2 className="font-display text-lg text-white">Prep Time</h2>
              <p className="text-sm text-gray-400">Estimated time to prepare an order</p>
            </div>
          </div>

          <div className="bg-negro rounded-lg px-4 py-4 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">Buffer Time</p>
              <span className="text-amarillo font-display text-2xl">{prepTime} min</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amarillo"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Shown to customers as estimated wait time
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-verde hover:bg-verde/90 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {saveMessage && (
            <div
              className={`flex items-center gap-2 text-sm ${
                saveMessage.type === 'success' ? 'text-verde' : 'text-rojo'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {saveMessage.text}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
