import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';

export const metadata = {
  title: 'El Taco Chingon - Admin',
  description: 'Staff dashboard for order management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLocaleProvider>{children}</AdminLocaleProvider>;
}
