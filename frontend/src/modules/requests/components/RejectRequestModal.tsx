import {
  useEffect,
  useState,
} from "react";

import {
  XCircle,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  Button,
} from "@/components/ui/Button";

import type {
  RejectRequestDto,
  Request,
} from "../types/request.types";

interface Props {
  open: boolean;

  request: Request | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: RejectRequestDto
  ) => void;
}

export function RejectRequestModal({
  open,
  request,
  loading = false,
  onClose,
  onSubmit,
}: Props) {

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {

    if (!open) {
      return;
    }

    setReason("");
    setError("");

  }, [
    open,
  ]);

  if (
    !open ||
    !request
  ) {
    return null;
  }

  const handleSubmit = () => {

    const cleanReason =
      reason.trim();

    if (!cleanReason) {

      setError(
        "Debes indicar el motivo del rechazo."
      );

      return;
    }

    onSubmit({
      reason:
        cleanReason,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar solicitud"
    >

      <div className="space-y-5">

        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
          "
        >

          <XCircle
            size={22}
            className="mt-0.5 text-red-600"
          />

          <div>

            <p className="font-semibold text-red-700">
              {
                request.requestNumber
              }
            </p>

            <p className="mt-1 text-sm text-red-600">
              La solicitud de {request.warehouse.name} será rechazada completamente.
            </p>

          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Motivo del rechazo *
          </label>

          <textarea
            rows={4}
            maxLength={1000}
            value={reason}
            disabled={loading}
            placeholder="Explica por qué se rechaza la solicitud..."
            onChange={(event) => {

              setReason(
                event.target.value
              );

              setError("");
            }}
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
              focus:border-red-500
              focus:ring-2
              focus:ring-red-100
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

          <button
            type="button"
            disabled={loading}
            onClick={
              handleSubmit
            }
            className="
              rounded-lg
              bg-red-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              hover:bg-red-700
              disabled:opacity-50
            "
          >
            {loading
              ? "Rechazando..."
              : "Confirmar rechazo"
            }
          </button>

        </div>

      </div>

    </Modal>
  );
}