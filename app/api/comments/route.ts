import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoComments } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const videoId = searchParams.get('videoId');
  const maxResults = parseInt(searchParams.get('maxResults') || '20');
  const order = (searchParams.get('order') || 'relevance') as 'relevance' | 'time';
  const pageToken = searchParams.get('pageToken') || undefined;

  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
  }
  if (!videoId) {
    return NextResponse.json({ error: '영상 ID가 필요합니다.' }, { status: 400 });
  }

  try {
    const result = await fetchVideoComments(apiKey, videoId, maxResults, order, pageToken);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    if (message === 'COMMENTS_DISABLED') {
      return NextResponse.json({ error: 'COMMENTS_DISABLED', comments: [], totalResults: 0 }, { status: 200 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
