import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_PUBLISHABLE_DEFAULT_KEY || '';

if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL is not set. Please add it to your .env file.');
}
if (!supabaseKey) {
  console.warn('VITE_PUBLISHABLE_DEFAULT_KEY is not set. Please add it to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'dualview-auth',
    storage: {
      getItem: (key: string) => {
        const cookies = document.cookie.split(';').reduce((res, c) => {
          const [k, v] = c.trim().split('=');
          if (k === key) return decodeURIComponent(v || '');
          return res;
        }, '');
        return cookies || null;
      },
      setItem: (key: string, value: string) => {
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
        document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      },
      removeItem: (key: string) => {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
      },
    },
  },
});

export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'uploads';
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

