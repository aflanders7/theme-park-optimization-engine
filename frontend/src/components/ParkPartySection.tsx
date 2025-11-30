// frontend/src/components/parks/ParkPartySection.tsx
import { Users } from 'lucide-react';
import Section from './shared/Section';
import NumberInput from './shared/NumberInput';

interface Props {
  searchData: any;
  updateSearchData: (field: string, value: any) => void;
  totalPeople: number;
}

export default function ParkPartySection({ searchData, updateSearchData, totalPeople }: Props) {
  const updateChildAges = (count: number) => {
    const newAges = Array(count).fill(0).map((_, i) => searchData.childAges[i] || 10);
    updateSearchData('children', count);
    updateSearchData('childAges', newAges);
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...searchData.childAges];
    newAges[index] = age;
    updateSearchData('childAges', newAges);
  };

  return (
    <Section icon={<Users className="w-6 h-6 text-[var(--blue)]" />} title="Who's coming?">
      <div className="grid grid-cols-3 gap-4">
        <NumberInput
          label="Adults (18+)"
          value={searchData.adults}
          onChange={(val) => updateSearchData('adults', val)}
          min={1}
        />
        <NumberInput
          label="Children (3-17)"
          value={searchData.children}
          onChange={updateChildAges}
          min={0}
        />
        <NumberInput
          label="Infants (under 3)"
          value={searchData.infants}
          onChange={(val) => updateSearchData('infants', val)}
          min={0}
        />
      </div>

      {/* Child Ages */}
      {searchData.children > 0 && (
        <div className="mt-4 rounded-xl p-4 border-2 border-[var(--blue)] bg-blue-50">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Children's ages:
          </p>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: searchData.children }).map((_, i) => (
              <div key={i}>
                <label className="block text-xs text-gray-600 mb-1">Child {i + 1}</label>
                <input
                  type="number"
                  min="3"
                  max="17"
                  value={searchData.childAges[i] || []}
                  onChange={(e) => handleChildAgeChange(i, parseInt(e.target.value) || 8)}
                  placeholder="Age"
                  className="w-full px-3 py-2 border-2 border-[var(--blue)] bg-white rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 bg-[var(--lpink)] rounded-xl p-4">
        <p className="text-center text-lg font-semibold text-gray-800">
          Total: {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
        </p>
      </div>
    </Section>
  );
}