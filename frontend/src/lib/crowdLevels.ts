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
  { label: string; range: string; bg: string; text: string; dot: string }
> = {
  low: { label: 'Low', range: '1–3', bg: 'bg-[#EBF2EF]', text: 'text-[#3F6459]', dot: 'bg-[#5C8B7C]' },
  moderate: { label: 'Moderate', range: '4–6', bg: 'bg-[#FBF2DC]', text: 'text-[#8A6A16]', dot: 'bg-[#C9A227]' },
  high: { label: 'High', range: '7–8', bg: 'bg-[#FBE9DD]', text: 'text-[#9A4E24]', dot: 'bg-[#C46A3B]' },
  veryHigh: { label: 'Very High', range: '9–10', bg: 'bg-[#F6E1E1]', text: 'text-[#8A2F2F]', dot: 'bg-[#A13D3D]' },
  unknown: { label: 'No data', range: '', bg: 'bg-[#F4F3F0]', text: 'text-gray-400', dot: 'bg-gray-300' },
};

export const PARKS = [
  { key: 'magic_kingdom', short: 'MK', name: 'Magic Kingdom' },
  { key: 'epcot', short: 'EP', name: 'EPCOT' },
  { key: 'hollywood_studios', short: 'HS', name: 'Hollywood Studios' },
  { key: 'animal_kingdom', short: 'AK', name: 'Animal Kingdom' },
] as const;

export type ParkKey = (typeof PARKS)[number]['key'];