import type {
  ProductReportItem,
} from "../types/report.types";

interface Props {
  data: ProductReportItem[];
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

export function ProductRanking({
  data,
}: Props) {
  const top = data.slice(0, 10);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900">
          Top productos
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Productos con mayor valor despachado.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3 text-right">Cantidad</th>
              <th className="px-5 py-3 text-right">Despachos</th>
              <th className="px-5 py-3 text-right">Valor</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {top.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-gray-400"
                >
                  Sin datos para mostrar.
                </td>
              </tr>
            ) : (
              top.map((item, index) => (
                <tr
                  key={item.productId}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-3 text-sm font-semibold text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-gray-800">
                      {item.productName}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {item.internalCode ||
                        item.sku ||
                        "Sin código"}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {item.categoryName}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-medium text-gray-700">
                    {quantity(item.totalQuantity)}
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">
                    {item.dispatchCount}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">
                    {money(item.totalAmount)}
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