'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { Comment } from '@/types/youtube';
import { formatNumber, formatRelativeDate } from '@/lib/youtube';

interface Props {
  videoId: string;
  apiKey: string;
  onClose?: () => void;
}

export default function CommentList({ videoId, apiKey }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [order, setOrder] = useState<'relevance' | 'time'>('relevance');
  const [maxResults, setMaxResults] = useState(20);
  const [disabled, setDisabled] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const loadComments = useCallback(async (reset = false, newOrder?: 'relevance' | 'time') => {
    setLoading(true);
    setError('');
    const useOrder = newOrder ?? order;

    try {
      const params = new URLSearchParams({
        apiKey,
        videoId,
        maxResults: String(maxResults),
        order: useOrder,
      });
      if (!reset && nextPageToken) {
        params.set('pageToken', nextPageToken);
      }

      const res = await fetch(`/api/comments?${params}`);
      const data = await res.json();

      if (data.error === 'COMMENTS_DISABLED') {
        setDisabled(true);
        setLoaded(true);
        return;
      }
      if (data.error) throw new Error(data.error);

      setComments(reset ? data.comments : [...comments, ...data.comments]);
      setNextPageToken(data.nextPageToken);
      setTotalResults(data.totalResults);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 로드 실패');
    } finally {
      setLoading(false);
    }
  }, [apiKey, videoId, maxResults, order, nextPageToken, comments]);

  const handleOrderChange = (newOrder: 'relevance' | 'time') => {
    setOrder(newOrder);
    setNextPageToken(undefined);
    setComments([]);
    loadComments(true, newOrder);
  };

  if (!loaded) {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-3 mb-3">
          <select
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-500"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          <button
            onClick={() => loadComments(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 text-sm rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                불러오는 중...
              </>
            ) : (
              '댓글 불러오기'
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="mt-4 text-center py-8 text-gray-500 text-sm">
        이 영상은 댓글이 비활성화되어 있습니다.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            댓글 {formatNumber(totalResults)}개
          </span>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => handleOrderChange('relevance')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              order === 'relevance'
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => handleOrderChange('time')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              order === 'time'
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            최신순
          </button>
        </div>
        <select
          value={maxResults}
          onChange={(e) => {
            setMaxResults(parseInt(e.target.value));
          }}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value={10}>10개씩</option>
          <option value={20}>20개씩</option>
          <option value={50}>50개씩</option>
          <option value={100}>100개씩</option>
        </select>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => {
          const s = comment.snippet.topLevelComment.snippet;
          return (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {s.authorProfileImageUrl ? (
                  <Image
                    src={s.authorProfileImageUrl}
                    alt={s.authorDisplayName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                    {s.authorDisplayName[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-300">{s.authorDisplayName}</span>
                  <span className="text-xs text-gray-600">{formatRelativeDate(s.publishedAt)}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {s.textDisplay
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {formatNumber(s.likeCount)}
                  </span>
                  {comment.snippet.totalReplyCount > 0 && (
                    <span>답글 {comment.snippet.totalReplyCount}개</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {nextPageToken && (
        <button
          onClick={() => loadComments(false)}
          disabled={loading}
          className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-400 text-sm rounded-lg transition-colors"
        >
          {loading ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
}
