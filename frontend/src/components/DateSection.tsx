// frontend/src/components/search/DateSection.tsx
import { Calendar } from 'lucide-react';
import Section from './shared/Section';
import { useEffect } from 'react';
import NumberInput from './shared/NumberInput';

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
            if (y === currentYear && m <= currentMonth) continue; // skip past months
            if (y === currentYear + 1 && m === 12) continue; // skip dec 2026 for now
            monthYearOptions.push({ month: m, year: y });
        }
    }

    return (
        <Section icon={<Calendar className="w-6 h-6 text-[var(--blue)]" />} title="When are you going?">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2">Month</label>
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
                </div>
                {/* Nights */}
                <div>
                    <NumberInput
                        label="Nights"
                        value={searchData.numNights || 5}
                        onChange={(val) => updateSearchData('numNights', val)}
                        min={1}
                        max={14}
                    />
                </div>
            </div>
        </Section>
    );
}
