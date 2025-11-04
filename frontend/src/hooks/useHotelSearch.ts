// frontend/src/hooks/useHotelSearch.ts
import { useState } from 'react';
import { searchHotels, HotelSearchRequest, HotelSearchResponse } from '../lib/api';
import { useSearchStore } from './useSearchStore';

export function useHotelSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setResults } = useSearchStore();

  const search = async (searchData: any): Promise<HotelSearchResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Transform frontend data to API format
      const request: HotelSearchRequest = {
        date_type: searchData.dateType,
        check_in: searchData.checkIn || undefined,
        check_out: searchData.checkOut || undefined,
        flexible_month: searchData.flexibleMonth,
        flexible_year: searchData.flexibleYear,
        num_nights: searchData.numNights,
        
        adults: searchData.adults,
        children: searchData.children,
        child_ages: searchData.childAges,
        infants: searchData.infants,
        
        total_budget: searchData.totalBudget,
        
        transportation_prefs: searchData.transportationPrefs,
        transportation_importance: 4,

        location_pref: searchData.locationPref,
        
        room_features: searchData.roomFeatures,
        features_importance: 3,
        
        prefer_budget: searchData.preferBudget,
      };

      const response = await searchHotels(request);
      setResults(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to search hotels. Please try again.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { search, loading, error };
}