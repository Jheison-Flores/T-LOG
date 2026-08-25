import {
  LayoutDashboard,
  Boxes,
  Package,
  Warehouse,
  ArrowRightLeft,
  ShoppingCart,
  FileText,
  Users,
  Shield,
  Settings,
  Truck,
  FileCheck2,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

import {
  SidebarItem,
} from "./SidebarItem";

import {
  Logo,
} from "./Logo";

import {
  useAuth,
} from "@/modules/auth/contexts/AuthContexts";

export function Sidebar() {
  const { user } = useAuth();

  const roleCode = user?.role?.code;

  const isAdmin = roleCode === "ADMIN";
  const isLogistics = roleCode === "LOGISTICS";
  const canOperate = isAdmin || isLogistics;

  return (
    <aside className="w-72 bg-[#1B1B1B] text-white flex flex-col">
      <Logo />

      <nav className="flex flex-col gap-2 p-4">
        {canOperate && (
          <SidebarItem
            icon={LayoutDashboard}
            text="Dashboard"
            to="/"
          />
        )}

        {canOperate && (
          <>
            <SidebarItem
              icon={Boxes}
              text="Categorías"
              to="/categories"
            />
            <SidebarItem
              icon={Package}
              text="Productos"
              to="/products"
            />
            <SidebarItem
              icon={Truck}
              text="Proveedores"
              to="/suppliers"
            />
            <SidebarItem
              icon={Warehouse}
              text="Inventario"
              to="/inventory"
            />
            <SidebarItem
              icon={ArrowRightLeft}
              text="Movimientos"
              to="/movements"
            />
          </>
        )}

        {canOperate && (
          <div className="my-2 border-t border-white/10" />
        )}

        {canOperate && (
          <>
            <SidebarItem
              icon={FileText}
              text="Requerimientos"
              to="/requests"
            />
            <SidebarItem
              icon={ShoppingCart}
              text="Órdenes de Compra"
              to="/purchases"
            />
            <SidebarItem
              icon={FileCheck2}
              text="Guías de Remisión"
              to="/remission-guides"
            />
            <SidebarItem
              icon={ClipboardCheck}
              text="Hojas de Recorrido"
              to="/route-sheets"
            />
          </>
        )}

        {canOperate && (
          <>
            <div className="my-2 border-t border-white/10" />

            <SidebarItem
              icon={BarChart3}
              text="Reportes"
              to="/reports"
            />
          </>
        )}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-white/10" />

            <SidebarItem
              icon={Users}
              text="Usuarios"
              to="/users"
            />
            <SidebarItem
              icon={Shield}
              text="Roles"
              to="/roles"
            />
            <SidebarItem
              icon={Settings}
              text="Configuración"
              to="/settings"
            />
          </>
        )}
      </nav>
    </aside>
  );
}