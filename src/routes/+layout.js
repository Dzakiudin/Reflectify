import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

export async function load({ data, depends, fetch }) {
    depends('supabase:auth');

    const supabase = isBrowser()
        ? createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
            global: { fetch }
        })
        : createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
            global: { fetch },
            cookies: {
                getAll() {
                    return data.cookies ?? [];
                }
            }
        });

    const {
        data: { session }
    } = await supabase.auth.getSession();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    return { supabase, session, user };
}
