import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/modules/auth/services/auth.service";

import type { AuthUser, LoginDto } from "@/modules/auth/types/auth-types";

// ============================================================
// TIPO DEL CONTEXTO
// ============================================================

interface AuthContextType {
  user: AuthUser | null;

  token: string | null;

  isAuthenticated: boolean;

  login: (data: LoginDto) => Promise<void>;

  logout: () => void;

  updateUser: (updatedUser: Partial<AuthUser>) => void;
}

// ============================================================
// CONTEXTO
// ============================================================

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // ==========================================================
  // ESTADO
  // ==========================================================

  const [user, setUser] = useState<AuthUser | null>(null);

  const [token, setToken] = useState<string | null>(null);

  // ==========================================================
  // RECUPERAR SESIÓN GUARDADA
  // ==========================================================

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("No se pudo recuperar el usuario almacenado:", error);

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setToken(null);

        setUser(null);
      }
    }
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  async function login(data: LoginDto) {
    const response = await authService.login(data);

    localStorage.setItem("token", response.accessToken);

    localStorage.setItem("user", JSON.stringify(response.user));

    setToken(response.accessToken);

    setUser(response.user);
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function logout() {
    authService.logout();

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);

    setUser(null);
  }

  // ==========================================================
  // ACTUALIZAR DATOS DEL USUARIO EN SESIÓN
  // ==========================================================

  function updateUser(updatedUser: Partial<AuthUser>) {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider
      value={{
        user,

        token,

        isAuthenticated: Boolean(token),

        login,

        logout,

        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth() {
  return useContext(AuthContext);
}
