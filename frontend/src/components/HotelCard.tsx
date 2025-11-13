// frontend/src/components/results/HotelCard.tsx
import { Star, Bus, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

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
  location: string,
  match_score: number;
  score_breakdown: Record<string, number>;
  why_recommended: string[];
}

interface HotelCardProps {
  hotel: Hotel;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function HotelCard({ hotel, rank, isExpanded, onToggle }: HotelCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {rank}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{hotel.hotel_name}</h3>
                <p className="text-gray-600">{hotel.room_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {hotel.hotel_category}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Sleeps {hotel.occupancy}
              </span>
            </div>
          </div>
{/*           <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">
              ${hotel.avg_price_per_night.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">per night</div>
            <div className="text-lg font-semibold text-blue-600 mt-1">
              ${hotel.total_price.toFixed(0)} total
            </div> 
          </div>*/}
        </div>

        {/* Why Recommended */}
        <WhyRecommended reasons={hotel.why_recommended} />

        {/* Transportation & Features */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <TransportationTags transportation={hotel.transportation} />
          <FeatureTags features={hotel.features} />
          <LocationTag location={hotel.location} />
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={onToggle}
          className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 border-t border-gray-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Show Details
            </>
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <ExpandedDetails hotel={hotel} />
        )}
      </div>
    </div>
  );
}

// Sub-components for better organization

function WhyRecommended({ reasons }: { reasons: string[] }) {
  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h4>
      <div className="space-y-1">
        {reasons.map((reason, i) => (
          <div key={i} className="flex items-start gap-2">
            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransportationTags({ transportation }: { transportation: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Transportation</p>
      <div className="flex flex-wrap gap-2">
        {transportation.map(t => (
          <span
            key={t}
            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1"
          >
            <Bus className="w-3 h-3" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function LocationTag({ location }: { location: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {location}
        </span>
      </div>
    </div>
  );
}

function FeatureTags({ features }: { features: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Room Features</p>
      <div className="flex flex-wrap gap-2">
        {features.slice(0, 4).map((f, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
          >
            {f}
          </span>
        ))}
        {features.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
            +{features.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}

function ExpandedDetails({ hotel }: { hotel: Hotel }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
      {/* Room Description */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Room Description</h4>
        <p className="text-gray-700">{hotel.room_description}</p>
      </div>

      {/* Beds */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Beds</h4>
        <div className="space-y-1">
          {hotel.beds.map((bed, i) => (
            <p key={i} className="text-gray-700">
              {bed.count} {bed.type}
            </p>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {/*<div className="flex gap-3">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          //Select This Hotel
        </button>
        <button className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
          View Full Details
        </button>
      </div>*/}
    </div>
  );
}