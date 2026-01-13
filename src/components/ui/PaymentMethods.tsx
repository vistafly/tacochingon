'use client';

interface PaymentMethodsProps {
  className?: string;
}

export function PaymentMethods({ className = '' }: PaymentMethodsProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {/* Visa */}
      <div className="w-10 h-6 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 50 16" className="h-4 w-auto fill-current text-gray-400">
          <path d="M19.13 15.34h-3.87l2.42-14.68h3.87l-2.42 14.68zm16.47-14.32c-.77-.3-1.97-.62-3.47-.62-3.83 0-6.53 2.01-6.55 4.89-.02 2.13 1.93 3.32 3.4 4.03 1.51.72 2.02 1.19 2.01 1.83-.01.99-1.21 1.44-2.32 1.44-1.55 0-2.38-.22-3.65-.77l-.5-.24-.55 3.31c.91.41 2.59.77 4.33.79 4.07 0 6.72-1.98 6.75-5.06.01-1.69-1.02-2.97-3.26-4.03-1.36-.69-2.19-1.14-2.18-1.84 0-.62.7-1.28 2.22-1.28 1.27-.02 2.19.27 2.9.57l.35.17.53-3.19zm9.97-.36h-2.99c-.93 0-1.62.26-2.03 1.22l-5.76 13.46h4.07l.81-2.21h4.98l.47 2.21h3.59l-3.14-14.68zm-4.79 9.48c.32-.86 1.56-4.16 1.56-4.16-.02.04.32-.86.52-1.42l.27 1.28s.75 3.55.91 4.3h-3.26zm-20.29-9.48l-3.79 10.01-.41-2.03c-.7-2.35-2.89-4.9-5.34-6.17l3.47 12.85h4.1l6.1-14.66h-4.13z"/>
          <path d="M6.75.66H.76L.7 1c4.86 1.22 8.08 4.17 9.42 7.72l-1.36-6.78c-.23-.93-.91-1.24-1.81-1.28z"/>
        </svg>
      </div>

      {/* Mastercard */}
      <div className="w-10 h-6 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 24 16" className="h-5 w-auto fill-current text-gray-400">
          <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity="0.6"/>
          <circle cx="16" cy="8" r="7" fill="currentColor" fillOpacity="0.8"/>
        </svg>
      </div>

      {/* Amex */}
      <div className="w-10 h-6 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 24 16" className="h-5 w-auto fill-current text-gray-400">
          <rect width="24" height="16" rx="2" fill="currentColor" fillOpacity="0.15"/>
          <text x="12" y="10.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">AMEX</text>
        </svg>
      </div>

      {/* Discover */}
      <div className="w-10 h-6 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 24 16" className="h-5 w-auto fill-current text-gray-400">
          <rect width="24" height="16" rx="2" fill="currentColor" fillOpacity="0.15"/>
          <circle cx="16" cy="8" r="4" fill="currentColor" fillOpacity="0.5"/>
        </svg>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-gray-600 mx-1" />

      {/* Apple Pay */}
      <div className="w-10 h-6 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 50 20" className="h-4 w-auto fill-current text-gray-400">
          <path d="M9.6 4.8c-.6.7-1.5 1.3-2.5 1.2-.1-1 .4-2 .9-2.7.6-.7 1.6-1.2 2.4-1.3.1 1-.3 2-.8 2.8zm.8 1.4c-1.4-.1-2.6.8-3.2.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.8-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.2 0 2-1 2.7-2.1.9-1.2 1.2-2.4 1.2-2.5-.1 0-2.4-.9-2.4-3.6 0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.3-1.4z"/>
          <path d="M21.2 2.1c3.1 0 5.3 2.1 5.3 5.3 0 3.2-2.2 5.3-5.4 5.3h-3.5v5.5h-2.5V2.1h6.1zm-3.6 8.5h2.9c2.2 0 3.4-1.2 3.4-3.2 0-2-1.2-3.2-3.4-3.2h-2.9v6.4zm10.6 3.4c0-2.1 1.6-3.4 4.5-3.5l3.3-.2v-.9c0-1.3-.9-2.1-2.4-2.1-1.4 0-2.3.7-2.5 1.7h-2.3c.1-2.2 2-3.8 4.9-3.8 2.9 0 4.7 1.5 4.7 3.9v8.2h-2.3v-2h-.1c-.7 1.4-2.1 2.2-3.7 2.2-2.3 0-4.1-1.4-4.1-3.5zm7.8-1.1v-.9l-3 .2c-1.5.1-2.3.7-2.3 1.7 0 1 .9 1.7 2.2 1.7 1.7 0 3.1-1.2 3.1-2.7zm5 6.2c-.1-.4-.3-.6-.3-1v-.1c0-.8.5-1.4 1.5-1.4h.1v2c0 .2 0 .4-.1.5h-1.2zm4.4-11.7h2.3l-5.1 14h-2.4l1.4-3.8-4.1-10.2h2.5l2.9 8h.1l2.4-8z"/>
        </svg>
      </div>

      {/* Google Pay */}
      <div className="w-10 h-6 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 50 20" className="h-4 w-auto fill-current text-gray-400">
          <path d="M23.8 9.9v5.8h-1.8V2.3H26c1.2 0 2.3.4 3.1 1.2.9.8 1.3 1.8 1.3 3s-.4 2.2-1.3 3c-.8.8-1.9 1.2-3.1 1.2h-2.2v.2zm0-6v4.3h2.3c.7 0 1.3-.2 1.8-.7.5-.5.7-1.1.7-1.8 0-.7-.2-1.3-.7-1.8-.5-.5-1.1-.7-1.8-.7h-2.3v.7zm10.1 2.1c1.3 0 2.4.4 3.1 1.1.8.7 1.1 1.7 1.1 3v6h-1.7v-1.3h-.1c-.7 1.1-1.7 1.6-2.9 1.6-1 0-1.9-.3-2.6-.9-.7-.6-1-1.3-1-2.3 0-1 .4-1.7 1.1-2.3.7-.6 1.7-.8 2.9-.8 1 0 1.9.2 2.5.6v-.4c0-.6-.2-1.1-.7-1.5-.5-.4-1-.6-1.7-.6-.9 0-1.7.4-2.2 1.2l-1.6-.9c.8-1.1 2-1.7 3.8-1.5zm-2.3 6.6c0 .4.2.8.5 1.1.4.3.8.4 1.3.4.7 0 1.3-.3 1.8-.8.5-.5.8-1.1.8-1.8-.5-.4-1.2-.6-2.1-.6-.7 0-1.2.2-1.7.5-.5.3-.6.7-.6 1.2zm14.5-6.3l-5.9 13.5h-1.9l2.2-4.7-3.9-8.8h2l2.8 6.6h.1l2.7-6.6h1.9z"/>
          <path d="M12.4 9.2c0-.6-.1-1.2-.2-1.7H6.3v3.2h3.5c-.2.9-.6 1.6-1.4 2.2v1.8h2.2c1.3-1.2 2.1-3 1.8-5.5z"/>
          <path d="M6.3 16.3c1.9 0 3.4-.6 4.6-1.7l-2.2-1.7c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-4-2.9H0v1.8c1.2 2.3 3.6 3.8 6.3 3.8z"/>
          <path d="M2.4 10.6c-.1-.4-.2-.9-.2-1.4s.1-1 .2-1.4V6H.1C0 6.6 0 7.3 0 8c0 .7.1 1.4.2 2.1l2.2-1.5z"/>
          <path d="M6.3 4.9c1 0 1.9.4 2.7 1l2-2C9.7 2.7 8.1 2 6.3 2 3.6 2 1.2 3.5 0 5.8l2.3 1.8c.6-1.7 2.2-2.7 4-2.7z"/>
        </svg>
      </div>
    </div>
  );
}
