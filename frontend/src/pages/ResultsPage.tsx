// frontend/src/pages/ResultsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../hooks/useSearchStore';
import HotelList from '../components/HotelList';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { results } = useSearchStore();

  if (!results) {
    navigate('/');
    return null;
  }

  return (
    <div className="py-8 px-4 bg-[var(--lpink)] ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/search')}
            className="bg-white text-[var(--rose)] hover:bg-[var(--sunset)] hover:text-black font-medium mb-4 border rounded-lg px-3 py-2 transition-colors"
          >
            ← Back to Search
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Perfect Hotels</h1>
          <p className="text-gray-600">Found {results.total_results} hotels matching your preferences</p>
        </div>

        <HotelList hotels={results.recommendations} />
      </div>
    </div>
  );
}