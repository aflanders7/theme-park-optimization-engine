// frontend/src/components/parks/ParkPreferencesSection.tsx
import { Zap } from 'lucide-react';
import Section from './shared/Section';

interface Props {
  searchData: any;
  updateSearchData: (field: string, value: any) => void;
}

export default function ParkPreferencesSection({ searchData, updateSearchData }: Props) {
  const togglePreference = (pref: string) => {
    const prefs = searchData.parkPreferences.includes(pref)
      ? searchData.parkPreferences.filter((p: string) => p !== pref)
      : [...searchData.parkPreferences, pref];
    updateSearchData('parkPreferences', prefs);
  };

  return (
    <Section icon={<Zap className="w-6 h-6 text-[var(--blue)]" />} title="Your Preferences">
      {/* Thrill Level */}
      <div className="mb-6">
        <label className="block font-medium mb-3">Thrill Level</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'low', label: 'Low', desc: 'Gentle rides', emoji: '🎠' },
            { value: 'moderate', label: 'Moderate', desc: 'Mix of both', emoji: '🎢' },
            { value: 'high', label: 'High', desc: 'Love thrills!', emoji: '🎰' }
          ].map(option => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                checked={searchData.thrillLevel === option.value}
                onChange={() => updateSearchData('thrillLevel', option.value)}
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-xl text-center transition-all ${
                searchData.thrillLevel === option.value
                  ? 'border-[var(--blue)] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-2xl mb-1">{option.emoji}</div>
                <p className="font-bold">{option.label}</p>
                <p className="text-sm text-gray-600">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Park Interests */}
      <div>
        <label className="block font-medium mb-3">
          What interests you? (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'thrills', label: '🎢 Thrill Rides', color: 'purple' },
            { value: 'food_drinks', label: '🍽️ Food & Drinks', color: 'orange' },
            { value: 'animals_nature', label: '🦁 Animals & Nature', color: 'green' },
            { value: 'themes', label: '🏰 Immersive Theming', color: 'blue' },
            { value: 'cultural', label: '🌍 Culture', color: 'indigo' }
          ].map(pref => (
            <button
              key={pref.value}
              onClick={() => togglePreference(pref.value)}
              className={`p-4 border-2 rounded-xl text-center transition-all ${
                searchData.parkPreferences.includes(pref.value)
                  ? 'border-[var(--pink)] bg-pink-50'
                  : 'border-gray-200 hover:!border-gray-300'
              }`}
            >
              {pref.label}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}