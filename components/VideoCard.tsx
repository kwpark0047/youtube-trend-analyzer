'use client';

import Image from 'next/image';
import type { Video } from '@/types/youtube';
import { formatNumber, formatDuration, formatRelativeDate } from '@/lib/youtube';

interface Props {
  video: Video;
  onClick: (video: Video) => void;
}

export default function VideoCard({ video, onClick }: Props) {
  const { snippet, statistics, contentDetails } = video;
  const thumbnail = snippet.thumbnails.medium || snippet.thumbnails.default;

  const engagementRate =
    parseInt(statistics.viewCount) > 0
      ? (
          ((parseInt(statistics.likeCount || '0') +
            parseInt(statistics.commentCount || '0')) /
            parseInt(statistics.viewCount)) *
          100
        ).toFixed(2)
      : '0';

  return (
    <div
      onClick={() => onClick(video)}
      className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 hover:shadow-lg hover:shadow-black/30 transition-all cursor-pointer"
    >
      <div className="relative aspect-video bg-gray-800">
        {thumbnail && (
          <Image
            src={thumbnail.url}
            alt={snippet.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {video.rank && (
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
            #{video.rank}
          </div>
        )}
        {contentDetails?.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(contentDetails.duration)}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-white transition-colors">
          {snippet.title}
        </h3>
        <p className="text-xs text-gray-400 mb-2 truncate">{snippet.channelTitle}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {formatNumber(statistics.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {formatNumber(statistics.likeCount || '0')}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {formatNumber(statistics.commentCount || '0')}
          </span>
          <span className="ml-auto">{formatRelativeDate(snippet.publishedAt)}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
          <span className="text-gray-600">참여율</span>
          <span className="text-blue-400 font-medium">{engagementRate}%</span>
        </div>
      </div>
    </div>
  );
}
