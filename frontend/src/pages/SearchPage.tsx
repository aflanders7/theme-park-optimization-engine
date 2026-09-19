// frontend/src/pages/SearchPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { useSearchStore } from '../hooks/useSearchStore';
import { useHotelSearch } from '../hooks/useHotelSearch';
import DateSection from '../components/DateSection';
import BudgetSection from '../components/BudgetSection';
import AdvancedOptions from '../components/AdvancedOptions';
import ParkPartySection from '../components/ParkPartySection';

export default function SearchPage() {
  const navigate = useNavigate();
  const { searchData, updateSearchData } = useSearchStore();
  const { search } = useHotelSearch();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = async () => {
    navigate('/loading');
    const result = await search(searchData);

    if (result) {
      navigate("/hotels/results");
    } else{
      navigate("/hotels");
    }
  };

  const totalPeople = searchData.adults + searchData.children + searchData.infants;

  return (
    <div className="py-8 px-4 bg-white bg-gradient-to-r from-[var(--snow)] via-[var(--pale)] to-[var(--snow)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-[var(--rose)]" />
            <h1 className="text-4xl font-bold text-gray-800">Find The Best Hotel For You</h1>
          </div>
          <p className="text-gray-600">Answer a few questions and we'll recommend the best hotel rooms for you</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          <DateSection searchData={searchData} updateSearchData={updateSearchData} />
          
          <ParkPartySection
            searchData={searchData} 
            updateSearchData={updateSearchData}
            totalPeople={totalPeople}
          />
          
          <BudgetSection 
            searchData={searchData} 
            updateSearchData={updateSearchData}
            totalPeople={totalPeople}
          />

          <AdvancedOptions
            searchData={searchData}
            updateSearchData={updateSearchData}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-[var(--sunset)] text-[var(--charcoal)] text-xl font-bold py-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Search className="w-6 h-6" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}