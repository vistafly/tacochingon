'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, Settings, LogOut } from 'lucide-react';

interface AdminNavProps {
  onLogout: () => void;
}

const navItems = [
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav({ onLogout }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-amarillo text-negro'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={onLogout}
        className="p-2 bg-rojo/20 hover:bg-rojo/30 text-rojo rounded-lg transition-colors ml-2"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
