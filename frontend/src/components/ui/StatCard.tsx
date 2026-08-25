import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  icon: Icon,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center border">

      <div>
        <p className="text-gray-500 text-sm">
          {title}
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {value}
        </h2>
      </div>

      <div className="bg-orange-100 p-4 rounded-xl">
        <Icon
          size={30}
          className="text-orange-500"
        />
      </div>

    </div>
  );
}