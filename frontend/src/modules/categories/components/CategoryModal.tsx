import {
  useEffect,
  useState,
} from "react";

import {
  Boxes,
  Cog,
  Hammer,
  HardHat,
  Package,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import type {
  Category,
  CategoryColor,
  CreateCategoryDto,
} from "../types/category.types";

interface Props {
  open: boolean;

  category?: Category | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: CreateCategoryDto,
  ) => void;
}

const COLORS: {
  value: CategoryColor;
  label: string;
}[] = [
  {
    value: "BLUE",
    label: "Azul",
  },
  {
    value: "GREEN",
    label: "Verde",
  },
  {
    value: "RED",
    label: "Rojo",
  },
  {
    value: "YELLOW",
    label: "Amarillo",
  },
  {
    value: "ORANGE",
    label: "Naranja",
  },
  {
    value: "PURPLE",
    label: "Morado",
  },
  {
    value: "GRAY",
    label: "Gris",
  },
];

const ICONS = [
  {
    value: "Package",
    label: "Paquete",
    icon: Package,
  },
  {
    value: "Boxes",
    label: "Cajas",
    icon: Boxes,
  },
  {
    value: "Wrench",
    label: "Herramientas",
    icon: Wrench,
  },
  {
    value: "Hammer",
    label: "Martillo",
    icon: Hammer,
  },
  {
    value: "Cog",
    label: "Engranaje",
    icon: Cog,
  },
  {
    value: "HardHat",
    label: "Seguridad industrial",
    icon: HardHat,
  },
  {
    value: "Zap",
    label: "Electricidad",
    icon: Zap,
  },
  {
    value: "Shield",
    label: "Protección",
    icon: Shield,
  },
];

export function CategoryModal({
  open,
  category,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const isEditing =
    Boolean(category);

  const [
    code,
    setCode,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    color,
    setColor,
  ] =
    useState<CategoryColor>(
      "BLUE",
    );

  const [
    icon,
    setIcon,
  ] = useState(
    "Package",
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setCode(
        category.code ??
          "",
      );

      setName(
        category.name ??
          "",
      );

      setDescription(
        category.description ??
          "",
      );

      setColor(
        category.color ??
          "BLUE",
      );

      setIcon(
        category.icon ??
          "Package",
      );
    } else {
      setCode("");
      setName("");
      setDescription("");
      setColor("BLUE");
      setIcon("Package");
    }

    setError("");
  }, [
    open,
    category,
  ]);

  if (!open) {
    return null;
  }

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const cleanCode =
      code.trim();

    const cleanName =
      name.trim();

    if (
      cleanCode.length < 2
    ) {
      setError(
        "El código debe tener al menos 2 caracteres.",
      );

      return;
    }

    if (
      cleanCode.length > 20
    ) {
      setError(
        "El código no puede superar los 20 caracteres.",
      );

      return;
    }

    if (
      cleanName.length < 3
    ) {
      setError(
        "El nombre debe tener al menos 3 caracteres.",
      );

      return;
    }

    if (
      cleanName.length > 100
    ) {
      setError(
        "El nombre no puede superar los 100 caracteres.",
      );

      return;
    }

    if (
      description.length >
      250
    ) {
      setError(
        "La descripción no puede superar los 250 caracteres.",
      );

      return;
    }

    onSubmit({
      code:
        cleanCode.toUpperCase(),

      name:
        cleanName,

      description:
        description
          .trim() ||
        undefined,

      color,

      icon:
        icon ||
        undefined,
    });
  };

  const SelectedIcon =
    ICONS.find(
      (item) =>
        item.value === icon,
    )?.icon ?? Package;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditing
          ? "Editar categoría"
          : "Nueva categoría"
      }
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
      >
        <div
          className="
            flex
            items-center
            gap-4
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            p-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-white
              shadow-sm
            "
          >
            <SelectedIcon
              size={24}
              className="text-gray-700"
            />
          </div>

          <div>
            <p className="font-semibold text-gray-800">
              {name ||
                "Nueva categoría"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {code ||
                "CÓDIGO"}
            </p>
          </div>
        </div>

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
              Código *
            </label>

            <Input
              value={code}
              maxLength={20}
              disabled={loading}
              placeholder="Ej. EPP"
              onChange={(
                event,
              ) =>
                setCode(
                  event.target.value.toUpperCase(),
                )
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Nombre *
            </label>

            <Input
              value={name}
              maxLength={100}
              disabled={loading}
              placeholder="Ej. Equipos de protección"
              onChange={(
                event,
              ) =>
                setName(
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Descripción
          </label>

          <textarea
            rows={3}
            maxLength={250}
            value={
              description
            }
            disabled={loading}
            placeholder="Descripción de la categoría..."
            onChange={(
              event,
            ) =>
              setDescription(
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
              transition
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-100
            "
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {
              description.length
            }
            /250
          </p>
        </div>

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
              Color
            </label>

            <select
              value={color}
              disabled={loading}
              onChange={(
                event,
              ) =>
                setColor(
                  event.target
                    .value as CategoryColor,
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
              {COLORS.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Icono
            </label>

            <select
              value={icon}
              disabled={loading}
              onChange={(
                event,
              ) =>
                setIcon(
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
              {ICONS.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {error && (
          <div
            className="
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear categoría"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}