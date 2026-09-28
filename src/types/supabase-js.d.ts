declare module '@supabase/supabase-js' {
  export type User = { id: string; email?: string | null; [key: string]: any };
  export function createClient(url: string, key: string): any;
}
