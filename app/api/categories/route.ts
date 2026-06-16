import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoCategories } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const regionCode = searchParams.get('regionCode') || 'KR';
  const hl = searchParams.get('hl') || 'ko';

  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
  }

  try {
    const categories = await fetchVideoCategories(apiKey, regionCode, hl);
    return NextResponse.json({ categories });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
