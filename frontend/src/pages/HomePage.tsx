import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChartNoAxesCombined,
  Users,
  CableCar,
} from 'lucide-react';
import { blogPosts, formatPostDate } from '../lib/blog';
import BrevoForm from '../components/BrevoForm';

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const ROUTES = {
  parkPlanner: '/parks',
  crowdCalendar: '/crowd-calendar',
  blog: '/blog',
  post: (slug: string) => `/blog/${slug}`,
};

/* ------------------------------------------------------------------ */
/* Recent blog posts                                                   */
/* ------------------------------------------------------------------ */

const time = (d: unknown) => new Date(d as string).getTime();

const recentPosts = [...blogPosts]
  .sort((a, b) => time(b.frontmatter.date) - time(a.frontmatter.date))
  .slice(0, 5);

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const COLORS = {
  rust: '#CC3F4F',
  rose: '#E0728D',
  pink: '#E89FBA',
  sunset: '#FFE0B2',
  blue: '#759FBC',
  dblue: '#3C6583',
};

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dblue)]';

const textLink = `font-semibold text-[var(--dblue)] underline underline-offset-2 hover:text-[var(--rust)] ${focusRing}`;

function SectionHeading({
  id,
  color,
  small = false,
  children,
}: {
  id: string;
  color: string;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      style={{ borderColor: color }}
      className={`font-display mb-4 border-b-4 pb-1 font-bold text-[var(--charcoal)] ${small ? 'text-xl' : 'text-2xl md:text-3xl'
        }`}
    >
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[var(--charcoal)]">

      {/* ============================================================ */}
      {/* Hero                                                         */}
      {/* ============================================================ */}

      <section className="border-b border-[var(--charcoal)]/15 bg-[var(--pale)] px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[var(--dblue)]">Welcome to MouseDays</p>
          <h1 className="font-display text-3xl font-bold text-[var(--charcoal)] md:text-5xl">Planning a Disney World trip?</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">Pick your park days, check the crowds, and get a little help with all the planning in between.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTES.parkPlanner} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--charcoal)] bg-white px-5 py-3 font-bold shadow-[2px_2px_0_var(--charcoal)] transition-transform hover:-translate-y-0.5">
              <CableCar className="h-5 w-5" /> Plan your park days
            </Link>
            <Link to={ROUTES.crowdCalendar} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--charcoal)] bg-white px-5 py-3 font-bold shadow-[2px_2px_0_var(--charcoal)] transition-transform hover:-translate-y-0.5">
              <Calendar className="h-5 w-5" /> Check the crowd calendar
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* How It Works                                                  */}
      {/* ============================================================ */}

      <section className="border-b border-[var(--charcoal)]/15 bg-white px-4 py-12 md:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <SectionHeading id="how-it-works" color={COLORS.sunset}>
              Start Planning
            </SectionHeading>

            <p className="leading-relaxed max-w-2xl">
              Three quick steps can help turn your trip dates into park days that fit your group.
            </p>
          </div>

          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            <PlannerStep
              n={1}
              bg={COLORS.pink}
              fg="#274156"
              title="Pick your dates"
            >
              Choose your dates and how many park days you have.
            </PlannerStep>

            <PlannerStep
              n={2}
              bg={COLORS.sunset}
              fg="#274156"
              title="Tell us who's coming"
            >
              Tell us who's coming and what everyone enjoys.
            </PlannerStep>

            <PlannerStep
              n={3}
              bg={COLORS.dblue}
              fg="#FFFFFF"
              title="Get your plan"
            >
              Get a park plan shaped around your trip.
            </PlannerStep>
          </ol>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Main Content                                                  */}
      {/* ============================================================ */}

      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">

        <section aria-labelledby="blog" className="mb-16">
          <SectionHeading id="blog" color={COLORS.rust}>
            From the Blog
          </SectionHeading>

          {recentPosts.length > 0 ? (
            <>
              <p className="max-w-xl leading-relaxed">
                Planning guides and practical tips for a Walt Disney World
                trip.
              </p>

              <ul className="mt-3 max-w-3xl">
                {recentPosts.map((post, i) => (
                  <li
                    key={post.frontmatter.slug}
                    className="flex items-center justify-between gap-4 border-b border-dotted border-[var(--charcoal)] py-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--charcoal)]"
                        style={{
                          background: [
                            COLORS.rose,
                            COLORS.blue,
                            COLORS.sunset,
                            COLORS.pink,
                            COLORS.rust,
                          ][i % 5],
                        }}
                      />

                      <Link
                        to={ROUTES.post(post.frontmatter.slug)}
                        className={textLink}
                      >
                        {post.frontmatter.title}
                      </Link>
                    </span>

                    <span className="shrink-0 text-sm text-[var(--dblue)]">
                      {formatPostDate(post.frontmatter.date)}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4">
                <Link to={ROUTES.blog} className={textLink}>
                  View all articles
                </Link>
              </p>
            </>
          ) : (
            <p className="leading-relaxed">
              The first planning guides are on the way. Sign
              up for email notifications and additional content.
            </p>
          )}
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Park Planner                                                */}
        {/* ---------------------------------------------------------- */}

        <section aria-labelledby="park-planner" className="mb-16">
          <SectionHeading id="park-planner" color={COLORS.rose}>
            Park Planner
          </SectionHeading>

          <div className="max-w-2xl">
            <p className="leading-relaxed">
              Have your dates picked out? Let’s figure out which parks make the most sense for each day.
            </p>

            <div className="mt-6 space-y-5">
              <FeatureRow
                icon={<Calendar className="h-5 w-5" />}
                title="Plans around your actual trip"
              >
              Add your dates, park days, and any parks you’d especially like to visit on arrival or departure.
              </FeatureRow>

              <FeatureRow
                icon={<Users className="h-5 w-5" />}
                title="Accounts for your group"
              >
              Tell us who’s coming and what they like, from thrill rides and food to animals and culture.
              </FeatureRow>

              <FeatureRow
                icon={<ChartNoAxesCombined className="h-5 w-5" />}
                title="Balances the whole trip"
              >
              We’ll weigh the crowd forecast, your must-sees and skips, repeat visits, and a little breathing room.
              </FeatureRow>
            </div>

            <p className="mt-6 leading-relaxed">
              You’ll see the suggested park, crowd level, and a few notes about why it fits. If a rest day makes sense, we’ll include that too.
            </p>

            <p className="mt-6">
              <Link
                to={ROUTES.parkPlanner}
                className="inline-flex items-center gap-3 bg-[var(--sunset)] px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <CableCar className="w-6 h-6" />
                Plan Your Park Days
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Crowd Calendar                                              */}
        {/* ---------------------------------------------------------- */}

        <section aria-labelledby="crowd-calendar" className="mb-16">
          <SectionHeading id="crowd-calendar" color={COLORS.blue}>
            Crowd Calendar
          </SectionHeading>

          <div className="max-w-2xl">
            <p className="leading-relaxed">
              Check the forecast for each park and date. It can help you compare travel dates or see whether moving your trip by a few days might help.
            </p>

            <p className="mt-4 leading-relaxed">
              Days are rated from 1 to 10, using the same scale you'll see in
              your park plan:
            </p>

            <ul
              aria-label="Crowd levels"
              className="mt-4 flex flex-wrap gap-2 text-sm"
            >
              <li className="rounded-full border-2 border-[#8CCDB0] bg-[#BEE5D3] px-3 py-1 font-bold text-[#1B5E44]">
                Low · 1–3
              </li>
              <li className="rounded-full border-2 border-[#E5C45D] bg-[#FCDD8E] px-3 py-1 font-bold text-[#7A5900]">
                Moderate · 4–6
              </li>
              <li className="rounded-full border-2 border-[#E99A58] bg-[#FBBB86] px-3 py-1 font-bold text-[#8A3A0E]">
                High · 7–8
              </li>
              <li className="rounded-full border-2 border-[#E07C7C] bg-[#F3A2A2] px-3 py-1 font-bold text-[#7A1F1F]">
                Very High · 9–10
              </li>
            </ul>

            <p className="mt-4 leading-relaxed">
              The Park Planner uses the same forecasts when it suggests your park days.
            </p>

            <p className="mt-6">
              <Link
                to={ROUTES.crowdCalendar}
                className="inline-flex items-center gap-3 bg-[var(--sunset)] px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Calendar className="w-6 h-6" />
                Check the Crowd Calendar
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Hotel Matcher                                               */}
        {/* ---------------------------------------------------------- */}

        {/* <section
          aria-labelledby="hotel-matcher"
          className="mb-16 rounded-2xl border-2 border-[var(--charcoal)] bg-gradient-to-br from-[var(--pale)] to-[var(--pink)] p-6 md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-1 border-[var(--charcoal)] bg-white text-[var(--dblue)]">
                  <Hotel className="h-5 w-5" />
                </div>

                <h2
                  id="hotel-matcher"
                  className="font-display text-2xl font-bold"
                >
                  Hotel Matcher
                </h2>
              </div>

              <p className="leading-relaxed">
                Still deciding where to stay? Answer a few questions and get
                Disney resort suggestions based on your group, with information
                about amenities, location, and transportation.
              </p>
            </div>

                                    <p className="mt-6">
              <Link
                to={ROUTES.hotelMatcher}
                className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Hotel className="w-6 h-6" />
                Search Hotels
              </Link>
            </p>
          </div>
        </section> */}

      </main>

      {/* ============================================================ */}
      {/* Email signup                                                  */}
      {/* ============================================================ */}

      <BrevoForm />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function PlannerStep({
  n,
  bg,
  fg,
  title,
  children,
}: {
  n: number;
  bg: string;
  fg: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="relative">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--charcoal)] font-display text-lg font-bold shadow-[2px_2px_0_var(--charcoal)]"
          style={{ background: bg, color: fg }}
        >
          {n}
        </span>

        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-bold">{title}</h3>
          </div>

          <p className="leading-relaxed">{children}</p>
        </div>
      </div>
    </li>
  );
}

function FeatureRow({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--pale)] text-[var(--dblue)]">
        {icon}
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

