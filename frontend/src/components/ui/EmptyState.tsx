import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="py-20 flex flex-col items-center">

      <PackageOpen
        size={70}
        className="text-gray-300"
      />

      <h2 className="mt-6 text-2xl font-semibold">
        {title}
      </h2>

      <p className="text-gray-500 mt-3">
        {description}
      </p>

    </div>
  );
}