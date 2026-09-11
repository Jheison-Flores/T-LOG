import {
  Bell,
  ChevronDown,
  KeyRound,
  LogOut,
  UserCircle2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Button,
} from "@/components/ui";

import {
  useAuth,
} from "@/modules/auth/contexts/AuthContexts";

import {
  ChangePasswordModal,
} from "@/modules/users/components/ChangePasswordModal";

export function Navbar() {
  // ============================================================
  // AUTH
  // ============================================================

  const {
    user,
    logout,
  } =
    useAuth();

  // ============================================================
  // STATE
  // ============================================================

  const [
    accountOpen,
    setAccountOpen,
  ] =
    useState(false);

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] =
    useState(false);

  const accountRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  // ============================================================
  // CERRAR MENÚ AL HACER CLICK FUERA
  // ============================================================

  useEffect(() => {
    const handleClickOutside =
      (
        event: MouseEvent,
      ) => {
        if (
          accountRef.current &&
          !accountRef.current.contains(
            event.target as Node,
          )
        ) {
          setAccountOpen(
            false,
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // ============================================================
  // NOMBRE
  // ============================================================

  const fullName =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(
        Boolean,
      )
      .join(" ")
      .trim();

  const displayName =
    fullName ||
    user?.username ||
    "Usuario";

  // ============================================================
  // ROL
  // ============================================================

  const roleName =
    user?.role?.name ??
    user?.role?.code ??
    "";

  // ============================================================
  // ALMACÉN
  // ============================================================

  const warehouseName =
    user?.warehouse?.name ??
    "";

  return (
    <>
      <header
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-gray-100
          bg-white
          px-8
          shadow-sm
        "
      >
        {/* =====================================================
            SISTEMA
        ===================================================== */}

        <div>
          <h2
            className="
              text-xl
              font-bold
              text-gray-800
            "
          >
            Sistema Logístico
          </h2>
        </div>

        {/* =====================================================
            DERECHA
        ===================================================== */}

        <div
          className="
            flex
            items-center
            gap-5
          "
        >
          {/* ===================================================
              NOTIFICACIONES
          =================================================== */}

          <button
            type="button"
            title="Notificaciones"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition-colors
              hover:bg-orange-50
              hover:text-orange-500
            "
          >
            <Bell
              size={
                21
              }
            />
          </button>

          {/* ===================================================
              CUENTA
          =================================================== */}

          <div
            ref={
              accountRef
            }
            className="
              relative
            "
          >
            <button
              type="button"
              onClick={() =>
                setAccountOpen(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-2
                py-1.5
                text-left
                transition
                hover:bg-orange-50
              "
            >
              <UserCircle2
                size={
                  38
                }
                className="
                  shrink-0
                  text-orange-500
                "
              />

              <div
                className="
                  min-w-0
                  leading-tight
                "
              >
                <p
                  className="
                    max-w-[220px]
                    truncate
                    font-semibold
                    text-gray-800
                  "
                >
                  {
                    displayName
                  }
                </p>

                <div
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    text-gray-500
                  "
                >
                  {roleName && (
                    <span>
                      {
                        roleName
                      }
                    </span>
                  )}

                  {roleName &&
                    warehouseName && (
                      <span>
                        •
                      </span>
                    )}

                  {warehouseName && (
                    <span
                      className="
                        max-w-[160px]
                        truncate
                      "
                    >
                      {
                        warehouseName
                      }
                    </span>
                  )}
                </div>
              </div>

              <ChevronDown
                size={
                  16
                }
                className={`
                  text-gray-400
                  transition-transform
                  ${
                    accountOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* =================================================
                MENÚ CUENTA
            ================================================= */}

            {accountOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  z-50
                  w-64
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-xl
                "
              >
                <div
                  className="
                    border-b
                    border-gray-100
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-gray-800
                    "
                  >
                    {
                      displayName
                    }
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-gray-500
                    "
                  >
                    {
                      user?.username
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(
                      false,
                    );

                    setPasswordModalOpen(
                      true,
                    );
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-orange-50
                    hover:text-orange-700
                  "
                >
                  <KeyRound
                    size={
                      17
                    }
                  />

                  Cambiar contraseña
                </button>
              </div>
            )}
          </div>

          {/* ===================================================
              SALIR
          =================================================== */}

          <Button
            variant="secondary"
            onClick={
              logout
            }
            className="
              flex
              items-center
              gap-2
            "
          >
            <LogOut
              size={
                18
              }
            />

            Salir
          </Button>
        </div>
      </header>

      {/* =======================================================
          MODAL CAMBIO DE CONTRASEÑA
      ======================================================= */}

      <ChangePasswordModal
        open={
          passwordModalOpen
        }
        onClose={() =>
          setPasswordModalOpen(
            false,
          )
        }
      />
    </>
  );
}
