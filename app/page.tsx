'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Video, VideoCategory, EducationMeta } from '@/types/youtube';
import { COUNTRIES, DEFAULT_CATEGORIES } from '@/lib/constants';
import { videosToCSV } from '@/lib/youtube';
import { useAuth } from '@/contexts/AuthContext';
import ApiKeyManager from '@/components/ApiKeyManager';
import VideoGrid from '@/components/VideoGrid';
import RollingBanner from '@/components/RollingBanner';
import VideoModal from '@/components/VideoModal';
import EducationTab from '@/components/EducationTab';
import AdsTab from '@/components/AdsTab';
import UserMenu from '@/components/UserMenu';
import AuthModal from '@/components/AuthModal';
import SettingsModal from '@/components/SettingsModal';

type Tab = 'trending' | 'education' | 'ads';

export default function Home() {
  const { settings, user, updateSettings } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [regionCode, setRegionCode] = useState('KR');
  const [categoryId, setCategoryId] = useState('0');
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('trending');
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [educationVideos, setEducationVideos] = useState<Video[]>([]);
  const [educationMeta, setEducationMeta] = useState<EducationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [adsVideos, setAdsVideos] = useState<Video[]>([]);
  const [adsQuota, setAdsQuota] = useState(0);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState('');
  const [eduLoading, setEduLoading] = useState(false);
  const [error, setError] = useState('');
  const [educationError, setEducationError] = useState('');
  const [lastFetched, setLastFetched] = useState('');
  const [fetchCount, setFetchCount] = useState(100);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  const loadCategories = useCallback(async (key: string, region: string) => {
    if (!key) return;
    try {
      const res = await fetch(`/api/categories?apiKey=${encodeURIComponent(key)}&regionCode=${region}&hl=ko`);
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (settings?.youtube_api_key) {
      setApiKey(settings.youtube_api_key);
      localStorage.setItem('yt_api_key', settings.youtube_api_key);
    }
    if (settings?.default_region) setRegionCode(settings.default_region);
    if (settings?.fetch_count) setFetchCount(settings.fetch_count);
  }, [settings]);

  useEffect(() => {
    if (apiKey) loadCategories(apiKey, regionCode);
  }, [apiKey, regionCode, loadCategories]);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    if (user && key) updateSettings({ youtube_api_key: key });
  }, [user, updateSettings]);

  const fetchAds = useCallback(async (key: string, region: string) => {
    if (!key) return;
    setAdsLoading(true);
    setAdsError('');
    try {
      const params = new URLSearchParams({ apiKey: key, regionCode: region, maxResults: '30' });
      const res = await fetch(`/api/ads?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdsVideos(data.videos || []);
      setAdsQuota(data.quota || 0);
    } catch (err) {
      setAdsError(err instanceof Error ? err.message : '광고 영상 조회 실패');
      setAdsVideos([]);
    } finally {
      setAdsLoading(false);
    }
  }, []);

  const fetchEducation = useCallback(async (key: string, region: string) => {
    if (!key) return;
    setEduLoading(true);
    setEducationError('');
    try {
      const params = new URLSearchParams({ apiKey: key, regionCode: region, maxResults: '30' });
      const res = await fetch(`/api/education?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEducationVideos(data.videos || []);
      setEducationMeta(data.strategy ? {
        strategy: data.strategy,
        strategyLabel: data.strategyLabel,
        quota: data.quota,
        warning: data.warning,
      } : null);
    } catch (err) {
      setEducationError(err instanceof Error ? err.message : '교육 영상 조회 실패');
      setEducationVideos([]);
    } finally {
      setEduLoading(false);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    if (!apiKey) {
      setError('API 키를 먼저 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');

    const trendingParams = new URLSearchParams({
      apiKey,
      regionCode,
      categoryId: categoryId === '0' ? '' : categoryId,
      maxResults: String(fetchCount),
    });

    const [trendResult] = await Promise.allSettled([
      fetch(`/api/trending?${trendingParams}`).then((r) => r.json()),
      fetchEducation(apiKey, regionCode),
      fetchAds(apiKey, regionCode),
    ]);

    if (trendResult.status === 'fulfilled') {
      const data = trendResult.value;
      if (data.error) {
        setError(data.error);
      } else {
        setTrendingVideos(data.videos || []);
        setLastFetched(new Date().toLocaleTimeString('ko-KR'));
      }
    } else {
      setError(trendResult.reason?.message || '급상승 영상 조회에 실패했습니다.');
    }

    setLoading(false);
  }, [apiKey, regionCode, categoryId, fetchCount, fetchEducation, fetchAds]);

  const handleDownloadCSV = () => {
    if (trendingVideos.length === 0) return;
    const csv = videosToCSV(trendingVideos);
    const bom = '﻿';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_급상승_${regionCode}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCountry = COUNTRIES.find((c) => c.code === regionCode);
  const allCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map(c => ({
    id: c.id,
    snippet: { title: c.title, assignable: true },
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-none truncate">YouTube 트렌드 분석기</h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5 hidden sm:block">급상승 동영상 분석 도구</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastFetched && (
              <span className="text-xs text-gray-600 hidden md:block">
                마지막 조회: {lastFetched}
              </span>
            )}
            <UserMenu
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-5">
        <ApiKeyManager onApiKeyChange={handleApiKeyChange} />

        <RollingBanner videos={trendingVideos} onVideoClick={setModalVideo} />

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs text-gray-500 mb-1.5">국가</label>
              <select
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs text-gray-500 mb-1.5">카테고리 (급상승 필터)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="ad" disabled>── 📢 광고 ──</option>
                <option value="0">전체</option>
                {allCategories
                  .filter((c) => c.id !== '0')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.snippet.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">급상승 조회 수</label>
              <select
                value={fetchCount}
                onChange={(e) => setFetchCount(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value={25}>TOP 25</option>
                <option value={50}>TOP 50</option>
                <option value={100}>TOP 100</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchVideos}
                disabled={loading || !apiKey}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors h-[38px]"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="hidden sm:inline">조회 중...</span>
                    <span className="sm:hidden">조회</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    조회
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 bg-red-950/50 border border-red-800 rounded-lg p-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
              <TabButton
                active={activeTab === 'trending'}
                onClick={() => setActiveTab('trending')}
                label={`급상승 TOP ${fetchCount}`}
                count={trendingVideos.length}
                icon="🔥"
              />
              <TabButton
                active={activeTab === 'education'}
                onClick={() => setActiveTab('education')}
                label="교육 TOP 30"
                count={educationVideos.length}
                icon="📚"
              />
              <TabButton
                active={activeTab === 'ads'}
                onClick={() => setActiveTab('ads')}
                label="최신광고 TOP 30"
                count={adsVideos.length}
                icon="📺"
              />
            </div>

            <div className="flex items-center gap-2">
              {currentCountry && (
                <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
                  {currentCountry.flag} {currentCountry.name}
                </span>
              )}
              {activeTab === 'trending' && trendingVideos.length > 0 && (
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV 다운로드
                </button>
              )}
            </div>
          </div>

          {activeTab === 'trending' ? (
            <VideoGrid
              videos={trendingVideos}
              apiKey={apiKey}
              loading={loading}
            />
          ) : activeTab === 'education' ? (
            <EducationTab
              videos={educationVideos}
              meta={educationMeta}
              loading={eduLoading}
              error={educationError}
              onVideoClick={setModalVideo}
              onRefetch={() => fetchEducation(apiKey, regionCode)}
              regionCode={regionCode}
            />
          ) : (
            <AdsTab
              videos={adsVideos}
              loading={adsLoading}
              error={adsError}
              quota={adsQuota}
              onVideoClick={setModalVideo}
              onRefetch={() => fetchAds(apiKey, regionCode)}
              regionCode={regionCode}
            />
          )}
        </div>
      </main>

      {modalVideo && (
        <VideoModal
          video={modalVideo}
          apiKey={apiKey}
          onClose={() => setModalVideo(null)}
        />
      )}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onApiKeyChange={handleApiKeyChange}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-red-600 text-white shadow-lg'
          : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
      {count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            active ? 'bg-red-500 text-red-100' : 'bg-gray-800 text-gray-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
