import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PackageCheck,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Modal,
} from "@/components/ui/Modal";

import type {
  Purchase,
  PurchaseWarehouse,
} from "../types/purchase.types";

interface ReceivePurchaseUser {
  role?: {
    code?: string;
  } | null;

  warehouse?: {
    id: number;
    name?: string | null;
    city?: string | null;
  } | null;
}

interface Props {
  open: boolean;

  purchase:
    Purchase | null;

  warehouses:
    PurchaseWarehouse[];

  currentUser?:
    ReceivePurchaseUser | null;

  loading?: boolean;

  onClose:
    () => void;

  onSubmit: (
    warehouseId:
      number,
  ) => void;
}

export function ReceivePurchaseModal({
  open,
  purchase,
  warehouses,
  currentUser,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [
    warehouseId,
    setWarehouseId,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const roleCode =
    currentUser?.role?.code;

  const isAdmin =
    roleCode ===
    "ADMIN";

  const isLogistics =
    roleCode ===
    "LOGISTICS";

  const activeWarehouses =
    useMemo(
      () =>
        warehouses.filter(
          (
            warehouse,
          ) =>
            warehouse.isActive,
        ),
      [
        warehouses,
      ],
    );

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      setError("");

      // ==========================================================
      // LOGISTICS
      //
      // Recepciona siempre en su propia unidad.
      // El backend vuelve a validar esta regla.
      // ==========================================================

      if (
        isLogistics &&
        currentUser?.warehouse?.id
      ) {
        setWarehouseId(
          String(
            currentUser.warehouse.id,
          ),
        );

        return;
      }

      // ==========================================================
      // ADMIN
      //
      // Como primera opción usamos el warehouse de la O.C.
      // Si por datos históricos no existe, aplicamos los fallbacks
      // que ya tenía el componente.
      // ==========================================================

      if (
        isAdmin &&
        purchase?.warehouse?.id
      ) {
        setWarehouseId(
          String(
            purchase.warehouse.id,
          ),
        );

        return;
      }

      if (
        activeWarehouses.length ===
        1
      ) {
        setWarehouseId(
          String(
            activeWarehouses[0].id,
          ),
        );

        return;
      }

      const lima =
        activeWarehouses.find(
          (
            warehouse,
          ) =>
            warehouse.city
              ?.toLowerCase() ===
              "lima" ||
            warehouse.name
              .toLowerCase()
              .includes(
                "lima",
              ),
        );

      setWarehouseId(
        lima
          ? String(
              lima.id,
            )
          : "",
      );
    },
    [
      open,
      purchase,
      activeWarehouses,
      currentUser,
      isAdmin,
      isLogistics,
    ],
  );

  if (
    !open ||
    !purchase
  ) {
    return null;
  }

  const handleConfirm =
    () => {
      const id =
        Number(
          warehouseId,
        );

      if (
        !id ||
        id <= 0
      ) {
        setError(
          "Selecciona el almacén donde se recibió la mercadería.",
        );

        return;
      }

      onSubmit(
        id,
      );
    };

  const selectedWarehouse =
    activeWarehouses.find(
      (
        warehouse,
      ) =>
        warehouse.id ===
        Number(
          warehouseId,
        ),
    ) ??
    null;

  const productCount =
    purchase.details
      ?.length ??
    0;

  return (
    <Modal
      open={
        open
      }
      onClose={
        onClose
      }
      title="Confirmar recepción"
    >
      <div className="space-y-5">
        <div
          className="
            flex
            gap-3
            rounded-xl
            border
            border-green-200
            bg-green-50
            p-4
          "
        >
          <PackageCheck
            className="
              mt-0.5
              shrink-0
              text-green-600
            "
            size={
              22
            }
          />

          <div className="min-w-0">
            <p
              className="
                truncate
                font-semibold
                text-green-800
              "
            >
              {
                purchase.purchaseOrderNumber
              }
            </p>

            <p
              className="
                mt-1
                text-sm
                text-green-700
              "
            >
              Se ingresarán al inventario{" "}
              {
                productCount
              }{" "}
              producto
              {
                productCount ===
                1
                  ? ""
                  : "s"
              }.
            </p>
          </div>
        </div>

        <div>
          <label
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Almacén de recepción
            <span className="text-red-500">
              {" "}
              *
            </span>
          </label>

          {isLogistics ? (
            <div
              className="
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                px-3
                py-3
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                {
                  currentUser
                    ?.warehouse
                    ?.name ??
                  selectedWarehouse
                    ?.name ??
                  "Unidad asignada"
                }
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                La recepción se registrará automáticamente en tu unidad.
              </p>
            </div>
          ) : (
            <select
              value={
                warehouseId
              }
              disabled={
                loading
              }
              onChange={(
                event,
              ) => {
                setWarehouseId(
                  event.target.value,
                );

                setError(
                  "",
                );
              }}
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                text-sm
                text-gray-700
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">
                Selecciona un almacén
              </option>

              {activeWarehouses.map(
                (
                  warehouse,
                ) => (
                  <option
                    key={
                      warehouse.id
                    }
                    value={
                      warehouse.id
                    }
                  >
                    {
                      warehouse.name
                    }
                    {
                      warehouse.city
                        ? ` - ${warehouse.city}`
                        : ""
                    }
                  </option>
                ),
              )}
            </select>
          )}
        </div>

        {error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
          >
            {
              error
            }
          </div>
        )}

        <div
          className="
            rounded-xl
            bg-gray-50
            p-4
            text-sm
            text-gray-600
          "
        >
          Al confirmar, el stock de todos los productos aumentará en el almacén seleccionado y se generarán los movimientos de entrada correspondientes.
        </div>

        <div
          className="
            flex
            justify-end
            gap-3
          "
        >
          <Button
            type="button"
            variant="secondary"
            disabled={
              loading
            }
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={
              loading
            }
            onClick={
              handleConfirm
            }
          >
            {
              loading
                ? "Recibiendo..."
                : "Confirmar recepción"
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
}