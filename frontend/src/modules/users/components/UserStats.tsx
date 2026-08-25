import {
  Building2,
  CircleCheckBig,
  CircleOff,
  Users,
} from "lucide-react";

import {
  StatCard,
} from "@/components/ui/StatCard";

import type {
  User,
} from "../types/user.types";

interface Props {
  users: User[];
}

export function UserStats({
  users,
}: Props) {

  const total =
    users.length;

  const active =
    users.filter(
      (user) =>
        user.isActive,
    ).length;

  const inactive =
    users.filter(
      (user) =>
        !user.isActive,
    ).length;

  const withWarehouse =
    users.filter(
      (user) =>
        Boolean(
          user.warehouse,
        ),
    ).length;

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >

      <StatCard
        title="Total usuarios"
        value={total}
        icon={Users}
      />

      <StatCard
        title="Activos"
        value={active}
        icon={CircleCheckBig}
      />

      <StatCard
        title="Inactivos"
        value={inactive}
        icon={CircleOff}
      />

      <StatCard
        title="Con almacén/mina"
        value={withWarehouse}
        icon={Building2}
      />

    </div>
  );
}