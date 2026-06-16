import { NextRequest, NextResponse } from 'next/server';
import { fetchAllTrendingVideos } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const regionCode = searchParams.get('regionCode') || 'KR';
  const categoryId = searchParams.get('categoryId') || '';
  const maxResults = parseInt(searchParams.get('maxResults') || '100');

  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
  }

  try {
    const videos = await fetchAllTrendingVideos(apiKey, regionCode, categoryId, maxResults);
    return NextResponse.json({ videos, total: videos.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    // 카테고리 필터가 적용된 요청에서의 오류는 해당 지역에 데이터가 없는 것으로 처리
    if (categoryId && categoryId !== '0') {
      return NextResponse.json({
        videos: [],
        total: 0,
        warning: `이 국가(${regionCode})에서 해당 카테고리의 급상승 데이터를 제공하지 않습니다. (${message})`,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
