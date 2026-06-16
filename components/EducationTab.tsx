'use client';

import { useState } from 'react';
import type { Video, EducationStrategy, EducationMeta } from '@/types/youtube';
import { formatNumber, formatDuration, formatRelativeDate, videosToCSV } from '@/lib/youtube';
import Image from 'next/image';

interface Props {
  videos: Video[];
  meta: EducationMeta | null;
  loading: boolean;
  error: string;
  onVideoClick: (video: Video) => void;
  onRefetch: () => void;
  regionCode: string;
}

type SortKey = 'rank' | 'views' | 'likes' | 'comments' | 'date' | 'engagement';
type FilterKey = 'all' | 'long' | 'short' | 'recent';

const STRATEGY_COLORS: Record<EducationStrategy, string> = {
  trending: 'bg-green-900/50 text-green-400 border-green-700',
  search: 'bg-blue-900/50 text-blue-400 border-blue-700',
  filtered: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  none: 'bg-gray-800 text-gray-500 border-gray-700',
};

const STRATEGY_ICONS: Record<EducationStrategy, string> = {
  trending: '🔥',
  search: '🔍',
  filtered: '🔽',
  none: '—',
};

function getDurationSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0');
}

function getEngagementRate(v: Video): number {
  const views = parseInt(v.statistics.viewCount || '0');
  if (views === 0) return 0;
  return ((parseInt(v.statistics.likeCount || '0') + parseInt(v.statistics.commentCount || '0')) / views) * 100;
}

export default function EducationTab({ videos, meta, loading, error, onVideoClick, onRefetch, regionCode }: Props) {
  const [sort, setSort] = useState<SortKey>('rank');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [keyword, setKeyword] = useState('');

  const handleDownload = () => {
    const csv = videosToCSV(sortedVideos);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_education_${regionCode}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter
  const filtered = videos.filter((v) => {
    const secs = getDurationSeconds(v.contentDetails?.duration || '');
    const daysAgo = (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 86400000;
    const kw = keyword.trim().toLowerCase();

    if (kw && !v.snippet.title.toLowerCase().includes(kw) && !v.snippet.channelTitle.toLowerCase().includes(kw)) return false;
    if (filter === 'long' && secs < 600) return false;
    if (filter === 'short' && secs >= 600) return false;
    if (filter === 'recent' && daysAgo > 7) return false;
    return true;
  });

  // Sort
  const sortedVideos = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'views': return parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount);
      case 'likes': return parseInt(b.statistics.likeCount || '0') - parseInt(a.statistics.likeCount || '0');
      case 'comments': return parseInt(b.statistics.commentCount || '0') - parseInt(a.statistics.commentCount || '0');
      case 'date': return new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime();
      case 'engagement': return getEngagementRate(b) - getEngagementRate(a);
      default: return (a.rank ?? 0) - (b.rank ?? 0);
    }
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 animate-pulse">
            <div className="w-36 h-20 bg-gray-800 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/60 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <button onClick={onRefetch} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {meta && (
          <>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${STRATEGY_COLORS[meta.strategy]}`}>
              <span>{STRATEGY_ICONS[meta.strategy]}</span>
              <span>{meta.strategyLabel}</span>
            </span>
            <span className="text-xs text-gray-600">quota {meta.quota} 사용</span>
          </>
        )}
        <span className="text-xs text-gray-500 ml-1">{sortedVideos.length}개 영상</span>
        <div className="ml-auto flex gap-2">
          <button onClick={onRefetch} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            새로고침
          </button>
          {sortedVideos.length > 0 && (
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
          )}
        </div>
      </div>

      {/* Warning */}
      {meta?.warning && (
        <div className="mb-4 flex items-start gap-2 bg-yellow-950/40 border border-yellow-800/60 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-yellow-400">{meta.warning}</p>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Keyword search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목 / 채널 검색"
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Duration filter */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {([['all', '전체'], ['long', '10분+'], ['short', '10분 미만'], ['recent', '7일 이내']] as [FilterKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${filter === key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none">
          <option value="rank">순위순</option>
          <option value="views">조회수순</option>
          <option value="likes">좋아요순</option>
          <option value="comments">댓글순</option>
          <option value="engagement">참여율순</option>
          <option value="date">최신순</option>
        </select>
      </div>

      {/* Empty */}
      {sortedVideos.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <span className="text-4xl mb-3">📚</span>
          <p className="text-sm">조건에 맞는 교육 영상이 없습니다.</p>
          {keyword && <button onClick={() => setKeyword('')} className="mt-2 text-xs text-gray-500 underline">검색어 초기화</button>}
        </div>
      )}

      {/* Video list */}
      <div className="space-y-3">
        {sortedVideos.map((video, i) => {
          const thumb = video.snippet.thumbnails.medium || video.snippet.thumbnails.default;
          const engagement = getEngagementRate(video).toFixed(2);
          const secs = getDurationSeconds(video.contentDetails?.duration || '');
          const isLong = secs >= 600;

          return (
            <div key={video.id} onClick={() => onVideoClick(video)}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-3 flex gap-4 cursor-pointer transition-all">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 text-center mt-1">
                <span className={`text-sm font-black ${i < 3 ? 'text-red-500' : 'text-gray-700'}`}>
                  {String(video.rank ?? i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-800" style={{ width: 144, height: 81 }}>
                {thumb && (
                  <Image src={thumb.url} alt={video.snippet.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="144px" />
                )}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {video.contentDetails?.duration ? formatDuration(video.contentDetails.duration) : ''}
                </div>
                {isLong && (
                  <div className="absolute top-1 left-1 bg-blue-600/90 text-white text-xs px-1.5 py-0.5 rounded">
                    롱폼
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2 mb-1 group-hover:text-white transition-colors">
                  {video.snippet.title}
                </h3>
                <p className="text-xs text-gray-500 truncate mb-2">{video.snippet.channelTitle}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span>👁 {formatNumber(video.statistics.viewCount)}</span>
                  <span>👍 {formatNumber(video.statistics.likeCount || '0')}</span>
                  <span>💬 {formatNumber(video.statistics.commentCount || '0')}</span>
                  <span className="text-blue-500">참여율 {engagement}%</span>
                  <span className="ml-auto">{formatRelativeDate(video.snippet.publishedAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
