import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays } from 'lucide-react';
import SEO from '../components/SEO';
import { blogPosts, formatPostDate } from '../lib/blog';
import { absoluteUrl, DEFAULT_SOCIAL_IMAGE, SITE_NAME } from '../lib/site';

export default function BlogIndexPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
    ],
  };

  return (
    <div className="bg-[var(--snow)] px-4 py-10">
      <SEO
        title={`Disney World Planning Blog | ${SITE_NAME}`}
        description="Practical Disney World planning notes, itineraries, crowd guidance, and resort planning from MouseDays."
        path="/blog"
        image={DEFAULT_SOCIAL_IMAGE}
        jsonLd={breadcrumbJsonLd}
      />

      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b border-gray-200 pb-8">
          <div className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-[var(--red)]">
            <BookOpen className="h-5 w-5" />
            MouseDays Blogs
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Disney World planning notes for real trip decisions
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Itineraries, crowd strategy, park-day tradeoffs, and resort planning written for people turning a big trip into a workable plan.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article key={post.frontmatter.slug} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              {post.frontmatter.featuredImage && (
                <Link to={`/blog/${post.frontmatter.slug}`} aria-label={post.frontmatter.title}>
                  <img
                    src={post.frontmatter.featuredImage}
                    alt=""
                    className="h-56 w-full border-b border-gray-100 object-cover"
                  />
                </Link>
              )}

              <div className="p-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <CalendarDays className="h-4 w-4 text-[var(--rose)]" />
                  <time dateTime={post.frontmatter.date}>{formatPostDate(post.frontmatter.date)}</time>
                </div>

                <h2 className="text-2xl font-bold leading-snug text-gray-900">
                  <Link to={`/blog/${post.frontmatter.slug}`} className="hover:text-[var(--red)]">
                    {post.frontmatter.title}
                  </Link>
                </h2>

                <p className="mt-3 leading-7 text-gray-600">{post.frontmatter.description}</p>

                <Link
                  to={`/blog/${post.frontmatter.slug}`}
                  className="mt-5 inline-flex items-center font-bold text-[var(--red)] hover:text-[var(--rose)]"
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
