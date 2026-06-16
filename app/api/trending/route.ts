import { NextRequest } from 'next/server';
import { fetchAllTrendingVideos } from '@/lib/youtube';
import { validateApiKey, validateRegionCode, validateMaxResults } from '@/lib/errors';
import { handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const regionCode = searchParams.get('regionCode') || 'KR';
    const categoryId = searchParams.get('categoryId') || '';
    const maxResults = validateMaxResults(searchParams.get('maxResults'), 100);

    validateApiKey(apiKey);

    if (!validateRegionCode(regionCode)) {
      return Response.json(
        { error: '지원하지 않는 국가 코드입니다.' },
        { status: 400 }
      );
    }

    const videos = await fetchAllTrendingVideos(apiKey!, regionCode, categoryId, maxResults);
    return Response.json({ videos, total: videos.length });
  } catch (error) {
    return handleApiError(error);
  }
}
