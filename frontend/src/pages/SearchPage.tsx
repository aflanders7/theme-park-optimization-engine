// frontend/src/pages/SearchPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { useSearchStore } from '../hooks/useSearchStore';
import { useHotelSearch } from '../hooks/useHotelSearch';
import DateSection from '../components/DateSection';
import PartySection from '../components/PartySection';
import BudgetSection from '../components/BudgetSection';
import AdvancedOptions from '../components/AdvancedOptions';

export default function SearchPage() {
  const navigate = useNavigate();
  const { searchData, updateSearchData } = useSearchStore();
  const { search } = useHotelSearch();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = async () => {
    navigate('/loading');
    await search(searchData);
    navigate('/results');
  };

  const totalPeople = searchData.adults + searchData.children + searchData.infants;

  return (
    <div className="py-8 px-4">
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
          <DateSection searchData={searchData} updateSearchData={updateSearchData} />
          
          <PartySection 
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