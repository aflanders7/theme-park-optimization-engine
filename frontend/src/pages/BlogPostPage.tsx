import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import SEO from '../components/SEO';
import { formatPostDate, getBlogPost } from '../lib/blog';
import { absoluteUrl, DEFAULT_SOCIAL_IMAGE, SITE_NAME } from '../lib/site';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const { frontmatter } = post;
  const postPath = `/blog/${frontmatter.slug}`;
  const image = frontmatter.featuredImage || DEFAULT_SOCIAL_IMAGE;
  const updatedDate = frontmatter.updated || frontmatter.date;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: frontmatter.title,
      description: frontmatter.description,
      image: absoluteUrl(image),
      datePublished: frontmatter.date,
      dateModified: updatedDate,
      author: {
        '@type': 'Organization',
        name: frontmatter.author || SITE_NAME,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
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

  return (
    <article className="bg-white px-4 py-10">
      <SEO
        title={frontmatter.title}
        description={frontmatter.description}
        path={postPath}
        image={image}
        type="article"
        publishedTime={frontmatter.date}
        modifiedTime={updatedDate}
        author={frontmatter.author}
        jsonLd={jsonLd}
      />

      <div className="mx-auto max-w-3xl">
        <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--red)] hover:text-[var(--rose)]">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <header className="border-b border-gray-200 pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-500">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[var(--rose)]" />
              <time dateTime={frontmatter.date}>{formatPostDate(frontmatter.date)}</time>
            </span>
            {frontmatter.updated && frontmatter.updated !== frontmatter.date && (
              <span>Updated <time dateTime={frontmatter.updated}>{formatPostDate(frontmatter.updated)}</time></span>
            )}
          </div>

          <h1 className="text-4xl font-bold leading-tight text-gray-950 md:text-5xl">{frontmatter.title}</h1>
          <p className="mt-5 text-xl leading-8 text-gray-600">{frontmatter.description}</p>
        </header>

        {frontmatter.featuredImage && (
          <img
            src={frontmatter.featuredImage}
            alt=""
            className="my-8 aspect-[16/9] w-full rounded-lg border border-gray-200 object-cover"
          />
        )}

        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
}
