import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import {
  LoginPage,
} from "../modules/auth/pages/LoginPage";

import {
  DashboardPage,
} from "@/modules/dashboard/pages/DashboardPage";

import {
  CategoriesPage,
} from "@/modules/categories/pages/CategoriesPage";

import {
  ProductsPage,
} from "@/modules/products/pages/ProductsPage";

import {
  InventoryPage,
} from "@/modules/inventory/pages/InventoryPage";

import {
  StockMovementsPage,
} from "@/modules/stock-movements/pages/StockMovementsPage";

import {
  SuppliersPage,
} from "@/modules/suppliers/pages/SuppliersPage";

import {
  PurchasesPage,
} from "@/modules/purchases/pages/PurchasesPage";

import {
  RequestsPage,
} from "@/modules/requests/pages/RequestsPage";

import {
  RemissionGuidesPage,
} from "@/modules/remission-guides/pages/RemissionGuidesPage";

import { RouteSheetsPage } from "@/modules/route-sheets/pages/routeSheetsPage";

import { ReportsPage } from "@/modules/reports/pages/ReportPages";

import {
  UsersPage,
} from "@/modules/users/pages/UsersPage";

import {
  RolesPage,
} from "@/modules/roles/pages/RolesPage";

import {
  SettingsPage,
} from "@/modules/settings/pages/SettingsPage";

import {
  MainLayout,
} from "../layouts/MainLayout";

import {
  ProtectedRoute,
} from "./ProtectedRoute";

import {
  RoleRoute,
} from "./RoleRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <DashboardPage />
              </RoleRoute>
            }
          />

          <Route
            path="categories"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <CategoriesPage />
              </RoleRoute>
            }
          />

          <Route
            path="products"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <ProductsPage />
              </RoleRoute>
            }
          />

          <Route
            path="suppliers"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <SuppliersPage />
              </RoleRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <InventoryPage />
              </RoleRoute>
            }
          />

          <Route
            path="movements"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <StockMovementsPage />
              </RoleRoute>
            }
          />

          <Route
            path="requests"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <RequestsPage />
              </RoleRoute>
            }
          />

          <Route
            path="purchases"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <PurchasesPage />
              </RoleRoute>
            }
          />

          <Route
            path="remission-guides"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <RemissionGuidesPage />
              </RoleRoute>
            }
          />

          <Route
            path="route-sheets"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <RouteSheetsPage />
              </RoleRoute>
            }
          />

          <Route
            path="reports"
            element={
              <RoleRoute allowedRoles={["ADMIN", "LOGISTICS"]}>
                <ReportsPage />
              </RoleRoute>
            }
          />

          <Route
            path="users"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <UsersPage />
              </RoleRoute>
            }
          />

          <Route
            path="roles"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <RolesPage />
              </RoleRoute>
            }
          />

          <Route
            path="settings"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <SettingsPage />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}