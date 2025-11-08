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
  child_ages: number[];
  infants: number;

  total_budget: number;
  budget_per_night?: number;

  location_pref?: string;

  transportation_prefs?: string[];
  transportation_importance?: number;

  room_features?: string[];
  features_importance?: number;

  prefer_budget?: boolean;
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
}

export const searchHotels = async (request: HotelSearchRequest): Promise<HotelSearchResponse> => {
  try {
    const response = await api.post('/hotels/search', request);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      alert("Too many requests. Please wait a moment and try again.");
    } else {
      alert("An error occurred while generating park recommendations.");
      console.error(error);
    }
    throw error;
  };
}

// Park Recommendation Types
export interface ParkRecommendationRequest {
  start_date: string;
  end_date: string;
  park_days: number;
  adults: number;
  children: number;
  child_ages: number[];
  infants: number;
  thrill_level: 'low' | 'moderate' | 'high';
  park_preferences: string[];
  must_visit_parks?: string[];
  avoid_parks?: string[];
  max_park_days?: number;
}

export interface DailyParkPlan {
  date: string;
  park: string;
  park_display_name: string;
  crowd_level: number;
  reasons: string[];
  tips: string[];
}

export interface ParkRecommendationResponse {
  daily_plans: DailyParkPlan[];
  rest_days: string[];
  summary: {
    total_days: number;
    park_days: number;
    rest_days: number;
    parks_visited: Record<string, number>;
    average_crowd_level: number;
    busiest_day: string;
    quietest_day: string;
  };
  optimization_notes: string[];
}

export const recommendParks = async (request: ParkRecommendationRequest): Promise<ParkRecommendationResponse> => {
  try {
    const response = await api.post('/parks/recommend', request);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      alert("Too many requests. Please wait a moment and try again.");
    } else {
      alert("An error occurred while generating park recommendations.");
      console.error(error);
    }
    throw error;
  };
}

export default api;