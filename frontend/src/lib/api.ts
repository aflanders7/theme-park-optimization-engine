// frontend/src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
  park_on_arrival: boolean;
  park_on_departure: boolean;
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

export const recommendParks = async (
  request: ParkRecommendationRequest
): Promise<ParkRecommendationResponse> => {
  try {
    const response = await api.post('/parks/recommend', request);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        alert("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert("An error occurred while generating park recommendations.");
        console.error(error);
      }
    } else {
      alert("An error occurred while generating park recommendations.");
      console.error(error);
    }

    throw error;
  }
};

// Crowd Calendar Types
export interface ParkCrowdLevels {
  magic_kingdom: number | null;
  epcot: number | null;
  hollywood_studios: number | null;
  animal_kingdom: number | null;
}

export interface CrowdCalendarDay {
  date: string; // "YYYY-MM-DD"
  parks: ParkCrowdLevels;
}

export interface CrowdCalendarResponse {
  year: number;
  month: number;
  has_data: boolean;
  days: CrowdCalendarDay[];
}

// ---------------------------------------------------------------------------
// Client-side cache
// ---------------------------------------------------------------------------
// Bump the version if the response shape ever changes so stale shapes are ignored.
const STORAGE_PREFIX = 'crowd-cal:v1:';
const TTL_WITH_DATA_MS = 24 * 60 * 60 * 1000; // 24 hours
const TTL_NO_DATA_MS = 15 * 60 * 1000; // 15 minutes (predictions may be published soon)

interface CacheRecord {
  savedAt: number;
  data: CrowdCalendarResponse;
}

const memoryCache = new Map<string, CacheRecord>();
const inFlight = new Map<string, Promise<CrowdCalendarResponse>>();

const isFresh = (record: CacheRecord) =>
  Date.now() - record.savedAt < (record.data.has_data ? TTL_WITH_DATA_MS : TTL_NO_DATA_MS);

function readCache(key: string): CrowdCalendarResponse | null {
  const inMemory = memoryCache.get(key);
  if (inMemory && isFresh(inMemory)) return inMemory.data;

  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      const record: CacheRecord = JSON.parse(raw);
      if (isFresh(record)) {
        memoryCache.set(key, record);
        return record.data;
      }
      localStorage.removeItem(STORAGE_PREFIX + key);
    }
  } catch {
    // Storage unavailable (private mode, quota, bad JSON) - just skip the cache
  }
  return null;
}

function writeCache(key: string, data: CrowdCalendarResponse) {
  const record: CacheRecord = { savedAt: Date.now(), data };
  memoryCache.set(key, record);
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export const getCrowdCalendar = async (
  year: number,
  month: number
): Promise<CrowdCalendarResponse> => {
  // The backend rejects past months with a 400, so don't spend a request on it
  const now = new Date();
  if (year * 12 + month < now.getFullYear() * 12 + (now.getMonth() + 1)) {
    throw new Error('Cannot fetch crowd data for a past month.');
  }

  const key = `${year}-${month}`;

  const cached = readCache(key);
  if (cached) return cached;

  // Share requests if the same month is already being requested
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = api
    .get<CrowdCalendarResponse>('/crowd-calendar', { params: { year, month } })
    .then((response) => {
      writeCache(key, response.data);
      return response.data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
};

export default api;
