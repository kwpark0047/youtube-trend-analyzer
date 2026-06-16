export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class YouTubeApiError extends ApiError {
  constructor(message: string, public quotaExceeded: boolean = false) {
    super(message, 400, 'YOUTUBE_API_ERROR');
    this.name = 'YouTubeApiError';
    this.quotaExceeded = quotaExceeded;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
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

export function validateApiKey(apiKey: string | null): asserts apiKey is string {
  if (!apiKey) {
    throw new ValidationError('API 키가 필요합니다.');
  }
  if (apiKey.length < 10) {
    throw new ValidationError('API 키가 유효하지 않습니다.');
  }
}

export function validateRegionCode(regionCode: string): boolean {
  const validCodes = [
    'KR', 'US', 'JP', 'GB', 'DE', 'FR', 'CA', 'AU', 'IN', 'BR',
    'MX', 'IT', 'ES', 'RU', 'TW', 'TH', 'VN', 'ID', 'SG', 'PH',
    'MY', 'AR', 'NG', 'ZA', 'EG', 'PL', 'NL', 'SE', 'NO', 'DK'
  ];
  return validCodes.includes(regionCode);
}

export function validateMaxResults(maxResults: string | null, max: number = 100): number {
  const parsed = parseInt(maxResults || '100', 10);
  if (isNaN(parsed) || parsed < 1) {
    return 100;
  }
  return Math.min(parsed, max);
}
