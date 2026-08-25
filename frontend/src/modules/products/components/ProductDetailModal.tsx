import {
  Modal,
} from "@/components/ui/Modal";

import type {
  Product,
} from "../types/product.types";

interface Props {
  product: Product | null;

  open: boolean;

  onClose: () => void;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "—"}
      </p>

    </div>
  );
}

function BooleanItem({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          value
            ? "text-orange-600"
            : "text-gray-600"
        }`}
      >
        {value ? "Sí" : "No"}
      </p>

    </div>
  );
}

export function ProductDetailModal({
  product,
  open,
  onClose,
}: Props) {

  if (!open || !product) {
    return null;
  }

  return (
    <Modal
      title="Detalle del producto"
      open={open}
      onClose={onClose}
      width="max-w-4xl"
    >

      <div className="space-y-6">

        {/* ENCABEZADO */}

        <div className="rounded-xl bg-gray-900 p-5 text-white">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {product.internalCode ||
                  "Sin código interno"}
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {product.name}
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                SKU:{" "}
                {product.sku || "Sin SKU"}
              </p>

            </div>

            <div>

              {product.isActive ? (

                <span className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-500/20
                  px-3
                  py-1.5
                  text-sm
                  font-semibold
                  text-green-300
                ">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Activo
                </span>

              ) : (

                <span className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-gray-500/30
                  px-3
                  py-1.5
                  text-sm
                  font-semibold
                  text-gray-300
                ">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  Inactivo
                </span>

              )}

            </div>

          </div>

        </div>

        {/* INFORMACIÓN GENERAL */}

        <section>

          <h4 className="
            mb-3
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-gray-700
          ">
            Información general
          </h4>

          <div className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-3
          ">

            <DetailItem
              label="SKU"
              value={product.sku}
            />

            <DetailItem
              label="Código interno"
              value={product.internalCode}
            />

            <DetailItem
              label="Categoría"
              value={
                product.category?.name
              }
            />

            <DetailItem
              label="Código de categoría"
              value={
                product.category?.code
              }
            />

            <DetailItem
              label="Marca"
              value={product.brand}
            />

            <DetailItem
              label="Modelo"
              value={product.model}
            />

            <DetailItem
              label="Unidad"
              value={product.unit}
            />

            <DetailItem
              label="Stock mínimo"
              value={
                product.minimumStock
              }
            />

            <DetailItem
              label="Estado"
              value={
                product.isActive
                  ? "Activo"
                  : "Inactivo"
              }
            />

          </div>

        </section>

        {/* CONFIGURACIÓN LOGÍSTICA */}

        <section>

          <h4 className="
            mb-3
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-gray-700
          ">
            Configuración logística
          </h4>

          <div className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          ">

            <BooleanItem
              label="Maneja número de serie"
              value={
                product.requiresSerial
              }
            />

            <BooleanItem
              label="Maneja lote"
              value={
                product.requiresBatch
              }
            />

          </div>

        </section>

        {/* DESCRIPCIÓN */}

        <section>

          <h4 className="
            mb-3
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-gray-700
          ">
            Descripción
          </h4>

          <div className="
            rounded-lg
            border
            border-gray-200
            bg-gray-50
            p-4
          ">

            <p className="
              text-sm
              leading-relaxed
              text-gray-700
            ">
              {product.description ||
                "Este producto no tiene una descripción registrada."}
            </p>

          </div>

        </section>

        {/* INFORMACIÓN DEL REGISTRO */}

        <section>

          <h4 className="
            mb-3
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-gray-700
          ">
            Información del registro
          </h4>

          <div className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          ">

            <DetailItem
              label="Fecha de creación"
              value={
                new Date(
                  product.createdAt
                ).toLocaleString("es-PE")
              }
            />

            <DetailItem
              label="Última actualización"
              value={
                new Date(
                  product.updatedAt
                ).toLocaleString("es-PE")
              }
            />

          </div>

        </section>

        {/* BOTÓN */}

        <div className="
          flex
          justify-end
          border-t
          border-gray-200
          pt-5
        ">

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              bg-gray-900
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-gray-800
            "
          >
            Cerrar
          </button>

        </div>

      </div>

    </Modal>
  );
}