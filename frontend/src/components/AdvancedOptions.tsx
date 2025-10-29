// frontend/src/components/search/AdvancedOptions.tsx
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
    searchData: any;
    updateSearchData: (field: string, value: any) => void;
    showAdvanced: boolean;
    setShowAdvanced: (show: boolean) => void;
}

export default function AdvancedOptions({
    searchData,
    updateSearchData,
    showAdvanced,
    setShowAdvanced
}: Props) {
    return (
        <div>
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                Advanced Preferences
            </button>

            {showAdvanced && (
                <div className="mt-6 space-y-6 pt-6 border-t border-gray-200">
                    {/* Transportation Preferences */}
                    <div>
                        <label className="block font-medium mb-3">Preferred Transportation</label>
                        <div className="flex flex-wrap gap-2">
                            {['Skyliner', 'Monorail', 'Boat', 'Bus', 'Walking'].map(transport => (
                                <button
                                    key={transport}
                                    onClick={() => {
                                        const prefs = searchData.transportationPrefs.includes(transport)
                                            ? searchData.transportationPrefs.filter((t: string) => t !== transport)
                                            : [...searchData.transportationPrefs, transport];
                                        updateSearchData('transportationPrefs', prefs);
                                    }}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${searchData.transportationPrefs.includes(transport)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {transport}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location Preference */}
                    <div>
                        <label className="block font-medium mb-3">Preferred Location</label>
                        <div className="flex flex-wrap gap-2">
                            {['Magic Kingdom Resort Area', 'Epcot Resort Area', 'Animal Kingdom Resort Area', 'Disney Springs Resort Area'].map(location => (
                                <button
                                    key={location}
                                    onClick={() => {
                                        const newPref =
                                            searchData.locationPref === location ? '' : location;
                                        updateSearchData('locationPref', newPref);
                                    }}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${searchData.locationPref === location
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {location}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Room Features */}
                    <div>
                        <label className="block font-medium mb-3">Room Features</label>
                        <div className="flex flex-wrap gap-2">
                            {['Balcony', 'Full Kitchen', 'Theme Park View', 'Villa', 'Club Level'].map(feature => (
                                <button
                                    key={feature}
                                    onClick={() => {
                                        const feats = searchData.roomFeatures.includes(feature)
                                            ? searchData.roomFeatures.filter((f: string) => f !== feature)
                                            : [...searchData.roomFeatures, feature];
                                        updateSearchData('roomFeatures', feats);
                                    }}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${searchData.roomFeatures.includes(feature)
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {feature}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget vs Luxury */}
                    <div>
                        <label className="block font-medium mb-3">Hotel Tier Preference</label>
                        <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={searchData.preferBudget === true}
                                    onChange={() => updateSearchData('preferBudget', true)}
                                    className="sr-only"
                                />
                                <div className={`p-4 border-2 rounded-xl text-center ${searchData.preferBudget ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                                    }`}>
                                    <p className="font-bold">Budget-Friendly</p>
                                    <p className="text-sm text-gray-600">Best Value</p>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={searchData.preferBudget === false}
                                    onChange={() => updateSearchData('preferBudget', false)}
                                    className="sr-only"
                                />
                                <div className={`p-4 border-2 rounded-xl text-center ${!searchData.preferBudget ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                                    }`}>
                                    <p className="font-bold">Luxury</p>
                                    <p className="text-sm text-gray-600">What I Can Afford IDK</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}