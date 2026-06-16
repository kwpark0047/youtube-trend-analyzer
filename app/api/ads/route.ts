import { NextRequest, NextResponse } from 'next/server';
import { searchVideosByKeyword, fetchVideosByIds } from '@/lib/youtube';

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
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const regionCode = searchParams.get('regionCode') || 'KR';
  const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '30'), 30);

  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
  }

  const query = AD_QUERIES[regionCode] ?? AD_QUERIES.default;

  try {
    const ids = await searchVideosByKeyword(apiKey, regionCode, query, maxResults, 'date');

    if (ids.length === 0) {
      return NextResponse.json({
        videos: [],
        total: 0,
        query,
        quota: 100,
        warning: `이 국가(${regionCode})에서 최신 광고 영상을 찾을 수 없습니다.`,
      });
    }

    const videos = await fetchVideosByIds(apiKey, ids);
    const ranked = videos
      .sort((a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime())
      .slice(0, maxResults)
      .map((v, i) => ({ ...v, rank: i + 1 }));

    return NextResponse.json({ videos: ranked, total: ranked.length, query, quota: 101 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
