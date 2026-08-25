import type {
  LucideIcon,
} from "lucide-react";

import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowRightLeft,
  ArrowUp,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  PackageCheck,
  PackageX,
  RefreshCw,
  ShoppingCart,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useDashboard,
} from "../hooks/useDashboard";

// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value:
    string |
    null |
    undefined,
  withTime = false,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  if (withTime) {
    return date.toLocaleString(
      "es-PE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  return date.toLocaleDateString(
    "es-PE",
  );
}

function movementLabel(
  movementType:
    string,
) {
  switch (
    movementType
  ) {
    case "ENTRY":
      return "Entrada";

    case "OUTPUT":
      return "Salida";

    case "TRANSFER":
      return "Transferencia";

    case "ADJUSTMENT_IN":
      return "Ajuste +";

    case "ADJUSTMENT_OUT":
      return "Ajuste -";

    default:
      return movementType;
  }
}

function movementIcon(
  movementType:
    string,
) {
  switch (
    movementType
  ) {
    case "ENTRY":
      return {
        icon:
          ArrowUp,
        className:
          "bg-emerald-50 text-emerald-600",
      };

    case "OUTPUT":
      return {
        icon:
          ArrowDown,
        className:
          "bg-red-50 text-red-600",
      };

    case "TRANSFER":
      return {
        icon:
          ArrowRightLeft,
        className:
          "bg-blue-50 text-blue-600",
      };

    case "ADJUSTMENT_IN":
      return {
        icon:
          ArrowUp,
        className:
          "bg-teal-50 text-teal-600",
      };

    case "ADJUSTMENT_OUT":
      return {
        icon:
          ArrowDown,
        className:
          "bg-amber-50 text-amber-600",
      };

    default:
      return {
        icon:
          ArrowRightLeft,
        className:
          "bg-gray-50 text-gray-600",
      };
  }
}

// ============================================================
// KPI
// ============================================================

interface MetricCardProps {
  title:
    string;

  value:
    number;

  subtitle?:
    string;

  icon:
    LucideIcon;

  to:
    string;

  iconClass:
    string;

