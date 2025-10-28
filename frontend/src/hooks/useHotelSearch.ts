// frontend/src/hooks/useHotelSearch.ts
import { useState } from 'react';
import { searchHotels, HotelSearchRequest, HotelSearchResponse } from '../lib/api';

export function useHotelSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HotelSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchData: any) => {
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
        infants: searchData.infants,
        
        total_budget: searchData.totalBudget,
        
        transportation_prefs: searchData.transportationPrefs,
        transportation_importance: 4,
        
        room_features: searchData.roomFeatures,
        features_importance: 3,
        
        prefer_budget: searchData.preferBudget,
        pool_importance: searchData.poolImportance,
      };

      const response = await searchHotels(request);
      setResults(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { search, loading, results, error };
}