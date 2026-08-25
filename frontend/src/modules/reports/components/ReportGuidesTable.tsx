import type {
  GuideReportItem,
} from "../types/report.types";

interface Props {
  data: GuideReportItem[];
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function quantity(value: number) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const parts = value.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

export function ReportGuidesTable({
  data,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900">
          Guías consideradas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Detalle de documentos incluidos en el reporte.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Guía</th>
              <th className="px-5 py-3">Fecha traslado</th>
              <th className="px-5 py-3">Requerimiento</th>
              <th className="px-5 py-3">Mina / unidad</th>
              <th className="px-5 py-3 text-right">Líneas</th>
              <th className="px-5 py-3 text-right">Cantidad</th>
              <th className="px-5 py-3 text-right">Valor</th>
              <th className="px-5 py-3 text-right">Sin costo</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-gray-400"
                >
                  No existen guías para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              data.map((guide) => (
                <tr
                  key={guide.guideId}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-3">
                    <div className="font-semibold text-gray-800">
                      GR-{guide.fullNumber}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {formatDate(guide.transferStartDate)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {guide.requestNumber || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">
                      {guide.destinationWarehouseName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {guide.destinationWarehouseCode}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">
                    {guide.detailCount}
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-gray-700">
                    {quantity(guide.totalQuantity)}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">
                    {money(guide.totalAmount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {guide.unpricedItemCount > 0 ? (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {guide.unpricedItemCount}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green-600">
                        0
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}