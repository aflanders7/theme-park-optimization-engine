// frontend/src/components/parks/ParkDateSection.tsx
import { Calendar } from 'lucide-react';
import Section from './shared/Section';

interface Props {
  searchData: any;
  updateSearchData: (field: string, value: any) => void;
}

export default function ParkDateSection({ searchData, updateSearchData }: Props) {
  return (
    <Section icon={<Calendar className="w-6 h-6" />} title="Trip Dates">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Day</label>
          <input
            type="date"
            value={searchData.startDate}
            onChange={(e) => updateSearchData('startDate', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Day</label>
          <input
            type="date"
            value={searchData.endDate}
            onChange={(e) => updateSearchData('endDate', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3 italic">
        We'll optimize which days to visit each park based on crowd levels
      </p>
    </Section>
  );
}