import {
  CircleCheckBig,
  CircleOff,
  Layers3,
} from "lucide-react";

import {
  StatCard,
} from "@/components/ui/StatCard";

import type {
  Category,
} from "../types/category.types";

interface Props {
  categories: Category[];
}

export function CategoryStats({
  categories,
}: Props) {
  const total =
    categories.length;

  const active =
    categories.filter(
      (category) =>
        category.isActive,
    ).length;

  const inactive =
    categories.filter(
      (category) =>
        !category.isActive,
    ).length;

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-3
      "
    >
      <StatCard
        title="Total categorías"
        value={total}
        icon={Layers3}
      />

      <StatCard
        title="Activas"
        value={active}
        icon={CircleCheckBig}
      />

      <StatCard
        title="Inactivas"
        value={inactive}
        icon={CircleOff}
      />
    </div>
  );
}