/**
 * Supabase browser client — blog posts & case studies.
 *
 * Usage (ES module on a page):
 *   <script type="module">
 *     import { fetchPublishedBlogPosts } from './assets/js/lib/supabase-client.js';
 *     const { data, error } = await fetchPublishedBlogPosts();
 *   </script>
 *
 * Requires assets/js/lib/supabase-config.js with real URL + anon key.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

export const TABLES = {
  blogPosts: 'blog_posts',
  caseStudies: 'case_studies',
};

const PLACEHOLDER_URL = 'YOUR_PROJECT_REF';
const PLACEHOLDER_KEY = 'YOUR_ANON';

/**
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  const url = (SUPABASE_URL || '').trim();
  const key = (SUPABASE_ANON_KEY || '').trim();
  if (!url || !key) return false;
  if (url.includes(PLACEHOLDER_URL) || key.includes(PLACEHOLDER_KEY)) return false;
  return url.startsWith('https://') && key.length > 20;
}

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Copy supabase-config.example.js to supabase-config.js and add your Project URL and anon key.'
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/**
 * @param {import('@supabase/supabase-js').PostgrestError | null} error
 * @returns {{ data: null, error: import('@supabase/supabase-js').PostgrestError }}
 */
function fail(error) {
  return { data: null, error };
}

/**
 * Published blog posts, newest first.
 * @param {{ limit?: number }} [options]
 */
export async function fetchPublishedBlogPosts(options = {}) {
  const { limit } = options;
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from(TABLES.blogPosts)
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (typeof limit === 'number' && limit > 0) {
      query = query.limit(limit);
    }

    return await query;
  } catch (err) {
    return fail(/** @type {import('@supabase/supabase-js').PostgrestError} */ (err));
  }
}

/**
 * Single blog post by URL slug.
 * @param {string} slug
 */
export async function fetchBlogPostBySlug(slug) {
  const normalized = (slug || '').trim();
  if (!normalized) {
    return { data: null, error: { message: 'Slug is required', details: '', hint: '', code: '' } };
  }
  try {
    const supabase = getSupabaseClient();
    return await supabase
      .from(TABLES.blogPosts)
      .select('*')
      .eq('slug', normalized)
      .eq('status', 'published')
      .maybeSingle();
  } catch (err) {
    return fail(/** @type {import('@supabase/supabase-js').PostgrestError} */ (err));
  }
}

/**
 * Published case studies, newest first.
 * @param {{ limit?: number, featuredOnly?: boolean }} [options]
 */
export async function fetchPublishedCaseStudies(options = {}) {
  const { limit, featuredOnly = false } = options;
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from(TABLES.caseStudies)
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (featuredOnly) {
      query = query.eq('featured', true);
    }
    if (typeof limit === 'number' && limit > 0) {
      query = query.limit(limit);
    }

    return await query;
  } catch (err) {
    return fail(/** @type {import('@supabase/supabase-js').PostgrestError} */ (err));
  }
}

/**
 * Single case study by URL slug.
 * @param {string} slug
 */
export async function fetchCaseStudyBySlug(slug) {
  const normalized = (slug || '').trim();
  if (!normalized) {
    return { data: null, error: { message: 'Slug is required', details: '', hint: '', code: '' } };
  }
  try {
    const supabase = getSupabaseClient();
    return await supabase
      .from(TABLES.caseStudies)
      .select('*')
      .eq('slug', normalized)
      .eq('status', 'published')
      .maybeSingle();
  } catch (err) {
    return fail(/** @type {import('@supabase/supabase-js').PostgrestError} */ (err));
  }
}
