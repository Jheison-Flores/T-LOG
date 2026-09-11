import { useEffect, useMemo, useState } from "react";

import { PackagePlus, Plus, Trash2 } from "lucide-react";

import { Modal } from "@/components/ui/Modal";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { ProductSearchSelect } from "@/components/selectors/ProductSearchSelect";

import { ProductModal } from "@/modules/products/components/ProductModal";

import { useCreateProduct } from "@/modules/products/hooks/useProducts";

import type {
  CreateProductDto,
  Product,
} from "@/modules/products/types/product.types";

import type { Warehouse } from "@/modules/warehouses/types/warehouse.types";

import type { CreateRequestDto } from "../types/request.types";

// ============================================================
// LINEA
// ============================================================

interface RequestLine {
  productId: string;
  quantity: string;
  observations: string;
}

// ============================================================
// PROPS
// ============================================================

interface Props {
  open: boolean;

  isAdmin: boolean;

  requesterName?: string;

  products: Product[];

  warehouses: Warehouse[];

  loading?: boolean;

  onClose: () => void;

  onSubmit: (data: CreateRequestDto) => void;
}

// ============================================================
// LINEA VACÍA
// ============================================================

const emptyLine = (): RequestLine => ({
  productId: "",
  quantity: "1",
  observations: "",
});

// ============================================================
// MODAL
// ============================================================

