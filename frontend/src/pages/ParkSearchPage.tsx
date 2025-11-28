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

  const handleSearch = async () => {
    navigate('/park-loading');
    const result = await search(parkSearchData);

    if (result) {
      navigate('/park-results');
    } else{
      navigate("/parks")
    }
  };

  const totalPeople = parkSearchData.adults + parkSearchData.children + parkSearchData.infants;

  return (
    <div className="py-8 px-4 bg-gradient-to-r from-[var(--snow)] via-[var(--lpink)] to-[var(--snow)]">
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

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!parkSearchData.startDate || !parkSearchData.endDate}
            className={`w-full text-xl font-bold py-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 ${
              !parkSearchData.startDate || !parkSearchData.endDate
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[var(--blue)] text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            <Search className="w-6 h-6" />
            Generate My Park Plan
          </button>
        </div>
      </div>
    </div>
  );
}