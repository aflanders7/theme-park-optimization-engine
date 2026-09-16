import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useCrowdCalendar } from '../hooks/useCrowdCalendar';
import type { CrowdCalendarDay, ParkCrowdLevels } from '../lib/api';
import { CROWD_BAND_STYLES, getCrowdBand, PARKS } from '../lib/crowdLevels';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function todayYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function addMonths(year: number, month: number, delta: number) {
  const zeroBased = month - 1 + delta;
  const newYear = year + Math.floor(zeroBased / 12);
  const newMonth = ((zeroBased % 12) + 12) % 12;
  return { year: newYear, month: newMonth + 1 };
}

// Monday-first weekday index for the 1st of the month (0 = Monday).
function mondayIndex(year: number, month: number) {
  const jsDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

function formatDayLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function ParkScore({ shortLabel, score }: { shortLabel: string; score: number | null }) {
  const band = getCrowdBand(score);
  const styles = CROWD_BAND_STYLES[band];
  return (
    <div className={`flex items-center justify-between rounded px-1.5 py-0.5 ${styles.bg}`}>
      <span className="text-[10px] font-medium text-gray-500">{shortLabel}</span>
      <span className={`text-[11px] font-semibold ${styles.text}`}>{score ?? '–'}</span>
    </div>
  );
}

function CalendarLegend() {
  const bands = ['low', 'moderate', 'high', 'veryHigh'] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-gray-200 py-3">
      {bands.map((band) => {
        const styles = CROWD_BAND_STYLES[band];
        return (
          <div key={band} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
            <span className="text-sm text-gray-700">
              {styles.label} <span className="text-gray-400">({styles.range})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DesktopGrid({ days, year, month }: { days: CrowdCalendarDay[]; year: number; month: number }) {
  const leadingBlanks = mondayIndex(year, month);
  const cells: (CrowdCalendarDay | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-7 border-b border-gray-200 pb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`blank-${i}`} className="min-h-[104px] border-b border-r border-gray-100" />;
          }
          const dayNum = Number(day.date.slice(-2));
          return (
            <div
              key={day.date}
              className="flex min-h-[104px] flex-col gap-1 border-b border-r border-gray-100 p-2 last:border-r-0"
            >
              <span className="text-sm font-medium text-gray-700">{dayNum}</span>
              <div className="grid grid-cols-2 gap-1">
                {PARKS.map((p) => (
                  <ParkScore
                    key={p.key}
                    shortLabel={p.short}
                    score={day.parks[p.key as keyof ParkCrowdLevels]}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileAgenda({ days }: { days: CrowdCalendarDay[] }) {
  return (
    <div className="divide-y divide-gray-100 md:hidden">
      {days.map((day) => (
        <div key={day.date} className="flex items-center justify-between gap-3 py-3">
          <span className="w-24 shrink-0 text-sm font-medium text-gray-700">
            {formatDayLabel(day.date)}
          </span>
          <div className="grid flex-1 grid-cols-4 gap-1.5">
            {PARKS.map((p) => (
              <ParkScore
                key={p.key}
                shortLabel={p.short}
                score={day.parks[p.key as keyof ParkCrowdLevels]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ParkKey() {
  return (
    <p className="mt-3 text-xs text-gray-400">
      MK Magic Kingdom&emsp;EP EPCOT&emsp;HS Hollywood Studios&emsp;AK Animal Kingdom
    </p>
  );
}

export default function CrowdCalendarPage() {
  const { year: currentYear, month: currentMonth } = useMemo(todayYearMonth, []);
  const [{ year, month }, setViewed] = useState({ year: currentYear, month: currentMonth });

  const isAtEarliestMonth = year === currentYear && month === currentMonth;
  const { data, status, error, refetch } = useCrowdCalendar(year, month);

  const goToMonth = (delta: number) => {
    setViewed((prev) => addMonths(prev.year, prev.month, delta));
  };

  return (
    <div className="bg-[var(--snow)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-semibold text-gray-800">Crowd Calendar</h1>
          <p className="mt-1 text-gray-600">
            See predicted crowd levels for all four parks and plan the days that work best for you.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          {/* Month selector */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => goToMonth(-1)}
              disabled={isAtEarliestMonth}
              aria-label="Previous month"
              className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-gray-800">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              onClick={() => goToMonth(1)}
              aria-label="Next month"
              className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Legend */}
          <CalendarLegend />

          {/* Calendar body */}
          <div className="mt-4">
            {status === 'loading' && (
              <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-400">
                Loading crowd predictions…
              </div>
            )}

            {status === 'error' && (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-gray-600">{error}</p>
                <button
                  onClick={refetch}
                  className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </button>
              </div>
            )}

            {status === 'success' && data && (
              <>
                {!data.has_data && (
                  <div className="mb-4 rounded border border-[var(--pale)] bg-[var(--pale)]/40 px-3 py-2 text-sm text-gray-600">
                    Predictions for {MONTH_NAMES[month - 1]} {year} haven't been published yet. Check back closer to the date.
                  </div>
                )}
                <DesktopGrid days={data.days} year={year} month={month} />
                <MobileAgenda days={data.days} />
                <ParkKey />
              </>
            )}
          </div>
        </div>

        {/* Explanation */}
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-gray-500">
          Predictions are estimates based on historical Disney crowd patterns, park hours, holidays, and
          special events. A higher score means the park is expected to feel busier that day — it's a
          relative crowd intensity score, not a percentage of capacity.
        </p>
      </div>
    </div>
  );
}