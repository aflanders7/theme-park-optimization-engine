// frontend/src/components/search/DateSection.tsx
import { Calendar } from 'lucide-react';
import Section from './shared/Section';

interface Props {
    searchData: any;
    updateSearchData: (field: string, value: any) => void;
}

export default function DateSection({ searchData, updateSearchData }: Props) {
    return (
        <Section icon={<Calendar className="w-6 h-6" />} title="When are you going?">
            <div className="space-y-4">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={searchData.dateType === 'exact'}
                            onChange={() => updateSearchData('dateType', 'exact')}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span>Specific dates</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={searchData.dateType === 'flexible_days'}
                            onChange={() => updateSearchData('dateType', 'flexible_days')}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span>Flexible (find best prices)</span>
                    </label>
                </div>

                {searchData.dateType === 'exact' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Check-in</label>
                            <input
                                type="date"
                                value={searchData.checkIn}
                                onChange={(e) => updateSearchData('checkIn', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Check-out</label>
                            <input
                                type="date"
                                value={searchData.checkOut}
                                onChange={(e) => updateSearchData('checkOut', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Month</label>
                            <select
                                value={searchData.flexibleMonth}
                                onChange={(e) => updateSearchData('flexibleMonth', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Year</label>
                            <select
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            >
                                {['2025', '2026'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Nights</label>
                            <input
                                type="number"
                                min="1"
                                max="14"
                                value={searchData.numNights}
                                onChange={(e) => updateSearchData('numNights', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
}