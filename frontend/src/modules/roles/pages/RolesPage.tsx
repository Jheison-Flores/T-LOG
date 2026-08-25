import {
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  useRoles,
} from "../hooks/useRoles";

export function RolesPage() {
  const {
    data: roles = [],
    isLoading,
    isError,
  } = useRoles();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <p className="text-gray-500">
          Cargando roles...
        </p>

      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">

        <p className="font-medium text-red-600">
          No se pudieron cargar los roles.
        </p>

      </div>
    );
  }

  const adminRole =
    roles.find(
      (role) =>
        role.code ===
        "ADMIN",
    );

  const logisticsRole =
    roles.find(
      (role) =>
        role.code ===
        "LOGISTICS",
    );

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Roles del sistema
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Roles principales utilizados para controlar el acceso a T-LOG.
        </p>
      </div>

      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Roles
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {roles.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <Shield size={22} />
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Administrador
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {adminRole?.isActive
                  ? "Activo"
                  : "No disponible"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <ShieldCheck size={22} />
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Logística
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {logisticsRole?.isActive
                  ? "Activo"
                  : "No disponible"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <Users size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ROLES
      ===================================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b border-gray-100 px-6 py-4">

          <h2 className="font-semibold text-gray-900">
            Roles disponibles
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">

                <th className="px-6 py-3">
                  Rol
                </th>

                <th className="px-6 py-3">
                  Código
                </th>

                <th className="px-6 py-3">
                  Descripción
                </th>

                <th className="px-6 py-3">
                  Alcance
                </th>

                <th className="px-6 py-3">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {roles.map(
                (role) => {

                  const isAdmin =
                    role.code ===
                    "ADMIN";

                  const isLogistics =
                    role.code ===
                    "LOGISTICS";

                  return (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              ${
                                isAdmin
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-700"
                              }
                            `}
                          >

                            {isAdmin ? (
                              <ShieldCheck size={18} />
                            ) : (
                              <Users size={18} />
                            )}

                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {role.name}
                            </p>

                            {(
                              isAdmin ||
                              isLogistics
                            ) && (
                              <p className="text-xs text-gray-400">
                                Rol del sistema
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                          {role.code}
                        </span>

                      </td>

                      <td className="max-w-md px-6 py-4 text-sm text-gray-500">
                        {role.description ||
                          "Sin descripción"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">

                        {isAdmin &&
                          "Acceso global"}

                        {isLogistics &&
                          "Según almacén asignado"}

                        {!isAdmin &&
                          !isLogistics &&
                          "Sin permisos definidos"}

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            ${
                              role.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          `}
                        >

                          {role.isActive
                            ? "Activo"
                            : "Inactivo"}

                        </span>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          INFORMACIÓN
      ===================================================== */}

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

        <p className="font-semibold text-orange-700">
          Roles administrados por el sistema
        </p>

        <p className="mt-1 text-sm text-orange-600">
          ADMIN posee acceso global. LOGISTICS obtiene acceso operativo según la mina o almacén asignado al usuario.
        </p>

      </div>

    </div>
  );
}