export interface BlogPostFrontmatter {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  author?: string;
  featuredImage?: string;
  published?: boolean;
}

export interface BlogPost {
  frontmatter: BlogPostFrontmatter;
  content: string;
  path: string;
}

const modules = import.meta.glob('../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function parseFrontmatter(raw: string, path: string): BlogPost {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`Blog post is missing frontmatter: ${path}`);
  }

  const [, frontmatterRaw, content] = match;
  const frontmatter = frontmatterRaw.split('\n').reduce<Record<string, string | boolean>>((acc, line) => {
    const separator = line.indexOf(':');
    if (separator === -1) return acc;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');
    acc[key] = value === 'true' ? true : value === 'false' ? false : value;
    return acc;
  }, {});

  return {
    frontmatter: frontmatter as unknown as BlogPostFrontmatter,
    content: content.trim(),
    path,
  };
}

function byNewest(a: BlogPost, b: BlogPost) {
  return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
}

export const blogPosts = Object.entries(modules)
  .map(([path, raw]) => parseFrontmatter(raw, path))
  .filter((post) => post.frontmatter.published !== false)
  .sort(byNewest);

export function getBlogPost(slug: string | undefined) {
  return blogPosts.find((post) => post.frontmatter.slug === slug);
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}
