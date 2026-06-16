import type { Video, Comment, VideoCategory } from '@/types/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function fetchTrendingVideos(
  apiKey: string,
  regionCode: string = 'KR',
  categoryId: string = '',
  maxResults: number = 50,
  pageToken?: string
): Promise<{ videos: Video[]; nextPageToken?: string; totalResults: number }> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode,
    maxResults: String(Math.min(maxResults, 50)),
    key: apiKey,
  });

  if (categoryId && categoryId !== '0') {
    params.set('videoCategoryId', categoryId);
  }
  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '동영상을 가져오는데 실패했습니다.');
  }

  const data = await res.json();
  return {
    videos: (data.items || []) as Video[],
    nextPageToken: data.nextPageToken,
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export async function fetchAllTrendingVideos(
  apiKey: string,
  regionCode: string = 'KR',
  categoryId: string = '',
  targetCount: number = 100
): Promise<Video[]> {
  const videos: Video[] = [];
  let pageToken: string | undefined;

  while (videos.length < targetCount) {
    const remaining = targetCount - videos.length;
    const batchSize = Math.min(remaining, 50);

    const result = await fetchTrendingVideos(
      apiKey,
      regionCode,
      categoryId,
      batchSize,
      pageToken
    );

    videos.push(...result.videos);
    pageToken = result.nextPageToken;

    if (!pageToken) break;
  }

  return videos.slice(0, targetCount).map((v, i) => ({ ...v, rank: i + 1 }));
}

export async function searchVideosByCategory(
  apiKey: string,
  regionCode: string = 'KR',
  categoryId: string = '27',
  maxResults: number = 30,
  order: 'viewCount' | 'relevance' | 'date' = 'viewCount'
): Promise<string[]> {
  const langMap: Record<string, string> = {
    KR: 'ko', JP: 'ja', CN: 'zh-Hans', TW: 'zh-Hant',
    DE: 'de', FR: 'fr', ES: 'es', IT: 'it', PT: 'pt',
    RU: 'ru', PL: 'pl', NL: 'nl', SE: 'sv',
  };

  const params = new URLSearchParams({
    part: 'id',
    type: 'video',
    videoCategoryId: categoryId,
    order,
    regionCode,
    maxResults: String(Math.min(maxResults, 50)),
    key: apiKey,
  });

  const lang = langMap[regionCode];
  if (lang) params.set('relevanceLanguage', lang);

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '검색 실패');
  }

  const data = await res.json();
  return (data.items || [])
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean) as string[];
}

export async function searchVideosByKeyword(
  apiKey: string,
  regionCode: string = 'KR',
  query: string = '광고 CF',
  maxResults: number = 30,
  order: 'date' | 'viewCount' | 'relevance' = 'date'
): Promise<string[]> {
  const params = new URLSearchParams({
    part: 'id',
    type: 'video',
    q: query,
    order,
    regionCode,
    maxResults: String(Math.min(maxResults, 50)),
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '검색 실패');
  }

  const data = await res.json();
  return (data.items || [])
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean) as string[];
}

export async function fetchVideosByIds(apiKey: string, ids: string[]): Promise<Video[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: ids.slice(0, 50).join(','),
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '영상 상세 조회 실패');
  }

  const data = await res.json();
  return (data.items || []) as Video[];
}

export async function fetchVideoComments(
  apiKey: string,
  videoId: string,
  maxResults: number = 20,
  order: 'relevance' | 'time' = 'relevance',
  pageToken?: string
): Promise<{ comments: Comment[]; nextPageToken?: string; totalResults: number }> {
  const params = new URLSearchParams({
    part: 'snippet',
    videoId,
    maxResults: String(Math.min(maxResults, 100)),
    order,
    key: apiKey,
  });

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const res = await fetch(`${YOUTUBE_API_BASE}/commentThreads?${params}`);

  if (res.status === 403) {
    const err = await res.json();
    if (err.error?.errors?.[0]?.reason === 'commentsDisabled') {
      throw new Error('COMMENTS_DISABLED');
    }
    throw new Error(err.error?.message || '댓글을 가져오는데 실패했습니다.');
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '댓글을 가져오는데 실패했습니다.');
  }

  const data = await res.json();
  return {
    comments: (data.items || []) as Comment[],
    nextPageToken: data.nextPageToken,
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export async function fetchVideoCategories(
  apiKey: string,
  regionCode: string = 'KR',
  hl: string = 'ko'
): Promise<VideoCategory[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    regionCode,
    hl,
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/videoCategories?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '카테고리를 가져오는데 실패했습니다.');
  }

  const data = await res.json();
  return ((data.items || []) as VideoCategory[]).filter(
    (c) => c.snippet.assignable
  );
}

export function formatNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '0';
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
}

export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

export function videosToCSV(videos: Video[]): string {
  const headers = [
    '순위', '제목', '채널명', '조회수', '좋아요수', '댓글수',
    '업로드일', '영상 URL', '썸네일 URL', '설명(요약)',
  ];

  const rows = videos.map((v, i) => [
    v.rank ?? i + 1,
    `"${v.snippet.title.replace(/"/g, '""')}"`,
    `"${v.snippet.channelTitle.replace(/"/g, '""')}"`,
    v.statistics.viewCount,
    v.statistics.likeCount,
    v.statistics.commentCount,
    formatDate(v.snippet.publishedAt),
    `https://www.youtube.com/watch?v=${v.id}`,
    v.snippet.thumbnails.medium?.url || '',
    `"${v.snippet.description.slice(0, 100).replace(/"/g, '""').replace(/\n/g, ' ')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function commentsToCSV(comments: Comment[], videoTitle: string): string {
  const headers = [
    '작성자', '댓글 내용', '좋아요수', '답글수', '작성일',
  ];

  const rows = comments.map((c) => {
    const s = c.snippet.topLevelComment.snippet;
    return [
      `"${s.authorDisplayName.replace(/"/g, '""')}"`,
      `"${s.textDisplay.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      s.likeCount,
      c.snippet.totalReplyCount,
      formatDate(s.publishedAt),
    ];
  });

  return [
    `# ${videoTitle}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}
