import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL, getBlogPosts, root } from './blog-content.mjs';

const publicDir = path.join(root, 'public');
const posts = getBlogPosts().map((post) => post.frontmatter);

const urls = [
  { loc: '/', priority: '0.8' },
  { loc: '/blog', priority: '0.7' },
  { loc: '/crowd-calendar', priority: '0.7' },
  { loc: '/parks', priority: '0.7' },
  { loc: '/hotels', priority: '0.7' },
  ...posts.map((post) => ({
    loc: `/blog/${post.slug}`,
    lastmod: post.updated || post.date,
    priority: '0.6',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);

console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
