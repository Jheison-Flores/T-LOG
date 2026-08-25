import {
  Navigate,
} from "react-router-dom";

import { useAuth } from "@/modules/auth/contexts/AuthContexts";

interface RoleRouteProps {
  children:
    React.ReactNode;

  allowedRoles:
    string[];
}

export function RoleRoute({
  children,
  allowedRoles,
}: RoleRouteProps) {
  const {
    user,
  } = useAuth();

  // ============================================================
  // SIN USUARIO
  // ============================================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ============================================================
  // VALIDAR ROL
  // ============================================================

  const roleCode =
    user.role?.code;

  if (
    !roleCode ||
    !allowedRoles.includes(
      roleCode,
    )
  ) {
    /*
     * Si intenta entrar manualmente a una ruta
     * que no le corresponde, vuelve al Dashboard.
     */

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <>
      {children}
    </>
  );
}