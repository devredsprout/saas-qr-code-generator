import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export const metadata = { title: 'Dashboard' };

export default async function DashboardLayout({ children }) {
  let session = null;
  try {
    const { getSession } = await import('@/lib/auth');
    session = await getSession();
  } catch (e) {
    console.error('Dashboard auth check failed:', e.message);
  }
  if (!session) redirect('/auth/login');

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar />
      <main className="flex-1 p-6 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
