import {
  Eye,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";

import type {
  Product,
} from "../types/product.types";

interface Props {
  products: Product[];

  onViewDetail: (
    product: Product
  ) => void;

  onEdit: (
    product: Product
  ) => void;

  onActivate: (
    product: Product
  ) => void;

  onDeactivate: (
    product: Product
  ) => void;

  loadingId?: number | null;
}

export function ProductTable({
  products,
  onViewDetail,
  onEdit,
  onActivate,
  onDeactivate,
  loadingId = null,
}: Props) {

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">

        <div className="text-gray-400 mb-2">
          No se encontraron productos.
        </div>

        <p className="text-sm text-gray-500">
          Intenta cambiar el término de búsqueda.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b border-gray-200">

            <tr>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                SKU
              </th>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                Producto
              </th>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                Categoría
              </th>

              <th className="text-left px-5 py-4 font-semibold text-gray-600">
                Unidad
              </th>

              <th className="text-center px-5 py-4 font-semibold text-gray-600">
                Stock mínimo
              </th>

              <th className="text-center px-5 py-4 font-semibold text-gray-600">
                Estado
              </th>

              <th className="text-right px-5 py-4 font-semibold text-gray-600">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {products.map((product) => {

              const isLoading =
                loadingId === product.id;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition"
                >

                  {/* SKU */}

                  <td className="px-5 py-4">

                    <span className="font-mono text-xs text-gray-600">
                      {product.sku || "—"}
                    </span>

                  </td>

                  {/* PRODUCTO */}

                  <td className="px-5 py-4">

                    <div>

                      <p className="font-semibold text-gray-800">
                        {product.name}
                      </p>

                      {product.internalCode && (
                        <p className="text-xs text-gray-400 mt-1">
                          Código: {product.internalCode}
                        </p>
                      )}

                    </div>

                  </td>

                  {/* CATEGORÍA */}

                  <td className="px-5 py-4">

                    <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {product.category?.name ||
                        "Sin categoría"}
                    </span>

                  </td>

                  {/* UNIDAD */}

                  <td className="px-5 py-4 text-gray-600">
                    {product.unit}
                  </td>

                  {/* STOCK MÍNIMO */}

                  <td className="px-5 py-4 text-center">

                    <span className="font-semibold text-gray-700">
                      {product.minimumStock}
                    </span>

                  </td>

                  {/* ESTADO */}

                  <td className="px-5 py-4 text-center">

                    {product.isActive ? (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

                        Activo

                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />

                        Inactivo

                      </span>

                    )}

                  </td>

                  {/* ACCIONES */}

                  <td className="px-5 py-4">

                    <div className="flex justify-end items-center gap-1">

                      {/* VER */}

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          onViewDetail(product)
                        }
                        title="Ver detalle"
                        className="
                          p-2
                          rounded-lg
                          text-gray-500
                          hover:text-blue-600
                          hover:bg-blue-50
                          transition
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                        "
                      >
                        <Eye size={17} />
                      </button>

                      {/* EDITAR */}

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          onEdit(product)
                        }
                        title="Editar producto"
                        className="
                          p-2
                          rounded-lg
                          text-gray-500
                          hover:text-orange-600
                          hover:bg-orange-50
                          transition
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                        "
                      >
                        <Pencil size={17} />
                      </button>

                      {/* ACTIVAR */}

                      {!product.isActive && (

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            onActivate(product)
                          }
                          title="Activar producto"
                          className="
                            p-2
                            rounded-lg
                            text-gray-500
                            hover:text-green-600
                            hover:bg-green-50
                            transition
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                          "
                        >
                          <Power size={17} />
                        </button>

                      )}

                      {/* DESACTIVAR */}

                      {product.isActive && (

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            onDeactivate(product)
                          }
                          title="Desactivar producto"
                          className="
                            p-2
                            rounded-lg
                            text-gray-500
                            hover:text-red-600
                            hover:bg-red-50
                            transition
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                          "
                        >
                          <PowerOff size={17} />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}