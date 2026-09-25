import { useMemo, useState } from "react";

import {
  Building2,
  CheckCircle2,
  Pencil,
  Plus,
  Power,
  Search,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { CompanyModal } from "../components/CompanyModal";

import {
  useActivateCompany,
  useCompanies,
  useCreateCompany,
  useDeactivateCompany,
  useUpdateCompany,
} from "../hooks/UseCompanies";

import type {
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
} from "../types/company.types";

// ============================================================
// PAGE
// ============================================================

export function CompaniesPage() {
  // ==========================================================
  // DATA
  // ==========================================================

  const {
    data: companies = [],

    isLoading,

    isError,
  } = useCompanies();

  const createCompany = useCreateCompany();

  const updateCompany = useUpdateCompany();

  const activateCompany = useActivateCompany();

  const deactivateCompany = useDeactivateCompany();

  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [actionError, setActionError] = useState("");

  // ==========================================================
  // FILTROS
  // ==========================================================

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return companies.filter((company) => {
      if (statusFilter === "ACTIVE" && !company.isActive) {
        return false;
      }

      if (statusFilter === "INACTIVE" && company.isActive) {
        return false;
      }

      if (!term) {
        return true;
      }

      const legalName = company.legalName?.toLowerCase() ?? "";

      const tradeName = company.tradeName?.toLowerCase() ?? "";

      const ruc = company.ruc?.toLowerCase() ?? "";

      const address = company.address?.toLowerCase() ?? "";

      return (
        legalName.includes(term) ||
        tradeName.includes(term) ||
        ruc.includes(term) ||
        address.includes(term)
      );
    });
  }, [companies, search, statusFilter]);

  // ==========================================================
  // CONTADORES
  // ==========================================================

  const activeCompanies = companies.filter(
    (company) => company.isActive,
  ).length;

  const inactiveCompanies = companies.length - activeCompanies;

  // ==========================================================
  // MENSAJE ERROR API
  // ==========================================================

  const getErrorMessage = (
    error: any,

    fallback: string,
  ) => {
    const message = error?.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    return message ?? fallback;
  };

  // ==========================================================
  // CREAR
  // ==========================================================

  const handleCreate = async (data: CreateCompanyDto) => {
    setActionError("");

    try {
      await createCompany.mutateAsync(data);

      setCreateOpen(false);
    } catch (error: any) {
      setActionError(
        getErrorMessage(error, "No se pudo registrar la empresa."),
      );
    }
  };

  // ==========================================================
  // EDITAR
  // ==========================================================

  const handleUpdate = async (data: CreateCompanyDto) => {
    if (!editingCompany) {
      return;
    }

    setActionError("");

    try {
      const updateData: UpdateCompanyDto = {
        legalName: data.legalName,

        tradeName: data.tradeName,

        ruc: data.ruc,

        address: data.address,
      };

      await updateCompany.mutateAsync({
        id: editingCompany.id,

        data: updateData,
      });

      setEditingCompany(null);
    } catch (error: any) {
      setActionError(
        getErrorMessage(error, "No se pudo actualizar la empresa."),
      );
    }
  };

  // ==========================================================
  // ACTIVAR
  // ==========================================================

  const handleActivate = async (company: Company) => {
    const confirmed = window.confirm(
      `¿Deseas activar la empresa "${company.tradeName || company.legalName}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await activateCompany.mutateAsync(company.id);
    } catch (error: any) {
      setActionError(getErrorMessage(error, "No se pudo activar la empresa."));
    }
  };

  // ==========================================================
  // DESACTIVAR
  // ==========================================================

  const handleDeactivate = async (company: Company) => {
    const confirmed = window.confirm(
      `¿Deseas desactivar la empresa "${company.tradeName || company.legalName}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await deactivateCompany.mutateAsync(company.id);
    } catch (error: any) {
      setActionError(
        getErrorMessage(error, "No se pudo desactivar la empresa."),
      );
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center text-gray-500 shadow-sm">
          Cargando empresas...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (isError) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          No se pudieron cargar las empresas.
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-7 p-1">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hr-background">
            <Building2 size={24} className="text-hr-primary" />
          </div>
          Empresas
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Administración de empresas empleadoras del personal
        </p>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total empresas
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {companies.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hr-background">
              <Building2 size={23} className="text-hr-primary" />
            </div>
          </div>
        </div>

        {/* ACTIVAS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Empresas activas
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {activeCompanies}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 size={23} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* INACTIVAS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Empresas inactivas
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-600">
                {inactiveCompanies}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <XCircle size={23} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR ACCIÓN
      ===================================================== */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">{actionError}</p>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:flex-row">
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              className="h-11 pl-11"
              value={search}
              placeholder="Buscar empresa, nombre comercial, RUC o dirección..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
          >
            <option value="ALL">Todas</option>

            <option value="ACTIVE">Activas</option>

            <option value="INACTIVE">Inactivas</option>
          </select>
        </div>

        <Button
          type="button"
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 px-5"
          onClick={() => {
            setActionError("");

            setCreateOpen(true);
          }}
        >
          <Plus size={18} />
          Nueva empresa
        </Button>
      </div>

      {/* =====================================================
          RESULTADOS
      ===================================================== */}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          Mostrando{" "}
          <span className="font-semibold text-gray-700">
            {filteredCompanies.length}
          </span>{" "}
          empresas
        </p>
      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Empresa
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  RUC
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Dirección
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Building2
                      size={38}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="font-medium text-gray-600">
                      No se encontraron empresas
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Intenta cambiar los filtros de búsqueda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="transition hover:bg-gray-50">
                    {/* EMPRESA */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          <Building2 size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {company.tradeName || company.legalName}
                          </p>

                          {company.tradeName && (
                            <p className="mt-1 max-w-md text-xs text-gray-500">
                              {company.legalName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* RUC */}

                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-medium text-gray-700">
                        {company.ruc}
                      </span>
                    </td>

                    {/* DIRECCIÓN */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {company.address || "—"}
                    </td>

                    {/* ESTADO */}

                    <td className="px-5 py-4 text-center">
                      {company.isActive ? (
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Inactiva
                        </span>
                      )}
                    </td>

                    {/* ACCIONES */}

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="Editar"
                          onClick={() => {
                            setActionError("");

                            setEditingCompany(company);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-hr-primary hover:bg-hr-background hover:text-hr-primary"
                        >
                          <Pencil size={16} />
                        </button>

                        {company.isActive ? (
                          <button
                            type="button"
                            title="Desactivar"
                            disabled={deactivateCompany.isPending}
                            onClick={() => handleDeactivate(company)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Power size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Activar"
                            disabled={activateCompany.isPending}
                            onClick={() => handleActivate(company)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Power size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          CREAR
      ===================================================== */}

      <CompanyModal
        open={createOpen}
        loading={createCompany.isPending}
        onClose={() => {
          if (createCompany.isPending) {
            return;
          }

          setCreateOpen(false);
        }}
        onSubmit={handleCreate}
      />

      {/* =====================================================
          EDITAR
      ===================================================== */}

      <CompanyModal
        open={editingCompany !== null}
        loading={updateCompany.isPending}
        defaultValues={
          editingCompany
            ? {
                legalName: editingCompany.legalName,

                tradeName: editingCompany.tradeName,

                ruc: editingCompany.ruc,

                address: editingCompany.address,
              }
            : undefined
        }
        onClose={() => {
          if (updateCompany.isPending) {
            return;
          }

          setEditingCompany(null);
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