  cardClass:
    string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon:
    Icon,
  to,
  iconClass,
  cardClass,
}: MetricCardProps) {
  return (
    <Link
      to={
        to
      }
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${cardClass}
      `}
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-4
          "
        >
          <div
            className={`
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              shadow-sm
              ${iconClass}
            `}
          >
            <Icon
              size={
                23
              }
              strokeWidth={
                2
              }
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-[13px]
                font-semibold
                leading-4
                text-slate-600
              "
            >
              {
                title
              }
            </p>

            <div
              className="
                mt-1
                flex
                items-end
                gap-2
              "
            >
              <span
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-slate-950
                "
              >
                {
                  value
                }
              </span>

              {subtitle && (
                <span
                  className="
                    mb-1
                    text-[11px]
                    font-medium
                    text-slate-400
                  "
                >
                  {
                    subtitle
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        <ArrowRight
          size={
            18
          }
          className="
            shrink-0
            text-slate-300
            opacity-0
            transition
            group-hover:translate-x-1
            group-hover:opacity-100
          "
        />
      </div>
    </Link>
  );
}

// ============================================================
// STATUS DE REQUERIMIENTO
// ============================================================

interface StatusCardProps {
  title:
    string;

  value:
    number;

  total:
    number;

  icon:
    LucideIcon;

  iconClass:
    string;

  barClass:
    string;
}

function RequestStatusCard({
  title,
  value,
  total,
  icon:
    Icon,
  iconClass,
  barClass,
}: StatusCardProps) {
  const percentage =
    total > 0
      ? Math.round(
          (
            value /
            total
          ) *
            1000,
        ) /
        10
      : 0;

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3.5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            ${iconClass}
          `}
        >
          <Icon
            size={
              18
            }
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-2
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  text-slate-500
                "
              >
                {
                  title
                }
              </p>

              <p
                className="
                  mt-0.5
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                {
                  value
                }
              </p>
            </div>

            <span
              className="
                text-[10px]
                font-semibold
                text-slate-400
              "
            >
              {
                percentage
              }
              %
            </span>
          </div>

          <div
            className="
              mt-2
              h-1.5
              overflow-hidden
              rounded-full
              bg-slate-100
            "
          >
            <div
              className={`
                h-full
                rounded-full
                transition-all
                duration-500
                ${barClass}
              `}
              style={{
                width:
                  `${Math.min(
                    percentage,
                    100,
                  )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TITULO DE PANEL
// ============================================================

function PanelTitle({
  title,
  subtitle,
  icon:
    Icon,
  iconClass =
    "text-orange-600",
}: {
  title:
    string;

  subtitle:
    string;

  icon:
    LucideIcon;

  iconClass?:
    string;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className={`
          mt-0.5
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-slate-50
          ${iconClass}
        `}
      >
        <Icon
          size={
            19
          }
        />
      </div>

      <div>
        <h2
          className="
            text-[15px]
            font-bold
            text-slate-900
          "
        >
          {
            title
          }
        </h2>

        <p
          className="
            mt-0.5
            text-[11px]
            leading-4
            text-slate-400
          "
        >
          {
            subtitle
          }
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } =
    useDashboard();

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    isLoading
  ) {
    return (
      <div
        className="
          flex
          min-h-[65vh]
          items-center
          justify-center
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-8
            py-7
            text-center
            shadow-sm
          "
        >
          <RefreshCw
            size={
              26
            }
            className="
              mx-auto
              animate-spin
              text-orange-500
            "
          />

          <p
            className="
              mt-3
              text-sm
              font-medium
              text-slate-500
            "
          >
            Cargando indicadores...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    isError ||
    !data
  ) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-8
          text-center
        "
      >
        <AlertTriangle
          size={
            30
          }
          className="
            mx-auto
            text-red-500
          "
        />

        <p
          className="
            mt-3
            font-bold
            text-red-700
          "
        >
          No se pudo cargar el dashboard.
        </p>

        <button
          type="button"
          onClick={() =>
            refetch()
          }
          className="
            mt-4
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-red-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-700
          "
        >
          <RefreshCw
            size={
              16
            }
          />

          Reintentar
        </button>
      </div>
    );
  }

  // ==========================================================
  // CONTEXTO
  // ==========================================================

  const isGlobal =
    data.scope.global;

  const warehouseName =
    data.scope
      .warehouse
      ?.name ??
    "";

  const totalRequestStatuses =
    data.requests
      .pendingRequests +
    data.requests
      .approvedRequests +
    data.requests
      .inProgressRequests +
    data.requests
      .deliveredRequests +
    data.requests
      .completedRequests +
    data.requests
      .rejectedRequests;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      className="
        min-h-full
        bg-slate-50/70
        p-1
        sm:p-2
      "
    >
      <div
        className="
          space-y-5
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <section
          className="
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-5
            shadow-sm
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-orange-50
                text-orange-600
              "
            >
              <ArrowRightLeft
                size={
                  24
                }
              />
            </div>

            <div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <h1
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    text-slate-950
                    sm:text-3xl
                  "
                >
                  Dashboard Logístico
                </h1>

                {!isGlobal &&
                  warehouseName && (
                    <span
                      className="
                        rounded-full
                        bg-orange-100
                        px-2.5
                        py-1
                        text-xs
                        font-bold
                        text-orange-700
                      "
                    >
                      {
                        warehouseName
                      }
                    </span>
                  )}
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {isGlobal
                  ? "Vista general de toda la operación logística."
                  : `Indicadores operativos de ${warehouseName}.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              isFetching
            }
            onClick={() =>
              refetch()
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-orange-500
              px-4
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-orange-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={
                17
              }
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Actualizar
          </button>
        </section>

        {/* ===================================================
            OPERACION PENDIENTE
        =================================================== */}

        <section>
          <div
            className="
              mb-3
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-base
                  font-black
                  text-slate-900
                "
              >
                Operación pendiente
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Documentos que requieren atención dentro del flujo logístico.
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            <MetricCard
              title="Requerimientos pendientes"
              value={
                data.summary
                  .pendingRequests
              }
              icon={
                ClipboardList
              }
              to="/requests"
              cardClass="
                border-orange-200
                bg-gradient-to-br
                from-orange-50
                to-white
              "
              iconClass="
                bg-orange-500
                text-white
              "
            />

            <MetricCard
              title="O.C. por recepcionar"
              value={
                data.summary
                  .pendingPurchases
              }
              icon={
                ShoppingCart
              }
              to="/purchases"
              cardClass="
                border-blue-200
                bg-gradient-to-br
                from-blue-50
                to-white
              "
              iconClass="
                bg-blue-600
                text-white
              "
            />

            <MetricCard
              title="Guías emitidas"
              value={
                data.summary
                  .issuedGuides
              }
              icon={
                Truck
              }
              to="/remission-guides"
              cardClass="
                border-green-200
                bg-gradient-to-br
                from-green-50
                to-white
              "
              iconClass="
                bg-green-600
                text-white
              "
            />

            <MetricCard
              title="Recepciones pendientes"
              value={
                data.summary
                  .pendingRouteSheets
              }
              icon={
                ClipboardCheck
              }
              to="/route-sheets"
              cardClass="
                border-violet-200
                bg-gradient-to-br
                from-violet-50
                to-white
              "
              iconClass="
                bg-violet-600
                text-white
              "
            />
          </div>
        </section>

        {/* ===================================================
            INVENTARIO
        =================================================== */}

        <section>
          <div
            className="
              mb-3
            "
          >
            <h2
              className="
                text-base
                font-black
                text-slate-900
              "
            >
              Inventario y control
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            <MetricCard
              title={
                isGlobal
                  ? "Productos"
                  : "Productos en inventario"
              }
              value={
                data.summary
                  .totalProducts
              }
              subtitle="en inventario"
              icon={
                Boxes
              }
              to="/inventory"
              cardClass="
                border-cyan-200
                bg-gradient-to-br
                from-cyan-50
                to-white
              "
              iconClass="
                bg-cyan-600
                text-white
              "
            />

            <MetricCard
              title="Stock bajo"
              value={
                data.inventory
                  .lowStockProducts
              }
              icon={
                AlertTriangle
              }
              to="/inventory"
              cardClass="
                border-amber-200
                bg-gradient-to-br
                from-amber-50
                to-white
              "
              iconClass="
                bg-amber-500
                text-white
              "
            />

            <MetricCard
              title="Sin stock"
              value={
                data.inventory
                  .outOfStockProducts
              }
              icon={
                PackageX
              }
              to="/inventory"
              cardClass="
                border-red-200
                bg-gradient-to-br
                from-red-50
                to-white
              "
              iconClass="
                bg-red-500
                text-white
              "
            />

            <MetricCard
              title="Movimientos"
              value={
                data.summary
                  .totalMovements
              }
              subtitle="registrados"
              icon={
                ArrowRightLeft
              }
              to="/movements"
              cardClass="
                border-indigo-200
                bg-gradient-to-br
                from-indigo-50
                to-white
              "
              iconClass="
                bg-indigo-600
                text-white
              "
            />
          </div>
        </section>

        {/* ===================================================
            ESTADO REQUERIMIENTOS
        =================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              mb-4
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-base
                  font-black
                  text-slate-900
                "
              >
                Estado de requerimientos
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Seguimiento desde aprobación hasta cierre.
              </p>
            </div>

            <Link
              to="/requests"
              className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-bold
                text-blue-600
                hover:text-blue-700
              "
            >
              Ver requerimientos

              <ArrowRight
                size={
                  14
                }
              />
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
              2xl:grid-cols-6
            "
          >
            <RequestStatusCard
              title="Pendientes"
              value={
                data.requests
                  .pendingRequests
              }
              total={
                totalRequestStatuses
              }
              icon={
                ClipboardList
              }
              iconClass="
                bg-orange-100
                text-orange-600
              "
              barClass="
                bg-orange-500
              "
            />

            <RequestStatusCard
              title="Aprobados"
              value={
                data.requests
                  .approvedRequests
              }
              total={
                totalRequestStatuses
              }
              icon={
                CheckCircle2
              }
              iconClass="
                bg-green-100
                text-green-600
              "
              barClass="
                bg-green-500
              "
            />

            <RequestStatusCard
              title="En despacho"
              value={
                data.requests
                  .inProgressRequests
              }
              total={
                totalRequestStatuses
              }
              icon={
                Truck
              }
              iconClass="
                bg-blue-100
                text-blue-600
              "
              barClass="
                bg-blue-500
              "
            />

            <RequestStatusCard
              title="Entregados"
              value={
                data.requests
                  .deliveredRequests
              }
              total={
                totalRequestStatuses
              }
              icon={
                PackageCheck
              }
              iconClass="
                bg-cyan-100
                text-cyan-700
              "
              barClass="
                bg-cyan-500
              "
            />

            <RequestStatusCard
              title="Completados"
              value={
                data.requests
                  .completedRequests
              }
              total={
                totalRequestStatuses
              }
              icon={
                ShieldCheck
              }
              iconClass="
                bg-emerald-100
                text-emerald-600
              "
              barClass="
                bg-emerald-500
              "
            />

            <RequestStatusCard
              title="Rechazados"
              value={
                data.requests
                  .rejectedRequests
              }
              total={
                totalRequestStatuses
              }
              icon={
                XCircle
              }
              iconClass="
                bg-red-100
                text-red-600
              "
              barClass="
                bg-red-500
              "
            />
          </div>
        </section>

        {/* ===================================================
            TRES PANELES
        =================================================== */}

        <section
          className="
            grid
            grid-cols-1
            gap-4
            xl:grid-cols-3
          "
        >
          {/* STOCK CRITICO */}

          <div
            className="
              flex
              min-h-[365px]
              flex-col
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <PanelTitle
              title="Stock crítico"
              subtitle="Productos iguales o por debajo del mínimo."
              icon={
                AlertTriangle
              }
              iconClass="text-red-500"
            />

            <div
              className="
                mt-4
                flex-1
                divide-y
                divide-slate-100
              "
            >
              {data.alerts
                .lowStockAlerts
                .length ===
              0 ? (
                <div
                  className="
                    flex
                    h-full
                    min-h-48
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      text-center
                    "
                  >
                    <CheckCircle2
                      size={
                        30
                      }
                      className="
                        mx-auto
                        text-green-500
                      "
                    />

                    <p
                      className="
                        mt-2
                        text-sm
                        font-medium
                        text-slate-400
                      "
                    >
                      No hay stock crítico.
                    </p>
                  </div>
                </div>
              ) : (
                data.alerts
                  .lowStockAlerts
                  .slice(
                    0,
                    6,
                  )
                  .map(
                    (
                      item,
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          py-2.5
                        "
                      >
                        <div
                          className="
                            min-w-0
                          "
                        >
                          <p
                            className="
                              truncate
                              text-[12px]
                              font-bold
                              text-slate-800
                            "
                          >
                            {
                              item.product
                                ?.name
                            }
                          </p>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[10px]
                              text-slate-400
                            "
                          >
                            {
                              item.warehouse
                                ?.name
                            }
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-3
                          "
                        >
                          <span
                            className="
                              text-[10px]
                              font-semibold
                              text-slate-400
                            "
                          >
                            Mín.{" "}
                            {
                              item.product
                                ?.minimumStock
                            }
                          </span>

                          <span
                            className="
                              min-w-7
                              text-right
                              text-sm
                              font-black
                              text-red-600
                            "
                          >
                            {
                              item.quantity
                            }
                          </span>
                        </div>
                      </div>
                    ),
                  )
              )}
            </div>

            <Link
              to="/inventory"
              className="
                mt-4
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-3
                text-xs
                font-bold
                text-red-600
                transition
                hover:bg-red-100
              "
            >
              Ver todo el stock crítico

              <ArrowRight
                size={
                  13
                }
              />
            </Link>
          </div>

          {/* PENDIENTES RECEPCION */}

          <div
            className="
              flex
              min-h-[365px]
              flex-col
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <PanelTitle
              title="Pendientes de recepción"
              subtitle="Guías que aún no tienen Hoja de Recorrido."
              icon={
                FileCheck2
              }
              iconClass="text-blue-600"
            />

            <div
              className="
                mt-4
                flex-1
                divide-y
                divide-slate-100
              "
            >
              {data.guides
                .recentPendingReceptionGuides
                .length ===
              0 ? (
                <div
                  className="
                    flex
                    h-full
                    min-h-48
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      text-center
                    "
                  >
                    <CheckCircle2
                      size={
                        30
                      }
                      className="
                        mx-auto
                        text-green-500
                      "
                    />

                    <p
                      className="
                        mt-2
                        text-sm
                        font-medium
                        text-slate-400
                      "
                    >
                      No hay recepciones pendientes.
                    </p>
                  </div>
                </div>
              ) : (
                data.guides
                  .recentPendingReceptionGuides
                  .map(
                    (
                      guide,
                    ) => (
                      <div
                        key={
                          guide.id
                        }
                        className="
                          py-3
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                          "
                        >
                          <p
                            className="
                              text-[12px]
                              font-black
                              text-slate-800
                            "
                          >
                            {
                              guide.fullNumber
                            }
                          </p>

                          <span
                            className="
                              text-[10px]
                              font-semibold
                              text-slate-400
                            "
                          >
                            {formatDate(
                              guide.transferStartDate,
                            )}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1
                            text-[11px]
                            font-medium
                            text-slate-500
                          "
                        >
                          {
                            guide
                              .destinationWarehouse
                              ?.name ??
                            "Destino no disponible"
                          }
                        </p>
                      </div>
                    ),
                  )
              )}
            </div>

            <Link
              to="/route-sheets"
              className="
                mt-4
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-blue-200
                bg-blue-50
                px-3
                text-xs
                font-bold
                text-blue-600
                transition
                hover:bg-blue-100
              "
            >
              Ir a Hojas de Recorrido

              <ArrowRight
                size={
                  13
                }
              />
            </Link>
          </div>

          {/* OC RECIENTES */}

          <div
            className="
              flex
              min-h-[365px]
              flex-col
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <PanelTitle
              title="Órdenes de Compra recientes"
              subtitle="Últimas O.C. registradas en tu alcance."
              icon={
                ShoppingCart
              }
              iconClass="text-orange-500"
            />

            <div
              className="
                mt-4
                flex-1
                divide-y
                divide-slate-100
              "
            >
              {data.purchases
                .recentPurchases
                .length ===
              0 ? (
                <div
                  className="
                    flex
                    h-full
                    min-h-48
                    items-center
                    justify-center
                  "
                >
                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-400
                    "
                  >
                    No hay O.C. recientes.
                  </p>
                </div>
              ) : (
                data.purchases
                  .recentPurchases
                  .slice(
                    0,
                    5,
                  )
                  .map(
                    (
                      purchase,
                    ) => (
                      <div
                        key={
                          purchase.id
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          py-2.5
                        "
                      >
                        <div
                          className="
                            min-w-0
                          "
                        >
                          <p
                            className="
                              truncate
                              text-[12px]
                              font-black
                              text-slate-800
                            "
                          >
                            {
                              purchase.purchaseOrderNumber
                            }
                          </p>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[10px]
                              uppercase
                              tracking-wide
                              text-slate-400
                            "
                          >
                            {
                              purchase.supplier
                                ?.name ??
                              "Sin proveedor"
                            }
                          </p>
                        </div>

                        <span
                          className={`
                            shrink-0
                            rounded-md
                            px-2
                            py-1
                            text-[10px]
                            font-bold
                            ${
                              purchase.status ===
                              "RECEIVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          `}
                        >
                          {purchase.status ===
                          "RECEIVED"
                            ? "Recibida"
                            : "Pendiente"}
                        </span>
                      </div>
                    ),
                  )
              )}
            </div>

            <Link
              to="/purchases"
              className="
                mt-4
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-orange-200
                bg-orange-50
                px-3
                text-xs
                font-bold
                text-orange-600
                transition
                hover:bg-orange-100
              "
            >
              Ver todas las O.C.

              <ArrowRight
                size={
                  13
                }
              />
            </Link>
          </div>
        </section>

        {/* ===================================================
            ACTIVIDAD RECIENTE
        =================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-slate-100
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <PanelTitle
              title="Actividad reciente de inventario"
              subtitle={
                isGlobal
                  ? "Últimos movimientos relacionados con toda la operación."
                  : `Últimos movimientos relacionados con ${warehouseName}.`
              }
              icon={
                ArrowRightLeft
              }
              iconClass="text-blue-600"
            />

            <Link
              to="/movements"
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-bold
                text-blue-600
                hover:text-blue-700
              "
            >
              Ver toda la actividad

              <ArrowRight
                size={
                  13
                }
              />
            </Link>
          </div>

          {data.movements
            .recentMovements
            .length ===
          0 ? (
            <div
              className="
                flex
                min-h-44
                items-center
                justify-center
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  text-slate-400
                "
              >
                No hay movimientos recientes.
              </p>
            </div>
          ) : (
            <div
              className="
                overflow-x-auto
              "
            >
              <table
                className="
                  min-w-[900px]
                  w-full
                  text-xs
                "
              >
                <thead
                  className="
                    bg-slate-50
                    text-slate-500
                  "
                >
                  <tr>
                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-bold
                      "
                    >
                      Tipo
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-bold
                      "
                    >
                      Producto
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-bold
                      "
                    >
                      Origen
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-bold
                      "
                    >
                      Destino
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-center
                        font-bold
                      "
                    >
                      Cantidad
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-bold
                      "
                    >
                      Fecha
                    </th>
                  </tr>
                </thead>

                <tbody
                  className="
                    divide-y
                    divide-slate-100
                  "
                >
                  {data.movements
                    .recentMovements
                    .slice(
                      0,
                      8,
                    )
                    .map(
                      (
                        movement,
                      ) => {
                        const source =
                          movement
                            .sourceInventory
                            ?.warehouse
                            ?.name;

                        const destination =
                          movement
                            .destinationInventory
                            ?.warehouse
                            ?.name;

                        const product =
                          movement
                            .sourceInventory
                            ?.product
                            ?.name ??
                          movement
                            .destinationInventory
                            ?.product
                            ?.name ??
                          "Producto";

                        const movementMeta =
                          movementIcon(
                            movement.movementType,
                          );

                        const MovementIcon =
                          movementMeta.icon;

                        return (
                          <tr
                            key={
                              movement.id
                            }
                            className="
                              transition
                              hover:bg-slate-50/80
                            "
                          >
                            <td
                              className="
                                px-5
                                py-3
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >
                                <span
                                  className={`
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    ${movementMeta.className}
                                  `}
                                >
                                  <MovementIcon
                                    size={
                                      14
                                    }
                                  />
                                </span>

                                <span
                                  className="
                                    font-semibold
                                    text-slate-600
                                  "
                                >
                                  {movementLabel(
                                    movement.movementType,
                                  )}
                                </span>
                              </div>
                            </td>

                            <td
                              className="
                                max-w-[280px]
                                px-5
                                py-3
                                font-bold
                                text-slate-800
                              "
                            >
                              <p
                                className="
                                  truncate
                                "
                              >
                                {
                                  product
                                }
                              </p>
                            </td>

                            <td
                              className="
                                px-5
                                py-3
                                text-slate-500
                              "
                            >
                              {
                                source ??
                                "—"
                              }
                            </td>

                            <td
                              className="
                                px-5
                                py-3
                                text-slate-500
                              "
                            >
                              {
                                destination ??
                                "—"
                              }
                            </td>

                            <td
                              className="
                                px-5
                                py-3
                                text-center
                                text-sm
                                font-black
                                text-slate-900
                              "
                            >
                              {
                                movement.quantity
                              }
                            </td>

                            <td
                              className="
                                whitespace-nowrap
                                px-5
                                py-3
                                text-slate-500
                              "
                            >
                              {formatDate(
                                movement.createdAt,
                                true,
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===================================================
            ALERTA HOJAS
        =================================================== */}

        {data.summary
          .routeSheetsWithObservations >
          0 && (
          <Link
            to="/route-sheets"
            className="
              group
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-red-200
              bg-gradient-to-r
              from-red-50
              to-white
              px-5
              py-4
              transition
              hover:border-red-300
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-100
                  text-red-600
                "
              >
                <AlertTriangle
                  size={
                    22
                  }
                />
              </div>

              <div>
                <p
                  className="
                    font-black
                    text-red-700
                  "
                >
                  Hojas de Recorrido con observaciones
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-red-600
                  "
                >
                  Hay{" "}
                  {
                    data.summary
                      .routeSheetsWithObservations
                  }{" "}
                  recepción(es) no conformes que requieren revisión.
                </p>
              </div>
            </div>

            <span
              className="
                inline-flex
                h-9
                shrink-0
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-red-200
                bg-white
                px-3
                text-xs
                font-bold
                text-red-600
                transition
                group-hover:bg-red-50
              "
            >
              Ver observaciones

              <ArrowRight
                size={
                  13
                }
              />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}