import { NextRequest } from 'next/server';
import {
  fetchAllTrendingVideos,
  searchVideosByCategory,
  fetchVideosByIds,
} from '@/lib/youtube';
import { validateApiKey, validateRegionCode, validateMaxResults } from '@/lib/errors';
import { handleApiError } from '@/lib/api-errors';
import type { EducationStrategy } from '@/types/youtube';

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

    // ── Strategy 1: 트렌딩 교육 카테고리 (quota: 1) ──────────────────
    try {
      const videos = await fetchAllTrendingVideos(apiKey!, regionCode, '27', maxResults);
      if (videos.length > 0) {
        return Response.json({
          videos,
          total: videos.length,
          strategy: 'trending' as EducationStrategy,
          strategyLabel: '트렌딩 교육 카테고리',
          quota: 1,
        });
      }
    } catch {
      // fallthrough to strategy 2
    }

    // ── Strategy 2: 검색 API 교육 카테고리 (quota: 100 + 1) ──────────
    try {
      const ids = await searchVideosByCategory(apiKey!, regionCode, '27', maxResults, 'viewCount');
      if (ids.length > 0) {
        const videos = await fetchVideosByIds(apiKey!, ids);
        const ranked = videos.slice(0, maxResults).map((v, i) => ({ ...v, rank: i + 1 }));
        return Response.json({
          videos: ranked,
          total: ranked.length,
          strategy: 'search' as EducationStrategy,
          strategyLabel: '검색 기반 교육 영상',
          quota: 101,
        });
      }
    } catch {
      // fallthrough to strategy 3
    }

    // ── Strategy 3: 전체 급상승 → 교육 카테고리 필터링 (quota: 2) ────
    try {
      const allVideos = await fetchAllTrendingVideos(apiKey!, regionCode, '', 100);
      const eduVideos = allVideos
        .filter((v) => v.snippet.categoryId === '27')
        .slice(0, maxResults)
        .map((v, i) => ({ ...v, rank: i + 1 }));

      return Response.json({
        videos: eduVideos,
        total: eduVideos.length,
        strategy: 'filtered' as EducationStrategy,
        strategyLabel: '전체 교육 TOP30 필터',
        quota: 2,
        warning:
          eduVideos.length === 0
            ? `이 국가(${regionCode})의 급상승 TOP 100에 교육 카테고리 영상이 없습니다.`
            : undefined,
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
