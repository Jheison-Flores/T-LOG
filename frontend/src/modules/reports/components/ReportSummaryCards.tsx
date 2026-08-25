import {
  Boxes,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

import type {
  ReportSummary,
} from "../types/report.types";

interface Props {
  summary: ReportSummary;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function ReportSummaryCards({
  summary,
}: Props) {
  const cards = [
    {
      title: "Valor enviado",
      value: formatCurrency(summary.totalAmount),
      subtitle: "Materiales con costo histórico",
      icon: CircleDollarSign,
    },
    {
      title: "Guías emitidas",
      value: String(summary.guideCount),
      subtitle: `${summary.detailCount} líneas despachadas`,
      icon: FileCheck2,
    },
    {
      title: "Cantidad despachada",
      value: formatNumber(summary.totalQuantity),
      subtitle: "Suma de cantidades de las guías",
      icon: Boxes,
    },
    {
      title: "Cobertura de costos",
      value: `${summary.coveragePercentage.toFixed(2)}%`,
      subtitle:
        summary.unpricedItemCount > 0
          ? `${summary.unpricedItemCount} líneas sin costo`
          : "Todos los ítems valorizados",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <p className="mt-2 truncate text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {card.subtitle}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}