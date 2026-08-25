import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui";

export function DashboardHeader() {
  return (
    <div className="flex items-start justify-between">

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard Logístico
        </h1>

        <p className="mt-2 text-gray-500">
          Bienvenido nuevamente 👋
        </p>

      </div>

      <Button
        className="bg-orange-500 hover:bg-orange-600"
      >
        <RefreshCcw
          size={18}
          className="mr-2"
        />

        Actualizar

      </Button>

    </div>
  );
}