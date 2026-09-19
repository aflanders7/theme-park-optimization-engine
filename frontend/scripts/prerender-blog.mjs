import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
  escapeHtml,
  formatPostDate,
  getBlogPosts,
  renderMarkdown,
  root,
} from './blog-content.mjs';

const distDir = path.join(root, 'dist');
const distIndexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(distIndexPath)) {
  throw new Error('dist/index.html was not found. Run this script after vite build.');
}

const appShell = fs.readFileSync(distIndexPath, 'utf8');
const posts = getBlogPosts();

function injectHead(html, head) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, '').replace('</head>', `${head}\n  </head>`);
}

function injectRoot(html, rootHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`);
}

function writePage(routePath, head, rootHtml) {
  const outputDir = path.join(distDir, routePath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), injectRoot(injectHead(appShell, head), rootHtml));
}

function metaTags({ title, description, path: pagePath, image = DEFAULT_SOCIAL_IMAGE, type = 'website', jsonLd, publishedTime, modifiedTime, author }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonical = absoluteUrl(pagePath);
  const imageUrl = absoluteUrl(image);

  return `
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(fullTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">${publishedTime ? `
    <meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}${modifiedTime ? `
    <meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">` : ''}${author ? `
    <meta property="article:author" content="${escapeHtml(author)}">` : ''}
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

function layout(content) {
  return `
    <div class="min-h-screen bg-gradient-to-br from-[var(--snow)] via-[var(--pale)] to-[var(--snow)]">
      <main class="flex-grow">${content}</main>
    </div>`;
}

const blogHead = metaTags({
  title: `Disney World Planning Blog | ${SITE_NAME}`,
  description: 'Practical Disney World planning notes, itineraries, crowd guidance, and resort planning from MouseDays.',
  path: '/blog',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
    ],
  },
});

const blogCards = posts.map((post) => {
  const { frontmatter } = post;
  return `
    <article class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      ${frontmatter.featuredImage ? `<a href="/blog/${frontmatter.slug}"><img src="${escapeHtml(frontmatter.featuredImage)}" alt="" class="h-56 w-full border-b border-gray-100 object-cover"></a>` : ''}
      <div class="p-6">
        <div class="mb-3 text-sm font-medium text-gray-500"><time datetime="${escapeHtml(frontmatter.date)}">${formatPostDate(frontmatter.date)}</time></div>
        <h2 class="text-2xl font-bold leading-snug text-gray-900"><a href="/blog/${frontmatter.slug}">${escapeHtml(frontmatter.title)}</a></h2>
        <p class="mt-3 leading-7 text-gray-600">${escapeHtml(frontmatter.description)}</p>
        <a href="/blog/${frontmatter.slug}" class="mt-5 inline-flex items-center font-bold text-[var(--red)]">Read article</a>
      </div>
    </article>`;
}).join('\n');

writePage('blog', blogHead, layout(`
  <div class="bg-[var(--snow)] px-4 py-10">
    <div class="mx-auto max-w-6xl">
      <header class="mb-10 border-b border-gray-200 pb-8">
        <div class="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--red)]">MouseDays Journal</div>
        <h1 class="max-w-3xl text-4xl font-bold leading-tight text-gray-900 md:text-5xl">Disney World planning notes for real trip decisions</h1>
        <p class="mt-4 max-w-2xl text-lg leading-8 text-gray-600">Itineraries, crowd strategy, park-day tradeoffs, and resort planning written for people turning a big trip into a workable plan.</p>
      </header>
      <div class="grid gap-6 md:grid-cols-2">${blogCards}</div>
    </div>
  </div>`));

for (const post of posts) {
  const { frontmatter } = post;
  const postPath = `/blog/${frontmatter.slug}`;
  const image = frontmatter.featuredImage || DEFAULT_SOCIAL_IMAGE;
  const updatedDate = frontmatter.updated || frontmatter.date;
  const articleJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: frontmatter.title,
      description: frontmatter.description,
      image: absoluteUrl(image),
      datePublished: frontmatter.date,
      dateModified: updatedDate,
      author: { '@type': 'Organization', name: frontmatter.author || SITE_NAME },
      publisher: { '@type': 'Organization', name: SITE_NAME },
      mainEntityOfPage: absoluteUrl(postPath),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: frontmatter.title, item: absoluteUrl(postPath) },
      ],
    },
  ];

  const head = metaTags({
    title: frontmatter.title,
    description: frontmatter.description,
    path: postPath,
    image,
    type: 'article',
    jsonLd: articleJsonLd,
    publishedTime: frontmatter.date,
    modifiedTime: updatedDate,
    author: frontmatter.author,
  });

  writePage(path.join('blog', frontmatter.slug), head, layout(`
    <article class="bg-white px-4 py-10">
      <div class="mx-auto max-w-3xl">
        <a href="/blog" class="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--red)]">Back to blog</a>
        <header class="border-b border-gray-200 pb-8">
          <div class="mb-4 text-sm font-medium text-gray-500">
            <time datetime="${escapeHtml(frontmatter.date)}">${formatPostDate(frontmatter.date)}</time>
            ${frontmatter.updated && frontmatter.updated !== frontmatter.date ? `<span> · Updated <time datetime="${escapeHtml(frontmatter.updated)}">${formatPostDate(frontmatter.updated)}</time></span>` : ''}
          </div>
          <h1 class="text-4xl font-bold leading-tight text-gray-950 md:text-5xl">${escapeHtml(frontmatter.title)}</h1>
          <p class="mt-5 text-xl leading-8 text-gray-600">${escapeHtml(frontmatter.description)}</p>
        </header>
        ${frontmatter.featuredImage ? `<img src="${escapeHtml(frontmatter.featuredImage)}" alt="" class="my-8 aspect-[16/9] w-full rounded-lg border border-gray-200 object-cover">` : ''}
        <div class="blog-prose">${renderMarkdown(post.content)}</div>
      </div>
    </article>`));
}

console.log(`Prerendered /blog and ${posts.length} blog posts.`);
