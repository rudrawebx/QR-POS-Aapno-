'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const localSess = localStorage.getItem('auth_session');
      if (localSess) {
        const parsed = JSON.parse(localSess);
        if (parsed.role === 'CASHIER') {
          router.replace('/admin/pos');
          return;
        }
      }
    } catch {
      // fallback
    }
    router.replace('/admin/orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FEFBF5] flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-[#AA1B2A] font-bold text-sm">
        <span className="w-5 h-5 border-2 border-[#AA1B2A] border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Aapno Khaano Terminal...</span>
      </div>
    </div>
  );
}
