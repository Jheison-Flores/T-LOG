import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  ProductSearchSelect,
} from "@/components/selectors/ProductSearchSelect";

import {
  SupplierSearchSelect,
} from "@/components/selectors/SupplierSearchSelect";

import type {
  Product,
} from "@/modules/products/types/product.types";

import type {
  Supplier,
} from "@/modules/suppliers/types/supplier.types";

import type {
  Request,
} from "@/modules/requests/types/request.types";

import type {
  CreatePurchaseDto,
  PurchaseCurrency,
} from "../types/purchase.types";

interface PurchaseLine {
  productId: string;
  quantity: string;
  unitPrice: string;
}

interface PurchaseWarehouseOption {
  id: number;
  name: string;
  code?: string | null;
}

interface PurchaseModalUser {
  role?: {
    code?: string;
  } | null;

  warehouse?: {
    id: number;
    name?: string;
  } | null;
}

interface Props {
  open: boolean;

  onClose: () => void;

  onSubmit: (
    data: CreatePurchaseDto,
  ) => void;

  suppliers: Supplier[];

  products: Product[];

  requests: Request[];

  warehouses: PurchaseWarehouseOption[];

  currentUser?: PurchaseModalUser | null;

  loading?: boolean;

  defaultValues?: Partial<CreatePurchaseDto>;
}

// ============================================================
// FILA VACÍA
// ============================================================

const emptyLine =
  (): PurchaseLine => ({
    productId: "",
    quantity: "1",
    unitPrice: "",
  });

// ============================================================
// FECHA ACTUAL
// ============================================================

function getToday() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

// ============================================================
// COMPONENTE
// ============================================================

