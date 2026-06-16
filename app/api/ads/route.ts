import { NextRequest } from 'next/server';
import { searchVideosByKeyword, fetchVideosByIds } from '@/lib/youtube';
import { validateApiKey, validateRegionCode, validateMaxResults } from '@/lib/errors';
import { handleApiError } from '@/lib/api-errors';

const AD_QUERIES: Record<string, string> = {
  KR: '광고 OR CF OR TVCF OR 광고영상',
  JP: '広告 OR CM OR TVCM OR コマーシャル',
  US: 'commercial OR advertisement OR ad 2024 2025',
  GB: 'advert OR commercial OR advertisement',
  CN: '广告 OR 商业广告 OR 广告片',
  TW: '廣告 OR 廣告片 OR CF',
  DE: 'Werbung OR Werbespot OR Reklame',
  FR: 'publicité OR spot publicitaire',
  default: 'advertisement OR commercial OR advert',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const regionCode = searchParams.get('regionCode') || 'KR';
    const maxResults = validateMaxResults(searchParams.get('maxResults'), 30);

    validateApiKey(apiKey);

    if (!validateRegionCode(regionCode)) {
      return Response.json(
        { error: '지원하지 않는 국가 코드입니다.' },
        { status: 400 }
      );
    }

    const query = AD_QUERIES[regionCode] ?? AD_QUERIES.default;

    const ids = await searchVideosByKeyword(apiKey!, regionCode, query, maxResults, 'date');

    if (ids.length === 0) {
      return Response.json({
        videos: [],
        total: 0,
        query,
        quota: 100,
        warning: `이 국가(${regionCode})에서 최신 광고 영상을 찾을 수 없습니다.`,
      });
    }

    const videos = await fetchVideosByIds(apiKey!, ids);
    const ranked = videos
      .sort((a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime())
      .slice(0, maxResults)
      .map((v, i) => ({ ...v, rank: i + 1 }));

    return Response.json({ videos: ranked, total: ranked.length, query, quota: 101 });
  } catch (error) {
    return handleApiError(error);
  }
}
