import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  text: string;
  to: string;
}

export function SidebarItem({
  icon: Icon,
  text,
  to,
}: Props) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-5 py-3 rounded-lg transition-all
        ${
          isActive
            ? "bg-orange-500 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-orange-400"
        }`
      }
    >
      <Icon size={20} />
      <span>{text}</span>
    </NavLink>
  );
}