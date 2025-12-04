// frontend/src/pages/ParkSearchPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search } from 'lucide-react';
import { useParkStore } from '../hooks/useParkStore';
import { useParkSearch } from '../hooks/useParkSearch';
import ParkDateSection from '../components/ParkDateSection';
import ParkPartySection from '../components/ParkPartySection';
import ParkPreferencesSection from '../components/ParkPreferencesSection';
import ParkConstraints from '../components/ParkConstraints';

export default function ParkSearchPage() {
  const navigate = useNavigate();
  const { parkSearchData, updateParkSearchData } = useParkStore();
  const { search } = useParkSearch();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate difference in days
  const start = parkSearchData.startDate ? new Date(parkSearchData.startDate) : null;
  const end = parkSearchData.endDate ? new Date(parkSearchData.endDate) : null;

  let dayRange = 0;
  if (start && end) {
    dayRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  const isRangeTooLong = dayRange > 12;

  const handleSearch = async () => {
    if (isRangeTooLong) return;

    navigate('/park-loading');
    const result = await search(parkSearchData);

    if (result) {
      navigate('/park-results');
    } else {
      navigate("/parks")
    }
  };

  const totalPeople = parkSearchData.adults + parkSearchData.children + parkSearchData.infants;

  return (
    <div className="py-8 px-4 bg-gradient-to-r from-[var(--snow)] via-[var(--pale)] to-[var(--snow)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-8 h-8 text-[var(--rose)]" />
            <h1 className="text-4xl font-bold text-gray-800">Plan Your Park Days</h1>
          </div>
          <p className="text-gray-600">
            We'll optimize your schedule based on crowd levels and your preferences
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          <ParkDateSection
            searchData={parkSearchData}
            updateSearchData={updateParkSearchData}
          />

          <ParkPartySection
            searchData={parkSearchData}
            updateSearchData={updateParkSearchData}
            totalPeople={totalPeople}
          />

          <ParkPreferencesSection
            searchData={parkSearchData}
            updateSearchData={updateParkSearchData}
          />

          <ParkConstraints
            searchData={parkSearchData}
            updateSearchData={updateParkSearchData}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
          />

          {/* Error Message */}
          {isRangeTooLong && (
            <p className="text-red-600 font-medium text-center -mt-4">
              Date range cannot exceed 12 days.
            </p>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!parkSearchData.startDate || !parkSearchData.endDate || isRangeTooLong}
            className={`w-full text-xl font-bold py-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 ${!parkSearchData.startDate || !parkSearchData.endDate || isRangeTooLong
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[var(--sunset)] text-[var(--charcoal)] hover:shadow-lg transform hover:scale-105'
              }`}
          >
            <Search className="w-6 h-6" />
            Generate Park Plan
          </button>
        </div>
      </div>
    </div>
  );
}