// frontend/src/components/results/HotelList.tsx
import { useState } from 'react';
import HotelCard from './HotelCard';

interface Hotel {
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

interface HotelListProps {
  hotels: Hotel[];
}

export default function HotelList({ hotels }: HotelListProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Top Recommendations</h2>
      
      {hotels.map((hotel, index) => {
        const cardId = `${hotel.hotel_id}-${hotel.room_id}`;
        return (
            <HotelCard
            key={cardId}
            hotel={hotel}
            rank={index + 1}
            isExpanded={expandedCard === cardId}
            onToggle={() => 
                setExpandedCard(expandedCard === cardId ? null : cardId)}
            />
        )})}
    </div>
  );
}