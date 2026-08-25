import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";

import {
  StatCard,
} from "@/components/ui/StatCard";

import type {
  RouteSheet,
} from "../types/route-sheet.types";

interface Props {
  routeSheets:
    RouteSheet[];
}

export function RouteSheetStats({
  routeSheets,
}: Props) {
  const total =
    routeSheets.length;

  const conforming =
    routeSheets.filter(
      (
        item,
      ) =>
        item.status ===
        "CONFORMING",
    ).length;

  const withObservations =
    routeSheets.filter(
      (
        item,
      ) =>
        item.status ===
        "WITH_OBSERVATIONS",
    ).length;

  const totalProducts =
    routeSheets.reduce(
      (
        accumulator,
        routeSheet,
      ) =>
        accumulator +
        routeSheet.details.length,
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
        title="Hojas registradas"
        value={
          total
        }
        icon={
          ClipboardCheck
        }
      />

      <StatCard
        title="Conformes"
        value={
          conforming
        }
        icon={
          CheckCircle2
        }
      />

      <StatCard
        title="Con observaciones"
        value={
          withObservations
        }
        icon={
          AlertTriangle
        }
      />

      <StatCard
        title="Ítems verificados"
        value={
          totalProducts
        }
        icon={
          PackageCheck
        }
      />
    </div>
  );
}