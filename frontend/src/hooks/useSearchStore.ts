// frontend/src/hooks/useSearchStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  searchData: {
    dateType: 'exact' | 'flexible_days' | 'flexible_month';
    checkIn: string;
    checkOut: string;
    flexibleMonth: number;
    flexibleYear: number;
    numNights: number;
    adults: number;
    children: number;
    infants: number;
    totalBudget: number;
    transportationPrefs: string[];
    roomFeatures: string[];
    preferBudget: boolean;
    poolImportance: number;
  };
  results: any | null;
  updateSearchData: (field: string, value: any) => void;
  setResults: (results: any) => void;
  resetSearch: () => void;
}

const initialSearchData = {
  dateType: 'exact' as const,
  checkIn: '',
  checkOut: '',
  flexibleMonth: 3,
  flexibleYear: 2025,
  numNights: 5,
  adults: 2,
  children: 0,
  infants: 0,
  totalBudget: 5000,
  transportationPrefs: [],
  roomFeatures: [],
  preferBudget: true,
  poolImportance: 3,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchData: initialSearchData,
      results: null,
      updateSearchData: (field, value) =>
        set((state) => ({
          searchData: { ...state.searchData, [field]: value },
        })),
      setResults: (results) => set({ results }),
      resetSearch: () => set({ searchData: initialSearchData, results: null }),
    }),
    {
      name: 'hotel-search-storage',
    }
  )
);