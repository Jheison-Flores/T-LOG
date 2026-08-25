import {
  Building2,
  CircleCheck,
  CircleOff,
} from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";

import type {
  Supplier,
} from "../types/supplier.types";

interface Props {
  suppliers: Supplier[];
}

export function SuplierStats({
  suppliers,
}: Props) {

  const total =
    suppliers.length;

  const active =
    suppliers.filter(
      (supplier) =>
        supplier.isActive
    ).length;

  const inactive =
    suppliers.filter(
      (supplier) =>
        !supplier.isActive
    ).length;

  return (
    <div className="
      grid
      grid-cols-1
      md:grid-cols-3
      gap-4
    ">

      <StatCard
        title="Total proveedores"
        value={total}
        icon={Building2}
      />

      <StatCard
        title="Proveedores activos"
        value={active}
        icon={CircleCheck}
      />

      <StatCard
        title="Proveedores inactivos"
        value={inactive}
        icon={CircleOff}
      />

    </div>
  );
}