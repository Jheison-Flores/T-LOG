import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, User } from "lucide-react";

import { Button, Card, Input } from "@/components/ui";
import { useAuth } from "../contexts/AuthContexts";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login({
        username,
        password,
      });

    } catch (error: any) {

      console.error(error);
      console.error(error.response);

      setError(
        error.response?.data?.message ??
        "Error al conectar con el servidor."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-900 via-neutral-800 to-orange-600">

      <Card>

        <div className="w-105">

          <div className="text-center mb-8">

            <h1 className="text-4xl font-bold text-orange-500">
              T-LOG
            </h1>

            <p className="text-gray-500 mt-2">
              Sistema Logístico TEINCOMIN
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="font-medium">
                Usuario
              </label>

              <div className="relative mt-2">

                <User
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  className="pl-10"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />

              </div>

            </div>

            <div>

              <label className="font-medium">
                Contraseña
              </label>

              <div className="relative mt-2">

                <Lock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <Input
                  className="pl-10"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

              </div>

            </div>

            {error && (
              <div className="bg-red-100 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Ingresando..."
                : "Iniciar sesión"}
            </Button>

          </form>

        </div>

      </Card>

    </div>
  );
}