import { NextRequest } from 'next/server';
import { fetchVideoComments } from '@/lib/youtube';
import { validateApiKey, validateMaxResults } from '@/lib/errors';
import { handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const videoId = searchParams.get('videoId');
    const maxResults = validateMaxResults(searchParams.get('maxResults'), 100);
    const order = (searchParams.get('order') || 'relevance') as 'relevance' | 'time';
    const pageToken = searchParams.get('pageToken') || undefined;

    validateApiKey(apiKey);

    if (!videoId) {
      return Response.json(
        { error: '영상 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await fetchVideoComments(apiKey!, videoId, maxResults, order, pageToken);
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'COMMENTS_DISABLED') {
      return Response.json(
        { error: 'COMMENTS_DISABLED', comments: [], totalResults: 0 },
        { status: 200 }
      );
    }
    return handleApiError(error);
  }
}
