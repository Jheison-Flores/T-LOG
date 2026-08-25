import {
  useMemo,
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  useAuth,
} from "@/modules/auth/contexts/AuthContexts";

import {
  useProducts,
} from "@/modules/products/hooks/useProducts";

import {
  useRequests,
} from "@/modules/requests/hooks/useRequests";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  api,
} from "@/services/api";

import {
  PurchaseModal,
} from "../components/PurchaseModal";

import {
  PurchaseTable,
} from "../components/PurchaseTable";

import {
  PurchaseStats,
} from "../components/PurchaseStats";

import {
  PurchaseDetailModal,
} from "../components/PurchaseDetailModal";

import {
  ReceivePurchaseModal,
} from "../components/ReceivePurchasesModal";

import {
  useCreatePurchase,
  useDeletePurchase,
  useDownloadPurchaseExcel,
  useDownloadPurchasePdf,
  usePurchases,
  useReceivePurchase,
  useUpdatePurchase,
} from "../hooks/usePurchases";

import type {
  CreatePurchaseDto,
  Purchase,
  UpdatePurchaseDto,
} from "../types/purchase.types";

import type {
  Supplier,
} from "@/modules/suppliers/types/supplier.types";

// ============================================================
// PAGE
// ============================================================

export function PurchasesPage() {
  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    user,
  } = useAuth();

  const roleCode =
    user?.role?.code;

  const isAdmin =
    roleCode === "ADMIN";

  const isLogistics =
    roleCode === "LOGISTICS";

  // ==========================================================
  // PERMISOS
  //
  // ADMIN:
  // - visualización global
  // - puede crear para cualquier unidad
  //
  // LOGISTICS:
  // - puede crear O.C.
  // - puede editar O.C.
  // - puede eliminar O.C.
  // - puede recepcionar O.C.
  // - backend fuerza su propia unidad
  // - backend solo devuelve O.C. de su unidad
  // ==========================================================

  const canCreate =
    isAdmin ||
    isLogistics;

  const canEdit =
    isAdmin ||
    isLogistics;

  const canDelete =
    isAdmin ||
    isLogistics;

  const canReceive =
    isAdmin ||
    isLogistics;

  // ==========================================================
  // ÓRDENES DE COMPRA
  // ==========================================================

  const {
    data:
      purchases = [],

    isLoading,

    isError,
  } = usePurchases();

  // ==========================================================
  // PROVEEDORES
  //
  // IMPORTANTE:
  // Se consultan directamente aquí para no depender de
  // "@/modules/suppliers/hooks/useSuppliers", que actualmente
  // no existe físicamente en tu proyecto.
  //
  // Todos los ADMIN y LOGISTICS reciben el mismo catálogo.
  // ==========================================================

  const {
    data:
      suppliers = [],

    isLoading:
      isLoadingSuppliers,

    isError:
      isSuppliersError,
  } = useQuery<Supplier[]>({
    queryKey: [
      "suppliers",
    ],

    queryFn:
      async () => {
        const response =
          await api.get<Supplier[]>(
            "/suppliers",
          );

        return response.data;
      },

    staleTime:
      30_000,
  });

  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  const {
    data:
      products = [],
  } = useProducts();

  // ==========================================================
  // REQUERIMIENTOS
  //
  // El backend se encarga de que LOGISTICS reciba únicamente
  // los requerimientos de su propia unidad.
  // ==========================================================

  const {
    data:
      requests = [],
  } = useRequests();

  // ==========================================================
  // ALMACENES
  // ==========================================================

  const {
    data:
      warehouses = [],
  } = useWarehouses();

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const createPurchase =
    useCreatePurchase();

  const updatePurchase =
    useUpdatePurchase();

  const deletePurchase =
    useDeletePurchase();

  const receivePurchase =
    useReceivePurchase();

  const downloadPdf =
    useDownloadPurchasePdf();

  const downloadExcel =
    useDownloadPurchaseExcel();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editingPurchase,
    setEditingPurchase,
  ] =
    useState<Purchase | null>(
      null,
    );

  const [
    detailPurchase,
    setDetailPurchase,
  ] =
    useState<Purchase | null>(
      null,
    );

  const [
    receivingPurchase,
    setReceivingPurchase,
  ] =
    useState<Purchase | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    downloadingPdfId,
    setDownloadingPdfId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    downloadingExcelId,
    setDownloadingExcelId,
  ] =
    useState<number | null>(
      null,
    );

  // ==========================================================
  // FILTRADO
  // ==========================================================

  const filteredPurchases =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return purchases;
        }

        return purchases.filter(
          (
            purchase,
          ) => {
            const orderNumber =
              purchase
                .purchaseOrderNumber
                ?.toLowerCase() ??
              "";

            const quotation =
              purchase
                .quotationNumber
                ?.toLowerCase() ??
              "";

            const supplierName =
              purchase
                .supplier
                ?.name
                ?.toLowerCase() ??
              "";

            const supplierRuc =
              purchase
                .supplier
                ?.ruc
                ?.toLowerCase() ??
              "";

            const requestNumber =
              purchase
                .request
                ?.requestNumber
                ?.toLowerCase() ??
              "";

            const warehouseName =
              purchase
                .warehouse
                ?.name
                ?.toLowerCase() ??
              "";

            const currency =
              purchase
                .currency
                ?.toLowerCase() ??
              "";

            const status =
              purchase
                .status
                ?.toLowerCase() ??
              "";

            const productMatch =
              purchase
                .details
                ?.some(
                  (
                    detail,
                  ) => {
                    const name =
                      detail
                        .product
                        ?.name
                        ?.toLowerCase() ??
                      "";

                    const code =
                      detail
                        .product
                        ?.internalCode
                        ?.toLowerCase() ??
                      "";

                    const sku =
                      detail
                        .product
                        ?.sku
                        ?.toLowerCase() ??
                      "";

                    return (
                      name.includes(
                        term,
                      ) ||
                      code.includes(
                        term,
                      ) ||
                      sku.includes(
                        term,
                      )
                    );
                  },
                ) ??
              false;

            return (
              orderNumber.includes(
                term,
              ) ||
              quotation.includes(
                term,
              ) ||
              supplierName.includes(
                term,
              ) ||
              supplierRuc.includes(
                term,
              ) ||
              requestNumber.includes(
                term,
              ) ||
              warehouseName.includes(
                term,
              ) ||
              currency.includes(
                term,
              ) ||
              status.includes(
                term,
              ) ||
              productMatch
            );
          },
        );
      },
      [
        purchases,
        search,
      ],
    );

  // ==========================================================
  // CREAR
  // ==========================================================

  const handleCreate =
    async (
      data:
        CreatePurchaseDto,
    ) => {
      setActionError("");

      try {
        await createPurchase.mutateAsync(
          data,
        );

        setCreateOpen(
          false,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error creando Orden de Compra:",
          error,
        );

        const message =
          error
            ?.response
            ?.data
            ?.message;

        setActionError(
          Array.isArray(
            message,
          )
            ? message.join(
                " ",
              )
            : message ??
                "No se pudo crear la Orden de Compra.",
        );
      }
    };

  // ==========================================================
  // EDITAR
  // ==========================================================

  const handleUpdate =
    async (
      data:
        CreatePurchaseDto,
    ) => {
      if (
        !editingPurchase
      ) {
        return;
      }

      setActionError("");

      try {
        const updateData:
          UpdatePurchaseDto = {
          ...data,
        };

        await updatePurchase.mutateAsync({
          id:
            editingPurchase.id,

          data:
            updateData,
        });

        setEditingPurchase(
          null,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error actualizando Orden de Compra:",
          error,
        );

        const message =
          error
            ?.response
            ?.data
            ?.message;

        setActionError(
          Array.isArray(
            message,
          )
            ? message.join(
                " ",
              )
            : message ??
                "No se pudo actualizar la Orden de Compra.",
        );
      }
    };

  // ==========================================================
  // ELIMINAR
  // ==========================================================

  const handleDelete =
    async (
      purchase:
        Purchase,
    ) => {
      const confirmed =
        window.confirm(
          `¿Deseas eliminar la Orden de Compra ${purchase.purchaseOrderNumber}?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await deletePurchase.mutateAsync(
          purchase.id,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error eliminando Orden de Compra:",
          error,
        );

        const message =
          error
            ?.response
            ?.data
            ?.message;

        setActionError(
          Array.isArray(
            message,
          )
            ? message.join(
                " ",
              )
            : message ??
                "No se pudo eliminar la Orden de Compra.",
        );
      }
    };

  // ==========================================================
  // RECEPCIONAR
  // ==========================================================

  const handleReceive =
    async (
      warehouseId:
        number,
    ) => {
      if (
        !receivingPurchase
      ) {
        return;
      }

      setActionError("");

      try {
        await receivePurchase.mutateAsync({
          id:
            receivingPurchase.id,

          data: {
            warehouseId,
          },
        });

        setReceivingPurchase(
          null,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error recepcionando O.C.:",
          error,
        );

        const message =
          error
            ?.response
            ?.data
            ?.message;

        setActionError(
          Array.isArray(
            message,
          )
            ? message.join(
                " ",
              )
            : message ??
                "No se pudo recepcionar la Orden de Compra.",
        );
      }
    };

  // ==========================================================
  // PDF
  // ==========================================================

  const handleDownloadPdf =
    async (
      purchase:
        Purchase,
    ) => {
      setDownloadingPdfId(
        purchase.id,
      );

      setActionError("");

      try {
        await downloadPdf.mutateAsync(
          purchase,
        );
      } catch (
        error
      ) {
        console.error(
          "Error descargando PDF:",
          error,
        );

        setActionError(
          "No se pudo descargar el PDF de la Orden de Compra.",
        );
      } finally {
        setDownloadingPdfId(
          null,
        );
      }
    };

  // ==========================================================
  // EXCEL
  // ==========================================================

  const handleDownloadExcel =
    async (
      purchase:
        Purchase,
    ) => {
      setDownloadingExcelId(
        purchase.id,
      );

      setActionError("");

      try {
        await downloadExcel.mutateAsync(
          purchase,
        );
      } catch (
        error
      ) {
        console.error(
          "Error descargando Excel:",
          error,
        );

        setActionError(
          "No se pudo descargar el Excel de la Orden de Compra.",
        );
      } finally {
        setDownloadingExcelId(
          null,
        );
      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    isLoading ||
    isLoadingSuppliers
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Órdenes de Compra
        </h1>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          Cargando Órdenes de Compra...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    isError ||
    isSuppliersError
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Órdenes de Compra
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
          No se pudieron cargar los datos de Órdenes de Compra.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <ShoppingCart className="text-orange-500" />

          Órdenes de Compra
        </h1>

        <p className="mt-1 text-gray-500">
          Gestión de compras y abastecimiento por unidad minera
        </p>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <PurchaseStats
        purchases={
          purchases
        }
      />

      {/* =====================================================
          ERROR DE ACCIÓN
      ===================================================== */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {
              actionError
            }
          </p>

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="text-sm font-semibold text-red-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[500px]">
          <Search
            size={
              18
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <Input
            className="pl-10"
            placeholder="Buscar O.C., proveedor, requerimiento, producto o unidad..."
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        {canCreate && (
          <Button
            type="button"
            className="flex items-center gap-2"
            onClick={() => {
              setActionError("");

              setCreateOpen(
                true,
              );
            }}
          >
            <Plus
              size={
                18
              }
            />

            Nueva Orden de Compra
          </Button>
        )}
      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <PurchaseTable
        purchases={
          filteredPurchases
        }

        canEdit={
          canEdit
        }

        canDelete={
          canDelete
        }

        canReceive={
          canReceive
        }

        onView={
          setDetailPurchase
        }

        onEdit={
          setEditingPurchase
        }

        onDelete={
          handleDelete
        }

        onReceive={
          setReceivingPurchase
        }

        onDownloadPdf={
          handleDownloadPdf
        }

        onDownloadExcel={
          handleDownloadExcel
        }

        downloadingPdfId={
          downloadingPdfId
        }

        downloadingExcelId={
          downloadingExcelId
        }
      />

      {/* =====================================================
          MODAL CREAR
      ===================================================== */}

      <PurchaseModal
        open={
          createOpen
        }

        suppliers={
          suppliers
        }

        products={
          products
        }

        requests={
          requests
        }

        warehouses={
          warehouses
        }

        loading={
          createPurchase.isPending
        }

        currentUser={
          user
        }

        onClose={() => {
          if (
            createPurchase.isPending
          ) {
            return;
          }

          setCreateOpen(
            false,
          );
        }}

        onSubmit={
          handleCreate
        }
      />

      {/* =====================================================
          MODAL EDITAR
      ===================================================== */}

      <PurchaseModal
        open={
          editingPurchase !==
          null
        }

        suppliers={
          suppliers
        }

        products={
          products
        }

        requests={
          requests
        }

        warehouses={
          warehouses
        }

        loading={
          updatePurchase.isPending
        }

        currentUser={
          user
        }

        defaultValues={
          editingPurchase
            ? {
                warehouseId:
                  editingPurchase
                    .warehouse
                    ?.id,

                requestId:
                  editingPurchase
                    .request
                    ?.id,

                supplierId:
                  editingPurchase
                    .supplier
                    .id,

                purchaseDate:
                  editingPurchase
                    .purchaseDate ??
                  undefined,

                quotationNumber:
                  editingPurchase
                    .quotationNumber ??
                  undefined,

                currency:
                  editingPurchase
                    .currency,

                applyIgv:
                  editingPurchase
                    .applyIgv,

                commercialConditions:
                  editingPurchase
                    .commercialConditions ??
                  undefined,

                paymentMethod:
                  editingPurchase
                    .paymentMethod ??
                  undefined,

                observation:
                  editingPurchase
                    .observation ??
                  undefined,

                details:
                  editingPurchase
                    .details
                    .map(
                      (
                        detail,
                      ) => ({
                        productId:
                          detail
                            .product
                            .id,

                        quantity:
                          Number(
                            detail
                              .quantity,
                          ),

                        unitPrice:
                          Number(
                            detail
                              .unitPrice,
                          ),
                      }),
                    ),
              }
            : undefined
        }

        onClose={() => {
          if (
            updatePurchase.isPending
          ) {
            return;
          }

          setEditingPurchase(
            null,
          );
        }}

        onSubmit={
          handleUpdate
        }
      />

      {/* =====================================================
          DETALLE
      ===================================================== */}

      <PurchaseDetailModal
        open={
          detailPurchase !==
          null
        }

        purchase={
          detailPurchase
        }

        onClose={() =>
          setDetailPurchase(
            null,
          )
        }
      />

      {/* =====================================================
          RECEPCIÓN
      ===================================================== */}

      <ReceivePurchaseModal
        open={
          receivingPurchase !==
          null
        }

        purchase={
          receivingPurchase
        }

        warehouses={
          warehouses
        }

        currentUser={
          user
        }

        loading={
          receivePurchase.isPending
        }

        onClose={() => {
          if (
            receivePurchase.isPending
          ) {
            return;
          }

          setReceivingPurchase(
            null,
          );
        }}

        onSubmit={
          handleReceive
        }
      />
    </div>
  );
}