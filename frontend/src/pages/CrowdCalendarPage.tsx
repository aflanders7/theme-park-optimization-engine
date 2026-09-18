import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { useCrowdCalendar } from '../hooks/useCrowdCalendar';
import type { CrowdCalendarDay, ParkCrowdLevels } from '../lib/api';
import { CROWD_BAND_STYLES, getCrowdBand, PARKS } from '../lib/crowdLevels';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// How many years forward the year dropdown offers, starting at the current year.
const YEAR_OPTIONS_COUNT = 3;

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

function ParkScore({
  shortLabel,
  score,
}: {
  shortLabel: string;
  score: number | null;
}) {
  const band = getCrowdBand(score);
  const styles = CROWD_BAND_STYLES[band];

  return (
    <div
      className={[
        "flex min-h-[48px] items-center justify-between rounded-lg px-8 py-2.5",
        "shadow-sm transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.bg
      ].join(" ")}
    >
      <span className="text-s font-bold uppercase tracking-wide text-gray-700">
        {shortLabel}
      </span>

      <span
        className={`text-2xl font-extrabold leading-none ${styles.text}`}
      >
        {score ?? "–"}
      </span>
    </div>
  );
}

function CalendarLegend() {
  const bands = ['low', 'moderate', 'high', 'veryHigh'] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-gray-200 py-4">
      {bands.map((band) => {
        const styles = CROWD_BAND_STYLES[band];
        return (
          <div key={band} className="flex items-center gap-2">
            <span className={`h-3.5 w-3.5 rounded-full ${styles.dot}`} />
            <span className="text-sm font-medium text-gray-700">
              {styles.label} <span className="font-normal text-gray-400">({styles.range})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DesktopGrid({
  days,
  year,
  month,
}: {
  days: CrowdCalendarDay[];
  year: number;
  month: number;
}) {
  const leadingBlanks = mondayIndex(year, month);

  const cells: (CrowdCalendarDay | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...days,
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="hidden md:block">
      {/* Weekday header */}
      <div className="grid grid-cols-7 overflow-hidden rounded-t-xl border border-gray-200 bg-gray-50">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="border-r border-gray-200 px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-500 last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 overflow-hidden rounded-b-xl border-x border-b border-gray-200">
        {cells.map((day, i) => {
          const column = i % 7;

          if (!day) {
            return (
              <div
                key={`blank-${i}`}
                className={[
                  "min-h-[245px] bg-gray-50/40 border-b border-gray-200",
                  column !== 6 ? "border-r border-gray-200" : "",
                ].join(" ")}
              />
            );
          }

          const dayNum = Number(day.date.slice(-2));

          return (
            <div
              key={day.date}
              className={[
                "flex min-h-[245px] flex-col bg-white p-3",
                "border-b border-gray-200",
                column !== 6 ? "border-r border-gray-200" : "",
              ].join(" ")}
            >
              {/* Date */}
              <div className="mb-3 flex items-center">
                <span className="text-lg font-bold text-gray-800">
                  {dayNum}
                </span>
              </div>

              {/* Park scores */}
              <div className="grid flex-1 grid-cols-1 gap-2">
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
        <div key={day.date} className="flex flex-col gap-3 py-5">
          <span className="text-sm font-semibold text-gray-700">
            {formatDayLabel(day.date)}
          </span>
          <div className="grid grid-cols-4 gap-2">
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
    <p className="mt-4 text-xs text-gray-400">
      MK Magic Kingdom&emsp;EP EPCOT&emsp;HS Hollywood Studios&emsp;AK Animal Kingdom
    </p>
  );
}

function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-400 focus:border-[var(--rose)] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
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

  const monthOptions = useMemo(() => {
    const startMonth = year === currentYear ? currentMonth : 1;
    return MONTH_NAMES.map((name, idx) => idx + 1)
      .filter((m) => m >= startMonth)
      .map((m) => ({ value: m, label: MONTH_NAMES[m - 1] }));
  }, [year, currentYear, currentMonth]);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: YEAR_OPTIONS_COUNT }, (_, i) => currentYear + i).map((y) => ({
        value: y,
        label: String(y),
      })),
    [currentYear]
  );

  const handleMonthSelect = (newMonth: number) => {
    setViewed({ year, month: newMonth });
  };

  const handleYearSelect = (newYear: number) => {
    const newMonth = newYear === currentYear && month < currentMonth ? currentMonth : month;
    setViewed({ year: newYear, month: newMonth });
  };

  return (
    <div className="bg-[var(--snow)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-gray-800">Crowd Calendar</h1>
          </div>
          <p className="text-gray-600">
            See predicted crowd levels for all four parks and plan the days that work best for you.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          {/* Month selector */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:justify-between">
            <button
              onClick={() => goToMonth(-1)}
              disabled={isAtEarliestMonth}
              aria-label="Previous month"
              className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <SelectField
                value={month}
                onChange={handleMonthSelect}
                options={monthOptions}
                ariaLabel="Select month"
              />
              <SelectField
                value={year}
                onChange={handleYearSelect}
                options={yearOptions}
                ariaLabel="Select year"
              />
            </div>

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
          <div className="mt-6">
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
        <p className="mx-auto mt-5 max-w-4xl text-center text-sm leading-relaxed text-gray-500">
          Predictions are estimates based on historical crowd patterns, holidays, and
          special events. A higher score means the park is expected to feel busier that day.
        </p>
      </div>
    </div>
  );
}