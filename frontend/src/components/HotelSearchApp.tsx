import React, { useState } from 'react';
import { Search, Calendar, Users, DollarSign, Sparkles, MapPin, Bus, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useHotelSearch } from '../hooks/useHotelSearch';

// Main App Component
export default function HotelSearchApp() {
  const [view, setView] = useState('search'); // 'search' or 'results'
  const [searchData, setSearchData] = useState({
    dateType: 'exact',
    checkIn: '',
    checkOut: '',
    flexibleMonth: 3,
    flexibleYear: 2025,
    numNights: 5,
    adults: 2,
    children: 0,
    infants: 0,
    totalBudget: 5000,
    transportationPrefs: [],
    locationPref: '',
    roomFeatures: [],
    preferBudget: true,
    poolImportance: 3,
  });
  const { search, loading, error } = useHotelSearch();

  const handleSearch = async () => {
    await search(searchData);
    if (!error) {
      setView('results');
    }
  };

  // Show error if exists
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (view === 'results' && results) {
    return <ResultsView results={results} onBack={() => setView('search')} />;
  }

  return <SearchView searchData={searchData} setSearchData={setSearchData} onSearch={handleSearch} />;
}

// Search View Component
function SearchView({ searchData, setSearchData, onSearch }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateData = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const totalPeople = searchData.adults + searchData.children + searchData.infants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Find Your Perfect Disney Hotel</h1>
          </div>
          <p className="text-gray-600">Answer a few questions and we'll recommend the best hotels for you</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          
          {/* Date Selection */}
          <Section icon={<Calendar className="w-6 h-6" />} title="When are you going?">
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={searchData.dateType === 'exact'}
                    onChange={() => updateData('dateType', 'exact')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Specific dates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={searchData.dateType === 'flexible_days'}
                    onChange={() => updateData('dateType', 'flexible_days')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Flexible (find best prices)</span>
                </label>
              </div>

              {searchData.dateType === 'exact' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-in</label>
                    <input
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => updateData('checkIn', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-out</label>
                    <input
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => updateData('checkOut', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Month</label>
                    <select
                      value={searchData.flexibleMonth}
                      onChange={(e) => updateData('flexibleMonth', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nights</label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={searchData.numNights}
                      onChange={(e) => updateData('numNights', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Party Size */}
          <Section icon={<Users className="w-6 h-6" />} title="Who's coming?">
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="Adults (18+)"
                value={searchData.adults}
                onChange={(val) => updateData('adults', val)}
                min={1}
              />
              <NumberInput
                label="Children (3-17)"
                value={searchData.children}
                onChange={(val) => updateData('children', val)}
                min={0}
              />
              <NumberInput
                label="Infants (under 3)"
                value={searchData.infants}
                onChange={(val) => updateData('infants', val)}
                min={0}
              />
            </div>
            <div className="mt-4 bg-blue-50 rounded-xl p-4 text-center">
              <p className="font-semibold text-gray-800">Total: {totalPeople} {totalPeople === 1 ? 'person' : 'people'}</p>
            </div>
          </Section>

          {/* Budget */}
          <Section icon={<DollarSign className="w-6 h-6" />} title="What's your budget?">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-800">${searchData.totalBudget.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">
                    ${Math.round(searchData.totalBudget / totalPeople).toLocaleString()} per person
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="100"
                  value={searchData.totalBudget}
                  onChange={(e) => updateData('totalBudget', parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$2,000</span>
                  <span>$15,000</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">Total budget for hotel only</p>
            </div>
          </Section>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              Advanced Preferences
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6 pt-6 border-t border-gray-200">
                {/* Transportation Preferences */}
                <div>
                  <label className="block font-medium mb-3">Preferred Transportation</label>
                  <div className="flex flex-wrap gap-2">
                    {['Skyliner', 'Monorail', 'Boat', 'Bus', 'Walking'].map(transport => (
                      <button
                        key={transport}
                        onClick={() => {
                          const prefs = searchData.transportationPrefs.includes(transport)
                            ? searchData.transportationPrefs.filter(t => t !== transport)
                            : [...searchData.transportationPrefs, transport];
                          updateData('transportationPrefs', prefs);
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          searchData.transportationPrefs.includes(transport)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {transport}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Features */}
                <div>
                  <label className="block font-medium mb-3">Room Features</label>
                  <div className="flex flex-wrap gap-2">
                    {['Balcony', 'Full Kitchen', 'Theme Park View', 'Villa', 'Club Level'].map(feature => (
                      <button
                        key={feature}
                        onClick={() => {
                          const feats = searchData.roomFeatures.includes(feature)
                            ? searchData.roomFeatures.filter(f => f !== feature)
                            : [...searchData.roomFeatures, feature];
                          updateData('roomFeatures', feats);
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          searchData.roomFeatures.includes(feature)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget vs Luxury */}
                <div>
                  <label className="block font-medium mb-3">Hotel Tier Preference</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={searchData.preferBudget === true}
                        onChange={() => updateData('preferBudget', true)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl text-center ${
                        searchData.preferBudget ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <p className="font-bold">Budget-Friendly</p>
                        <p className="text-sm text-gray-600">Value & Moderate</p>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={searchData.preferBudget === false}
                        onChange={() => updateData('preferBudget', false)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl text-center ${
                        !searchData.preferBudget ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                      }`}>
                        <p className="font-bold">Luxury</p>
                        <p className="text-sm text-gray-600">Deluxe & Villas</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold py-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Search className="w-6 h-6" />
            Find My Perfect Hotel
          </button>
        </div>
      </div>
    </div>
  );
}

// Results View Component
function ResultsView({ results, onBack }) {
  const [expandedCard, setExpandedCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to Search
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Perfect Hotels</h1>
          <p className="text-gray-600">Found {results.total_results} hotels matching your preferences</p>
        </div>

        {/* Budget Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Budget Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Your Budget</p>
              <p className="text-2xl font-bold text-gray-800">${results.budget_summary.your_budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recommended</p>
              <p className="text-2xl font-bold text-blue-600">${results.budget_summary.recommended_budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cheapest Option</p>
              <p className="text-2xl font-bold text-green-600">${results.budget_summary.cheapest_option.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Most Expensive</p>
              <p className="text-2xl font-bold text-purple-600">${results.budget_summary.most_expensive.toLocaleString()}</p>
            </div>
          </div>
          {results.budget_summary.under_budget && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium">✓ You're under budget! You have room for extras.</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Top Recommendations</h2>
          
          {results.recommendations.map((hotel, index) => (
            <HotelCard
              key={hotel.hotel_id}
              hotel={hotel}
              rank={index + 1}
              isExpanded={expandedCard === hotel.hotel_id}
              onToggle={() => setExpandedCard(expandedCard === hotel.hotel_id ? null : hotel.hotel_id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hotel Card Component
function HotelCard({ hotel, rank, isExpanded, onToggle }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {rank}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{hotel.hotel_name}</h3>
                <p className="text-gray-600">{hotel.room_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {hotel.hotel_category}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Sleeps {hotel.occupancy}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">${hotel.avg_price_per_night}</div>
            <div className="text-sm text-gray-600">per night</div>
            <div className="text-lg font-semibold text-blue-600 mt-1">${hotel.total_price} total</div>
          </div>
        </div>

        {/* Match Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Match Score</span>
            <span className="text-lg font-bold text-purple-600">{hotel.match_score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${hotel.match_score}%` }}
            />
          </div>
        </div>

        {/* Why Recommended */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h4>
          <div className="space-y-1">
            {hotel.why_recommended.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transportation & Features */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Transportation</p>
            <div className="flex flex-wrap gap-2">
              {hotel.transportation.map(t => (
                <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Bus className="w-3 h-3" />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Room Features</p>
            <div className="flex flex-wrap gap-2">
              {hotel.features.slice(0, 3).map((f, i) => (
                <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                  {f}
                </span>
              ))}
              {hotel.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                  +{hotel.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={onToggle}
          className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 border-t border-gray-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Show Details
            </>
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Room Description</h4>
              <p className="text-gray-700">{hotel.room_description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Beds</h4>
              <div className="space-y-1">
                {hotel.beds.map((bed, i) => (
                  <p key={i} className="text-gray-700">
                    {bed.count}x {bed.type}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Select This Hotel
              </button>
              <button className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                View Full Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility Components
function Section({ icon, title, children }) {
  return (
    <div className="border-b border-gray-200 pb-8 last:border-b-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-blue-600">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition-colors"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
          className="w-16 text-center px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-lg"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const messages = [
    'Analyzing your preferences...',
    'Finding the perfect hotels...',
    'Comparing prices across dates...',
    'Calculating match scores...',
    'Almost there...'
  ];
  
  const [messageIndex, setMessageIndex] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % messages.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <Sparkles className="w-24 h-24 text-yellow-300 mx-auto animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Finding Your Perfect Hotels</h2>
        <p className="text-2xl text-white/90 mb-8 animate-pulse">{messages[messageIndex]}</p>
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}