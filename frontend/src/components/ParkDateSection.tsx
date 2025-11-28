// frontend/src/components/parks/ParkDateSection.tsx
import { Calendar } from 'lucide-react';
import Section from './shared/Section';
import NumberInput from './shared/NumberInput';

interface Props {
  searchData: {
    startDate: string;
    endDate: string;
    parkDays: number;
    parkOnDeparture: boolean,
    parkOnArrival: boolean
  };
  updateSearchData: (field: string, value: any) => void;
}

export default function ParkDateSection({ searchData, updateSearchData }: Props) {
  const today = new Date().toLocaleDateString("en-CA");

  const start = searchData.startDate ? new Date(searchData.startDate) : null;
  const end = searchData.endDate ? new Date(searchData.endDate) : null;

  const tripLength =
    start && end
      ? Math.max(1, Math.min(12, Math.floor(
        (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
          Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        (1000 * 60 * 60 * 24)) + 1
      )) : 1;

  let maxParkDays = Math.min(tripLength, 12);
  if (!searchData.parkOnArrival) maxParkDays -= 1;
  if (!searchData.parkOnDeparture) maxParkDays -= 1;
  maxParkDays = Math.max(1, maxParkDays);
  
  if (tripLength == 1 && searchData.parkOnArrival == false) updateSearchData("parkOnArrival", true);

  if (searchData.parkDays > maxParkDays) {
    updateSearchData("parkDays", maxParkDays);
  }

  return (
    <Section icon={<Calendar className="w-6 h-6 text-[var(--blue)]" />} title="Trip Dates">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Arrival Day</label>
          <input
            type="date"
            value={searchData.startDate}
            onChange={(e) => updateSearchData('startDate', e.target.value)}
            min={today}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl"
          />
          <label className="flex items-center mt-2 text-sm">
            <input
              type="checkbox"
              checked={searchData.parkOnArrival || false}
              onChange={(e) => updateSearchData('parkOnArrival', e.target.checked)}
              className="mr-2 accent-[var(--rose)]"
              disabled={tripLength === 1 && searchData.parkOnArrival}
            />
            Allow park on arrival day
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Departure Day</label>
          <input
            type="date"
            value={searchData.endDate}
            onChange={(e) => updateSearchData('endDate', e.target.value)}
            min={searchData.startDate || today}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl"
          />
          <label className="flex items-center mt-2 text-sm">
            <input
              type="checkbox"
              checked={searchData.parkOnDeparture || false}
              onChange={(e) => updateSearchData('parkOnDeparture', e.target.checked)}
              className="mr-2 accent-[var(--rose)]"
            />
            Allow park on departure day
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Park Days</label>
          <NumberInput
            value={searchData.parkDays}
            onChange={(val) => updateSearchData('parkDays', val)}
            min={1} label={''} max={maxParkDays} />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3 italic">
        We'll optimize which days to visit each park based on crowd levels
      </p>
    </Section>
  );
}