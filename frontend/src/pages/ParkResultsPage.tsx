// frontend/src/pages/ParkResultsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useParkStore } from '../hooks/useParkStore';
import { Calendar, Users, Sparkles, TrendingUp, TrendingDown, AlertCircle, MapPin, Clock, Lightbulb, ArrowLeft, Coffee } from 'lucide-react';

export default function ParkResultsPage() {
  const navigate = useNavigate();
  const { parkResults, parkSearchData } = useParkStore();

  if (!parkResults) {
    navigate('/parks');
    return null;
  }

  const { daily_plans, rest_days, summary, optimization_notes } = parkResults;

  const getCrowdColor = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800 border-green-300';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getCrowdLabel = (level: number) => {
    if (level <= 3) return 'Low Crowds';
    if (level <= 6) return 'Moderate Crowds';
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/parks')}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Your Perfect Park Plan</h1>
          </div>
          <p className="text-gray-600 text-lg">
            We've optimized your {summary.total_days}-day trip based on crowd levels and your preferences
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-gray-800">{summary.park_days}</p>
            <p className="text-gray-600">Park Days</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <Coffee className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-3xl font-bold text-gray-800">{summary.rest_days}</p>
            <p className="text-gray-600">Rest Days</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <MapPin className="w-8 h-8 text-pink-600 mb-2" />
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
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">Pro Tips for Your Trip</h3>
                <ul className="space-y-2">
                  {optimization_notes.map((note, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Daily Plans */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-purple-600" />
            Your Day-by-Day Schedule
          </h2>

          {daily_plans.map((plan, idx) => {
            const isRestDay = rest_days.includes(plan.date);
            
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  isRestDay ? 'border-4 border-orange-300' : ''
                }`}
              >
                {/* Day Header */}
                <div className={`p-6 ${
                  isRestDay 
                    ? 'bg-gradient-to-r from-orange-100 to-yellow-100' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isRestDay ? 'text-orange-700' : 'text-white/80'}`}>
                        Day {idx + 1}
                      </p>
                      <h3 className={`text-2xl font-bold ${isRestDay ? 'text-orange-900' : 'text-white'}`}>
                        {formatDate(plan.date)}
                      </h3>
                    </div>
                    {isRestDay ? (
                      <div className="text-right">
                        <Coffee className="w-10 h-10 text-orange-600 mb-1 ml-auto" />
                        <p className="text-lg font-bold text-orange-900">Rest Day</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-4xl mb-1">{getParkEmoji(plan.park)}</p>
                        <p className="text-white font-bold text-lg">{plan.park_display_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {!isRestDay && (
                  <div className="p-6 space-y-6">
                    {/* Crowd Level */}
                    <div className="flex items-center gap-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getCrowdColor(plan.crowd_level)}`}>
                        {plan.crowd_level <= 6 ? (
                          <TrendingDown className="w-5 h-5" />
                        ) : (
                          <TrendingUp className="w-5 h-5" />
                        )}
                        {getCrowdLabel(plan.crowd_level)} ({plan.crowd_level}/10)
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Arrive by {plan.recommended_arrival_time}</span>
                      </div>
                    </div>

                    {/* Wait Times */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="font-medium text-blue-900 mb-1">Expected Wait Times</p>
                      <p className="text-blue-800">{plan.estimated_wait_times}</p>
                    </div>

                    {/* Reasons */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Why This Park Today?
                      </h4>
                      <ul className="space-y-2">
                        {plan.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700">
                            <span className="text-purple-600 font-bold mt-1">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    {plan.tips.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          Tips for Today
                        </h4>
                        <ul className="space-y-2">
                          {plan.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700">
                              <span className="text-yellow-600 font-bold mt-1">💡</span>
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
                    <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                      <p className="text-orange-900 font-medium">
                        Take it easy today! Relax at your hotel, explore Disney Springs, or just recharge for tomorrow's adventure.
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
            <MapPin className="w-6 h-6 text-purple-600" />
            Parks You'll Visit
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary.parks_visited).map(([park, count]) => (
              <div key={park} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">{getParkEmoji(park)}</div>
                <p className="font-bold text-gray-800">
                  {park.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
                <p className="text-purple-600 font-bold"> {count} {count === 1 ? 'day' : 'days'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/parks')}
            className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all"
          >
            Modify Search
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Save This Plan
          </button>
        </div>
      </div>
    </div>
  );
}