const requiredEnvVars = [
  'NEXT_PUBLIC_YOUTUBE_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const optionalEnvVars = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || fallback || '';
}

export function getYouTubeApiKey(): string {
  return getEnvVar('NEXT_PUBLIC_YOUTUBE_API_KEY');
}

export function getSupabaseConfig() {
  return {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}
