import {
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
} from "lucide-react";

import { useAuth } from "@/modules/auth/contexts/AuthContexts";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import { useProducts } from "@/modules/products/hooks/useProducts";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  ApproveRequestModal,
} from "../components/ApproveRequestModal";

import {
  RejectRequestModal,
} from "../components/RejectRequestModal";

import {
  RequestDetailModal,
} from "../components/RequestDetailModal";

import {
  RequestModal,
} from "../components/RequestModal";

import {
  RequestStats,
} from "../components/RequestStats";

import {
  RequestTable,
} from "../components/RequestTable";

import {
  useApproveRequest,
  useCreateRequest,
  useDownloadRequestExcel,
  useDownloadRequestPdf,
  useRejectRequest,
  useRequests,
} from "../hooks/useRequests";

import type {
  ApproveRequestDto,
  CreateRequestDto,
  RejectRequestDto,
  Request,
} from "../types/request.types";

export function RequestsPage() {
  // ============================================================
  // AUTH
  // ============================================================

  const {
    user,
  } = useAuth();

  const roleCode =
    user?.role?.code;

  const isAdmin =
    roleCode ===
    "ADMIN";

  // ============================================================
  // PERMISOS
  // ============================================================

  /*
   * Gerencia / ADMIN revisa y aprueba.
   *
   * Ya no existe permiso de despacho dentro de este módulo.
   */

  const canApprove =
    isAdmin;

  /*
   * ADMIN y LOGISTICS pueden generar requerimientos.
   * Las restricciones de almacén siguen siendo validadas
   * por el backend.
   */

  const canCreate =
    Boolean(
      user,
    );

  // ============================================================
  // DATA
  // ============================================================

  const {
    data:
      requests = [],

    isLoading,

    isError,
  } =
    useRequests();

  const {
    data:
      products = [],
  } =
    useProducts();

  const {
    data:
      warehouses = [],
  } =
    useWarehouses();

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createRequest =
    useCreateRequest();

  const approveRequest =
    useApproveRequest();

  const rejectRequest =
    useRejectRequest();

  const downloadPdf =
    useDownloadRequestPdf();

  const downloadExcel =
    useDownloadRequestExcel();

  // ============================================================
  // BÚSQUEDA
  // ============================================================

  const [
    search,
    setSearch,
  ] =
    useState("");

  // ============================================================
  // MODALES
  // ============================================================

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(
      false,
    );

  const [
    detailTarget,
    setDetailTarget,
  ] =
    useState<Request | null>(
      null,
    );

  const [
    approveTarget,
    setApproveTarget,
  ] =
    useState<Request | null>(
      null,
    );

  const [
    rejectTarget,
    setRejectTarget,
  ] =
    useState<Request | null>(
      null,
    );

  // ============================================================
  // ERRORES
  // ============================================================

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  // ============================================================
  // FILTRADO
  // ============================================================

  const filteredRequests =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return requests;
        }

        return requests.filter(
          (
            request,
          ) => {
            const number =
              request.requestNumber
                ?.toLowerCase() ??
              "";

            const requester =
              request.requester
                ?.toLowerCase() ??
              "";

            const warehouse =
              request.warehouse
                ?.name
                ?.toLowerCase() ??
              "";

            const status =
              request.status
                ?.toLowerCase() ??
              "";

            const productMatch =
              request.details.some(
                (
                  detail,
                ) =>
                  detail.product.name
                    .toLowerCase()
                    .includes(
                      term,
                    ),
              );

            return (
              number.includes(
                term,
              ) ||
              requester.includes(
                term,
              ) ||
              warehouse.includes(
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
        requests,
        search,
      ],
    );

  // ============================================================
  // SOLICITANTE POR DEFECTO
  // ============================================================

  const requesterName =
    user
      ? [
          user.firstName,
          user.lastName,
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          )
      : "";

  // ============================================================
  // CREAR REQUERIMIENTO
  // ============================================================

  const handleCreate =
    async (
      data:
        CreateRequestDto,
    ) => {
      setActionError(
        "",
      );

      try {
        await createRequest
          .mutateAsync(
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
          "Error creando requerimiento:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo crear el requerimiento. Revisa los datos e inténtalo nuevamente.",
        );
      }
    };

  // ============================================================
  // APROBAR
  //
  // El modal permite que Gerencia indique cuánto aprueba
  // de cada producto.
  //
  // Backend determina:
  //
  // todo aprobado       -> APPROVED
  // parte aprobada      -> PARTIAL
  // nada aprobado       -> REJECTED
  //
  // Aquí NO existe movimiento de inventario.
  // ============================================================

  const handleApprove =
    async (
      data:
        ApproveRequestDto,
    ) => {
      if (
        !approveTarget
      ) {
        return;
      }

      setActionError(
        "",
      );

      try {
        await approveRequest
          .mutateAsync({
            id:
              approveTarget.id,

            data,
          });

        setApproveTarget(
          null,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error aprobando requerimiento:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo aprobar el requerimiento.",
        );
      }
    };

  // ============================================================
  // RECHAZAR
  // ============================================================

  const handleReject =
    async (
      data:
        RejectRequestDto,
    ) => {
      if (
        !rejectTarget
      ) {
        return;
      }

      setActionError(
        "",
      );

      try {
        await rejectRequest
          .mutateAsync({
            id:
              rejectTarget.id,

            data,
          });

        setRejectTarget(
          null,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error rechazando requerimiento:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo rechazar el requerimiento.",
        );
      }
    };

  // ============================================================
  // PDF
  // ============================================================

  const handleDownloadPdf =
    async (
      request:
        Request,
    ) => {
      setActionError(
        "",
      );

      try {
        await downloadPdf
          .mutateAsync(
            request,
          );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error descargando PDF:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo descargar el PDF del requerimiento.",
        );
      }
    };

  // ============================================================
  // EXCEL
  // ============================================================

  const handleDownloadExcel =
    async (
      request:
        Request,
    ) => {
      setActionError(
        "",
      );

      try {
        await downloadExcel
          .mutateAsync(
            request,
          );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error descargando Excel:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo descargar el Excel del requerimiento.",
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Requerimientos
          </h1>

          <p className="mt-1 text-gray-500">
            Gestión y aprobación de requerimientos de materiales
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="animate-pulse text-gray-500">
            Cargando requerimientos...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR DE CARGA
  // ============================================================

  if (
    isError
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Requerimientos
        </h1>

        <div className="rounded-xl border border-red-200 bg-white p-12 text-center">
          <p className="font-medium text-red-600">
            No se pudieron cargar los requerimientos.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PÁGINA
  // ============================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Requerimientos
        </h1>

        <p className="mt-1 text-gray-500">
          Registro, revisión y aprobación de materiales solicitados por las unidades
        </p>
      </div>

      {/* =====================================================
          ESTADÍSTICAS
      ===================================================== */}

      <RequestStats
        requests={
          requests
        }
      />

      {/* =====================================================
          ERROR DE ACCIÓN
      ===================================================== */}

      {actionError && (
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          "
        >
          <p className="text-sm text-red-600">
            {
              actionError
            }
          </p>

          <button
            type="button"
            onClick={() =>
              setActionError(
                "",
              )
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

      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          {/* BÚSQUEDA */}

          <div
            className="
              relative
              w-full
              md:w-96
            "
          >
            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <Input
              className="pl-10"
              value={
                search
              }
              placeholder="Buscar requerimiento, mina o producto..."
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          {/* NUEVO REQUERIMIENTO */}

          {canCreate && (
            <Button
              type="button"
              onClick={() => {
                setActionError(
                  "",
                );

                setCreateOpen(
                  true,
                );
              }}
              className="flex items-center gap-2"
            >
              <Plus
                size={18}
              />

              Nuevo requerimiento
            </Button>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <RequestTable
        requests={
          filteredRequests
        }

        canApprove={
          canApprove
        }

        onView={
          setDetailTarget
        }

        onApprove={
          setApproveTarget
        }

        onReject={
          setRejectTarget
        }

        onDownloadPdf={
          handleDownloadPdf
        }

        onDownloadExcel={
          handleDownloadExcel
        }
      />

      {/* =====================================================
          NUEVO REQUERIMIENTO
      ===================================================== */}

      <RequestModal
        open={
          createOpen
        }

        isAdmin={
          isAdmin
        }

        requesterName={
          requesterName
        }

        products={
          products
        }

        warehouses={
          warehouses
        }

        loading={
          createRequest
            .isPending
        }

        onClose={() => {
          if (
            createRequest
              .isPending
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
          DETALLE
      ===================================================== */}

      <RequestDetailModal
        open={
          detailTarget !==
          null
        }

        request={
          detailTarget
        }

        onClose={() =>
          setDetailTarget(
            null,
          )
        }
      />

      {/* =====================================================
          APROBAR
      ===================================================== */}

      <ApproveRequestModal
        open={
          approveTarget !==
          null
        }

        request={
          approveTarget
        }

        loading={
          approveRequest
            .isPending
        }

        onClose={() => {
          if (
            approveRequest
              .isPending
          ) {
            return;
          }

          setApproveTarget(
            null,
          );
        }}

        onSubmit={
          handleApprove
        }
      />

      {/* =====================================================
          RECHAZAR
      ===================================================== */}

      <RejectRequestModal
        open={
          rejectTarget !==
          null
        }

        request={
          rejectTarget
        }

        loading={
          rejectRequest
            .isPending
        }

        onClose={() => {
          if (
            rejectRequest
              .isPending
          ) {
            return;
          }

          setRejectTarget(
            null,
          );
        }}

        onSubmit={
          handleReject
        }
      />
    </div>
  );
}