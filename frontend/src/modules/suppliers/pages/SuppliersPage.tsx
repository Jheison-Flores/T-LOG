import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Plus,
  Search,
  Truck,
  Users,
  UserCheck,
  UserX,
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
  api,
} from "@/services/api";

import {
  SupplierModal,
} from "../components/SupplierModal";

import {
  SupplierTable,
} from "../components/SupplierTable";

import type {
  CreateSupplierDto,
  Supplier,
  UpdateSupplierDto,
} from "../types/supplier.types";

// ============================================================
// RESPUESTA DELETE
// ============================================================

interface DeleteSupplierResponse {
  message: string;
}

// ============================================================
// PAGE
// ============================================================

export function SuppliersPage() {
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

  // ==========================================================
  // QUERY CLIENT
  // ==========================================================

  const queryClient =
    useQueryClient();

  // ==========================================================
  // PROVEEDORES
  // ==========================================================

  const {
    data:
      suppliers = [],

    isLoading,

    isError,
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
  // CREAR
  // ==========================================================

  const createSupplier =
    useMutation({
      mutationFn:
        async (
          data:
            CreateSupplierDto,
        ) => {
          const response =
            await api.post<Supplier>(
              "/suppliers",
              data,
            );

          return response.data;
        },

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "suppliers",
            ],
          });

          await queryClient.invalidateQueries({
            queryKey: [
              "purchases",
            ],
          });
        },
    });

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  const updateSupplier =
    useMutation({
      mutationFn:
        async ({
          id,
          data,
        }: {
          id: number;
          data: UpdateSupplierDto;
        }) => {
          const response =
            await api.patch<Supplier>(
              `/suppliers/${id}`,
              data,
            );

          return response.data;
        },

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "suppliers",
            ],
          });

          await queryClient.invalidateQueries({
            queryKey: [
              "purchases",
            ],
          });
        },
    });

  // ==========================================================
  // ELIMINAR
  // ==========================================================

  const deleteSupplier =
    useMutation({
      mutationFn:
        async (
          id:
            number,
        ) => {
          const response =
            await api.delete<DeleteSupplierResponse>(
              `/suppliers/${id}`,
            );

          return response.data;
        },

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "suppliers",
            ],
          });

          await queryClient.invalidateQueries({
            queryKey: [
              "purchases",
            ],
          });
        },
    });

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    editingSupplier,
    setEditingSupplier,
  ] =
    useState<Supplier | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  // ==========================================================
  // FILTRADO
  // ==========================================================

  const filteredSuppliers =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return suppliers;
        }

        return suppliers.filter(
          (
            supplier,
          ) => {
            const name =
              supplier.name
                ?.toLowerCase() ??
              "";

            const ruc =
              supplier.ruc
                ?.toLowerCase() ??
              "";

            const phone =
              supplier.phone
                ?.toLowerCase() ??
              "";

            const email =
              supplier.email
                ?.toLowerCase() ??
              "";

            const address =
              supplier.address
                ?.toLowerCase() ??
              "";

            return (
              name.includes(
                term,
              ) ||
              ruc.includes(
                term,
              ) ||
              phone.includes(
                term,
              ) ||
              email.includes(
                term,
              ) ||
              address.includes(
                term,
              )
            );
          },
        );
      },
      [
        suppliers,
        search,
      ],
    );

  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  const getErrorMessage =
    (
      error:
        any,
      fallback:
        string,
    ) => {
      const message =
        error?.response?.data?.message;

      if (
        Array.isArray(
          message,
        )
      ) {
        return message.join(
          " ",
        );
      }

      return (
        message ??
        fallback
      );
    };

  // ==========================================================
  // CREAR
  // ==========================================================

  const handleCreate =
    async (
      data:
        CreateSupplierDto,
    ) => {
      setActionError("");

      try {
        await createSupplier.mutateAsync(
          data,
        );

        setCreateOpen(
          false,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo registrar el proveedor.",
          ),
        );
      }
    };

  // ==========================================================
  // ACTUALIZAR
  // ==========================================================

  const handleUpdate =
    async (
      data:
        CreateSupplierDto,
    ) => {
      if (
        !editingSupplier
      ) {
        return;
      }

      setActionError("");

      try {
        await updateSupplier.mutateAsync({
          id:
            editingSupplier.id,

          data: {
            ...data,
          },
        });

        setEditingSupplier(
          null,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo actualizar el proveedor.",
          ),
        );
      }
    };

  // ==========================================================
  // ELIMINAR
  // ==========================================================

  const handleDelete =
    async (
      supplier:
        Supplier,
    ) => {
      const confirmed =
        window.confirm(
          `¿Deseas eliminar al proveedor "${supplier.name}"?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await deleteSupplier.mutateAsync(
          supplier.id,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo eliminar el proveedor.",
          ),
        );
      }
    };

  // ==========================================================
  // CONTADORES
  // ==========================================================

  const activeSuppliers =
    suppliers.filter(
      (
        supplier,
      ) =>
        supplier.isActive,
    ).length;

  const inactiveSuppliers =
    suppliers.length -
    activeSuppliers;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Proveedores
        </h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center text-gray-500 shadow-sm">
          Cargando proveedores...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    isError
  ) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Proveedores
        </h1>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          No se pudieron cargar los proveedores.
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-7 p-1">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <Truck
              size={
                24
              }
              className="text-orange-500"
            />
          </div>

          Proveedores
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Catálogo corporativo de proveedores disponible para todas las unidades
        </p>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total proveedores
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {
                  suppliers.length
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <Users
                size={
                  23
                }
                className="text-orange-500"
              />
            </div>
          </div>
        </div>

        {/* ACTIVOS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Proveedores activos
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {
                  activeSuppliers
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <UserCheck
                size={
                  23
                }
                className="text-green-600"
              />
            </div>
          </div>
        </div>

        {/* INACTIVOS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Proveedores inactivos
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-600">
                {
                  inactiveSuppliers
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <UserX
                size={
                  23
                }
                className="text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTION ERROR
      ===================================================== */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">
            {
              actionError
            }
          </p>

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search
            size={
              19
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <Input
            className="h-11 pl-11"
            value={
              search
            }
            placeholder="Buscar por proveedor, RUC, teléfono, correo o dirección..."
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
            className="flex min-h-11 items-center justify-center gap-2 px-5"
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

            Nuevo proveedor
          </Button>
        )}
      </div>

      {/* =====================================================
          RESULTADOS
      ===================================================== */}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          Mostrando{" "}
          <span className="font-semibold text-gray-700">
            {
              filteredSuppliers.length
            }
          </span>{" "}
          proveedores
        </p>
      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <SupplierTable
        suppliers={
          filteredSuppliers
        }

        canEdit={
          canEdit
        }

        canDelete={
          canDelete
        }

        onEdit={
          setEditingSupplier
        }

        onDelete={
          handleDelete
        }
      />

      {/* =====================================================
          CREAR
      ===================================================== */}

      <SupplierModal
        open={
          createOpen
        }

        loading={
          createSupplier.isPending
        }

        onClose={() => {
          if (
            createSupplier.isPending
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
          EDITAR
      ===================================================== */}

      <SupplierModal
        open={
          editingSupplier !==
          null
        }

        loading={
          updateSupplier.isPending
        }

        defaultValues={
          editingSupplier
            ? {
                name:
                  editingSupplier.name,

                ruc:
                  editingSupplier.ruc ??
                  undefined,

                address:
                  editingSupplier.address ??
                  undefined,

                phone:
                  editingSupplier.phone ??
                  undefined,

                email:
                  editingSupplier.email ??
                  undefined,

                isActive:
                  editingSupplier.isActive,
              }
            : undefined
        }

        onClose={() => {
          if (
            updateSupplier.isPending
          ) {
            return;
          }

          setEditingSupplier(
            null,
          );
        }}

        onSubmit={
          handleUpdate
        }
      />
    </div>
  );
}