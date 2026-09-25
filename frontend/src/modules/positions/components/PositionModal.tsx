import {
  useEffect,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Layers3,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  Modal,
} from "@/components/ui/Modal";

import type {
  CreatePositionDto,
} from "../types/position.types";

interface Props {
  open: boolean;

  loading?: boolean;

  defaultValues?:
    Partial<CreatePositionDto>;

  onClose: () => void;

  onSubmit: (
    data:
      CreatePositionDto,
  ) => void;
}

const EMPTY_FORM:
  CreatePositionDto = {
  name: "",

  area: "",

  description: "",
};

export function PositionModal({
  open,
  loading = false,
  defaultValues,
  onClose,
  onSubmit,
}: Props) {
  const [
    form,
    setForm,
  ] =
    useState<CreatePositionDto>(
      EMPTY_FORM,
    );

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setForm({
        name:
          defaultValues?.name ??
          "",

        area:
          defaultValues?.area ??
          "",

        description:
          defaultValues?.description ??
          "",
      });

      setError("");
    },
    [
      open,
      defaultValues,
    ],
  );

  const updateField = <
    K extends keyof CreatePositionDto,
  >(
    key:
      K,

    value:
      CreatePositionDto[K],
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    );
  };

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (
      !form.name.trim()
    ) {
      setError(
        "Ingresa el nombre del cargo.",
      );

      return;
    }

    onSubmit({
      name:
        form.name.trim(),

      area:
        form.area
          ?.trim() ||
        undefined,

      description:
        form.description
          ?.trim() ||
        undefined,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={
        open
      }

      onClose={
        onClose
      }

      title={
        defaultValues
          ? "Editar cargo"
          : "Nuevo cargo"
      }

      size="lg"
    >
      <form
        onSubmit={
          handleSubmit
        }

        className="space-y-6"
      >
        <div className="rounded-xl border border-hr-border bg-hr-background px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <BriefcaseBusiness
                size={
                  20
                }

                className="text-hr-primary"
              />
            </div>

            <div>
              <p className="font-semibold text-hr-text">
                Cargo laboral
              </p>

              <p className="mt-1 text-sm leading-5 text-hr-text">
                Los cargos serán utilizados para las asignaciones
                laborales del personal.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">
            Información del cargo
          </h3>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombre del cargo *
              </label>

              <Input
                className="h-11"

                value={
                  form.name
                }

                disabled={
                  loading
                }

                placeholder="Ej. Mecánico"

                onChange={(
                  event,
                ) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Área
              </label>

              <div className="relative">
                <Layers3
                  size={
                    17
                  }

                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  className="h-11 pl-10"

                  value={
                    form.area ??
                    ""
                  }

                  disabled={
                    loading
                  }

                  placeholder="Ej. Mantenimiento"

                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "area",
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
                rows={
                  4
                }

                value={
                  form.description ??
                  ""
                }

                disabled={
                  loading
                }

                placeholder="Descripción o funciones generales del cargo"

                onChange={(
                  event,
                ) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }

                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {
              error
            }
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Button
            type="button"

            variant="secondary"

            disabled={
              loading
            }

            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"

            disabled={
              loading
            }
          >
            {loading
              ? "Guardando..."
              : defaultValues
                ? "Guardar cambios"
                : "Registrar cargo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}