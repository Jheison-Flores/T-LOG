import {
  CircleCheckBig,
  Clock3,
  FileCheck2,
  ShoppingCart,
} from "lucide-react";

import {
  StatCard,
} from "@/components/ui/StatCard";

import type {
  Purchase,
} from "../types/purchase.types";

interface Props {
  purchases:
    Purchase[];
}

export function PurchaseStats({
  purchases,
}: Props) {
  const total =
    purchases.length;

  const registered =
    purchases.filter(
      (
        purchase,
      ) =>
        purchase.status ===
        "REGISTERED",
    ).length;

  const received =
    purchases.filter(
      (
        purchase,
      ) =>
        purchase.status ===
        "RECEIVED",
    ).length;

  const linkedToRequest =
    purchases.filter(
      (
        purchase,
      ) =>
        Boolean(
          purchase.request,
        ),
    ).length;

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
        title="Total órdenes"
        value={
          total
        }
        icon={
          ShoppingCart
        }
      />

      <StatCard
        title="Emitidas"
        value={
          registered
        }
        icon={
          Clock3
        }
      />

      <StatCard
        title="Recibidas"
        value={
          received
        }
        icon={
          CircleCheckBig
        }
      />

      <StatCard
        title="Con requerimiento"
        value={
          linkedToRequest
        }
        icon={
          FileCheck2
        }
      />
    </div>
  );
}