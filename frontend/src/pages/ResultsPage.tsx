// frontend/src/pages/ResultsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../hooks/useSearchStore';
import HotelList from '../components/HotelList';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { results } = useSearchStore();

  if (!results) {
    navigate('/');
    return null;
  }

  return (
    <div className="py-8 px-4 bg-gradient-to-r from-[var(--snow)] via-[var(--pale)] to-[var(--snow)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center text-[var(--charcoal)] hover:text-[var(--rose)] gap-2 lg px-3 py-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-[var(--rose)]" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Recommended Hotels</h1>
          </div>
          <p className="text-gray-600 text-lg">Found {results.total_results} hotels matching your preferences</p>
          <p className="text-[var(--charcoal)]">*Results do not reflect real-time pricing or availability.</p>
        </div>

        <div className="py-8">
          <HotelList hotels={results.recommendations} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/search')}
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