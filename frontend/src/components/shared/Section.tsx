// frontend/src/components/shared/Section.tsx
interface Props {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export default function Section({ icon, title, children }: Props) {
  return (
    <div className="border-b border-gray-200 pb-8 last:border-b-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-blue-600">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}