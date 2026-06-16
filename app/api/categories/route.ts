import { NextRequest } from 'next/server';
import { fetchVideoCategories } from '@/lib/youtube';
import { validateApiKey, validateRegionCode } from '@/lib/errors';
import { handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const regionCode = searchParams.get('regionCode') || 'KR';
    const hl = searchParams.get('hl') || 'ko';

    validateApiKey(apiKey);

    if (!validateRegionCode(regionCode)) {
      return Response.json(
        { error: '지원하지 않는 국가 코드입니다.' },
        { status: 400 }
      );
    }

    const categories = await fetchVideoCategories(apiKey!, regionCode, hl);
    return Response.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
