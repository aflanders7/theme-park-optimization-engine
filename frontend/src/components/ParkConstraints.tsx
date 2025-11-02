// frontend/src/components/parks/ParkConstraints.tsx
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import Section from './shared/Section';

interface Props {
  searchData: any;
  updateSearchData: (field: string, value: any) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

export default function ParkConstraints({ searchData, updateSearchData, showAdvanced, setShowAdvanced }: Props) {
  const togglePark = (parkArray: string, park: string) => {
    const parks = searchData[parkArray].includes(park)
      ? searchData[parkArray].filter((p: string) => p !== park)
      : [...searchData[parkArray], park];
    updateSearchData(parkArray, parks);
  };

  const parks = [
    { value: 'magic_kingdom', label: 'Magic Kingdom', emoji: '🏰' },
    { value: 'epcot', label: 'Epcot', emoji: '🌍' },
    { value: 'hollywood_studios', label: 'Hollywood Studios', emoji: '🎬' },
    { value: 'animal_kingdom', label: 'Animal Kingdom', emoji: '🦁' }
  ];

  return (
    <div>
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
      >
        {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        Park Preferences (Optional)
      </button>

      {showAdvanced && (
        <div className="mt-6 space-y-6 pt-6 border-t border-gray-200">
          <Section icon={<MapPin className="w-6 h-6" />} title="">
            {/* Must Visit Parks */}
            <div className="mb-6">
              <label className="block font-medium mb-3">
                Must Visit Parks
              </label>
              <div className="flex flex-wrap gap-2">
                {parks.map(park => (
                  <button
                    key={park.value}
                    onClick={() => {
                      if (searchData.avoidParks.includes(park.value)) togglePark('avoidParks', park.value);
                      togglePark('mustVisitParks', park.value)
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      searchData.mustVisitParks.includes(park.value)
                        ? 'bg-green-300 text-black shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {park.emoji} {park.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Parks you definitely want to visit
              </p>
            </div>

            {/* Avoid Parks */}
            <div className="mb-6">
              <label className="block font-medium mb-3">
                Skip These Parks
              </label>
              <div className="flex flex-wrap gap-2">
                {parks.map(park => (
                  <button
                    key={park.value}
                    onClick={() => {
                      if (searchData.mustVisitParks.includes(park.value)) togglePark('mustVisitParks', park.value)
                      togglePark('avoidParks', park.value)
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      searchData.avoidParks.includes(park.value)
                        ? 'bg-red-300 text-black shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {park.emoji} {park.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Parks you'd prefer not to visit
              </p>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}