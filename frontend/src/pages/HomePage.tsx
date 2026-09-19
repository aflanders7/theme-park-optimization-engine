import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChartNoAxesCombined,
  Sparkles,
  Star,
  Users,
  CableCar,
  Hotel,
  CalendarIcon
} from 'lucide-react';
import { blogPosts, formatPostDate } from '../lib/blog';
import BrevoForm from '../components/BrevoForm';

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

const ROUTES = {
  parkPlanner: '/parks',
  crowdCalendar: '/crowd-calendar',
  hotelMatcher: '/hotels',
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

      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--snow)] via-[var(--pink)] to-[var(--snow)] text-white py-20 px-4">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/40 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-[var(--charcoal)]" />
              <span className="font-semibold text-[var(--charcoal)]">
                Unofficial Recommendation Tool
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Tell Us When You're Going.</span>
              <span className="block ">
                We'll Plan Your Park Days.
              </span>
            </h1>

            <p className="text-l md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              MouseDays is a free planning tool that uses your trip
              dates, group details, preferences, and crowd forecasts to build your trip in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={ROUTES.parkPlanner}
                className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <CableCar className="w-6 h-6" />
                Park Planner
              </Link>

              <Link
                to={ROUTES.crowdCalendar}
                className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <CalendarIcon className="w-6 h-6" />
                Crowd Calendar
              </Link>
            </div>

            <p className="mt-4 text-sm font-medium">
              Takes about two minutes. No account required.
            </p>
          </div>

          {/* Decorative gradients */}
          <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[var(--sunset)]/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-[var(--rose)]/20 blur-3xl" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* Email signup                                                  */}
      {/* ============================================================ */}

      <BrevoForm />

      {/* ============================================================ */}
      {/* How It Works                                                  */}
      {/* ============================================================ */}

      <section className="border-b border-[var(--charcoal)]/15 bg-white px-4 py-12 md:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <SectionHeading id="how-it-works" color={COLORS.sunset}>
              How It Works
            </SectionHeading>

            <p className="leading-relaxed max-w-2xl">
              Planning a Disney trip means balancing dates, crowds, park
              preferences, and the people you're traveling with. MouseDays does
              the sorting for you.
            </p>
          </div>

          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            <PlannerStep
              n={1}
              bg={COLORS.pink}
              fg="#274156"
              title="Pick your dates"
            >
              Enter your trip dates and how many days you want to spend in the
              parks.
            </PlannerStep>

            <PlannerStep
              n={2}
              bg={COLORS.sunset}
              fg="#274156"
              title="Tell us who's coming"
            >
              Share your group and what you enjoy: thrills,
              food, animals, culture, and more.
            </PlannerStep>

            <PlannerStep
              n={3}
              bg={COLORS.dblue}
              fg="#FFFFFF"
              title="Get your plan"
            >
              MouseDays builds a personalized
              park schedule.
            </PlannerStep>
          </ol>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Main Content                                                  */}
      {/* ============================================================ */}

      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">

        {/* ---------------------------------------------------------- */}
        {/* Park Planner                                                */}
        {/* ---------------------------------------------------------- */}

        <section aria-labelledby="park-planner" className="mb-16">
          <SectionHeading id="park-planner" color={COLORS.rose}>
            Park Planner
          </SectionHeading>

          <div className="max-w-2xl">
            <p className="leading-relaxed">
              Four theme parks, a handful of days, and a group that never wants
              the same thing. The Park Planner sorts out the order.
            </p>

            <div className="mt-6 space-y-5">
              <FeatureRow
                icon={<Calendar className="h-5 w-5" />}
                title="Plans around your actual trip"
              >
                Choose your dates, number of park days, and optional arrival or
                departure park preferences.
              </FeatureRow>

              <FeatureRow
                icon={<Users className="h-5 w-5" />}
                title="Accounts for your group"
              >
                Tell us who's coming and what matters to them, from thrill
                rides to food, animals, culture, and more.
              </FeatureRow>

              <FeatureRow
                icon={<ChartNoAxesCombined className="h-5 w-5" />}
                title="Balances the whole trip"
              >
                The planner considers crowd forecasts, your preferences, repeat
                visits, must-see and skip parks, and rest between busy days.
              </FeatureRow>
            </div>

            <p className="mt-6 leading-relaxed">
              Every day of your plan comes with a park, its crowd level, the
              reasons it was picked, and tips for the day. Rest days can show up
              too, with an explanation of why.
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

        <section aria-labelledby="crowd-calendar" className="mb-16" bg-white>
          <SectionHeading id="crowd-calendar" color={COLORS.blue}>
            Crowd Calendar
          </SectionHeading>

          <div className="max-w-2xl">
            <p className="leading-relaxed">
              See the crowd forecast for each park, date by date. Use it to
              choose your travel dates, or to check whether shifting your trip
              by a few days could help.
            </p>

            <p className="mt-4 leading-relaxed">
              Days are rated from 1 to 10, using the same scale you'll see in
              your park plan:
            </p>

            <ul
              aria-label="Crowd levels"
              className="mt-4 flex flex-wrap gap-2 text-sm"
            >
              <li className="rounded-full border-2 border-green-300 bg-green-100 px-3 py-1 font-bold text-green-800">
                Low · 1–3
              </li>
              <li className="rounded-full border-2 border-yellow-400 bg-yellow-50 px-3 py-1 font-bold text-yellow-900">
                Moderate · 4–6
              </li>
              <li className="rounded-full border-2 border-red-300 bg-red-100 px-3 py-1 font-bold text-red-800">
                High · 7–10
              </li>
            </ul>

            <p className="mt-4 leading-relaxed">
              The Park Planner uses these same forecasts when it builds your
              schedule, so the calendar and personalized recommendations work
              together.
            </p>

                        <p className="mt-6">
              <Link
                to={ROUTES.crowdCalendar}
                className="inline-flex items-center gap-3 bg-[var(--sunset)] px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Calendar className="w-6 h-6" />
                Open the Crowd Calendar
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Why the Predictions Matter                                  */}
        {/* ---------------------------------------------------------- */}

        <section
          aria-labelledby="prediction-data"
          className="mb-16 border-y border-[var(--charcoal)]/15 py-12"
        >
          <div className="grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <div className="max-w-3xl">
              <SectionHeading id="prediction-data" color={COLORS.rose}>
                Why the Predictions Matter
              </SectionHeading>

              <p className="leading-relaxed">
                MouseDays forecasts aren't arbitrary guesses or feelings. They are based on historical Walt Disney
                World crowd patterns and mathematical modeling that looks at how
                crowds have behaved across different dates, parks, holidays,
                school breaks, weekends, and trip conditions.
              </p>

              <p className="mt-4 leading-relaxed">
                The model studies those past patterns, then estimates what
                future park days are likely to feel like. 
              </p>

              <p className="mt-4 text-sm font-semibold text-[var(--dblue)]">
                It is still a forecast, but it is a forecast with evidence
                behind it.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Built for real park tradeoffs                               */}
        {/* ---------------------------------------------------------- */}

        <section aria-labelledby="forecast-note" className="mb-16">
          <div className="max-w-3xl">
            <SectionHeading id="forecast-note" color={COLORS.sunset}>
              Built for Real Park Tradeoffs
            </SectionHeading>

            <p className="leading-relaxed">
              MouseDays compares parks day by day, so it can help you decide
              whats days to do what parks and when you should take a break day.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <TradeoffItem
                icon={<ChartNoAxesCombined className="h-5 w-5" />}
                title="Crowds"
              >
                A quieter day can matter, but it isn't the only thing that
                matters.
              </TradeoffItem>

              <TradeoffItem
                icon={<Star className="h-5 w-5" />}
                title="Your interests"
              >
                A park can be a better fit when its attractions match what your
                group actually enjoys.
              </TradeoffItem>

              <TradeoffItem
                icon={<Users className="h-5 w-5" />}
                title="Your group"
              >
                Children's ages and the makeup of your group can change which
                parks make sense on a particular day.
              </TradeoffItem>

              <TradeoffItem
                icon={<Calendar className="h-5 w-5" />}
                title="The whole trip"
              >
                The schedule considers the days around each recommendation
                instead of treating every park day independently.
              </TradeoffItem>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Hotel Matcher                                               */}
        {/* ---------------------------------------------------------- */}

        <section
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
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Blog                                                        */}
        {/* ---------------------------------------------------------- */}

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
                  Read all articles
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
      </main>
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

function TradeoffItem({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-l-4 border-[var(--rose)] pl-4">
      <div className="flex items-center gap-2 font-bold">
        <span className="text-[var(--dblue)]">{icon}</span>
        {title}
      </div>

      <p className="mt-1 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
