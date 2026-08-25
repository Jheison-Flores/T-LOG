import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Rows3,
  Truck,
  XCircle,
} from "lucide-react";

import {
  StatCard,
} from "@/components/ui/StatCard";

import type {
  Request,
} from "../types/request.types";

interface Props {
  requests: Request[];
}

export function RequestStats({
  requests,
}: Props) {
  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    requests.length;

  // ============================================================
  // PENDIENTES
  // ============================================================

  const pending =
    requests.filter(
      (request) =>
        request.status ===
        "PENDING"
    ).length;

  // ============================================================
  // APROBADAS
  //
  // Incluye:
  // - aprobación completa
  // - aprobación parcial
  //
  // Pero todavía sin despacho iniciado.
  // ============================================================

  const approved =
    requests.filter(
      (request) =>
        request.status ===
          "APPROVED" ||
        request.status ===
          "PARTIAL"
    ).length;

  // ============================================================
  // EN DESPACHO
  // ============================================================

  const inProgress =
    requests.filter(
      (request) =>
        request.status ===
        "IN_PROGRESS"
    ).length;

  // ============================================================
  // ENTREGADAS
  // ============================================================

  const delivered =
    requests.filter(
      (request) =>
        request.status ===
        "DELIVERED"
    ).length;

  // ============================================================
  // RECHAZADAS
  // ============================================================

  const rejected =
    requests.filter(
      (request) =>
        request.status ===
        "REJECTED"
    ).length;

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-6
        gap-4
      "
    >

      {/* TOTAL */}

      <StatCard
        title="Total solicitudes"
        value={total}
        icon={Rows3}
      />

      {/* PENDIENTES */}

      <StatCard
        title="Pendientes"
        value={pending}
        icon={Clock3}
      />

      {/* APROBADAS */}

      <StatCard
        title="Aprobadas"
        value={approved}
        icon={CheckCircle2}
      />

      {/* EN DESPACHO */}

      <StatCard
        title="En despacho"
        value={inProgress}
        icon={Truck}
      />

      {/* ENTREGADAS */}

      <StatCard
        title="Entregadas"
        value={delivered}
        icon={PackageCheck}
      />

      {/* RECHAZADAS */}

      <StatCard
        title="Rechazadas"
        value={rejected}
        icon={XCircle}
      />

    </div>
  );
}