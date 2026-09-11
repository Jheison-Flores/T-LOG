import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
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

import {
  useChangeOwnPassword,
} from "../hooks/useUsers";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  open,
  onClose,
}: Props) {
  const changePassword =
    useChangeOwnPassword();

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] =
    useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setSuccess("");
  }, [
    open,
  ]);

  if (!open) {
    return null;
  }

  const handleClose =
    () => {
      if (
        changePassword.isPending
      ) {
        return;
      }

      onClose();
    };

  const getApiErrorMessage =
    (
      value: unknown,
    ) => {
      if (
        typeof value !==
          "object" ||
        value === null
      ) {
        return null;
      }

      const errorObject =
        value as {
          response?: {
            data?: {
              message?:
                | string
                | string[];
            };
          };
        };

      const message =
        errorObject.response?.data
          ?.message;

      if (
        Array.isArray(
          message,
        )
      ) {
        return message.join(
          " ",
        );
      }

      if (
        typeof message ===
        "string"
      ) {
        return message;
      }

      return null;
    };

  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !currentPassword
      ) {
        setError(
          "Ingresa tu contraseña actual.",
        );

        return;
      }

      if (
        newPassword.length <
        8
      ) {
        setError(
          "La nueva contraseña debe tener al menos 8 caracteres.",
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "La confirmación de la nueva contraseña no coincide.",
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setError(
          "La nueva contraseña debe ser diferente a la contraseña actual.",
        );

        return;
      }

      try {
        const response =
          await changePassword.mutateAsync(
            {
              currentPassword,
              newPassword,
              confirmPassword,
            },
          );

        setSuccess(
          response.message ||
            "Contraseña actualizada correctamente.",
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (
        requestError
      ) {
        const message =
          getApiErrorMessage(
            requestError,
          );

        setError(
          message ||
            "No se pudo cambiar la contraseña. Verifica tu contraseña actual e inténtalo nuevamente.",
        );
      }
    };

  return (
    <Modal
      open={
        open
      }
      onClose={
        handleClose
      }
      title="Cambiar contraseña"
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
            items-start
            gap-3
            rounded-xl
            border
            border-blue-100
            bg-blue-50
            px-4
            py-3
          "
        >
          <div
            className="
              mt-0.5
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-blue-100
              text-blue-700
            "
          >
            <ShieldCheck
              size={
                18
              }
            />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-blue-800
              "
            >
              Seguridad de tu cuenta
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-blue-700
              "
            >
              Solo tú puedes cambiar tu contraseña. Para confirmar tu identidad,
              primero debes ingresar tu contraseña actual.
            </p>
          </div>
        </div>

        {/* =====================================================
            CONTRASEÑA ACTUAL
        ===================================================== */}

        <div>
          <label
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Contraseña actual *
          </label>

          <div
            className="
              relative
            "
          >
            <Input
              type={
                showCurrentPassword
                  ? "text"
                  : "password"
              }
              value={
                currentPassword
              }
              disabled={
                changePassword.isPending
              }
              placeholder="Ingresa tu contraseña actual"
              className="pr-11"
              onChange={(
                event,
              ) => {
                setCurrentPassword(
                  event.target.value,
                );

                setError("");
                setSuccess("");
              }}
            />

            <button
              type="button"
              title={
                showCurrentPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              onClick={() =>
                setShowCurrentPassword(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                transition
                hover:text-gray-700
              "
            >
              {showCurrentPassword ? (
                <EyeOff
                  size={
                    18
                  }
                />
              ) : (
                <Eye
                  size={
                    18
                  }
                />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            NUEVA CONTRASEÑA
        ===================================================== */}

        <div>
          <label
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Nueva contraseña *
          </label>

          <div
            className="
              relative
            "
          >
            <Input
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              value={
                newPassword
              }
              disabled={
                changePassword.isPending
              }
              placeholder="Mínimo 8 caracteres"
              className="pr-11"
              onChange={(
                event,
              ) => {
                setNewPassword(
                  event.target.value,
                );

                setError("");
                setSuccess("");
              }}
            />

            <button
              type="button"
              title={
                showNewPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              onClick={() =>
                setShowNewPassword(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                transition
                hover:text-gray-700
              "
            >
              {showNewPassword ? (
                <EyeOff
                  size={
                    18
                  }
                />
              ) : (
                <Eye
                  size={
                    18
                  }
                />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            CONFIRMAR CONTRASEÑA
        ===================================================== */}

        <div>
          <label
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Confirmar nueva contraseña *
          </label>

          <div
            className="
              relative
            "
          >
            <Input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              disabled={
                changePassword.isPending
              }
              placeholder="Repite la nueva contraseña"
              className="pr-11"
              onChange={(
                event,
              ) => {
                setConfirmPassword(
                  event.target.value,
                );

                setError("");
                setSuccess("");
              }}
            />

            <button
              type="button"
              title={
                showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              onClick={() =>
                setShowConfirmPassword(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                transition
                hover:text-gray-700
              "
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={
                    18
                  }
                />
              ) : (
                <Eye
                  size={
                    18
                  }
                />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-4
              py-3
              text-sm
              font-medium
              text-green-700
            "
          >
            {success}
          </div>
        )}

        <div
          className="
            flex
            justify-end
            gap-3
            border-t
            border-gray-100
            pt-4
          "
        >
          <Button
            type="button"
            variant="secondary"
            disabled={
              changePassword.isPending
            }
            onClick={
              handleClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              changePassword.isPending
            }
            className="
              flex
              items-center
              gap-2
            "
          >
            <KeyRound
              size={
                17
              }
            />

            {changePassword.isPending
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
