import {
  FileCheck2,
  PackageCheck,
  Route,
  Truck,
} from "lucide-react";

import {
  StatCard,
} from "@/components/ui/StatCard";

import type {
  RemissionGuide,
} from "../types/remission-guide.types";

interface Props {
  guides:
    RemissionGuide[];
}

export function RemissionGuideStats({
  guides,
}: Props) {
  const total =
    guides.length;

  const issued =
    guides.filter(
      (
        guide,
      ) =>
        guide.status ===
        "ISSUED",
    ).length;

  const cancelled =
    guides.filter(
      (
        guide,
      ) =>
        guide.status ===
        "CANCELLED",
    ).length;

  const totalItems =
    guides.reduce(
      (
        accumulator,
        guide,
      ) =>
        accumulator +
        guide.details.length,
      0,
    );

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      <StatCard
        title="Total guías"
        value={
          total
        }
        icon={
          Truck
        }
      />

      <StatCard
        title="Emitidas"
        value={
          issued
        }
        icon={
          FileCheck2
        }
      />

      <StatCard
        title="Productos enviados"
        value={
          totalItems
        }
        icon={
          PackageCheck
        }
      />

      <StatCard
        title="Anuladas"
        value={
          cancelled
        }
        icon={
          Route
        }
      />
    </div>
  );
}