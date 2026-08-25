import {
  Boxes,
  Cog,
  Edit3,
  Hammer,
  HardHat,
  Package,
  Power,
  PowerOff,
  Shield,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  Category,
  CategoryColor,
} from "../types/category.types";

interface Props {
  categories: Category[];

  isAdmin: boolean;

  changingStatus?: boolean;

  deleting?: boolean;

  onEdit: (
    category: Category,
  ) => void;

  onActivate: (
    category: Category,
  ) => void;

  onDeactivate: (
    category: Category,
  ) => void;

  onDelete: (
    category: Category,
  ) => void;
}

const icons:
  Record<
    string,
    LucideIcon
  > = {
  Package,
  Boxes,
  Wrench,
  Hammer,
  Cog,
  HardHat,
  Zap,
  Shield,
};

function getIcon(
  icon?: string | null,
): LucideIcon {
  if (
    icon &&
    icons[icon]
  ) {
    return icons[icon];
  }

  return Package;
}

function getColorClasses(
  color:
    CategoryColor,
): string {
  switch (color) {
    case "BLUE":
      return "bg-blue-100 text-blue-700";

    case "GREEN":
      return "bg-green-100 text-green-700";

    case "RED":
      return "bg-red-100 text-red-700";

    case "YELLOW":
      return "bg-yellow-100 text-yellow-700";

    case "ORANGE":
      return "bg-orange-100 text-orange-700";

    case "PURPLE":
      return "bg-purple-100 text-purple-700";

    case "GRAY":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function CategoryTable({
  categories,
  isAdmin,
  changingStatus = false,
  deleting = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: Props) {
  if (
    categories.length ===
    0
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
        <Boxes
          size={36}
          className="mx-auto text-gray-300"
        />

        <p className="mt-4 font-medium text-gray-500">
          No se encontraron categorías.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Crea una categoría o modifica la búsqueda.
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
            min-w-[850px]
            w-full
            text-sm
          "
        >
          <thead
            className="
              border-b
              border-gray-200
              bg-gray-50
            "
          >
            <tr>
              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Categoría
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Código
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Descripción
              </th>

              <th className="px-5 py-4 text-center font-semibold text-gray-600">
                Estado
              </th>

              {isAdmin && (
                <th className="px-5 py-4 text-right font-semibold text-gray-600">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {categories.map(
              (
                category,
              ) => {
                const Icon =
                  getIcon(
                    category.icon,
                  );

                return (
                  <tr
                    key={
                      category.id
                    }
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${getColorClasses(
                              category.color,
                            )}
                          `}
                        >
                          <Icon
                            size={
                              19
                            }
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {
                              category.name
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            ID #
                            {
                              category.id
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="
                          rounded-md
                          bg-gray-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-gray-600
                        "
                      >
                        {
                          category.code
                        }
                      </span>
                    </td>

                    <td className="max-w-sm px-5 py-4 text-gray-500">
                      <p className="line-clamp-2">
                        {
                          category.description ||
                          "Sin descripción"
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {category.isActive ? (
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
                          Activa
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
                          Inactiva
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() =>
                              onEdit(
                                category,
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
                              size={
                                17
                              }
                            />
                          </button>

                          {category.isActive ? (
                            <button
                              type="button"
                              disabled={
                                changingStatus
                              }
                              title="Desactivar"
                              onClick={() =>
                                onDeactivate(
                                  category,
                                )
                              }
                              className="
                                rounded-lg
                                p-2
                                text-gray-500
                                hover:bg-orange-50
                                hover:text-orange-600
                                disabled:opacity-40
                              "
                            >
                              <PowerOff
                                size={
                                  17
                                }
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                changingStatus
                              }
                              title="Activar"
                              onClick={() =>
                                onActivate(
                                  category,
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
                                size={
                                  17
                                }
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={
                              deleting
                            }
                            title="Eliminar"
                            onClick={() =>
                              onDelete(
                                category,
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
                            <Trash2
                              size={
                                17
                              }
                            />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}