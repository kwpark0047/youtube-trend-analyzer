'use client';

import { useState } from 'react';
import type { Video } from '@/types/youtube';
import VideoCard from './VideoCard';
import VideoModal from './VideoModal';

interface Props {
  videos: Video[];
  apiKey: string;
  loading: boolean;
  error?: string;
  warning?: string;
}

export default function VideoGrid({ videos, apiKey, loading, error, warning }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-800" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-full" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-950/60 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-red-400 mb-1">데이터 조회 실패</p>
        <p className="text-xs text-gray-600 max-w-sm">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">API 키와 조건을 설정하고 조회하세요.</p>
      </div>
    );
  }

  return (
    <>
      {warning && (
        <div className="mb-4 flex items-start gap-2 bg-yellow-950/40 border border-yellow-800/60 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-yellow-400">{warning}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onClick={setSelectedVideo} />
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          apiKey={apiKey}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
