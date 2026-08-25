import type {
  WarehouseReportItem,
} from "../types/report.types";

interface Props {
  data: WarehouseReportItem[];
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function WarehouseCostChart({
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
          Valor enviado por mina
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Comparación del valor de materiales despachados por unidad.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center text-sm text-gray-400">
          No hay información para los filtros seleccionados.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {data.map((item) => {
            const width = Math.max(
              3,
              (item.totalAmount / max) * 100,
            );

            return (
              <div key={item.warehouseId}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.warehouseName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.guideCount} guía(s)
                    </p>
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {money(item.totalAmount)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}