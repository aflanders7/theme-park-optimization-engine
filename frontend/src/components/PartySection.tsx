// frontend/src/components/search/PartySection.tsx
import { Users } from 'lucide-react';
import Section from './shared/Section';
import NumberInput from './shared/NumberInput';

interface Props {
  searchData: any;
  updateSearchData: (field: string, value: any) => void;
  totalPeople: number;
}

export default function PartySection({ searchData, updateSearchData, totalPeople }: Props) {
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
          onChange={(val) => updateSearchData('children', val)}
          min={0}
        />
        <NumberInput
          label="Infants (under 3)"
          value={searchData.infants}
          onChange={(val) => updateSearchData('infants', val)}
          min={0}
        />
      </div>
      <div className="mt-4 bg-blue-50 rounded-xl p-4 text-center">
        <p className="font-semibold text-gray-800">
          Total: {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
        </p>
      </div>
    </Section>
  );
}