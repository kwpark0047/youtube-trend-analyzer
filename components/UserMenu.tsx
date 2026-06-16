'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export default function UserMenu({ onOpenSettings, onOpenAuth }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <button onClick={onOpenAuth}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        로그인
      </button>
    );
  }

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자') as string;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
        {avatar ? (
          <Image src={avatar} alt={name} width={24} height={24} className="rounded-full" unoptimized />
        ) : (
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">{initial}</div>
        )}
        <span className="text-xs text-gray-300 hidden sm:block max-w-[90px] truncate">{name}</span>
        <svg className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {avatar ? (
                <Image src={avatar} alt={name} width={36} height={36} className="rounded-full" unoptimized />
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">{initial}</div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="p-1">
            <button onClick={() => { onOpenSettings(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-left">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              개인설정
            </button>
            <div className="h-px bg-gray-800 my-1" />
            <button onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 rounded-lg transition-colors text-left">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
