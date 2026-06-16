'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Video } from '@/types/youtube';
import { formatNumber } from '@/lib/youtube';

interface Props {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

const INTERVAL_MS = 5000;

export default function RollingBanner({ videos, onVideoClick }: Props) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (next: number) => {
    setFade(false);
    setTimeout(() => {
      setIndex(next);
      setProgress(0);
      setFade(true);
    }, 250);
  };

  useEffect(() => {
    if (videos.length === 0) return;

    setIndex(0);
    setProgress(0);

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % videos.length;
        setFade(false);
        setTimeout(() => {
          setIndex(next);
          setProgress(0);
          setFade(true);
        }, 250);
        return prev;
      });
    }, INTERVAL_MS);

    // Progress bar: tick every 50ms
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (50 / INTERVAL_MS) * 100, 100));
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [videos]);

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-900 border border-dashed border-gray-700 rounded-xl" style={{ minHeight: 90 }}>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs text-gray-600 uppercase tracking-widest">Advertisement</span>
          <span className="text-gray-700 text-xs">광고 영역 (728×90 권장)</span>
        </div>
      </div>
    );
  }

  const video = videos[index];
  const thumb = video.snippet.thumbnails.medium || video.snippet.thumbnails.default;

  return (
    <div className="w-full bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl overflow-hidden cursor-pointer transition-colors select-none"
      onClick={() => onVideoClick(video)}
    >
      <div
        className="flex items-center gap-4 px-4 h-[90px] transition-opacity duration-250"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {/* Rank badge */}
        <div className="flex-shrink-0 w-10 text-center">
          <span className="text-2xl font-black text-gray-700 leading-none">
            {String(video.rank ?? index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Thumbnail */}
        <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-800" style={{ width: 124, height: 70 }}>
          {thumb && (
            <Image
              src={thumb.url}
              alt={video.snippet.title}
              fill
              className="object-cover"
              sizes="124px"
            />
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <div className="w-7 h-7 rounded-full bg-red-600/80 flex items-center justify-center">
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
          <p className="text-sm font-semibold text-white leading-snug line-clamp-1 mb-0.5">
            {video.snippet.title}
          </p>
          <p className="text-xs text-gray-400 truncate mb-1">{video.snippet.channelTitle}</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>👁 {formatNumber(video.statistics.viewCount)}</span>
            <span>👍 {formatNumber(video.statistics.likeCount || '0')}</span>
            <span>💬 {formatNumber(video.statistics.commentCount || '0')}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="text-xs text-gray-600 font-medium">
            {index + 1} <span className="text-gray-700">/</span> {videos.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); goTo((index - 1 + videos.length) % videos.length); }}
              className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-xs"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo((index + 1) % videos.length); }}
              className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-xs"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 5초 진행 바 */}
      <div className="h-[3px] bg-gray-800">
        <div
          className="h-full bg-red-600 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
