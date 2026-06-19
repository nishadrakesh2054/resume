#!/usr/bin/env node
/**
 * Regenerate supabase/seeds/top-it-skills-nepal-2026.json
 * from supabase/content/top-it-skills-nepal-2026.md
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const body = readFileSync(
  join(ROOT, 'supabase/content/top-it-skills-nepal-2026.md'),
  'utf8'
);
const wordCount = body.split(/\s+/).filter(Boolean).length;
const readingTime = Math.max(1, Math.round(wordCount / 200));

const post = {
  slug: 'top-it-skills-nepal-2026',
  title: 'Top IT Skills in Demand in Nepal in 2026',
  subtitle:
    'A practical guide for students, developers, freelancers, and job seekers looking to build a successful tech career in Nepal.',
  excerpt:
    'Discover the most in-demand IT skills in Nepal in 2026 including React, Next.js, Laravel, AI, Cloud Computing, Cybersecurity, and Data Analytics. Learn what employers and freelancers are looking for.',
  body,
  body_format: 'markdown',
  cover_image_url: '/assets/img/blogs/it-skills-nepal-2026.png',
  cover_image_alt:
    'Nepali IT professionals learning in-demand tech skills including React, Laravel, cloud computing and AI in Kathmandu Nepal 2026',
  og_image_url: 'https://rakeshsahani.com.np/assets/img/blogs/it-skills-nepal-2026.png',
  meta_title: 'Top IT Skills in Demand in Nepal in 2026 | Career & Freelancing Guide',
  meta_description:
    'Discover the most in-demand IT skills in Nepal in 2026 including React, Next.js, Laravel, AI, Cloud Computing, Cybersecurity, and Data Analytics. Learn what employers and freelancers are looking for.',
  meta_keywords: [
    'top IT skills in Nepal',
    'IT jobs in Nepal',
    'best IT skills in Nepal',
    'IT skills in demand in Nepal 2026',
    'software development jobs Nepal',
    'freelancing in Nepal',
    'best tech skills Nepal',
    'high paying IT jobs Nepal',
    'web development Nepal',
    'AI jobs Nepal',
    'cloud computing Nepal',
    'cybersecurity Nepal',
    'data analyst Nepal',
    'full stack developer Nepal',
    'frontend developer Nepal',
    'backend developer Nepal',
    'freelancing skills Nepal',
    'remote jobs Nepal',
    'tech careers Nepal',
    'IT career Nepal',
    'programming skills Nepal',
    'React developer Nepal',
    'Laravel developer Nepal',
    'Next.js developer Nepal',
  ],
  canonical_url: 'https://rakeshsahani.com.np/blog/top-it-skills-nepal-2026/',
  seo_robots: 'index, follow',
  category: 'career',
  tags: [
    'nepal',
    'it-career',
    'full-stack',
    'react',
    'laravel',
    'ai',
    'cloud',
    'freelancing',
    'remote-jobs',
    'students',
  ],
  featured: true,
  sort_order: 20,
  author_name: 'Rakesh Kumar Sahani',
  reading_time_minutes: readingTime,
  status: 'published',
  published_at: '2026-06-19T06:00:00.000Z',
  related_case_study_slugs: [],
  related_post_slugs: ['coolify-hosting-platform-guide'],
  structured_data: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which IT skill has highest demand in Nepal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Full stack web development — especially React, Next.js, Laravel, and Node.js — has the highest volume of job posts and freelance projects in Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is AI replacing software developers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not in 2026. AI accelerates coding and documentation, but companies still need developers to architect systems, deploy securely, and fix production bugs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Laravel still in demand?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Laravel remains core to Nepali agency work, admin panels, and PHP hosting environments throughout 2026.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is React worth learning in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. React is the most transferable frontend skill for local jobs, remote SaaS roles, and React Native mobile work in Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which skill is best for freelancing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WordPress for local businesses, React/Next.js for USD remote work, and Laravel for custom business systems are top freelancing skills in Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the highest paying IT job in Nepal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Senior cloud architect, cybersecurity specialist, and remote full stack engineers on USD salaries typically top local NPR ranges in Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which programming language should beginners learn?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start with JavaScript for web development and SQL for data. Both offer the fastest path to employment in Nepal\'s web-heavy market.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I get an IT job in Nepal without a CS degree?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Many developers come from BCA, BIT, CSIT, or self-taught paths. Portfolios, internships, and technical interviews matter more than degree name alone.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to become job-ready?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With focused daily practice, 6–12 months to junior-ready for web development is realistic in Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are remote IT jobs available for Nepali developers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. LinkedIn and company career pages list remote-friendly roles. Portfolio quality, English fluency, and timezone flexibility are key.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I learn Flutter or React Native?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Choose React Native if you know React; choose Flutter if you are mobile-first without web background. Both have freelance demand in Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'What soft skills matter most in Nepal\'s IT market?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Clear English writing, meeting deadlines, proactive communication, and professional email/WhatsApp etiquette keep contracts and jobs.',
        },
      },
    ],
  },
};

writeFileSync(
  join(ROOT, 'supabase/seeds/top-it-skills-nepal-2026.json'),
  JSON.stringify(post, null, 2) + '\n',
  'utf8'
);

console.log(`✓ supabase/seeds/top-it-skills-nepal-2026.json (${wordCount} words, ~${readingTime} min read)`);
