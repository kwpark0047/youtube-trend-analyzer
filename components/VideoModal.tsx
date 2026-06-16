'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Video } from '@/types/youtube';
import { formatNumber, formatDuration, formatDate, commentsToCSV } from '@/lib/youtube';
import CommentList from './CommentList';

interface Props {
  video: Video;
  apiKey: string;
  onClose: () => void;
}

export default function VideoModal({ video, apiKey, onClose }: Props) {
  const { snippet, statistics, contentDetails } = video;
  const thumbnail = snippet.thumbnails.maxres || snippet.thumbnails.high || snippet.thumbnails.medium;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const openYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank', 'noopener,noreferrer');
  };

  const engagementRate =
    parseInt(statistics.viewCount) > 0
      ? (
          ((parseInt(statistics.likeCount || '0') + parseInt(statistics.commentCount || '0')) /
            parseInt(statistics.viewCount)) *
          100
        ).toFixed(2)
      : '0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            {video.rank && (
              <span className="text-sm font-bold text-red-400">#{video.rank}</span>
            )}
            <span className="text-xs text-gray-500">영상 상세 정보</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-800">
            {thumbnail && (
              <Image
                src={thumbnail.url}
                alt={snippet.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={openYouTube}
                className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors"
              >
                <svg className="w-7 h-7 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            {contentDetails?.duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(contentDetails.duration)}
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Title & Channel */}
            <h2 className="text-base font-semibold text-white leading-snug mb-2">
              {snippet.title}
            </h2>
            <p className="text-sm text-gray-400 mb-4">{snippet.channelTitle}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatBox label="조회수" value={formatNumber(statistics.viewCount)} icon="👁" />
              <StatBox label="좋아요" value={formatNumber(statistics.likeCount || '0')} icon="👍" />
              <StatBox label="댓글 수" value={formatNumber(statistics.commentCount || '0')} icon="💬" />
              <StatBox label="참여율" value={`${engagementRate}%`} icon="📊" />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-5 bg-gray-800/50 rounded-xl p-4">
              <DetailRow label="업로드일" value={formatDate(snippet.publishedAt)} />
              <DetailRow label="영상 길이" value={contentDetails?.duration ? formatDuration(contentDetails.duration) : '-'} />
              <DetailRow label="채널" value={snippet.channelTitle} />
              <DetailRow
                label="YouTube 링크"
                value={
                  <button
                    onClick={openYouTube}
                    className="text-red-400 hover:text-red-300 underline transition-colors"
                  >
                    영상 보기 ↗
                  </button>
                }
              />
            </div>

            {/* Description */}
            {snippet.description && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">설명</h3>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                  {snippet.description}
                </p>
              </div>
            )}

            {/* Comments */}
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <span>댓글</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                  {formatNumber(statistics.commentCount || '0')}개
                </span>
              </h3>
              <CommentList videoId={video.id} apiKey={apiKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-gray-300">{value}</span>
    </>
  );
}
