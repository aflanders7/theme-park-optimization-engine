// frontend/src/components/results/BudgetSummary.tsx
interface BudgetSummaryProps {
  summary: {
    your_budget: number;
    recommended_budget: number;
    cheapest_option: number;
    most_expensive: number;
    under_budget: boolean;
  };
}

export default function BudgetSummary({ summary }: BudgetSummaryProps) {
  return (
    <>
      {/* Budget Cards */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Budget Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BudgetCard
            label="Your Budget"
            amount={summary.your_budget}
            color="text-gray-800"
          />
          <BudgetCard
            label="Recommended"
            amount={summary.recommended_budget}
            color="text-blue-600"
          />
          <BudgetCard
            label="Cheapest Option"
            amount={summary.cheapest_option}
            color="text-green-600"
          />
          <BudgetCard
            label="Most Expensive"
            amount={summary.most_expensive}
            color="text-purple-600"
          />
        </div>

        {/* Under Budget Alert */}
        {summary.under_budget && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-medium">
              ✓ You're under budget! You have room for extras.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

interface BudgetCardProps {
  label: string;
  amount: number;
  color: string;
}

function BudgetCard({ label, amount, color }: BudgetCardProps) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        ${amount.toLocaleString()}
      </p>
    </div>
  );
}