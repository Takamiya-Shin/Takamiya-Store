import { createClient, SupabaseClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(rawUrl: string): string {
  return rawUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

/**
 * Konfigurasi Publik Supabase Takamiya Store
 * Menggunakan Project URL & Publishable Key (aman untuk frontend browser).
 * Anda juga dapat menimpanya melalui .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).
 */
export const SUPABASE_URL: string = normalizeSupabaseUrl(
  import.meta.env.VITE_SUPABASE_URL || 'https://rurtnmfpqztfbsauatmy.supabase.co'
);

export const SUPABASE_ANON_KEY: string = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_grKfqD6MmwbcDcCH7fFWOQ_89JzLxjo'
).trim();

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') &&
    /^https?:\/\//.test(SUPABASE_URL)
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
