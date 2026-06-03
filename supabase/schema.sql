-- =============================================================================
-- Portfolio CMS: blog_posts + case_studies
-- Paste into Supabase → SQL Editor → Run
--
-- Matches: assets/js/lib/supabase-client.js
-- Public site: anon key can READ rows where status = 'published' only
-- Writes: Supabase Dashboard Table Editor, or authenticated admin (policies below)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions & enums
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.publish_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE public.content_format AS ENUM ('markdown', 'html');

CREATE TYPE public.blog_category AS ENUM (
  'tutorial',
  'devops',
  'full-stack',
  'career',
  'project-log',
  'opinion',
  'other'
);

CREATE TYPE public.case_study_category AS ENUM (
  'ecommerce',
  'corporate',
  'healthcare',
  'hospitality',
  'embassy',
  'sports',
  'saas',
  'mobile',
  'cms',
  'other'
);

-- -----------------------------------------------------------------------------
-- Shared: auto-update updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_published_at_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    IF NEW.published_at IS NULL THEN
      NEW.published_at = NOW();
    END IF;
  END IF;
  IF NEW.status IN ('draft', 'archived') AND OLD IS NOT NULL AND OLD.status = 'published' THEN
    -- keep published_at as historical record; do not clear
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- BLOG POSTS
-- -----------------------------------------------------------------------------
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- URL & identity (required for SEO pages: /blog/{slug}/)
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,

  -- Main content
  body TEXT NOT NULL DEFAULT '',
  body_format public.content_format NOT NULL DEFAULT 'markdown',

  -- Media
  cover_image_url TEXT,
  cover_image_alt TEXT,
  og_image_url TEXT,

  -- SEO & social
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[] DEFAULT '{}',
  canonical_url TEXT,
  seo_robots TEXT NOT NULL DEFAULT 'index, follow',

  -- Taxonomy & discovery
  category public.blog_category NOT NULL DEFAULT 'other',
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Author & reading experience
  author_name TEXT NOT NULL DEFAULT 'Rakesh Kumar Sahani',
  reading_time_minutes INTEGER CHECK (reading_time_minutes IS NULL OR reading_time_minutes > 0),

  -- Publishing
  status public.publish_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Relations & extras (portfolio cross-links)
  related_case_study_slugs TEXT[] NOT NULL DEFAULT '{}',
  related_post_slugs TEXT[] NOT NULL DEFAULT '{}',
  structured_data JSONB NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT blog_posts_slug_len CHECK (char_length(slug) BETWEEN 3 AND 120),
  CONSTRAINT blog_posts_title_len CHECK (char_length(title) BETWEEN 3 AND 200),
  CONSTRAINT blog_posts_excerpt_len CHECK (char_length(excerpt) BETWEEN 20 AND 500),
  CONSTRAINT blog_posts_meta_desc_len CHECK (
    meta_description IS NULL OR char_length(meta_description) BETWEEN 50 AND 320
  )
);

CREATE UNIQUE INDEX blog_posts_slug_unique ON public.blog_posts (slug);
CREATE INDEX blog_posts_published_list_idx
  ON public.blog_posts (published_at DESC NULLS LAST)
  WHERE status = 'published';
CREATE INDEX blog_posts_featured_idx ON public.blog_posts (featured, sort_order)
  WHERE status = 'published' AND featured = TRUE;
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category)
  WHERE status = 'published';
CREATE INDEX blog_posts_tags_gin_idx ON public.blog_posts USING GIN (tags);

CREATE INDEX blog_posts_search_idx ON public.blog_posts USING GIN (
  to_tsvector(
    'english',
    coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' ||
    coalesce(excerpt, '') || ' ' || coalesce(body, '')
  )
);

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER blog_posts_set_published_at
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_published_at_on_publish();

COMMENT ON TABLE public.blog_posts IS 'Blog articles for /blog/{slug}/ — markdown body, full SEO fields';
COMMENT ON COLUMN public.blog_posts.structured_data IS 'Optional JSON-LD overrides or extra schema.org fields';
COMMENT ON COLUMN public.blog_posts.related_case_study_slugs IS 'Slugs from case_studies to show at end of post';

