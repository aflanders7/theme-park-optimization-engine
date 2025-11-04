// frontend/src/components/search/DateSection.tsx
import { Calendar } from 'lucide-react';
import Section from './shared/Section';
import { useEffect } from 'react';

interface Props {
    searchData: any;
    updateSearchData: (field: string, value: any) => void;
}

export default function DateSection({ searchData, updateSearchData }: Props) {
    useEffect(() => {
        // Force flexible_days
        if (searchData.dateType !== 'flexible_days') {
            updateSearchData('dateType', 'flexible_days');
        }
    }, [searchData.dateType, updateSearchData]);

    // Generate month/year options dynamically
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate a list of (month, year) pairs starting from current month
    type MonthYearOption = { month: number; year: number };
    const monthYearOptions: MonthYearOption[] = [];
    for (let y = currentYear; y <= currentYear + 1; y++) {
        for (let m = 1; m <= 12; m++) {
            if (y === currentYear && m < currentMonth) continue; // skip past months
            monthYearOptions.push({ month: m, year: y });
        }
    }

    return (
        <Section icon={<Calendar className="w-6 h-6" />} title="When are you going?">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Month & Year</label>
                    <select
                        value={`${searchData.flexibleYear}-${searchData.flexibleMonth}`}
                        onChange={(e) => {
                            const [year, month] = e.target.value.split('-').map(Number);
                            updateSearchData('flexibleYear', year);
                            updateSearchData('flexibleMonth', month);
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                        {monthYearOptions.map(({ month, year }) => (
                            <option key={`${month}-${year}`} value={`${year}-${month}`}>
                                {monthNames[month - 1]} {year}
                            </option>
                        ))}
                    </select>

                    {/* Nights */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Nights</label>
                        <input
                            type="number"
                            min="1"
                            max="14"
                            value={searchData.numNights || 5}
                            onChange={(e) => updateSearchData('numNights', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </Section>
    );
}
