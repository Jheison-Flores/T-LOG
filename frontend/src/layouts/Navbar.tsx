import {
  Bell,
  LogOut,
  UserCircle2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import {
  useAuth,
} from "@/modules/auth/contexts/AuthContexts";

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
          gap-6
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
            USUARIO
        =================================================== */}

        <div
          className="
            flex
            items-center
            gap-3
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
  );
}