-- -----------------------------------------------------------------------------
-- CASE STUDIES
-- -----------------------------------------------------------------------------
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- URL & identity (/case-studies/{slug}/)
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  tagline TEXT,

  -- Narrative sections (portfolio storytelling)
  overview TEXT,
  challenge TEXT,
  solution TEXT,
  results TEXT,
  lessons_learned TEXT,

  -- Main long-form body (markdown below the structured sections)
  body TEXT NOT NULL DEFAULT '',
  body_format public.content_format NOT NULL DEFAULT 'markdown',

  -- Outcome metrics e.g. [{"label":"Page speed","value":"92 Lighthouse"},{"label":"Uptime","value":"99.9%"}]
  metrics JSONB NOT NULL DEFAULT '[]',

  -- Gallery e.g. [{"url":"https://...","alt":"Dashboard","caption":"Admin panel"}]
  gallery JSONB NOT NULL DEFAULT '[]',

  -- Media
  cover_image_url TEXT,
  cover_image_alt TEXT,
  hero_image_url TEXT,
  og_image_url TEXT,

  -- Project facts (aligns with projects.json + case study pages)
  client_name TEXT,
  company TEXT,
  industry_label TEXT,
  category public.case_study_category NOT NULL DEFAULT 'other',
  filter_tag TEXT,
  role TEXT,
  stack TEXT[] NOT NULL DEFAULT '{}',
  tech_highlights TEXT[] NOT NULL DEFAULT '{}',

  -- Links
  live_url TEXT,
  github_url TEXT,
  demo_video_url TEXT,

  -- Timeline & scope
  project_started_on DATE,
  project_completed_on DATE,
  duration_label TEXT,
  team_size INTEGER CHECK (team_size IS NULL OR team_size >= 1),
  your_contribution TEXT,

  -- Social proof
  testimonial_quote TEXT,
  testimonial_author TEXT,
  testimonial_role TEXT,

  -- SEO & social
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[] NOT NULL DEFAULT '{}',
  canonical_url TEXT,
  seo_robots TEXT NOT NULL DEFAULT 'index, follow',

  -- Taxonomy & publishing
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status public.publish_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Cross-links
  related_blog_slugs TEXT[] NOT NULL DEFAULT '{}',
  related_case_study_slugs TEXT[] NOT NULL DEFAULT '{}',
  portfolio_legacy_id INTEGER,
  structured_data JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT case_studies_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT case_studies_slug_len CHECK (char_length(slug) BETWEEN 3 AND 120),
  CONSTRAINT case_studies_title_len CHECK (char_length(title) BETWEEN 3 AND 200),
  CONSTRAINT case_studies_excerpt_len CHECK (char_length(excerpt) BETWEEN 20 AND 500),
  CONSTRAINT case_studies_meta_desc_len CHECK (
    meta_description IS NULL OR char_length(meta_description) BETWEEN 50 AND 320
  ),
  CONSTRAINT case_studies_metrics_is_array CHECK (jsonb_typeof(metrics) = 'array'),
  CONSTRAINT case_studies_gallery_is_array CHECK (jsonb_typeof(gallery) = 'array')
);

CREATE UNIQUE INDEX case_studies_slug_unique ON public.case_studies (slug);
CREATE INDEX case_studies_published_list_idx
  ON public.case_studies (published_at DESC NULLS LAST)
  WHERE status = 'published';
CREATE INDEX case_studies_featured_idx ON public.case_studies (featured, sort_order)
  WHERE status = 'published' AND featured = TRUE;
CREATE INDEX case_studies_category_idx ON public.case_studies (category)
  WHERE status = 'published';
CREATE INDEX case_studies_company_idx ON public.case_studies (company)
  WHERE status = 'published';
CREATE INDEX case_studies_filter_tag_idx ON public.case_studies (filter_tag)
  WHERE status = 'published';
CREATE INDEX case_studies_stack_gin_idx ON public.case_studies USING GIN (stack);
CREATE INDEX case_studies_tags_gin_idx ON public.case_studies USING GIN (tags);

CREATE INDEX case_studies_search_idx ON public.case_studies USING GIN (
  to_tsvector(
    'english',
    coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' ||
    coalesce(excerpt, '') || ' ' || coalesce(overview, '') || ' ' ||
    coalesce(challenge, '') || ' ' || coalesce(solution, '') || ' ' ||
    coalesce(results, '') || ' ' || coalesce(body, '')
  )
);

CREATE TRIGGER case_studies_set_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER case_studies_set_published_at
  BEFORE INSERT OR UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_published_at_on_publish();

COMMENT ON TABLE public.case_studies IS 'Project case studies for /case-studies/{slug}/';
COMMENT ON COLUMN public.case_studies.metrics IS 'JSON array of {label, value} outcome stats for hero/results UI';
COMMENT ON COLUMN public.case_studies.gallery IS 'JSON array of {url, alt, caption?} screenshots';
COMMENT ON COLUMN public.case_studies.portfolio_legacy_id IS 'Optional link to id in projects.json during migration';

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors (your portfolio site): read published only
CREATE POLICY "anon_read_published_blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "anon_read_published_case_studies"
  ON public.case_studies
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated admin (enable later when you add Supabase Auth login)
CREATE POLICY "auth_manage_blog_posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_manage_case_studies"
  ON public.case_studies
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- Optional: public views (only safe columns — use if you want stricter anon access)
-- Uncomment if you prefer views over direct table SELECT for anon.
-- -----------------------------------------------------------------------------
-- CREATE VIEW public.blog_posts_public AS
--   SELECT id, slug, title, subtitle, excerpt, body, body_format,
--          cover_image_url, cover_image_alt, og_image_url,
--          meta_title, meta_description, meta_keywords, canonical_url,
--          category, tags, featured, author_name, reading_time_minutes,
--          published_at, related_case_study_slugs, related_post_slugs
--   FROM public.blog_posts
--   WHERE status = 'published';

-- =============================================================================
-- FIELD GUIDE (what to fill in Supabase Table Editor)
-- =============================================================================
--
-- BLOG POSTS — minimum to publish:
--   slug, title, excerpt, body, status='published'
-- Recommended for SEO:
--   meta_title (≤60 chars), meta_description (150–160 chars),
--   cover_image_url, cover_image_alt, og_image_url, tags, category
--
-- CASE STUDIES — minimum to publish:
--   slug, title, excerpt, body OR (overview + challenge + solution + results),
--   cover_image_url, stack, status='published'
-- Recommended for “next level” portfolio:
--   metrics, gallery, live_url, client_name, company, role,
--   challenge, solution, results, testimonial_*, meta_*, featured
--
-- Slug rules: lowercase, hyphens only, e.g. arksh-store-nextjs-ecommerce
--
-- =============================================================================
