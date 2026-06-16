'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { COUNTRIES } from '@/lib/constants';

interface Props {
  onClose: () => void;
  onApiKeyChange: (key: string) => void;
}

type Tab = 'youtube' | 'account';

export default function SettingsModal({ onClose, onApiKeyChange }: Props) {
  const { user, settings, updateSettings } = useAuth();
  const [tab, setTab] = useState<Tab>('youtube');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [defaultRegion, setDefaultRegion] = useState('KR');
  const [fetchCount, setFetchCount] = useState(100);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setApiKey(settings.youtube_api_key || '');
      setDefaultRegion(settings.default_region || 'KR');
      setFetchCount(settings.fetch_count || 100);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true); setError('');
    const { error } = await updateSettings({
      youtube_api_key: apiKey.trim(),
      default_region: defaultRegion,
      fetch_count: fetchCount,
    });
    setSaving(false);
    if (error) {
      setError(error);
    } else {
      if (apiKey.trim()) {
        localStorage.setItem('yt_api_key', apiKey.trim());
        onApiKeyChange(apiKey.trim());
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자') as string;
  const initial = name.charAt(0).toUpperCase();
  const maskedKey = apiKey ? apiKey.slice(0, 6) + '••••••••••••' + apiKey.slice(-4) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white">개인설정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {([['youtube', '📺 YouTube 설정'], ['account', '👤 계정 정보']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${tab === t ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-4">
          {tab === 'youtube' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">YouTube Data API 키</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza... YouTube Data API v3 키"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 pr-14 placeholder-gray-600"
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300">
                    {showKey ? '숨김' : '표시'}
                  </button>
                </div>
                {!showKey && apiKey && (
                  <p className="mt-1 text-xs text-gray-600 font-mono">{maskedKey}</p>
                )}
                <p className="mt-1.5 text-xs text-gray-600">키는 Supabase에 안전하게 저장됩니다.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">기본 국가</label>
                <select value={defaultRegion} onChange={(e) => setDefaultRegion(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500">
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">기본 급상승 조회 수</label>
                <select value={fetchCount} onChange={(e) => setFetchCount(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500">
                  <option value={25}>TOP 25</option>
                  <option value={50}>TOP 50</option>
                  <option value={100}>TOP 100</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
            </>
          )}

          {tab === 'account' && (
            <>
              {/* Profile card */}
              <div className="flex items-center gap-4 p-4 bg-gray-800/60 rounded-xl">
                {avatar ? (
                  <Image src={avatar} alt={name} width={56} height={56} className="rounded-full" unoptimized />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold">{initial}</div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-200">{name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    가입일: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
              </div>

              {/* Provider info */}
              <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  {user?.app_metadata?.provider === 'google' ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-xs text-blue-300 font-medium">Google 계정으로 연결됨</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-blue-300 font-medium">이메일 계정</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-blue-400/70">
                  {user?.app_metadata?.provider === 'google'
                    ? '이름/프로필 사진은 Google 계정 설정에서 변경됩니다.'
                    : '비밀번호 변경 링크는 이메일로 발송됩니다.'}
                </p>
              </div>

              {settings?.youtube_api_key && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">저장된 API 키</label>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-500 font-mono">
                    {settings.youtube_api_key.slice(0, 6)}{'••••••••••••'}{settings.youtube_api_key.slice(-4)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">취소</button>
          {tab === 'youtube' && (
            <button onClick={handleSave} disabled={saving}
              className={`px-5 py-2 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${saved ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
              {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
