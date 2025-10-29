// frontend/src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HotelSearchRequest {
  date_type: 'exact' | 'flexible_days' | 'flexible_month';
  check_in?: string;
  check_out?: string;
  flexible_month?: number;
  flexible_year?: number;
  num_nights?: number;
  
  adults: number;
  children: number;
  infants: number;
  
  total_budget: number;
  budget_per_night?: number;

  location_pref?: string;
  
  transportation_prefs?: string[];
  transportation_importance?: number;
  
  room_features?: string[];
  features_importance?: number;
  
  prefer_budget?: boolean;
  pool_importance?: number;
}

export interface RoomRecommendation {
  hotel_id: string;
  hotel_name: string;
  hotel_category: string;
  room_id: string;
  room_name: string;
  room_description: string;
  
  avg_price_per_night: number;
  total_price: number;
  
  occupancy: number;
  beds: Array<{ count: number; type: string }>;
  features: string[];
  transportation: string[];
  location: string;

  match_score: number;
  score_breakdown: Record<string, number>;
  why_recommended: string[];
}

export interface HotelSearchResponse {
  total_results: number;
  recommendations: RoomRecommendation[];
  alternatives: RoomRecommendation[];
  budget_summary: {
    recommended_budget: number;
    cheapest_option: number;
    most_expensive: number;
    your_budget: number;
    under_budget: boolean;
  };
}

export const searchHotels = async (request: HotelSearchRequest): Promise<HotelSearchResponse> => {
  const response = await api.post('/hotels/search', request);
  console.log(response);
  return response.data;
};

export const getSearchOptions = async () => {
  const response = await api.get('/hotels/options');
  return response.data;
};

export const getHotelDetails = async (hotelId: string) => {
  const response = await api.get(`/hotels/${hotelId}`);
  return response.data;
};

export default api;