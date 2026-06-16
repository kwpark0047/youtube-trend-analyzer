'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.replace('/');
    });
    const t = setTimeout(() => router.replace('/'), 4000);
    return () => { subscription.unsubscribe(); clearTimeout(t); };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
