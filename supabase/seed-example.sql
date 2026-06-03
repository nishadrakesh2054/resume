-- =============================================================================
-- OPTIONAL: Example rows (run AFTER schema.sql)
-- Delete or edit before running in production.
-- =============================================================================

INSERT INTO public.case_studies (
  slug,
  title,
  subtitle,
  excerpt,
  tagline,
  overview,
  challenge,
  solution,
  results,
  body,
  metrics,
  gallery,
  cover_image_url,
  cover_image_alt,
  company,
  client_name,
  category,
  filter_tag,
  role,
  stack,
  tech_highlights,
  live_url,
  featured,
  status,
  meta_title,
  meta_description,
  tags
) VALUES (
  'arksh-store',
  'Arksh Store',
  'Clothing ecommerce for Nepal',
  'Full-stack Next.js ecommerce with PostgreSQL, Prisma, and Cloudinary-backed catalog — built for scale and SEO.',
  'Modern ecommerce from catalog to checkout',
  'Arksh Store is a clothing ecommerce platform for the Arksh Group brand.',
  'Legacy workflows and slow catalog updates limited marketing launches.',
  'Next.js App Router storefront, Prisma ORM on PostgreSQL, optimized images via Cloudinary, and deployment on Coolify with Docker.',
  'Faster catalog updates, improved Core Web Vitals, and a maintainable admin-friendly data model.',
  '## Technical deep dive\n\nAdd architecture notes, API design, and deployment details here.',
  '[
    {"label": "Stack", "value": "Next.js + PostgreSQL"},
    {"label": "Role", "value": "Full-stack lead"}
  ]'::jsonb,
  '[
    {"url": "https://res.cloudinary.com/doaiilrxn/image/upload/v1780367651/arkshstore_owilqq.png", "alt": "Arksh Store homepage", "caption": "Storefront"}
  ]'::jsonb,
  'https://res.cloudinary.com/doaiilrxn/image/upload/v1780367651/arkshstore_owilqq.png',
  'Arksh Store ecommerce homepage screenshot',
  'Arksh Group',
  'Arksh Group',
  'ecommerce',
  'ecommerce',
  'Full-stack developer',
  ARRAY['Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Prisma ORM'],
  ARRAY['App Router', 'Prisma migrations', 'SEO'],
  'https://arkshstore.com',
  TRUE,
  'published',
  'Arksh Store Case Study | Rakesh Kumar Sahani',
  'How Arksh Store was built with Next.js, PostgreSQL, and Prisma — full-stack ecommerce case study by Rakesh Kumar Sahani.',
  ARRAY['ecommerce', 'nextjs', 'postgresql', 'nepal']
);

INSERT INTO public.blog_posts (
  slug,
  title,
  subtitle,
  excerpt,
  body,
  cover_image_url,
  cover_image_alt,
  category,
  tags,
  reading_time_minutes,
  featured,
  status,
  meta_title,
  meta_description,
  related_case_study_slugs
) VALUES (
  'deploy-nextjs-with-coolify',
  'Deploy Next.js with Coolify and Docker',
  'A practical DevOps guide from my portfolio stack',
  'Step-by-step notes on shipping a Next.js app with Docker, Coolify, and Cloudflare — what I use on client projects.',
  '## Introduction\n\nWrite your tutorial content in **markdown** here.\n\n## Prerequisites\n\n- Docker\n- Coolify instance\n\n## Steps\n\n1. Build image\n2. Configure domain\n3. Enable SSL',
  'https://nishadrakesh2054.github.io/rakesh/assets/img/profile/alex1.webp',
  'Rakesh Kumar Sahani — developer portrait',
  'devops',
  ARRAY['coolify', 'docker', 'nextjs', 'devops'],
  8,
  TRUE,
  'published',
  'Deploy Next.js with Coolify | Rakesh Kumar Sahani Blog',
  'Learn how to deploy Next.js using Docker and Coolify — DevOps tutorial from a full-stack developer in Nepal.',
  ARRAY['arksh-store']
);