export function RequestModal({
  open,
  isAdmin,
  requesterName = "",
  products,
  warehouses,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  // ==========================================================
  // MUTATION PRODUCTO
  // ==========================================================

  const createProduct = useCreateProduct();

  // ==========================================================
  // STATE REQUERIMIENTO
  // ==========================================================

  const [requester, setRequester] = useState("");

  const [warehouseId, setWarehouseId] = useState("");

  const [observations, setObservations] = useState("");

  const [lines, setLines] = useState<RequestLine[]>([emptyLine()]);

  const [error, setError] = useState("");

  // ==========================================================
  // NUEVO PRODUCTO
  // ==========================================================

  const [productModalOpen, setProductModalOpen] = useState(false);

  /*
   * Guarda la línea donde se colocará automáticamente
   * el nuevo producto después de crearlo.
   */

  const [targetLineIndex, setTargetLineIndex] = useState<number | null>(null);

  const [productError, setProductError] = useState("");

  // ==========================================================
  // PRODUCTOS ACTIVOS
  // ==========================================================

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive),
    [products],
  );

  // ==========================================================
  // ALMACENES ACTIVOS
  // ==========================================================

  const activeWarehouses = useMemo(
    () => warehouses.filter((warehouse) => warehouse.isActive),
    [warehouses],
  );

  // ==========================================================
  // RESET AL ABRIR
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setRequester(requesterName);

    setWarehouseId("");

    setObservations("");

    setLines([emptyLine()]);

    setError("");

    setProductError("");

    setProductModalOpen(false);

    setTargetLineIndex(null);
  }, [open, requesterName]);

  if (!open) {
    return null;
  }

  // ==========================================================
  // ACTUALIZAR LINEA
  // ==========================================================

  const updateLine = (
    index: number,
    field: keyof RequestLine,
    value: string,
  ) => {
    setLines((previous) =>
      previous.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              [field]: value,
            }
          : line,
      ),
    );
  };

  // ==========================================================
  // PRODUCTOS YA SELECCIONADOS
  // ==========================================================

  const selectedProductIds = lines
    .map((line) => Number(line.productId))
    .filter((productId) => Number.isFinite(productId) && productId > 0);

  // ==========================================================
  // AGREGAR LINEA
  // ==========================================================

  const addLine = () => {
    setLines((previous) => [...previous, emptyLine()]);
  };

  // ==========================================================
  // ELIMINAR LINEA
  // ==========================================================

  const removeLine = (index: number) => {
    setLines((previous) => {
      if (previous.length === 1) {
        return [emptyLine()];
      }

      return previous.filter((_, lineIndex) => lineIndex !== index);
    });
  };

  // ==========================================================
  // ABRIR NUEVO PRODUCTO
  // ==========================================================

  const handleOpenNewProduct = () => {
    setError("");

    setProductError("");

    /*
     * Primero buscamos una línea que todavía no tenga
     * producto seleccionado.
     */

    const emptyIndex = lines.findIndex((line) => !line.productId);

    if (emptyIndex >= 0) {
      setTargetLineIndex(emptyIndex);

      setProductModalOpen(true);

      return;
    }

    /*
     * Si todas las líneas ya tienen producto,
     * agregamos una nueva y esa será la línea objetivo.
     */

    const newIndex = lines.length;

    setLines((previous) => [...previous, emptyLine()]);

    setTargetLineIndex(newIndex);

    setProductModalOpen(true);
  };

  // ==========================================================
  // CREAR PRODUCTO DESDE EL REQUERIMIENTO
  // ==========================================================

  const handleCreateProduct = async (data: CreateProductDto) => {
    setProductError("");

    try {
      const createdProduct = await createProduct.mutateAsync(data);

      /*
       * Una vez creado:
       *
       * 1. Se conserva todo el requerimiento.
       * 2. Se coloca el producto nuevo automáticamente
       *    en la línea seleccionada.
       * 3. React Query actualiza el catálogo "products".
       */

      if (targetLineIndex !== null && createdProduct?.id) {
        setLines((previous) =>
          previous.map((line, lineIndex) =>
            lineIndex === targetLineIndex
              ? {
                  ...line,

                  productId: String(createdProduct.id),
                }
              : line,
          ),
        );
      }

      setProductModalOpen(false);

      setTargetLineIndex(null);
    } catch (productCreateError: any) {
      console.error(
        "Error creando producto desde requerimiento:",
        productCreateError,
      );

      const message = productCreateError?.response?.data?.message;

      setProductError(
        Array.isArray(message)
          ? message.join(" ")
          : (message ?? "No se pudo crear el producto."),
      );
    }
  };

  // ==========================================================
  // CERRAR PRODUCTO
  // ==========================================================

  const handleCloseProductModal = () => {
    if (createProduct.isPending) {
      return;
    }

    setProductModalOpen(false);

    setTargetLineIndex(null);

    setProductError("");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // ========================================================
    // SOLICITANTE
    // ========================================================

    if (!requester.trim()) {
      setError("Ingresa el solicitante o área solicitante.");

      return;
    }

    // ========================================================
    // ALMACEN ADMIN
    // ========================================================

    if (isAdmin && !Number(warehouseId)) {
      setError("Selecciona la mina o almacén solicitante.");

      return;
    }

    // ========================================================
    // DETALLES
    // ========================================================

    const details = lines.map((line) => ({
      productId: Number(line.productId),

      quantity: Number(line.quantity),

      observations: line.observations.trim() || undefined,
    }));

    // ========================================================
    // VALIDACIONES
    // ========================================================

    for (const detail of details) {
      if (!detail.productId) {
        setError("Selecciona todos los productos.");

        return;
      }

      if (!Number.isFinite(detail.quantity) || detail.quantity <= 0) {
        setError("Todas las cantidades deben ser mayores a 0.");

        return;
      }
    }

    // ========================================================
    // DUPLICADOS
    // ========================================================

    const productIds = details.map((detail) => detail.productId);

    if (new Set(productIds).size !== productIds.length) {
      setError("No puedes agregar el mismo producto dos veces.");

      return;
    }

    // ========================================================
    // DTO
    // ========================================================

    const data: CreateRequestDto = {
      requester: requester.trim(),

      observations: observations.trim() || undefined,

      details,
    };

    // ========================================================
    // ADMIN
    // ========================================================

    if (isAdmin) {
      data.warehouseId = Number(warehouseId);
    }

    onSubmit(data);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Modal open={open} onClose={onClose} title="Nueva solicitud" size="2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* =====================================================
              CABECERA
          ===================================================== */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* ===================================================
                SOLICITANTE
            =================================================== */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Solicitante / Área *
              </label>

              <Input
                value={requester}
                disabled={loading}
                placeholder="Ej. Área de mantenimiento"
                onChange={(event) => setRequester(event.target.value)}
              />
            </div>

            {/* ===================================================
                MINA
            =================================================== */}

            {isAdmin ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mina / Almacén solicitante *
                </label>

                <select
                  value={warehouseId}
                  disabled={loading}
                  onChange={(event) => setWarehouseId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Selecciona destino</option>

                  {activeWarehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}

                      {warehouse.city ? ` - ${warehouse.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-semibold text-blue-700">
                  Mina asignada automáticamente
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  La solicitud se registrará en la mina o almacén asociado a tu
                  usuario.
                </p>
              </div>
            )}
          </div>

          {/* =====================================================
              PRODUCTOS
          ===================================================== */}

          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Productos solicitados
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Busca por nombre, código interno, SKU o categoría.
                </p>
              </div>

              {/* =================================================
                  NUEVO PRODUCTO
              ================================================= */}

              <button
                type="button"
                disabled={loading || createProduct.isPending}
                onClick={handleOpenNewProduct}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-orange-200
                  bg-orange-50
                  px-4
                  text-sm
                  font-semibold
                  text-orange-700
                  transition
                  hover:border-orange-300
                  hover:bg-orange-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <PackagePlus size={17} />
                Nuevo producto
              </button>
            </div>

            {/* ===================================================
                ERROR PRODUCTO
            =================================================== */}

            {productError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {productError}
              </div>
            )}

            <div className="overflow-visible rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[46%] px-4 py-3 text-left font-semibold text-gray-600">
                      Producto
                    </th>

                    <th className="w-[14%] px-4 py-3 text-center font-semibold text-gray-600">
                      Cantidad
                    </th>

                    <th className="w-[34%] px-4 py-3 text-left font-semibold text-gray-600">
                      Observación
                    </th>

                    <th className="w-[6%] px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {lines.map((line, index) => {
                    const currentProductId = Number(line.productId) || null;

                    const disabledProductIds = selectedProductIds.filter(
                      (productId) => productId !== currentProductId,
                    );

                    return (
                      <tr
                        key={index}
                        className="border-t border-gray-100 align-top"
                      >
                        {/* PRODUCTO */}

                        <td className="p-4">
                          <ProductSearchSelect
                            products={activeProducts}
                            value={currentProductId}
                            disabledIds={disabledProductIds}
                            disabled={loading}
                            placeholder="Buscar producto por nombre, código o SKU..."
                            onChange={(productId) =>
                              updateLine(
                                index,
                                "productId",
                                productId ? String(productId) : "",
                              )
                            }
                          />
                        </td>

                        {/* CANTIDAD */}

                        <td className="p-4">
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={line.quantity}
                            disabled={loading}
                            onChange={(event) =>
                              updateLine(index, "quantity", event.target.value)
                            }
                          />
                        </td>

                        {/* OBSERVACIÓN */}

                        <td className="p-4">
                          <Input
                            value={line.observations}
                            disabled={loading}
                            placeholder="Opcional"
                            onChange={(event) =>
                              updateLine(
                                index,
                                "observations",
                                event.target.value,
                              )
                            }
                          />
                        </td>

                        {/* QUITAR */}

                        <td className="p-4">
                          <button
                            type="button"
                            disabled={loading}
                            title="Quitar producto"
                            onClick={() => removeLine(index)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ===================================================
                ACCIONES DE PRODUCTOS
            =================================================== */}

            <div className="mt-4 flex flex-wrap items-center gap-5">
              <button
                type="button"
                disabled={loading}
                onClick={addLine}
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                Agregar otro producto
              </button>

              <button
                type="button"
                disabled={loading || createProduct.isPending}
                onClick={handleOpenNewProduct}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PackagePlus size={16} />
                Crear producto nuevo
              </button>
            </div>
          </div>

          {/* =====================================================
              OBSERVACIÓN GENERAL
          ===================================================== */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Observación general
            </label>

            <textarea
              rows={2}
              value={observations}
              disabled={loading}
              placeholder="Información adicional sobre la solicitud..."
              onChange={(event) => setObservations(event.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =====================================================
              ACCIONES
          ===================================================== */}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={loading || createProduct.isPending}>
              {loading ? "Creando..." : "Crear solicitud"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==========================================================
          MODAL NUEVO PRODUCTO

          Se mantiene fuera del formulario del requerimiento para
          evitar formularios HTML anidados.
      ========================================================== */}

      <ProductModal
        open={productModalOpen}
        loading={createProduct.isPending}
        onClose={handleCloseProductModal}
        onSubmit={handleCreateProduct}
      />
    </>
  );
}
