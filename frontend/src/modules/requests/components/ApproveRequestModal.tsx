import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
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
  ApproveRequestDto,
  Request,
} from "../types/request.types";

interface ApprovalLine {
  detailId: number;

  requestedQuantity: number;

  approvedQuantity: string;
}

interface Props {
  open: boolean;

  request: Request | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: ApproveRequestDto
  ) => void;
}

export function ApproveRequestModal({
  open,
  request,
  loading = false,
  onClose,
  onSubmit,
}: Props) {

  const [
    lines,
    setLines,
  ] =
    useState<ApprovalLine[]>(
      []
    );

  const [
    observations,
    setObservations,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {

    if (
      !open ||
      !request
    ) {
      return;
    }

    /*
     * Inicialmente sugerimos aprobar
     * todo lo solicitado.
     */
    setLines(
      request.details.map(
        (detail) => ({
          detailId:
            detail.id,

          requestedQuantity:
            Number(
              detail.quantity
            ),

          approvedQuantity:
            String(
              Number(
                detail.quantity
              )
            ),
        })
      )
    );

    setObservations("");

    setError("");

  }, [
    open,
    request,
  ]);

  const summary =
    useMemo(() => {

      if (
        lines.length === 0
      ) {
        return {
          total: 0,
          full: 0,
          reduced: 0,
          rejected: 0,
        };
      }

      let full = 0;
      let reduced = 0;
      let rejected = 0;

      for (
        const line
        of lines
      ) {

        const approved =
          Number(
            line.approvedQuantity
          );

        if (
          approved === 0
        ) {
          rejected++;

        } else if (
          approved ===
          line.requestedQuantity
        ) {
          full++;

        } else {
          reduced++;
        }
      }

      return {
        total:
          lines.length,
        full,
        reduced,
        rejected,
      };

    }, [
      lines,
    ]);

  if (
    !open ||
    !request
  ) {
    return null;
  }

  const updateApproved = (
    detailId: number,
    value: string
  ) => {

    setLines(
      (previous) =>
        previous.map(
          (line) =>
            line.detailId ===
            detailId
              ? {
                  ...line,
                  approvedQuantity:
                    value,
                }
              : line
        )
    );
  };

  const approveAll = () => {

    setLines(
      (previous) =>
        previous.map(
          (line) => ({
            ...line,
            approvedQuantity:
              String(
                line.requestedQuantity
              ),
          })
        )
    );
  };

  const handleSubmit = () => {

    setError("");

    const details =
      lines.map(
        (line) => ({
          detailId:
            line.detailId,

          approvedQuantity:
            Number(
              line.approvedQuantity
            ),
        })
      );

    for (
      let index = 0;
      index < details.length;
      index++
    ) {

      const detail =
        details[index];

      const original =
        lines[index];

      if (
        !Number.isFinite(
          detail.approvedQuantity
        ) ||
        detail.approvedQuantity <
          0
      ) {

        setError(
          "Las cantidades aprobadas no pueden ser negativas."
        );

        return;
      }

      if (
        detail.approvedQuantity >
        original.requestedQuantity
      ) {

        setError(
          "No puedes aprobar una cantidad mayor a la solicitada."
        );

        return;
      }
    }

    onSubmit({
      details,

      observations:
        observations
          .trim() ||
        undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Revisar ${request.requestNumber}`}
    >

      <div className="space-y-5">

        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-green-200
            bg-green-50
            p-4
          "
        >

          <CheckCircle2
            size={22}
            className="mt-0.5 text-green-600"
          />

          <div>

            <p className="font-semibold text-green-800">
              {
                request.warehouse.name
              }
            </p>

            <p className="mt-1 text-sm text-green-700">
              Define la cantidad que será autorizada para cada producto.
            </p>

          </div>

        </div>

        <div className="flex justify-end">

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={
              approveAll
            }
          >
            Aprobar todo
          </Button>

        </div>

        <div
          className="
            overflow-x-auto
            rounded-xl
            border
            border-gray-200
          "
        >

          <table
            className="
              min-w-[650px]
              w-full
              text-sm
            "
          >

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left text-gray-600">
                  Producto
                </th>

                <th className="px-4 py-3 text-center text-gray-600">
                  Solicitado
                </th>

                <th className="px-4 py-3 text-center text-gray-600">
                  Aprobado
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {request.details.map(
                (
                  detail,
                  index
                ) => (

                  <tr
                    key={
                      detail.id
                    }
                  >

                    <td className="px-4 py-3">

                      <p className="font-medium text-gray-800">
                        {
                          detail.product.name
                        }
                      </p>

                      {detail.observations && (

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            detail.observations
                          }
                        </p>

                      )}

                    </td>

                    <td className="px-4 py-3 text-center font-semibold">
                      {
                        Number(
                          detail.quantity
                        )
                      }
                    </td>

                    <td className="px-4 py-3">

                      <div className="mx-auto w-28">

                        <Input
                          type="number"
                          min="0"
                          max={
                            Number(
                              detail.quantity
                            )
                          }
                          step="0.01"
                          disabled={loading}
                          value={
                            lines[index]
                              ?.approvedQuantity ??
                            ""
                          }
                          onChange={(event) =>
                            updateApproved(
                              detail.id,
                              event.target.value
                            )
                          }
                        />

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-3
          "
        >

          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold text-gray-800">
              {summary.total}
            </p>
            <p className="text-xs text-gray-400">
              Productos
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-xl font-bold text-green-700">
              {summary.full}
            </p>
            <p className="text-xs text-green-600">
              Completos
            </p>
          </div>

          <div className="rounded-lg bg-orange-50 p-3 text-center">
            <p className="text-xl font-bold text-orange-700">
              {summary.reduced}
            </p>
            <p className="text-xs text-orange-600">
              Reducidos
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-xl font-bold text-red-700">
              {summary.rejected}
            </p>
            <p className="text-xs text-red-600">
              En cero
            </p>
          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Observación de revisión
          </label>

          <textarea
            rows={3}
            value={
              observations
            }
            disabled={loading}
            onChange={(event) =>
              setObservations(
                event.target.value
              )
            }
            placeholder="Ej. Se reduce cantidad por disponibilidad..."
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
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-100
            "
          />

        </div>

        {error && (

          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>

        )}

        <div className="flex justify-end gap-3">

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={
              handleSubmit
            }
          >
            {loading
              ? "Guardando..."
              : "Guardar aprobación"
            }
          </Button>

        </div>

      </div>

    </Modal>
  );
}