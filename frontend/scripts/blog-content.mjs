import fs from 'node:fs';
import path from 'node:path';

export const SITE_NAME = 'MouseDays';
export const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://mousedays.net').replace(/\/$/, '');
export const DEFAULT_SOCIAL_IMAGE = '/blog/planning-notes.svg';

export const root = process.cwd();
export const contentDir = path.join(root, 'src/content/blog');

export function absoluteUrl(urlPath) {
  if (/^https?:\/\//i.test(urlPath)) return urlPath;
  return `${SITE_URL}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function parseFrontmatter(raw, filePath = '') {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Blog post is missing frontmatter: ${filePath}`);
  }

  const [, frontmatterRaw, content] = match;
  const frontmatter = frontmatterRaw.split('\n').reduce((acc, line) => {
    const separator = line.indexOf(':');
    if (separator === -1) return acc;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');
    acc[key] = value === 'true' ? true : value === 'false' ? false : value;
    return acc;
  }, {});

  return {
    frontmatter,
    content: content.trim(),
    path: filePath,
  };
}

export function getBlogPosts() {
  if (!fs.existsSync(contentDir)) return [];

  return fs.readdirSync(contentDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => parseFrontmatter(fs.readFileSync(path.join(contentDir, file), 'utf8'), file))
    .filter((post) => post.frontmatter.slug && post.frontmatter.published !== false)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export function formatPostDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function renderInline(text) {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const external = /^https?:\/\//i.test(href);
      const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
      return `<a href="${escapeHtml(href)}"${attrs}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function renderMarkdown(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      html.push('<hr>');
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      html.push(`<h${level} id="${slugify(text)}">${renderInline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(`<p>${renderInline(lines[i].trim().slice(2))}</p>`);
        i += 1;
      }
      html.push(`<blockquote>${quoteLines.join('')}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${renderInline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${renderInline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      html.push(`<img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}">`);
      i += 1;
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s+/.test(lines[i].trim()) && !/^([-*]|\d+\.)\s+/.test(lines[i].trim()) && !lines[i].trim().startsWith('> ')) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    html.push(`<p>${renderInline(paragraphLines.join(' '))}</p>`);
  }

  return html.join('\n');
}
