// frontend/src/lib/crowdLevels.ts

export type CrowdBand = 'low' | 'moderate' | 'high' | 'veryHigh' | 'unknown';

// Boundaries match the legend shown on the calendar page:
// Low 1-3, Moderate 4-6, High 7-8, Very High 9-10.
export function getCrowdBand(score: number | null | undefined): CrowdBand {
  if (score === null || score === undefined) return 'unknown';
  if (score <= 3) return 'low';
  if (score <= 6) return 'moderate';
  if (score <= 8) return 'high';
  return 'veryHigh';
}

export const CROWD_BAND_STYLES: Record<
  CrowdBand,
  {
    label: string;
    range: string;
    bg: string;
    text: string;
    dot: string;
    border: string;
  }
> = {
  low: {
    label: 'Low',
    range: '1–3',
    bg: 'bg-[#BEE5D3]',
    text: 'text-[#1B5E44]',
    dot: 'bg-[#219653]',
    border: 'border-[#8CCDB0]',
  },
  moderate: {
    label: 'Moderate',
    range: '4–6',
    bg: 'bg-[#FCDD8E]',
    text: 'text-[#7A5900]',
    dot: 'bg-[#E0A106]',
    border: 'border-[#E5C45D]',
  },
  high: {
    label: 'High',
    range: '7–8',
    bg: 'bg-[#FBBB86]',
    text: 'text-[#8A3A0E]',
    dot: 'bg-[#E36F0C]',
    border: 'border-[#E99A58]',
  },
  veryHigh: {
    label: 'Very High',
    range: '9–10',
    bg: 'bg-[#F3A2A2]',
    text: 'text-[#7A1F1F]',
    dot: 'bg-[#D23F3F]',
    border: 'border-[#E07C7C]',
  },
  unknown: {
    label: 'No data',
    range: '',
    bg: 'bg-[#EFEDE8]',
    text: 'text-gray-400',
    dot: 'bg-gray-300',
    border: 'border-gray-200',
  },
};

export const PARKS = [
  { key: 'magic_kingdom', short: 'MK', name: 'Magic Kingdom' },
  { key: 'epcot', short: 'EP', name: 'EPCOT' },
  { key: 'hollywood_studios', short: 'HS', name: 'Hollywood Studios' },
  { key: 'animal_kingdom', short: 'AK', name: 'Animal Kingdom' },
] as const;

export type ParkKey = (typeof PARKS)[number]['key'];