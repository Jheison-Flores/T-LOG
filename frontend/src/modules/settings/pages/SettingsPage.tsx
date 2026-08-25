import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  Save,
  Settings,
  Truck,
} from "lucide-react";

import {
  useSettings,
  useUpdateSettings,
} from "../hooks/useSettings";

import {
  useSettingsWarehouses,
} from "../hooks/useSettingsWarehouses";

import type { UpdateSettingsDto } from "../types/setttings.types";

export function SettingsPage() {
  const {
    data,
    isLoading,
    isError,
  } = useSettings();

  const {
    data: warehouses = [],
  } =
    useSettingsWarehouses();

  const updateMutation =
    useUpdateSettings();

  const [
    form,
    setForm,
  ] =
    useState<UpdateSettingsDto>({
      companyName:
        "",

      ruc:
        "",

      companyAddress:
        "",

      companyPhone:
        "",

      companyEmail:
        "",

      centralWarehouseId:
        null,

      requestPrefix:
        "REQ",

      dispatchPrefix:
        "DSP",

      purchasePrefix:
        "COM",

      systemName:
        "T-LOG",

      currency:
        "PEN",

      timezone:
        "America/Lima",
    });

  // ============================================================
  // CARGAR CONFIGURACIÓN
  // ============================================================

  useEffect(() => {
    if (!data) {
      return;
    }

    setForm({
      companyName:
        data.companyName ??
        "",

      ruc:
        data.ruc ??
        "",

      companyAddress:
        data.companyAddress ??
        "",

      companyPhone:
        data.companyPhone ??
        "",

      companyEmail:
        data.companyEmail ??
        "",

      centralWarehouseId:
        data.centralWarehouse
          ?.id ??
        null,

      requestPrefix:
        data.requestPrefix ??
        "REQ",

      dispatchPrefix:
        data.dispatchPrefix ??
        "DSP",

      purchasePrefix:
        data.purchasePrefix ??
        "COM",

      systemName:
        data.systemName ??
        "T-LOG",

      currency:
        data.currency ??
        "PEN",

      timezone:
        data.timezone ??
        "America/Lima",
    });
  }, [
    data,
  ]);

  // ============================================================
  // INPUT
  // ============================================================

  function updateField(
    field:
      keyof UpdateSettingsDto,

    value:
      string | number | null,
  ) {
    setForm(
      (previous) => ({
        ...previous,

        [field]:
          value,
      }),
    );
  }

  // ============================================================
  // GUARDAR
  // ============================================================

  async function handleSubmit(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    try {
      await updateMutation.mutateAsync({
        ...form,

        requestPrefix:
          form.requestPrefix
            ?.trim()
            .toUpperCase(),

        dispatchPrefix:
          form.dispatchPrefix
            ?.trim()
            .toUpperCase(),

        purchasePrefix:
          form.purchasePrefix
            ?.trim()
            .toUpperCase(),

        currency:
          form.currency
            ?.trim()
            .toUpperCase(),
      });

      alert(
        "Configuración guardada correctamente.",
      );
    } catch (
      error:
        any
    ) {
      alert(
        error?.response?.data?.message ??
          "No se pudo guardar la configuración.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Cargando configuración...
        </p>
      </div>
    );
  }

  if (
    isError ||
    !data
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <p className="font-medium text-red-600">
          No se pudo cargar la configuración.
        </p>
      </div>
    );
  }

  const activeWarehouses =
    warehouses.filter(
      (warehouse) =>
        warehouse.isActive ||
        warehouse.id ===
          form.centralWarehouseId,
    );

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configuración
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Parámetros generales de T-LOG y de la operación logística.
          </p>
        </div>

        <button
          type="submit"
          disabled={
            updateMutation.isPending
          }
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-orange-500
            px-5
            py-2.5
            font-semibold
            text-white
            transition
            hover:bg-orange-600
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <Save size={18} />

          {updateMutation.isPending
            ? "Guardando..."
            : "Guardar cambios"}
        </button>

      </div>

      {/* =====================================================
          EMPRESA
      ===================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Building2 size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Datos de la empresa
            </h2>

            <p className="text-sm text-gray-500">
              Información institucional utilizada por el sistema.
            </p>
          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre de la empresa
            </label>

            <input
              type="text"
              value={
                form.companyName ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "companyName",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
              placeholder="Teincomin"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              RUC
            </label>

            <input
              type="text"
              value={
                form.ruc ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "ruc",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
              placeholder="20123456789"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Dirección
            </label>

            <input
              type="text"
              value={
                form.companyAddress ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "companyAddress",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
              placeholder="Dirección de la empresa"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Teléfono
            </label>

            <input
              type="text"
              value={
                form.companyPhone ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "companyPhone",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
              placeholder="01 000 0000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Correo
            </label>

            <input
              type="email"
              value={
                form.companyEmail ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "companyEmail",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
              placeholder="logistica@teincomin.com"
            />
          </div>

        </div>

      </section>

      {/* =====================================================
          LOGÍSTICA
      ===================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <Truck size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Configuración logística
            </h2>

            <p className="text-sm text-gray-500">
              Parámetros utilizados en solicitudes, despachos y compras.
            </p>
          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="xl:col-span-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Almacén central
            </label>

            <select
              value={
                form.centralWarehouseId ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "centralWarehouseId",

                  event.target.value
                    ? Number(
                        event.target.value,
                      )
                    : null,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
            >
              <option value="">
                Seleccionar
              </option>

              {activeWarehouses.map(
                (
                  warehouse,
                ) => (
                  <option
                    key={
                      warehouse.id
                    }
                    value={
                      warehouse.id
                    }
                  >
                    {warehouse.name}
                  </option>
                ),
              )}

            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Prefijo solicitudes
            </label>

            <input
              type="text"
              value={
                form.requestPrefix ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "requestPrefix",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 uppercase outline-none focus:border-orange-400"
              placeholder="REQ"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Prefijo despachos
            </label>

            <input
              type="text"
              value={
                form.dispatchPrefix ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "dispatchPrefix",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 uppercase outline-none focus:border-orange-400"
              placeholder="DSP"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Prefijo compras
            </label>

            <input
              type="text"
              value={
                form.purchasePrefix ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "purchasePrefix",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 uppercase outline-none focus:border-orange-400"
              placeholder="COM"
            />
          </div>

        </div>

      </section>

      {/* =====================================================
          SISTEMA
      ===================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <Settings size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Configuración del sistema
            </h2>

            <p className="text-sm text-gray-500">
              Parámetros generales utilizados por T-LOG.
            </p>
          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre del sistema
            </label>

            <input
              type="text"
              value={
                form.systemName ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "systemName",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Moneda
            </label>

            <select
              value={
                form.currency ??
                "PEN"
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "currency",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
            >

              <option value="PEN">
                PEN - Sol peruano
              </option>

              <option value="USD">
                USD - Dólar estadounidense
              </option>

            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Zona horaria
            </label>

            <select
              value={
                form.timezone ??
                "America/Lima"
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "timezone",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400"
            >

              <option value="America/Lima">
                America/Lima
              </option>

            </select>
          </div>

        </div>

      </section>

    </form>
  );
}