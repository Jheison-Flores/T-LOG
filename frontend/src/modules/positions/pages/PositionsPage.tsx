import {
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Pencil,
  Plus,
  Power,
  Search,
  XCircle,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  PositionModal,
} from "../components/PositionModal";

import {
  useActivatePosition,
  useCreatePosition,
  useDeactivatePosition,
  usePositions,
  useUpdatePosition,
} from "../hooks/usePositions";

import type {
  CreatePositionDto,
  Position,
  UpdatePositionDto,
} from "../types/position.types";

export function PositionsPage() {
  const {
    data:
      positions = [],

    isLoading,

    isError,
  } = usePositions();

  const createPosition =
    useCreatePosition();

  const updatePosition =
    useUpdatePosition();

  const activatePosition =
    useActivatePosition();

  const deactivatePosition =
    useDeactivatePosition();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("ALL");

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    editingPosition,
    setEditingPosition,
  ] =
    useState<Position | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  const filteredPositions =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return positions.filter(
          (
            position,
          ) => {
            if (
              statusFilter ===
                "ACTIVE" &&
              !position.isActive
            ) {
              return false;
            }

            if (
              statusFilter ===
                "INACTIVE" &&
              position.isActive
            ) {
              return false;
            }

            if (!term) {
              return true;
            }

            const name =
              position.name
                ?.toLowerCase() ??
              "";

            const area =
              position.area
                ?.toLowerCase() ??
              "";

            const description =
              position.description
                ?.toLowerCase() ??
              "";

            return (
              name.includes(
                term,
              ) ||
              area.includes(
                term,
              ) ||
              description.includes(
                term,
              )
            );
          },
        );
      },
      [
        positions,
        search,
        statusFilter,
      ],
    );

  const activePositions =
    positions.filter(
      (
        position,
      ) =>
        position.isActive,
    ).length;

  const inactivePositions =
    positions.length -
    activePositions;

  const getErrorMessage = (
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

  const handleCreate =
    async (
      data:
        CreatePositionDto,
    ) => {
      setActionError("");

      try {
        await createPosition.mutateAsync(
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
            "No se pudo registrar el cargo.",
          ),
        );
      }
    };

  const handleUpdate =
    async (
      data:
        CreatePositionDto,
    ) => {
      if (
        !editingPosition
      ) {
        return;
      }

      setActionError("");

      try {
        const updateData:
          UpdatePositionDto = {
          name:
            data.name,

          area:
            data.area,

          description:
            data.description,
        };

        await updatePosition.mutateAsync({
          id:
            editingPosition.id,

          data:
            updateData,
        });

        setEditingPosition(
          null,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo actualizar el cargo.",
          ),
        );
      }
    };

  const handleActivate =
    async (
      position:
        Position,
    ) => {
      const confirmed =
        window.confirm(
          `¿Deseas activar el cargo "${position.name}"?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await activatePosition.mutateAsync(
          position.id,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo activar el cargo.",
          ),
        );
      }
    };

  const handleDeactivate =
    async (
      position:
        Position,
    ) => {
      const confirmed =
        window.confirm(
          `¿Deseas desactivar el cargo "${position.name}"?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await deactivatePosition.mutateAsync(
          position.id,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo desactivar el cargo.",
          ),
        );
      }
    };

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Cargos
        </h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center text-gray-500 shadow-sm">
          Cargando cargos...
        </div>
      </div>
    );
  }

  if (
    isError
  ) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Cargos
        </h1>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          No se pudieron cargar los cargos.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 p-1">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hr-background">
            <BriefcaseBusiness
              size={
                24
              }

              className="text-hr-primary"
            />
          </div>

          Cargos
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Catálogo de cargos y áreas del personal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total cargos
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              positions.length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Cargos activos
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {
                  activePositions
                }
              </p>
            </div>

            <CheckCircle2
              size={
                25
              }

              className="text-green-600"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Cargos inactivos
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-600">
                {
                  inactivePositions
                }
              </p>
            </div>

            <XCircle
              size={
                25
              }

              className="text-gray-500"
            />
          </div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {
            actionError
          }
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:flex-row">
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

              placeholder="Buscar cargo, área o descripción..."

              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <select
            value={
              statusFilter
            }

            onChange={(
              event,
            ) =>
              setStatusFilter(
                event.target.value,
              )
            }

            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">
              Todos
            </option>

            <option value="ACTIVE">
              Activos
            </option>

            <option value="INACTIVE">
              Inactivos
            </option>
          </select>
        </div>

        <Button
          type="button"

          className="flex min-h-11 shrink-0 items-center justify-center gap-2 px-5"

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

          Nuevo cargo
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Cargo
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Área
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Descripción
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredPositions.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      5
                    }

                    className="px-6 py-14 text-center text-gray-500"
                  >
                    No se encontraron cargos.
                  </td>
                </tr>
              ) : (
                filteredPositions.map(
                  (
                    position,
                  ) => (
                    <tr
                      key={
                        position.id
                      }

                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {
                          position.name
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {
                          position.area ||
                          "—"
                        }
                      </td>

                      <td className="max-w-md px-5 py-4 text-sm text-gray-600">
                        {
                          position.description ||
                          "—"
                        }
                      </td>

                      <td className="px-5 py-4 text-center">
                        {position.isActive ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"

                            title="Editar"

                            onClick={() =>
                              setEditingPosition(
                                position,
                              )
                            }

                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-hr-background hover:text-hr-primary"
                          >
                            <Pencil
                              size={
                                16
                              }
                            />
                          </button>

                          <button
                            type="button"

                            title={
                              position.isActive
                                ? "Desactivar"
                                : "Activar"
                            }

                            onClick={() =>
                              position.isActive
                                ? handleDeactivate(
                                    position,
                                  )
                                : handleActivate(
                                    position,
                                  )
                            }

                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                          >
                            <Power
                              size={
                                16
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PositionModal
        open={
          createOpen
        }

        loading={
          createPosition.isPending
        }

        onClose={() =>
          setCreateOpen(
            false,
          )
        }

        onSubmit={
          handleCreate
        }
      />

      <PositionModal
        open={
          editingPosition !==
          null
        }

        loading={
          updatePosition.isPending
        }

        defaultValues={
          editingPosition
            ? {
                name:
                  editingPosition.name,

                area:
                  editingPosition.area,

                description:
                  editingPosition.description,
              }
            : undefined
        }

        onClose={() =>
          setEditingPosition(
            null,
          )
        }

        onSubmit={
          handleUpdate
        }
      />
    </div>
  );
}