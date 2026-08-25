import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Button,
  Input,
} from "@/components/ui";

import { useCategories } from "../hooks/useCategories";

import {
  PRODUCT_UNIT_OPTIONS,
} from "../types/product.types";

import type {
  CreateProductDto,
} from "../types/product.types";

interface Props {
  defaultValues?: Partial<CreateProductDto>;

  loading?: boolean;

  onSubmit: (
    data: CreateProductDto,
  ) => void;
}

const initialValues: CreateProductDto = {
  name: "",

  description: "",

  brand: "",

  model: "",

  unit: "Unidad",

  minimumStock: 0,

  currentPrice: undefined,

  requiresSerial: false,

  requiresBatch: false,

  categoryId: 0,
};

export function ProductForm({
  defaultValues,
  loading = false,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm<CreateProductDto>({
    defaultValues: {
      ...initialValues,
      ...defaultValues,
    },
  });

  const {
    data: categories,
    isLoading:
      categoriesLoading,
  } = useCategories();

  useEffect(() => {
    reset({
      ...initialValues,
      ...defaultValues,
    });
  }, [
    defaultValues,
    reset,
  ]);

  const submitForm = (
    data: CreateProductDto,
  ) => {
    onSubmit({
      ...data,

      name:
        data.name.trim(),

      description:
        data.description?.trim() ||
        undefined,

      brand:
        data.brand?.trim() ||
        undefined,

      model:
        data.model?.trim() ||
        undefined,

      minimumStock:
        Number(
          data.minimumStock,
        ),

      currentPrice:
        data.currentPrice ===
          undefined ||
        Number.isNaN(
          data.currentPrice,
        )
          ? undefined
          : Number(
              data.currentPrice,
            ),

      categoryId:
        Number(
          data.categoryId,
        ),
    });
  };

  return (
    <form
      onSubmit={
        handleSubmit(
          submitForm,
        )
      }
      className="space-y-5"
    >

      {/* =====================================================
          NOMBRE
      ===================================================== */}

      <div>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nombre *
        </label>

        <Input
          placeholder="Ej. Taladro Percutor Industrial"
          disabled={
            loading
          }
          {...register(
            "name",
            {
              required:
                "El nombre del producto es obligatorio.",

              validate: (
                value,
              ) =>
                value.trim()
                  .length >=
                  2 ||
                "El nombre debe tener al menos 2 caracteres.",
            },
          )}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {
              errors.name
                .message
            }
          </p>
        )}

      </div>

      {/* =====================================================
          DESCRIPCIÓN
      ===================================================== */}

      <div>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción
        </label>

        <textarea
          className="
            min-h-[90px]
            w-full
            rounded-lg
            border
            border-gray-300
            p-3
            outline-none
            transition
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-500
            disabled:bg-gray-100
          "
          placeholder="Descripción del producto..."
          disabled={
            loading
          }
          {...register(
            "description",
            {
              maxLength: {
                value:
                  500,

                message:
                  "La descripción no puede superar los 500 caracteres.",
              },
            },
          )}
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {
              errors.description
                .message
            }
          </p>
        )}

      </div>

      {/* =====================================================
          MARCA / MODELO
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Marca
          </label>

          <Input
            placeholder="Ej. Bosch"
            disabled={
              loading
            }
            {...register(
              "brand",
              {
                maxLength: {
                  value:
                    100,

                  message:
                    "La marca no puede superar los 100 caracteres.",
                },
              },
            )}
          />

          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.brand
                  .message
              }
            </p>
          )}

        </div>

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Modelo
          </label>

          <Input
            placeholder="Ej. GSB 750"
            disabled={
              loading
            }
            {...register(
              "model",
              {
                maxLength: {
                  value:
                    100,

                  message:
                    "El modelo no puede superar los 100 caracteres.",
                },
              },
            )}
          />

          {errors.model && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.model
                  .message
              }
            </p>
          )}

        </div>

      </div>

      {/* =====================================================
          CATEGORÍA / UNIDAD
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* CATEGORÍA */}

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Categoría *
          </label>

          <select
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              p-3
              outline-none
              transition
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-500
              disabled:bg-gray-100
            "
            disabled={
              categoriesLoading ||
              loading
            }
            {...register(
              "categoryId",
              {
                valueAsNumber:
                  true,

                validate: (
                  value,
                ) =>
                  value >
                    0 ||
                  "Debes seleccionar una categoría.",
              },
            )}
          >

            <option value={0}>
              {categoriesLoading
                ? "Cargando categorías..."
                : "Seleccione categoría"}
            </option>

            {categories?.map(
              (
                category,
              ) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {
                    category.name
                  }
                </option>
              ),
            )}

          </select>

          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors
                  .categoryId
                  .message
              }
            </p>
          )}

        </div>

        {/* UNIDAD */}

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Unidad / presentación *
          </label>

          <select
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              p-3
              outline-none
              transition
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-500
              disabled:bg-gray-100
            "
            disabled={
              loading
            }
            {...register(
              "unit",
              {
                required:
                  "La unidad es obligatoria.",
              },
            )}
          >

            {PRODUCT_UNIT_OPTIONS.map(
              (
                unit,
              ) => (
                <option
                  key={
                    unit.value
                  }
                  value={
                    unit.value
                  }
                >
                  {
                    unit.label
                  }
                </option>
              ),
            )}

          </select>

          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.unit
                  .message
              }
            </p>
          )}

        </div>

      </div>

      {/* =====================================================
          STOCK MÍNIMO / PRECIO
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Stock mínimo
          </label>

          <Input
            type="number"
            min={0}
            step={1}
            disabled={
              loading
            }
            {...register(
              "minimumStock",
              {
                valueAsNumber:
                  true,

                min: {
                  value:
                    0,

                  message:
                    "El stock mínimo no puede ser negativo.",
                },

                validate: (
                  value,
                ) =>
                  Number.isInteger(
                    value,
                  ) ||
                  "El stock mínimo debe ser un número entero.",
              },
            )}
          />

          {errors.minimumStock && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors
                  .minimumStock
                  .message
              }
            </p>
          )}

        </div>

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Precio actual
          </label>

          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            disabled={
              loading
            }
            {...register(
              "currentPrice",
              {
                setValueAs: (
                  value,
                ) => {
                  if (
                    value ===
                      "" ||
                    value ===
                      null ||
                    value ===
                      undefined
                  ) {
                    return undefined;
                  }

                  return Number(
                    value,
                  );
                },

                min: {
                  value:
                    0,

                  message:
                    "El precio no puede ser negativo.",
                },
              },
            )}
          />

          {errors.currentPrice && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors
                  .currentPrice
                  .message
              }
            </p>
          )}

          <p className="mt-1 text-xs text-gray-400">
            Opcional. Puede actualizarse posteriormente mediante compras.
          </p>

        </div>

      </div>

      {/* =====================================================
          CONTROL
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <label
          className={`
            flex
            items-center
            gap-3
            rounded-lg
            border
            p-3
            transition
            ${
              loading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-gray-50"
            }
          `}
        >

          <input
            type="checkbox"
            disabled={
              loading
            }
            {...register(
              "requiresSerial",
            )}
            className="h-4 w-4 accent-orange-500"
          />

          <div>

            <span className="text-sm font-medium text-gray-700">
              Requiere número de serie
            </span>

            <p className="mt-0.5 text-xs text-gray-400">
              Para equipos o productos identificables individualmente.
            </p>

          </div>

        </label>

        <label
          className={`
            flex
            items-center
            gap-3
            rounded-lg
            border
            p-3
            transition
            ${
              loading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-gray-50"
            }
          `}
        >

          <input
            type="checkbox"
            disabled={
              loading
            }
            {...register(
              "requiresBatch",
            )}
            className="h-4 w-4 accent-orange-500"
          />

          <div>

            <span className="text-sm font-medium text-gray-700">
              Requiere lote
            </span>

            <p className="mt-0.5 text-xs text-gray-400">
              Para materiales que necesitan control por lote.
            </p>

          </div>

        </label>

      </div>

      {/* =====================================================
          BOTÓN
      ===================================================== */}

      <div className="flex justify-end border-t pt-4">

        <Button
          type="submit"
          disabled={
            loading ||
            categoriesLoading
          }
        >
          {loading
            ? "Guardando..."
            : defaultValues
              ? "Actualizar producto"
              : "Guardar producto"}
        </Button>

      </div>

    </form>
  );
}