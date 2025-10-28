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
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-gray-800">
              ${searchData.totalBudget.toLocaleString()}
            </span>
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
            onChange={(e) => updateSearchData('totalBudget', parseInt(e.target.value))}
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
  );
}