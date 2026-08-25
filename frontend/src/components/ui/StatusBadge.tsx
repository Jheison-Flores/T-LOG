import { Badge } from "./Badge";

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({
  active,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={
        active
          ? "success"
          : "danger"
      }
    >
      {active ? "Activo" : "Inactivo"}
    </Badge>
  );
}