import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/modules/auth/services/auth.service";
import type {
  AuthUser,
  LoginDto,
} from "@/modules/auth/types/auth-types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] = useState<AuthUser | null>(null);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {

    const storedToken = localStorage.getItem("token");

    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

  }, []);

  async function login(data: LoginDto) {

    const response = await authService.login(data);

    localStorage.setItem(
      "token",
      response.accessToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.user)
    );

    setToken(response.accessToken);

    setUser(response.user);

  }

  function logout() {

    authService.logout();

    setToken(null);

    setUser(null);

  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  return useContext(AuthContext);
}