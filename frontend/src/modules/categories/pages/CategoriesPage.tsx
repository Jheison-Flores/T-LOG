import {
  useMemo,
  useState,
} from "react";

import {
  Layers3,
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

import {
  CategoryModal,
} from "../components/CategoryModal";

import {
  CategoryStats,
} from "../components/CategoryStats";

import {
  CategoryTable,
} from "../components/CategoryTable";


import {
  useActivateCategory,
  useCategories,
  useCreateCategory,
  useDeactivateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";

import type {
  Category,
  CreateCategoryDto,
} from "../types/category.types";

export function CategoriesPage() {
  const {
    user,
  } = useAuth();

  const isAdmin =
    user?.role?.code ===
    "ADMIN";

  // ============================================================
  // CONSULTA
  // ============================================================

  const {
    data:
      categories = [],
    isLoading,
    isError,
  } = useCategories();

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createCategory =
    useCreateCategory();

  const updateCategory =
    useUpdateCategory();

  const activateCategory =
    useActivateCategory();

  const deactivateCategory =
    useDeactivateCategory();

  const deleteCategory =
    useDeleteCategory();

  // ============================================================
  // ESTADOS
  // ============================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    | "ALL"
    | "ACTIVE"
    | "INACTIVE"
  >("ALL");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] =
    useState<Category | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] = useState("");

  // ============================================================
  // FILTRADO
  // ============================================================

  const filteredCategories =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return categories.filter(
        (
          category,
        ) => {
          if (
            statusFilter ===
              "ACTIVE" &&
            !category.isActive
          ) {
            return false;
          }

          if (
            statusFilter ===
              "INACTIVE" &&
            category.isActive
          ) {
            return false;
          }

          if (!term) {
            return true;
          }

          return (
            category.name
              .toLowerCase()
              .includes(
                term,
              ) ||
            category.code
              .toLowerCase()
              .includes(
                term,
              ) ||
            (
              category.description ??
              ""
            )
              .toLowerCase()
              .includes(
                term,
              )
          );
        },
      );
    }, [
      categories,
      search,
      statusFilter,
    ]);

  // ============================================================
  // CREAR / EDITAR
  // ============================================================

  const handleSubmit =
    async (
      data:
        CreateCategoryDto,
    ) => {
      setActionError("");

      try {
        if (
          editingCategory
        ) {
          await updateCategory.mutateAsync({
            id:
              editingCategory.id,

            data,
          });
        } else {
          await createCategory.mutateAsync(
            data,
          );
        }

        setModalOpen(
          false,
        );

        setEditingCategory(
          null,
        );
      } catch (
        error
      ) {
        console.error(
          "Error guardando categoría:",
          error,
        );

        setActionError(
          "No se pudo guardar la categoría. Verifica que el código o nombre no estén registrados.",
        );
      }
    };

  // ============================================================
  // ACTIVAR
  // ============================================================

  const handleActivate =
    async (
      category:
        Category,
    ) => {
      setActionError("");

      try {
        await activateCategory.mutateAsync(
          category.id,
        );
      } catch (
        error
      ) {
        console.error(
          "Error activando categoría:",
          error,
        );

        setActionError(
          "No se pudo activar la categoría.",
        );
      }
    };

  // ============================================================
  // DESACTIVAR
  // ============================================================

  const handleDeactivate =
    async (
      category:
        Category,
    ) => {
      const confirmed =
        window.confirm(
          `¿Deseas desactivar la categoría "${category.name}"?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await deactivateCategory.mutateAsync(
          category.id,
        );
      } catch (
        error
      ) {
        console.error(
          "Error desactivando categoría:",
          error,
        );

        setActionError(
          "No se pudo desactivar la categoría.",
        );
      }
    };

  // ============================================================
  // ELIMINAR
  // ============================================================

  const handleDelete =
    async (
      category:
        Category,
    ) => {
      const confirmed =
        window.confirm(
          `¿Eliminar definitivamente la categoría "${category.name}"?\n\nEsta acción no se puede deshacer.`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await deleteCategory.mutateAsync(
          category.id,
        );
      } catch (
        error
      ) {
        console.error(
          "Error eliminando categoría:",
          error,
        );

        setActionError(
          "No se pudo eliminar la categoría. Es posible que esté siendo utilizada por uno o más productos. En ese caso, desactívala en lugar de eliminarla.",
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categorías
          </h1>

          <p className="mt-1 text-gray-500">
            Organización del catálogo de productos
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="animate-pulse text-gray-500">
            Cargando categorías...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Categorías
        </h1>

        <div className="rounded-xl border border-red-200 bg-white p-12 text-center">
          <p className="font-medium text-red-600">
            No se pudieron cargar las categorías.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-orange-50
                text-orange-600
              "
            >
              <Layers3
                size={
                  22
                }
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Categorías
              </h1>

              <p className="mt-1 text-gray-500">
                Organización del catálogo de productos
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Button
            type="button"
            onClick={() => {
              setActionError(
                "",
              );

              setEditingCategory(
                null,
              );

              setModalOpen(
                true,
              );
            }}
            className="flex items-center gap-2"
          >
            <Plus
              size={
                18
              }
            />

            Nueva categoría
          </Button>
        )}
      </div>

      {/* ESTADÍSTICAS */}

      <CategoryStats
        categories={
          categories
        }
      />

      {/* ERROR */}

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

      {/* FILTROS */}

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
          <div
            className="
              relative
              w-full
              md:w-96
            "
          >
            <Search
              size={
                18
              }
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
              placeholder="Buscar nombre, código o descripción..."
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
                event.target
                  .value as
                  | "ALL"
                  | "ACTIVE"
                  | "INACTIVE",
              )
            }
            className="
              h-10
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
            <option value="ALL">
              Todos los estados
            </option>

            <option value="ACTIVE">
              Activas
            </option>

            <option value="INACTIVE">
              Inactivas
            </option>
          </select>
        </div>
      </div>

      {/* TABLA */}

      <CategoryTable
        categories={
          filteredCategories
        }
        isAdmin={
          isAdmin
        }
        changingStatus={
          activateCategory.isPending ||
          deactivateCategory.isPending
        }
        deleting={
          deleteCategory.isPending
        }
        onEdit={(
          category,
        ) => {
          setActionError(
            "",
          );

          setEditingCategory(
            category,
          );

          setModalOpen(
            true,
          );
        }}
        onActivate={
          handleActivate
        }
        onDeactivate={
          handleDeactivate
        }
        onDelete={
          handleDelete
        }
      />

      {/* MODAL */}

      <CategoryModal
        open={
          modalOpen
        }
        category={
          editingCategory
        }
        loading={
          createCategory.isPending ||
          updateCategory.isPending
        }
        onClose={() => {
          if (
            createCategory.isPending ||
            updateCategory.isPending
          ) {
            return;
          }

          setModalOpen(
            false,
          );

          setEditingCategory(
            null,
          );
        }}
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}