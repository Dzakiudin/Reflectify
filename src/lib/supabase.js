import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

export function createSupabaseClient(fetch, cookies) {
    if (isBrowser()) {
        return createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
            global: { fetch }
        });
    }

    return createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
            getAll() {
                return cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    cookies.set(name, value, { ...options, path: '/' })
                );
            }
        }
    });
}
