// frontend/src/hooks/useParkSearch.ts
import { useState } from 'react';
import { recommendParks, ParkRecommendationRequest, ParkRecommendationResponse } from '../lib/api';
import { useParkStore } from './useParkStore';

export function useParkSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setParkResults } = useParkStore();

  const search = async (searchData: any): Promise<ParkRecommendationResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const request: ParkRecommendationRequest = {
        start_date: searchData.startDate,
        end_date: searchData.endDate,
        adults: searchData.adults,
        children: searchData.children,
        child_ages: searchData.childAges,
        infants: searchData.infants,
        thrill_level: searchData.thrillLevel,
        park_preferences: searchData.parkPreferences,
        must_visit_parks: searchData.mustVisitParks,
        avoid_parks: searchData.avoidParks
      };

      const response = await recommendParks(request);
      setParkResults(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate park recommendations. Please try again.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { search, loading, error };
}