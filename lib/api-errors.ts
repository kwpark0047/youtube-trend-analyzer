import { NextResponse } from 'next/server';
import { ApiError, YouTubeApiError, ValidationError } from './errors';

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof YouTubeApiError) {
    const message = error.quotaExceeded
      ? 'YouTube API 할당량이 초과되었습니다. 나중에 다시 시도해주세요.'
      : error.message;
    return NextResponse.json(
      { error: message, code: error.code, quotaExceeded: error.quotaExceeded },
      { status: error.statusCode }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    const message = parseYouTubeError(error.message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: '알 수 없는 오류가 발생했습니다.' },
    { status: 500 }
  );
}

function parseYouTubeError(message: string): string {
  if (message.includes('quota')) {
    return 'YouTube API 할당량이 초과되었습니다. 내일 다시 시도해주세요.';
  }
  if (message.includes('API key not valid')) {
    return 'YouTube API 키가 유효하지 않습니다. API 키를 확인해주세요.';
  }
  if (message.includes('quota has been exceeded')) {
    return 'YouTube API 일일 할당량을 초과했습니다.';
  }
  if (message.includes('forbidden')) {
    return 'API 접근 권한이 없습니다. API 키 설정을 확인해주세요.';
  }
  if (message.includes('not found')) {
    return '요청한 리소스를 찾을 수 없습니다.';
  }
  return message || 'YouTube API 호출 중 오류가 발생했습니다.';
}
