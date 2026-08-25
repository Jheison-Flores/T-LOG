import type {
  Inventory,
} from "../types/inventory.types";

import {
  StockStatusBadge,
} from "./StockStatusBadge";

interface InventoryTableProps {
  inventory: Inventory[];
}

export function InventoryTable({
  inventory,
}: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">

        <div className="text-gray-400 text-4xl mb-3">
          📦
        </div>

        <h3 className="font-semibold text-gray-700">
          No hay registros de inventario
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          No se encontraron existencias para la búsqueda realizada.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b border-gray-200">

            <tr>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                Producto
              </th>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                SKU
              </th>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                Almacén
              </th>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                Categoría
              </th>

              <th className="text-center px-5 py-4 font-semibold text-gray-600">
                Unidad
              </th>

              <th className="text-center px-5 py-4 font-semibold text-gray-600">
                Stock
              </th>

              <th className="text-center px-5 py-4 font-semibold text-gray-600">
                Mínimo
              </th>

              <th className="text-center px-5 py-4 font-semibold text-gray-600">
                Estado
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {inventory.map((item) => {

              const product = item.product;
              const warehouse = item.warehouse;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition"
                >

                  {/* PRODUCTO */}

                  <td className="px-5 py-4">

                    <div>

                      <p className="font-semibold text-gray-800">
                        {product?.name || "Sin producto"}
                      </p>

                      {product?.internalCode && (
                        <p className="text-xs text-gray-400 mt-1">
                          Código: {product.internalCode}
                        </p>
                      )}

                    </div>

                  </td>

                  {/* SKU */}

                  <td className="px-5 py-4">

                    <span className="font-mono text-xs text-gray-600">
                      {product?.sku || "—"}
                    </span>

                  </td>

                  {/* ALMACÉN */}

                  <td className="px-5 py-4">

                    <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {warehouse?.name || "Sin almacén"}
                    </span>

                  </td>

                  {/* CATEGORÍA */}

                  <td className="px-5 py-4 text-gray-600">

                    {product?.category?.name ||
                      "Sin categoría"}

                  </td>

                  {/* UNIDAD */}

                  <td className="px-5 py-4 text-center text-gray-600">

                    {product?.unit || "—"}

                  </td>

                  {/* STOCK */}

                  <td className="px-5 py-4 text-center">

                    <span
                      className={`font-bold ${
                        item.quantity <= 0
                          ? "text-red-600"
                          : item.quantity <=
                              (product?.minimumStock ?? 0)
                          ? "text-yellow-600"
                          : "text-gray-800"
                      }`}
                    >
                      {item.quantity}
                    </span>

                  </td>

                  {/* MÍNIMO */}

                  <td className="px-5 py-4 text-center">

                    <span className="text-gray-600">
                      {product?.minimumStock ?? 0}
                    </span>

                  </td>

                  {/* ESTADO */}

                  <td className="px-5 py-4 text-center">

                    <StockStatusBadge
                      quantity={item.quantity}
                      minimumStock={
                        product?.minimumStock ?? 0
                      }
                    />

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500">
          {inventory.length} registro
          {inventory.length !== 1
            ? "s"
            : ""}{" "}
          de inventario
        </p>

      </div>

    </div>
  );
}