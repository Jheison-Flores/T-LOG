import {
  Building2,
  Edit3,
  Power,
  PowerOff,
  UserRound,
} from "lucide-react";

import type {
  User,
} from "../types/user.types";

interface Props {
  users: User[];

  changingStatus?: boolean;

  onEdit: (
    user: User,
  ) => void;

  onActivate: (
    user: User,
  ) => void;

  onDeactivate: (
    user: User,
  ) => void;
}

function formatDate(
  value?: string | null,
) {

  if (!value) {
    return "Nunca";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "es-PE",
  );
}

export function UserTable({
  users,
  changingStatus = false,
  onEdit,
  onActivate,
  onDeactivate,
}: Props) {

  if (
    users.length === 0
  ) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-12
          text-center
        "
      >

        <UserRound
          size={38}
          className="mx-auto text-gray-300"
        />

        <p className="mt-4 font-medium text-gray-500">
          No se encontraron usuarios.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Crea un usuario o modifica los filtros.
        </p>

      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >

      <div className="overflow-x-auto">

        <table
          className="
            min-w-[1150px]
            w-full
            text-sm
          "
        >

          <thead className="border-b border-gray-200 bg-gray-50">

            <tr>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Usuario
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Rol
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Mina / Almacén
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Cargo
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Último acceso
              </th>

              <th className="px-5 py-4 text-center font-semibold text-gray-600">
                Estado
              </th>

              <th className="px-5 py-4 text-right font-semibold text-gray-600">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {users.map(
              (user) => (
                <tr
                  key={
                    user.id
                  }
                  className="transition-colors hover:bg-gray-50"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-orange-50
                          font-semibold
                          text-orange-700
                        "
                      >
                        {
                          user.firstName
                            .charAt(0)
                            .toUpperCase()
                        }
                        {
                          user.lastName
                            .charAt(0)
                            .toUpperCase()
                        }
                      </div>

                      <div>

                        <p className="font-semibold text-gray-800">
                          {
                            user.firstName
                          }{" "}
                          {
                            user.lastName
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          @
                          {
                            user.username
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {
                            user.email
                          }
                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-5 py-4">

                    <span
                      className="
                        inline-flex
                        rounded-full
                        bg-purple-50
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        text-purple-700
                      "
                    >
                      {
                        user.role.name
                      }
                    </span>

                    <p className="mt-1 text-xs text-gray-400">
                      {
                        user.role.code
                      }
                    </p>

                  </td>

                  <td className="px-5 py-4">

                    {user.warehouse ? (
                      <div className="flex items-center gap-2">

                        <Building2
                          size={16}
                          className="text-gray-400"
                        />

                        <div>
                          <p className="font-medium text-gray-700">
                            {
                              user.warehouse.name
                            }
                          </p>

                          <p className="text-xs text-gray-400">
                            {
                              user.warehouse.type
                            }
                          </p>
                        </div>

                      </div>
                    ) : (
                      <span className="text-gray-400">
                        Sin asignar
                      </span>
                    )}

                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {
                      user.position ||
                      "—"
                    }
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                    {
                      formatDate(
                        user.lastLogin,
                      )
                    }
                  </td>

                  <td className="px-5 py-4 text-center">

                    {user.isActive ? (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-green-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-green-700
                        "
                      >
                        Activo
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-gray-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-gray-600
                        "
                      >
                        Inactivo
                      </span>
                    )}

                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center justify-end gap-1">

                      <button
                        type="button"
                        title="Editar usuario"
                        onClick={() =>
                          onEdit(
                            user,
                          )
                        }
                        className="
                          rounded-lg
                          p-2
                          text-gray-500
                          hover:bg-blue-50
                          hover:text-blue-600
                        "
                      >
                        <Edit3
                          size={17}
                        />
                      </button>

                      {user.isActive ? (
                        <button
                          type="button"
                          disabled={
                            changingStatus
                          }
                          title="Desactivar usuario"
                          onClick={() =>
                            onDeactivate(
                              user,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:opacity-40
                          "
                        >
                          <PowerOff
                            size={17}
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            changingStatus
                          }
                          title="Activar usuario"
                          onClick={() =>
                            onActivate(
                              user,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-green-50
                            hover:text-green-600
                            disabled:opacity-40
                          "
                        >
                          <Power
                            size={17}
                          />
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              ),
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}