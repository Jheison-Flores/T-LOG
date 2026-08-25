import type {
  TrendReportItem,
} from "../types/report.types";

interface Props {
  data: TrendReportItem[];
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TrendChart({
  data,
}: Props) {
  const max = Math.max(
    ...data.map((item) => item.totalAmount),
    1,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Evolución del valor enviado
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Tendencia según la agrupación seleccionada.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center text-sm text-gray-400">
          No hay información para los filtros seleccionados.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-[560px] items-end gap-4">
            {data.map((item) => {
              const height = Math.max(
                14,
                (item.totalAmount / max) * 180,
              );

              return (
                <div
                  key={item.key}
                  className="flex min-w-20 flex-1 flex-col items-center"
                >
                  <div className="mb-2 text-center text-xs font-semibold text-gray-700">
                    {money(item.totalAmount)}
                  </div>

                  <div className="flex h-48 w-full items-end justify-center">
                    <div
                      className="w-10 rounded-t-lg bg-orange-500"
                      style={{ height: `${height}px` }}
                      title={`${item.label}: ${money(item.totalAmount)}`}
                    />
                  </div>

                  <div className="mt-3 text-center text-xs font-medium text-gray-500">
                    {item.label}
                  </div>

                  <div className="mt-1 text-center text-[11px] text-gray-400">
                    {item.guideCount} guía(s)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}