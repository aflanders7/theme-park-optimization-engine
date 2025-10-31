// frontend/src/hooks/useParkStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ParkSearchState {
  parkSearchData: {
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    childAges: number[];
    infants: number;
    thrillLevel: 'low' | 'moderate' | 'high';
    parkPreferences: string[];
    mustVisitParks: string[];
    avoidParks: string[];
  };
  parkResults: any | null;
  updateParkSearchData: (field: string, value: any) => void;
  setParkResults: (results: any) => void;
  resetParkSearch: () => void;
}

const initialParkSearchData = {
  startDate: '',
  endDate: '',
  adults: 2,
  children: 0,
  childAges: [],
  infants: 0,
  thrillLevel: 'moderate' as const,
  parkPreferences: [],
  mustVisitParks: [],
  avoidParks: [],
};

export const useParkStore = create<ParkSearchState>()(
  persist(
    (set) => ({
      parkSearchData: initialParkSearchData,
      parkResults: null,
      updateParkSearchData: (field, value) =>
        set((state) => ({
          parkSearchData: { ...state.parkSearchData, [field]: value },
        })),
      setParkResults: (results) => set({ parkResults: results }),
      resetParkSearch: () => set({ parkSearchData: initialParkSearchData, parkResults: null }),
    }),
    {
      name: 'park-search-storage',
    }
  )
);