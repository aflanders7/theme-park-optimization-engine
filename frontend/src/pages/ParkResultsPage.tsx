// frontend/src/pages/ParkResultsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useParkStore } from '../hooks/useParkStore';
import { Calendar, Users, Sparkles, TrendingUp, TrendingDown, AlertCircle, MapPin, Clock, Lightbulb, ArrowLeft, Coffee, Star, HelpCircle } from 'lucide-react';

export default function ParkResultsPage() {
  const navigate = useNavigate();
  const { parkResults, parkSearchData } = useParkStore();

  if (!parkResults) {
    navigate('/parks');
    return null;
  }

  const { daily_plans, rest_days, summary, optimization_notes } = parkResults;

  // Merge park days and rest days into a single sorted schedule.
  // rest_days now carries a `note` explaining why that day was chosen as a
  // rest day, so the UI can show that reasoning instead of generic filler.
  const allDays = [
    ...daily_plans.map(plan => ({
      date: plan.date,
      isRestDay: false,
      ...plan
    })),
    ...rest_days.map(restDay => ({
      date: restDay.date,
      isRestDay: true,
      note: restDay.note,
      park: '',
      park_display_name: '',
      crowd_level: 0,
      crowd_data_available: true,
      is_must_visit: false,
      reasons: [],
      tips: []
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCrowdColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800 border-green-300';
    if (level < 7) return 'bg-yellow-50 text-yellow-900 border-yellow-400';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getCrowdLabel = (level: number) => {
    if (level <= 3) return 'Low Crowds';
    if (level < 7) return 'Moderate Crowds';
    return 'High Crowds';
  };

  const getParkEmoji = (park: string) => {
    const emojis: Record<string, string> = {
      magic_kingdom: '🏰',
      epcot: '🌍',
      hollywood_studios: '🎬',
      animal_kingdom: '🦁'
    };
    return emojis[park] || '🎢';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Parse manually as local date (no timezone conversion)
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-r from-[var(--snow)] via-[var(--pale)] to-[var(--snow)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/parks')}
            className="inline-flex items-center text-[var(--charcoal)] hover:text-[var(--rose)] gap-2 lg px-3 py-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-[var(--rose)]" />
            <h1 className="text-4xl font-bold text-gray-800">Your Personalized Park Plan</h1>
          </div>
          <p className="text-gray-600 text-lg">
            We've optimized your {summary.total_days}-day trip based on crowd levels and your preferences
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <Calendar className="w-8 h-8 text-[var(--blue)] mb-2" />
            <p className="text-3xl font-bold text-gray-800">{summary.park_days}</p>
            <p className="text-gray-600">Park Days</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <Coffee className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-3xl font-bold text-gray-800">{summary.rest_days}</p>
            <p className="text-gray-600">Rest Days</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <MapPin className="w-8 h-8 text-[var(--rose)] mb-2" />
            <p className="text-3xl font-bold text-gray-800">{Object.keys(summary.parks_visited).length}</p>
            <p className="text-gray-600">Different Parks</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-gray-800">{summary.average_crowd_level.toFixed(1)}/10</p>
            <p className="text-gray-600">Avg Crowds</p>
          </div>
        </div>

        {/* Optimization Notes */}
        {optimization_notes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-[var(--charcoal)]">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-black mb-3">Insights about your trip</h3>
                <ul className="space-y-2">
                  {optimization_notes.map((note, idx) => (
                    <li key={idx} className="text-black flex items-start gap-2">
                      <span className="text-[var(--charcoal)] font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Daily Plans - Now includes rest days */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[var(--blue)]" />
            Your Day-by-Day Schedule
          </h2>

          {allDays.map((day, idx) => {
            const isRestDay = day.isRestDay;

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden`}
              >
                {/* Day Header */}
                <div className={`p-6 ${isRestDay
                    ? 'bg-gradient-to-r from-[var(--charcoal)] to-[var(--charcoal)]'
                    : 'bg-gradient-to-br from-[var(--sunset)] to-[var(--rose)]'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isRestDay ? 'text-[var(--snow)]' : 'text-white'}`}>
                        Day {idx + 1}
                      </p>
                      <h3 className={`text-2xl font-bold text-white`}>
                        {formatDate(day.date)}
                      </h3>
                    </div>
                    {isRestDay ? (
                      <div className="text-right">
                        <Coffee className="w-10 h-10 text-white mb-1 ml-auto" />
                        <p className="text-lg font-bold text-white">Rest Day</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-4xl mb-1">{getParkEmoji(day.park)}</p>
                        <p className="text-white font-bold text-lg">{day.park_display_name}</p>
                        {day.is_must_visit && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/90 text-[var(--rose)] text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" /> Must-Visit
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isRestDay && (
                  <div className="p-6 space-y-6">
                    {/* Crowd Level */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getCrowdColor(day.crowd_level)}`}>
                        {day.crowd_level < 7 ? (
                          <TrendingDown className="w-5 h-5" />
                        ) : (
                          <TrendingUp className="w-5 h-5" />
                        )}
                        {getCrowdLabel(day.crowd_level)} ({day.crowd_level}/10)
                      </div>
                      {!day.crowd_data_available && (
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
                          <HelpCircle className="w-4 h-4" />
                          Estimated - no forecast yet for this date
                        </div>
                      )}
                    </div>

                    {/* Reasons */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--blue)]" />
                        Why This Park Today?
                      </h4>
                      <ul className="space-y-2">
                        {day.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700">
                            <span className="text-[var(--charcoal)] font-bold mt-1">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    {day.tips.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          Tips for Today
                        </h4>
                        <ul className="space-y-2">
                          {day.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <span className="text-[var(--charcoal)] font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {isRestDay && (
                  <div className="p-6">
                    <div className="rounded-xl p-4 border-2 border-[var(--blue)]">
                      <p className="text-black font-medium">
                        {day.note || 'Take it easy today! Relax at your hotel, explore Disney Springs, or go to the pool.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Parks Visited Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[var(--blue)] " />
            Parks You'll Visit
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary.parks_visited).map(([park, count]) => (
              <div key={park} className="bg-gradient-to-br from-[var(--pale)] to-[var(--lpink)] rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">{getParkEmoji(park)}</div>
                <p className="font-bold text-gray-800">{park}</p>
                <p className="text-[var(--rose)]  font-bold">{count} {count === 1 ? 'day' : 'days'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/parks')}
            className="px-8 py-4 bg-white border-2 border-[var(--rose)]  text-[var(--rose)]  rounded-xl font-bold hover:bg-[var(--lpink)] transition-all"
          >
            Modify Search
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-white border-2 border-yellow-600  text-yellow-600  rounded-xl font-bold hover:bg-[var(--lpink)] transition-all"
          >
            Save This Plan
          </button>
        </div>
      </div>
    </div>
  );
}