import {
  Package,
  AlertTriangle,
  CircleX,
  Warehouse,
} from "lucide-react";

import type {
  Inventory,
} from "../types/inventory.types";

interface InventoryStatsProps {
  inventory: Inventory[];
}

export function InventoryStats({
  inventory,
}: InventoryStatsProps) {
  const totalProducts = new Set(
    inventory
      .map((item) => item.product?.id)
      .filter(Boolean),
  ).size;

  const lowStock = inventory.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <=
        (item.product?.minimumStock ?? 0),
  ).length;

  const outOfStock = inventory.filter(
    (item) => item.quantity <= 0,
  ).length;

  const warehouses = new Set(
    inventory
      .map((item) => item.warehouse?.id)
      .filter(Boolean),
  ).size;

  const stats = [
    {
      label: "Productos",
      value: totalProducts,
      icon: Package,
      iconClass:
        "text-blue-600 bg-blue-50",
    },
    {
      label: "Stock bajo",
      value: lowStock,
      icon: AlertTriangle,
      iconClass:
        "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Agotados",
      value: outOfStock,
      icon: CircleX,
      iconClass:
        "text-red-600 bg-red-50",
    },
    {
      label: "Almacenes",
      value: warehouses,
      icon: Warehouse,
      iconClass:
        "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  {stat.label}
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconClass}`}
              >
                <Icon size={21} />
              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
}