export function PurchaseModal({
  open,
  onClose,
  onSubmit,
  suppliers,
  products,
  requests,
  warehouses,
  currentUser,
  loading = false,
  defaultValues,
}: Props) {
  // ============================================================
  // FORMULARIO
  // ============================================================

  const [
    warehouseId,
    setWarehouseId,
  ] =
    useState("");

  const [
    requestId,
    setRequestId,
  ] =
    useState("");

  const [
    supplierId,
    setSupplierId,
  ] =
    useState("");

  const [
    purchaseDate,
    setPurchaseDate,
  ] =
    useState(
      getToday(),
    );

  const [
    quotationNumber,
    setQuotationNumber,
  ] =
    useState("");

  const [
    currency,
    setCurrency,
  ] =
    useState<PurchaseCurrency>(
      "PEN",
    );

  const [
    applyIgv,
    setApplyIgv,
  ] =
    useState(true);

  const [
    commercialConditions,
    setCommercialConditions,
  ] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState("");

  const [
    observation,
    setObservation,
  ] =
    useState("");

  const [
    lines,
    setLines,
  ] =
    useState<PurchaseLine[]>([
      emptyLine(),
    ]);

  const [
    error,
    setError,
  ] =
    useState("");

  const isEditing =
    Boolean(
      defaultValues,
    );

  const roleCode =
    currentUser?.role?.code;

  const isAdmin =
    roleCode ===
    "ADMIN";

  const isLogistics =
    roleCode ===
    "LOGISTICS";

  // ============================================================
  // PROVEEDORES ACTIVOS
  // ============================================================

  const activeSuppliers =
    useMemo(
      () =>
        suppliers.filter(
          (
            supplier,
          ) =>
            supplier.isActive ||
            supplier.id ===
              defaultValues?.supplierId,
        ),
      [
        suppliers,
        defaultValues,
      ],
    );

  // ============================================================
  // REQUERIMIENTOS APROBADOS
  // ============================================================

  const approvedRequests =
    useMemo(
      () =>
        requests.filter(
          (
            request,
          ) =>
            request.status ===
              "APPROVED" ||
            request.status ===
              "PARTIAL" ||
            request.id ===
              defaultValues?.requestId,
        ),
      [
        requests,
        defaultValues,
      ],
    );

  // ============================================================
  // PROVEEDOR SELECCIONADO
  // ============================================================

  const selectedSupplier =
    useMemo(
      () =>
        suppliers.find(
          (
            supplier,
          ) =>
            supplier.id ===
            Number(
              supplierId,
            ),
        ) ?? null,
      [
        supplierId,
        suppliers,
      ],
    );

  // ============================================================
  // REQUERIMIENTO SELECCIONADO
  // ============================================================

  const selectedRequest =
    useMemo(
      () =>
        requests.find(
          (
            request,
          ) =>
            request.id ===
            Number(
              requestId,
            ),
        ) ?? null,
      [
        requestId,
        requests,
      ],
    );

  // ============================================================
  // PRODUCTOS DISPONIBLES
  // ============================================================

  const availableProducts =
    useMemo(
      () => {
        if (
          selectedRequest
        ) {
          const approvedIds =
            new Set(
              selectedRequest.details
                .filter(
                  (
                    detail,
                  ) =>
                    Number(
                      detail.approvedQuantity,
                    ) > 0,
                )
                .map(
                  (
                    detail,
                  ) =>
                    detail.product.id,
                ),
            );

          return products.filter(
            (
              product,
            ) =>
              approvedIds.has(
                product.id,
              ),
          );
        }

        return products.filter(
          (
            product,
          ) =>
            product.isActive ||
            defaultValues?.details?.some(
              (
                detail,
              ) =>
                detail.productId ===
                product.id,
            ),
        );
      },
      [
        products,
        selectedRequest,
        defaultValues,
      ],
    );

  // ============================================================
  // PRODUCTOS YA SELECCIONADOS
  // ============================================================

  const selectedProductIds =
    useMemo(
      () =>
        lines
          .map(
            (
              line,
            ) =>
              Number(
                line.productId,
              ),
          )
          .filter(
            (
              productId,
            ) =>
              Number.isFinite(
                productId,
              ) &&
              productId > 0,
          ),
      [
        lines,
      ],
    );

  // ============================================================
  // CARGAR DATOS AL ABRIR
  // ============================================================

  useEffect(
    () => {
      if (!open) {
        return;
      }

      const initialWarehouseId =
        isLogistics &&
        currentUser?.warehouse?.id
          ? currentUser.warehouse.id
          : defaultValues?.warehouseId;

      setWarehouseId(
        initialWarehouseId
          ? String(
              initialWarehouseId,
            )
          : "",
      );

      setRequestId(
        defaultValues
          ?.requestId
          ? String(
              defaultValues.requestId,
            )
          : "",
      );

      setSupplierId(
        defaultValues
          ?.supplierId
          ? String(
              defaultValues.supplierId,
            )
          : "",
      );

      setPurchaseDate(
        defaultValues
          ?.purchaseDate ??
          getToday(),
      );

      setQuotationNumber(
        defaultValues
          ?.quotationNumber ??
          "",
      );

      setCurrency(
        defaultValues
          ?.currency ??
          "PEN",
      );

      setApplyIgv(
        defaultValues
          ?.applyIgv ??
          true,
      );

      setCommercialConditions(
        defaultValues
          ?.commercialConditions ??
          "",
      );

      setPaymentMethod(
        defaultValues
          ?.paymentMethod ??
          "",
      );

      setObservation(
        defaultValues
          ?.observation ??
          "",
      );

      if (
        defaultValues
          ?.details &&
        defaultValues.details.length >
          0
      ) {
        setLines(
          defaultValues.details.map(
            (
              detail,
            ) => ({
              productId:
                String(
                  detail.productId,
                ),

              quantity:
                String(
                  detail.quantity,
                ),

              unitPrice:
                String(
                  detail.unitPrice,
                ),
            }),
          ),
        );
      } else {
        setLines([
          emptyLine(),
        ]);
      }

      setError("");
    },
    [
      open,
      defaultValues,
      isLogistics,
      currentUser?.warehouse?.id,
    ],
  );

  // ============================================================
  // CAMBIAR REQUERIMIENTO
  //
  // Ahora:
  // - carga productos aprobados
  // - carga cantidad aprobada
  // - carga currentPrice como precio inicial
  // ============================================================

  const handleRequestChange = (
    value: string,
  ) => {
    setRequestId(
      value,
    );

    setError("");

    if (!value) {
      setLines([
        emptyLine(),
      ]);

      return;
    }

    const request =
      requests.find(
        (
          item,
        ) =>
          item.id ===
          Number(
            value,
          ),
      );

    if (!request) {
      setLines([
        emptyLine(),
      ]);

      return;
    }

    if (
      request.warehouse?.id
    ) {
      setWarehouseId(
        String(
          request.warehouse.id,
        ),
      );
    }

    const approvedLines =
      request.details
        .filter(
          (
            detail,
          ) =>
            Number(
              detail.approvedQuantity,
            ) > 0,
        )
        .map(
          (
            detail,
          ): PurchaseLine => {
            const product =
              products.find(
                (
                  item,
                ) =>
                  item.id ===
                  detail.product.id,
              ) ??
              detail.product;

            const currentPrice =
              Number(
                product.currentPrice ??
                  0,
              );

            return {
              productId:
                String(
                  detail.product.id,
                ),

              quantity:
                String(
                  Number(
                    detail.approvedQuantity,
                  ),
                ),

              unitPrice:
                currentPrice > 0
                  ? String(
                      currentPrice,
                    )
                  : "",
            };
          },
        );

    setLines(
      approvedLines.length >
        0
        ? approvedLines
        : [
            emptyLine(),
          ],
    );
  };

  // ============================================================
  // ACTUALIZAR FILA
  // ============================================================

  const updateLine = (
    index: number,

    field:
      keyof PurchaseLine,

    value: string,
  ) => {
    setLines(
      (
        previous,
      ) =>
        previous.map(
          (
            line,
            lineIndex,
          ) =>
            lineIndex ===
            index
              ? {
                  ...line,
                  [field]:
                    value,
                }
              : line,
        ),
    );
  };

  // ============================================================
  // CAMBIAR PRODUCTO
  //
  // Al seleccionar manualmente un producto:
  // trae currentPrice automáticamente.
  // ============================================================

  const handleProductChange = (
    index: number,

    productId: string,
  ) => {
    const selectedProduct =
      products.find(
        (
          product,
        ) =>
          product.id ===
          Number(
            productId,
          ),
      );

    const currentPrice =
      Number(
        selectedProduct
          ?.currentPrice ??
          0,
      );

    setLines(
      (
        previous,
      ) =>
        previous.map(
          (
            line,
            lineIndex,
          ) =>
            lineIndex ===
            index
              ? {
                  ...line,

                  productId,

                  unitPrice:
                    currentPrice >
                    0
                      ? String(
                          currentPrice,
                        )
                      : "",
                }
              : line,
        ),
    );
  };

  // ============================================================
  // AGREGAR FILA
  // ============================================================

  const addLine =
    () => {
      setLines(
        (
          previous,
        ) => [
          ...previous,
          emptyLine(),
        ],
      );
    };

  // ============================================================
  // ELIMINAR FILA
  //
  // Ahora sí se puede eliminar completamente un producto.
  // Si queda 1 sola fila, también se puede eliminar.
  // ============================================================

  const removeLine = (
    index: number,
  ) => {
    setLines(
      (
        previous,
      ) =>
        previous.filter(
          (
            _,
            lineIndex,
          ) =>
            lineIndex !==
            index,
        ),
    );
  };

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal =
    useMemo(
      () =>
        lines.reduce(
          (
            accumulator,
            line,
          ) => {
            const quantity =
              Number(
                line.quantity,
              ) ||
              0;

            const unitPrice =
              Number(
                line.unitPrice,
              ) ||
              0;

            return (
              accumulator +
              quantity *
                unitPrice
            );
          },
          0,
        ),
      [
        lines,
      ],
    );

  // ============================================================
  // IGV
  // ============================================================

  const igv =
    useMemo(
      () =>
        applyIgv
          ? subtotal *
            0.18
          : 0,
      [
        subtotal,
        applyIgv,
      ],
    );

  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    subtotal +
    igv;

  // ============================================================
  // FORMATEAR MONEDA
  // ============================================================

  const formatCurrency = (
    value: number,
  ) =>
    value.toLocaleString(
      "es-PE",
      {
        style:
          "currency",

        currency,

        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      },
    );

  // ============================================================
  // CANTIDAD APROBADA
  // ============================================================

  const getApprovedQuantity = (
    productId: number,
  ) => {
    if (
      !selectedRequest
    ) {
      return null;
    }

    const detail =
      selectedRequest.details.find(
        (
          item,
        ) =>
          item.product.id ===
          productId,
      );

    if (!detail) {
      return null;
    }

    return Number(
      detail.approvedQuantity,
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (
      isAdmin &&
      !Number(
        warehouseId,
      )
    ) {
      setError(
        "Selecciona la unidad de la Orden de Compra.",
      );

      return;
    }

    if (
      !Number(
        supplierId,
      )
    ) {
      setError(
        "Selecciona un proveedor.",
      );

      return;
    }

    if (
      lines.length ===
      0
    ) {
      setError(
        "La orden debe contener al menos un producto.",
      );

      return;
    }

    const detailDtos =
      lines.map(
        (
          line,
        ) => ({
          productId:
            Number(
              line.productId,
            ),

          quantity:
            Number(
              line.quantity,
            ),

          unitPrice:
            Number(
              line.unitPrice,
            ),
        }),
      );

    for (
      const detail of
      detailDtos
    ) {
      if (
        !detail.productId
      ) {
        setError(
          "Selecciona todos los productos.",
        );

        return;
      }

      if (
        !Number.isInteger(
          detail.quantity,
        ) ||
        detail.quantity <=
          0
      ) {
        setError(
          "Todas las cantidades deben ser enteras y mayores a 0.",
        );

        return;
      }

      if (
        !Number.isFinite(
          detail.unitPrice,
        ) ||
        detail.unitPrice <
          0
      ) {
        setError(
          "Todos los precios deben ser válidos y no negativos.",
        );

        return;
      }

      if (
        selectedRequest
      ) {
        const approved =
          getApprovedQuantity(
            detail.productId,
          );

        if (
          approved ===
          null
        ) {
          setError(
            "Uno de los productos no pertenece al requerimiento seleccionado.",
          );

          return;
        }

        if (
          detail.quantity >
          approved
        ) {
          const product =
            products.find(
              (
                item,
              ) =>
                item.id ===
                detail.productId,
            );

          setError(
            `La cantidad de "${product?.name ?? "producto"}" no puede superar lo aprobado (${approved}).`,
          );

          return;
        }
      }
    }

    const productIds =
      detailDtos.map(
        (
          detail,
        ) =>
          detail.productId,
      );

    if (
      new Set(
        productIds,
      ).size !==
      productIds.length
    ) {
      setError(
        "No puedes agregar el mismo producto dos veces.",
      );

      return;
    }

    onSubmit({
      warehouseId:
        Number(
          warehouseId,
        ) ||
        undefined,

      requestId:
        requestId
          ? Number(
              requestId,
            )
          : undefined,

      supplierId:
        Number(
          supplierId,
        ),

      purchaseDate:
        purchaseDate ||
        undefined,

      quotationNumber:
        quotationNumber
          .trim() ||
        undefined,

      currency,

      applyIgv,

      commercialConditions:
        commercialConditions
          .trim() ||
        undefined,

      paymentMethod:
        paymentMethod
          .trim() ||
        undefined,

      observation:
        observation
          .trim() ||
        undefined,

      details:
        detailDtos,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <Modal
  open={open}
  onClose={onClose}
  title={
    isEditing
      ? "Editar orden de compra"
      : "Nueva orden de compra"
  }
  size="2xl"
>
      {/* =======================================================
          CONTENEDOR CON SCROLL
      ======================================================= */}

      <div
        className="
          w-[92vw]
          max-w-6xl
          max-h-[82vh]
          overflow-y-auto
          overflow-x-hidden
          pr-2
        "
      >
        <form
          onSubmit={
            handleSubmit
          }
          className="
            min-w-0
            space-y-6
            pb-2
          "
        >
          {/* ===================================================
              REQUERIMIENTO / UNIDAD / FECHA
          =================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Requerimiento de origen
              </label>

              <select
                value={
                  requestId
                }
                disabled={
                  loading
                }
                onChange={(
                  event,
                ) =>
                  handleRequestChange(
                    event.target.value,
                  )
                }
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
                  Sin requerimiento
                </option>

                {approvedRequests.map(
                  (
                    request,
                  ) => (
                    <option
                      key={
                        request.id
                      }
                      value={
                        request.id
                      }
                    >
                      {
                        request.requestNumber
                      }
                      {" - "}
                      {
                        request.warehouse.name
                      }
                    </option>
                  ),
                )}
              </select>

              <p className="mt-1 text-xs text-gray-400">
                Si eliges un requerimiento, su unidad se selecciona automáticamente.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Unidad / Mina *
              </label>

              <select
                value={
                  warehouseId
                }
                disabled={
                  loading ||
                  isLogistics ||
                  Boolean(
                    selectedRequest,
                  )
                }
                onChange={(
                  event,
                ) =>
                  setWarehouseId(
                    event.target.value,
                  )
                }
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
                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                  disabled:text-gray-500
                  focus:border-orange-500
                  focus:ring-2
                  focus:ring-orange-100
                "
              >
                <option value="">
                  Seleccionar unidad
                </option>

                {warehouses.map(
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
                        warehouse.code
                          ? ` (${warehouse.code})`
                          : ""
                      }
                    </option>
                  ),
                )}
              </select>

              <p className="mt-1 text-xs text-gray-400">
                {
                  isLogistics
                    ? "Tu unidad se asigna automáticamente."
                    : selectedRequest
                      ? "Unidad tomada del requerimiento seleccionado."
                      : "Selecciona la unidad responsable de la O.C."
                }
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha
              </label>

              <Input
                type="date"
                value={
                  purchaseDate
                }
                disabled={
                  loading
                }
                onChange={(
                  event,
                ) =>
                  setPurchaseDate(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          {/* ===================================================
              PROVEEDOR
          =================================================== */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Proveedor *
            </label>

            <SupplierSearchSelect
              suppliers={
                activeSuppliers
              }
              value={
                Number(
                  supplierId,
                ) || null
              }
              disabled={
                loading
              }
              placeholder="Buscar proveedor por razón social, RUC, correo o teléfono..."
              onChange={(
                selectedSupplierId,
              ) =>
                setSupplierId(
                  selectedSupplierId
                    ? String(
                        selectedSupplierId,
                      )
                    : "",
                )
              }
            />
          </div>

          {/* ===================================================
              DATOS PROVEEDOR
          =================================================== */}

          {selectedSupplier && (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-4
                md:grid-cols-2
              "
            >
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  RUC
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {
                    selectedSupplier.ruc ||
                    "No registrado"
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Dirección
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {
                    selectedSupplier.address ||
                    "No registrada"
                  }
                </p>
              </div>
            </div>
          )}

          {/* ===================================================
              COTIZACIÓN / MONEDA
          =================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                N° Cotización
              </label>

              <Input
                value={
                  quotationNumber
                }
                maxLength={
                  100
                }
                disabled={
                  loading
                }
                placeholder="Ej. COT-00152"
                onChange={(
                  event,
                ) =>
                  setQuotationNumber(
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Moneda *
              </label>

              <select
                value={
                  currency
                }
                disabled={
                  loading
                }
                onChange={(
                  event,
                ) =>
                  setCurrency(
                    event.target
                      .value as PurchaseCurrency,
                  )
                }
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
                <option value="PEN">
                  PEN - Soles (S/)
                </option>

                <option value="USD">
                  USD - Dólares ($)
                </option>
              </select>
            </div>
          </div>

          {/* ===================================================
              PRODUCTOS
          =================================================== */}

          <div>
            <div className="mb-3">
              <h3 className="font-semibold text-gray-800">
                Productos de la orden
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Busca productos por nombre, código interno, SKU o categoría. Puedes retirar los que no se comprarán con este proveedor.
              </p>
            </div>

            {/* =================================================
                SCROLL HORIZONTAL
            ================================================= */}

            <div
              className="
                w-full
                overflow-visible
                rounded-xl
                border
                border-gray-200
              "
            >
              <table
                className="
                  min-w-[1050px]
                  w-full
                  text-sm
                "
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="min-w-[360px] px-3 py-3 text-left font-semibold text-gray-600">
                      Producto
                    </th>

                    <th className="w-28 min-w-[110px] px-3 py-3 text-center font-semibold text-gray-600">
                      U.M.
                    </th>

                    <th className="w-28 min-w-[110px] px-3 py-3 text-center font-semibold text-gray-600">
                      Aprobado
                    </th>

                    <th className="w-32 min-w-[130px] px-3 py-3 text-center font-semibold text-gray-600">
                      Cantidad
                    </th>

                    <th className="w-40 min-w-[150px] px-3 py-3 text-right font-semibold text-gray-600">
                      P. Unit.
                    </th>

                    <th className="w-44 min-w-[170px] px-3 py-3 text-right font-semibold text-gray-600">
                      Importe
                    </th>

                    <th className="w-16 min-w-[64px] px-3 py-3 text-center font-semibold text-gray-600">
                      Quitar
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lines.map(
                    (
                      line,
                      index,
                    ) => {
                      const product =
                        products.find(
                          (
                            item,
                          ) =>
                            item.id ===
                            Number(
                              line.productId,
                            ),
                        );

                      const lineSubtotal =
                        (
                          Number(
                            line.quantity,
                          ) ||
                          0
                        ) *
                        (
                          Number(
                            line.unitPrice,
                          ) ||
                          0
                        );

                      const approved =
                        product
                          ? getApprovedQuantity(
                              product.id,
                            )
                          : null;

                      return (
                        <tr
                          key={
                            index
                          }
                          className="border-t border-gray-100"
                        >
                          <td className="p-3">
                            <ProductSearchSelect
                              products={
                                availableProducts
                              }
                              value={
                                Number(
                                  line.productId,
                                ) || null
                              }
                              disabledIds={
                                selectedProductIds.filter(
                                  (
                                    productId,
                                  ) =>
                                    productId !==
                                    Number(
                                      line.productId,
                                    ),
                                )
                              }
                              disabled={
                                loading
                              }
                              placeholder={
                                selectedRequest
                                  ? "Buscar producto aprobado del requerimiento..."
                                  : "Buscar producto por nombre, código o SKU..."
                              }
                              onChange={(
                                selectedProductId,
                              ) =>
                                handleProductChange(
                                  index,
                                  selectedProductId
                                    ? String(
                                        selectedProductId,
                                      )
                                    : "",
                                )
                              }
                            />

                            {product && (
                              <p className="mt-1 text-xs text-gray-400">
                                Último precio registrado:{" "}
                                {
                                  Number(
                                    product.currentPrice ??
                                      0,
                                  ) >
                                  0
                                    ? formatCurrency(
                                        Number(
                                          product.currentPrice,
                                        ),
                                      )
                                    : "Sin precio registrado"
                                }
                              </p>
                            )}
                          </td>

                          <td className="p-3 text-center text-gray-600">
                            {
                              product?.unit ??
                              "—"
                            }
                          </td>

                          <td className="p-3 text-center">
                            {approved !==
                            null ? (
                              <span
                                className="
                                  inline-flex
                                  min-w-10
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-green-50
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-semibold
                                  text-green-700
                                "
                              >
                                {
                                  approved
                                }
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                line.quantity
                              }
                              disabled={
                                loading
                              }
                              onChange={(
                                event,
                              ) =>
                                updateLine(
                                  index,
                                  "quantity",
                                  event.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                line.unitPrice
                              }
                              disabled={
                                loading
                              }
                              placeholder={
                                currency ===
                                "PEN"
                                  ? "S/ 0.00"
                                  : "$ 0.00"
                              }
                              onChange={(
                                event,
                              ) =>
                                updateLine(
                                  index,
                                  "unitPrice",
                                  event.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="p-3 text-right font-semibold text-gray-700">
                            {
                              formatCurrency(
                                lineSubtotal,
                              )
                            }
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              disabled={
                                loading
                              }
                              title="Quitar producto de la orden"
                              onClick={() =>
                                removeLine(
                                  index,
                                )
                              }
                              className="
                                rounded-lg
                                p-2
                                text-gray-400
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                                disabled:opacity-40
                              "
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}

                  {lines.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          7
                        }
                        className="px-4 py-8 text-center text-sm text-gray-400"
                      >
                        No hay productos en esta orden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                addLine
              }
              className="
                mt-3
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-orange-600
                hover:text-orange-700
              "
            >
              <Plus
                size={
                  16
                }
              />

              Agregar producto
            </button>
          </div>

          {/* ===================================================
              IGV
          =================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-4
            "
          >
            <div>
              <p className="font-semibold text-gray-800">
                Aplicar IGV
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Se calculará 18 % sobre el subtotal.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                applyIgv
              }
              disabled={
                loading
              }
              onChange={(
                event,
              ) =>
                setApplyIgv(
                  event.target.checked,
                )
              }
              className="h-5 w-5"
            />
          </div>

          {/* ===================================================
              TOTALES
          =================================================== */}

          <div className="flex justify-end">
            <div
              className="
                w-full
                max-w-md
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-4
              "
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-semibold text-gray-800">
                  {
                    formatCurrency(
                      subtotal,
                    )
                  }
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">
                  IGV 18 %
                </span>

                <span className="font-semibold text-gray-800">
                  {
                    formatCurrency(
                      igv,
                    )
                  }
                </span>
              </div>

              <div className="my-3 border-t border-gray-200" />

              <div className="flex justify-between">
                <span className="font-bold text-gray-900">
                  TOTAL
                </span>

                <span className="text-xl font-bold text-orange-600">
                  {
                    formatCurrency(
                      total,
                    )
                  }
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              CONDICIONES / PAGO
          =================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Condiciones comerciales
              </label>

              <textarea
                rows={
                  3
                }
                value={
                  commercialConditions
                }
                disabled={
                  loading
                }
                placeholder="Ej. Entrega según coordinación con Logística."
                onChange={(
                  event,
                ) =>
                  setCommercialConditions(
                    event.target.value,
                  )
                }
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-orange-500
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Forma de pago
              </label>

              <textarea
                rows={
                  3
                }
                value={
                  paymentMethod
                }
                disabled={
                  loading
                }
                placeholder="Ej. DEPÓSITO EN CUENTA"
                onChange={(
                  event,
                ) =>
                  setPaymentMethod(
                    event.target.value,
                  )
                }
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-gray-300
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-orange-500
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>
          </div>

          {/* ===================================================
              OBSERVACIÓN
          =================================================== */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Observación
            </label>

            <textarea
              rows={
                3
              }
              value={
                observation
              }
              disabled={
                loading
              }
              placeholder="Observaciones adicionales de la orden..."
              onChange={(
                event,
              ) =>
                setObservation(
                  event.target.value,
                )
              }
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-gray-300
                px-3
                py-2
                text-sm
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
              "
            />
          </div>

          {/* ===================================================
              ERROR
          =================================================== */}

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

          {/* ===================================================
              BOTONES
          =================================================== */}

          <div
            className="
              sticky
              bottom-0
              -mx-1
              flex
              justify-end
              gap-3
              border-t
              border-gray-200
              bg-white
              px-1
              py-4
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
              type="submit"
              disabled={
                loading ||
                lines.length ===
                  0
              }
            >
              {loading
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Generar orden de compra"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}