// frontend/src/components/search/BudgetSection.tsx
import { DollarSign } from 'lucide-react';
import Section from './shared/Section';

interface Props {
  searchData: any;
  updateSearchData: (field: string, value: any) => void;
  totalPeople: number;
}

export default function BudgetSection({ searchData, updateSearchData, totalPeople }: Props) {
  return (
    <Section icon={<DollarSign className="w-6 h-6" />} title="What's your budget?">
      <div className="space-y-4">
                {/* Selected Budget Display */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total hotel budget</p>
              <p className="text-2xl font-bold text-gray-800">
                Under ${searchData.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Estimated per person</p>
              <p className="text-xl font-bold text-purple-600">
                ~${Math.round(searchData.totalBudget / totalPeople).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div>
          <input
            type="range"
            min="2000"
            max="15000"
            step="1000"
            value={searchData.totalBudget}
            onChange={(e) => updateSearchData('totalBudget', parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$2,000</span>
            <span>$15,000</span>
          </div>
          <br></br>
          <p className="text-sm text-gray-600 italic text-center">
          Resort recommendations are based on typical pricing ranges and do not reflect real-time pricing or availability.
        </p>
        </div>
      </div>
    </Section>
  );
}