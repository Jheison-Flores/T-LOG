import {
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  UsersRound,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  useRoles,
} from "@/modules/roles/hooks/useRoles";

import {
  UserModal,
} from "../components/UserModal";

import {
  UserStats,
} from "../components/UserStats";

import {
  UserTable,
} from "../components/UserTable";

import {
  useActivateUser,
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
  useUsers,
} from "../hooks/useUsers";

import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "../types/user.types";

export function UsersPage() {

  const {
    data:
      users = [],
    isLoading,
    isError,
  } = useUsers();

  const {
    data:
      roles = [],
  } = useRoles();

  const {
    data:
      warehouses = [],
  } = useWarehouses();

  const createUser =
    useCreateUser();

  const updateUser =
    useUpdateUser();

  const activateUser =
    useActivateUser();

  const deactivateUser =
    useDeactivateUser();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("ALL");

  const [
    warehouseFilter,
    setWarehouseFilter,
  ] = useState("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] = useState("");

  // ============================================================
  // FILTRAR
  // ============================================================

  const filteredUsers =
    useMemo(() => {

      const term =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {

          if (
            statusFilter ===
              "ACTIVE" &&
            !user.isActive
          ) {
            return false;
          }

          if (
            statusFilter ===
              "INACTIVE" &&
            user.isActive
          ) {
            return false;
          }

          if (
            roleFilter !==
              "ALL" &&
            String(
              user.role.id,
            ) !==
              roleFilter
          ) {
            return false;
          }

          if (
            warehouseFilter ===
              "NONE" &&
            user.warehouse
          ) {
            return false;
          }

          if (
            warehouseFilter !==
              "ALL" &&
            warehouseFilter !==
              "NONE" &&
            String(
              user.warehouse?.id ??
                "",
            ) !==
              warehouseFilter
          ) {
            return false;
          }

          if (!term) {
            return true;
          }

          const fullName =
            `${user.firstName} ${user.lastName}`
              .toLowerCase();

          const warehouse =
            user.warehouse
              ?.name
              ?.toLowerCase() ??
            "";

          return (
            fullName.includes(
              term,
            ) ||
            user.username
              .toLowerCase()
              .includes(
                term,
              ) ||
            user.email
              .toLowerCase()
              .includes(
                term,
              ) ||
            (
              user.position ??
              ""
            )
              .toLowerCase()
              .includes(
                term,
              ) ||
            user.role.name
              .toLowerCase()
              .includes(
                term,
              ) ||
            warehouse.includes(
              term,
            )
          );
        },
      );

    }, [
      users,
      search,
      roleFilter,
      warehouseFilter,
      statusFilter,
    ]);

  // ============================================================
  // GUARDAR
  // ============================================================

  const handleSubmit =
    async (
      data:
        | CreateUserDto
        | UpdateUserDto,
    ) => {

      setActionError("");

      try {

        if (editingUser) {

          await updateUser.mutateAsync({
            id:
              editingUser.id,

            data:
              data as UpdateUserDto,
          });

        } else {

          await createUser.mutateAsync(
            data as CreateUserDto,
          );

        }

        setModalOpen(
          false,
        );

        setEditingUser(
          null,
        );

      } catch (error) {

        console.error(
          "Error guardando usuario:",
          error,
        );

        setActionError(
          "No se pudo guardar el usuario. Verifica que el username y correo no estén registrados.",
        );
      }
    };

  // ============================================================
  // ACTIVAR
  // ============================================================

  const handleActivate =
    async (
      user: User,
    ) => {

      setActionError("");

      try {

        await activateUser.mutateAsync(
          user.id,
        );

      } catch (error) {

        console.error(
          "Error activando usuario:",
          error,
        );

        setActionError(
          "No se pudo activar el usuario.",
        );
      }
    };

  // ============================================================
  // DESACTIVAR
  // ============================================================

  const handleDeactivate =
    async (
      user: User,
    ) => {

      const confirmed =
        window.confirm(
          `¿Deseas desactivar al usuario "${user.firstName} ${user.lastName}"?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {

        await deactivateUser.mutateAsync(
          user.id,
        );

      } catch (error) {

        console.error(
          "Error desactivando usuario:",
          error,
        );

        setActionError(
          "No se pudo desactivar el usuario.",
        );
      }
    };

  if (isLoading) {

    return (
      <div className="space-y-6">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Usuarios
          </h1>

          <p className="mt-1 text-gray-500">
            Administración de usuarios y accesos
          </p>

        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="animate-pulse text-gray-500">
            Cargando usuarios...
          </p>
        </div>

      </div>
    );
  }

  if (isError) {

    return (
      <div className="space-y-6">

        <h1 className="text-3xl font-bold text-gray-900">
          Usuarios
        </h1>

        <div className="rounded-xl border border-red-200 bg-white p-12 text-center">
          <p className="font-medium text-red-600">
            No se pudieron cargar los usuarios.
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
            <UsersRound
              size={22}
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Usuarios
            </h1>

            <p className="mt-1 text-gray-500">
              Administración de usuarios, roles y almacenes
            </p>

          </div>

        </div>

        <Button
          type="button"
          onClick={() => {

            setActionError(
              "",
            );

            setEditingUser(
              null,
            );

            setModalOpen(
              true,
            );
          }}
          className="flex items-center gap-2"
        >

          <Plus
            size={18}
          />

          Nuevo usuario

        </Button>

      </div>

      {/* STATS */}

      <UserStats
        users={
          users
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
            className="text-sm font-semibold text-red-600"
            onClick={() =>
              setActionError(
                "",
              )
            }
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
            grid
            grid-cols-1
            gap-3
            lg:grid-cols-[1fr_auto_auto_auto]
          "
        >

          <div className="relative">

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
              placeholder="Buscar usuario, correo, cargo o mina..."
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
              roleFilter
            }
            onChange={(
              event,
            ) =>
              setRoleFilter(
                event.target.value,
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
            "
          >

            <option value="ALL">
              Todos los roles
            </option>

            {roles.map(
              (role) => (
                <option
                  key={
                    role.id
                  }
                  value={
                    role.id
                  }
                >
                  {
                    role.name
                  }
                </option>
              ),
            )}

          </select>

          <select
            value={
              warehouseFilter
            }
            onChange={(
              event,
            ) =>
              setWarehouseFilter(
                event.target.value,
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
            "
          >

            <option value="ALL">
              Todas las minas
            </option>

            <option value="NONE">
              Sin asignar
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
                </option>
              ),
            )}

          </select>

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
            className="
              h-10
              rounded-lg
              border
              border-gray-300
              bg-white
              px-3
              text-sm
              text-gray-700
            "
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

      </div>

      {/* TABLA */}

      <UserTable
        users={
          filteredUsers
        }
        changingStatus={
          activateUser.isPending ||
          deactivateUser.isPending
        }
        onEdit={(
          user,
        ) => {

          setActionError(
            "",
          );

          setEditingUser(
            user,
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
      />

      {/* MODAL */}

      <UserModal
        open={
          modalOpen
        }
        user={
          editingUser
        }
        roles={
          roles
        }
        warehouses={
          warehouses
        }
        loading={
          createUser.isPending ||
          updateUser.isPending
        }
        onClose={() => {

          if (
            createUser.isPending ||
            updateUser.isPending
          ) {
            return;
          }

          setModalOpen(
            false,
          );

          setEditingUser(
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