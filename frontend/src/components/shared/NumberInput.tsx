// frontend/src/components/shared/NumberInput.tsx
interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function NumberInput({ label, value, onChange, min = 0, max = 20 }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition-colors"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
          className="w-16 text-center px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-lg"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}