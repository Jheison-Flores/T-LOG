import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProductSearchSelect } from "@/components/selectors/ProductSearchSelect";

import type { Product } from "@/modules/products/types/product.types";
import type { Warehouse } from "@/modules/warehouses/types/warehouse.types";
import type { Request } from "@/modules/requests/types/request.types";

import type {
  CreateRemissionGuideDto,
  RemissionGuideType,
  TransferReason,
} from "../types/remission-guide.types";

interface GuideLine {
  requestDetailId?: number;
  productId: string;
  description: string;
  unit: string;
  approvedQuantity?: number;
  deliveredQuantity?: number;
  pendingQuantity?: number;
  quantity: string;
  totalWeight: string;
  freeText: boolean;
}

interface Props {
  open: boolean;
  requests: Request[];
  products: Product[];
  warehouses: Warehouse[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRemissionGuideDto) => void;
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const emptyManualLine = (): GuideLine => ({
  productId: "",
  description: "",
  unit: "",
  quantity: "1",
  totalWeight: "",
  freeText: false,
});

export function RemissionGuideModal({
  open,
  requests,
  products,
  warehouses,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [guideType, setGuideType] =
    useState<RemissionGuideType>("REQUEST");
  const [requestId, setRequestId] = useState("");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRuc, setRecipientRuc] = useState("");
  const [arrivalPoint, setArrivalPoint] = useState("");
  const [series, setSeries] = useState("002");
  const [issueDate, setIssueDate] = useState(getToday());
  const [transferStartDate, setTransferStartDate] = useState(getToday());
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [registrationCertificate, setRegistrationCertificate] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [transportCompanyName, setTransportCompanyName] = useState("");
  const [transportCompanyRuc, setTransportCompanyRuc] = useState("");
  const [purchaseOrderReference, setPurchaseOrderReference] = useState("");
  const [minimumCost, setMinimumCost] = useState("");
  const [transferReason, setTransferReason] =
    useState<TransferReason>("BETWEEN_ESTABLISHMENTS");
  const [otherTransferReason, setOtherTransferReason] = useState("");
  const [observations, setObservations] = useState("");
  const [lines, setLines] = useState<GuideLine[]>([]);
  const [error, setError] = useState("");

  const availableRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "APPROVED" ||
          request.status === "PARTIAL" ||
          request.status === "IN_PROGRESS",
      ),
    [requests],
  );

  const selectedRequest = useMemo(
    () =>
      requests.find((request) => request.id === Number(requestId)) ?? null,
    [requests, requestId],
  );

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive),
    [products],
  );

  const activeWarehouses = useMemo(
    () => warehouses.filter((warehouse) => warehouse.isActive),
    [warehouses],
  );

  const selectedProductIds = lines
    .map((line) => Number(line.productId))
    .filter((id) => id > 0);

  const resetForType = (type: RemissionGuideType) => {
    setGuideType(type);
    setRequestId("");
    setDestinationWarehouseId("");
    setRecipientName("");
    setRecipientRuc("");
    setArrivalPoint("");
    setLines(type === "REQUEST" ? [] : [emptyManualLine()]);
    setError("");

    if (type === "EXTERNAL_SERVICE") {
      setTransferReason("OTHER");
      setOtherTransferReason("Servicio externo");
    } else {
      setTransferReason("BETWEEN_ESTABLISHMENTS");
      setOtherTransferReason("");
    }
  };

  const handleRequestChange = (value: string) => {
    setRequestId(value);
    setError("");

    if (!value) {
      setLines([]);
      return;
    }

    const request = requests.find((item) => item.id === Number(value));

    if (!request) {
      setLines([]);
      return;
    }

    const pendingLines = request.details
      .map((detail) => {
        const approved = Number(detail.approvedQuantity);
        const delivered = Number(detail.deliveredQuantity);
        const pending = approved - delivered;

        return { detail, approved, delivered, pending };
      })
      .filter((item) => item.pending > 0)
      .map(
        (item): GuideLine => ({
          requestDetailId: item.detail.id,
          productId: String(item.detail.product.id),
          description: item.detail.product.name,
          unit: String(item.detail.product.unit),
          approvedQuantity: item.approved,
          deliveredQuantity: item.delivered,
          pendingQuantity: item.pending,
          quantity: String(item.pending),
          totalWeight: "",
          freeText: false,
        }),
      );

    setLines(pendingLines);
  };

  const updateLine = (
    index: number,
    field: keyof GuideLine,
    value: string | boolean,
  ) => {
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: value } : line,
      ),
    );
  };

  const handleProductChange = (index: number, productId: number | null) => {
    const product = activeProducts.find((item) => item.id === productId);

    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              productId: product ? String(product.id) : "",
              description: product?.name ?? "",
              unit: product ? String(product.unit) : "",
            }
          : line,
      ),
    );
  };

  const toggleFreeText = (index: number) => {
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              freeText: !line.freeText,
              productId: "",
              description: "",
              unit: "",
            }
          : line,
      ),
    );
  };

  const addLine = () => setLines((current) => [...current, emptyManualLine()]);
  const removeLine = (index: number) =>
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (guideType === "REQUEST" && !requestId) {
      setError("Selecciona un requerimiento.");
      return;
    }

    if (guideType === "MANUAL_WAREHOUSE" && !destinationWarehouseId) {
      setError("Selecciona la mina o almacén de destino.");
      return;
    }

    if (guideType === "EXTERNAL_SERVICE") {
      if (!recipientName.trim()) {
        setError("Indica el proveedor, taller o destinatario externo.");
        return;
      }

      if (!arrivalPoint.trim()) {
        setError("Indica el punto de llegada del servicio externo.");
        return;
      }
    }

    if (!transferStartDate) {
      setError("Indica la fecha de inicio del traslado.");
      return;
    }

    if (lines.length === 0) {
      setError("La guía debe contener al menos un producto.");
      return;
    }

    for (const line of lines) {
      const quantity = Number(line.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError(`La cantidad de "${line.description || "producto"}" debe ser mayor a cero.`);
        return;
      }

      if (
        guideType === "REQUEST" &&
        line.pendingQuantity !== undefined &&
        quantity > line.pendingQuantity
      ) {
        setError(
          `Solo quedan ${line.pendingQuantity} ${line.unit} pendientes de "${line.description}".`,
        );
        return;
      }

      if (guideType === "MANUAL_WAREHOUSE" && !Number(line.productId)) {
        setError("En una guía manual a mina todos los productos deben estar registrados.");
        return;
      }

      if (
        guideType === "EXTERNAL_SERVICE" &&
        !Number(line.productId) &&
        !line.description.trim()
      ) {
        setError("Completa la descripción del producto no registrado.");
        return;
      }
    }

    if (transferReason === "OTHER" && !otherTransferReason.trim()) {
      setError("Indica el otro motivo del traslado.");
      return;
    }

    onSubmit({
      guideType,
      requestId: guideType === "REQUEST" ? Number(requestId) : undefined,
      destinationWarehouseId:
        guideType === "MANUAL_WAREHOUSE"
          ? Number(destinationWarehouseId)
          : undefined,
      recipientName:
        guideType === "EXTERNAL_SERVICE" ? recipientName.trim() : undefined,
      recipientRuc:
        guideType === "EXTERNAL_SERVICE"
          ? recipientRuc.trim() || undefined
          : undefined,
      arrivalPoint:
        guideType === "EXTERNAL_SERVICE" ? arrivalPoint.trim() : undefined,
      series: series.trim() || "002",
      issueDate: issueDate || undefined,
      transferStartDate,
      vehicleBrand: vehicleBrand.trim() || undefined,
      vehiclePlate: vehiclePlate.trim() || undefined,
      registrationCertificate: registrationCertificate.trim() || undefined,
      driverLicense: driverLicense.trim() || undefined,
      transportCompanyName: transportCompanyName.trim() || undefined,
      transportCompanyRuc: transportCompanyRuc.trim() || undefined,
      purchaseOrderReference: purchaseOrderReference.trim() || undefined,
      minimumCost: minimumCost ? Number(minimumCost) : undefined,
      transferReason,
      otherTransferReason:
        transferReason === "OTHER"
          ? otherTransferReason.trim() || undefined
          : undefined,
      observations: observations.trim() || undefined,
      details: lines.map((line) => ({
        requestDetailId:
          guideType === "REQUEST" ? line.requestDetailId : undefined,
        productId:
          guideType !== "REQUEST" && Number(line.productId)
            ? Number(line.productId)
            : undefined,
        description:
          guideType === "EXTERNAL_SERVICE"
            ? line.description.trim() || undefined
            : undefined,
        unit:
          guideType === "EXTERNAL_SERVICE"
            ? line.unit.trim() || undefined
            : undefined,
        quantity: Number(line.quantity),
        totalWeight: line.totalWeight ? Number(line.totalWeight) : undefined,
      })),
    });
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Nueva guía de remisión" size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Tipo de guía
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {([
              ["REQUEST", "Desde requerimiento", "Transfiere stock y actualiza el requerimiento"],
              ["MANUAL_WAREHOUSE", "Manual a mina", "Transfiere stock Lima → mina, sin requerimiento"],
              ["EXTERNAL_SERVICE", "Servicio externo", "Documento referencial, no modifica stock"],
            ] as const).map(([value, title, subtitle]) => (
              <button
                key={value}
                type="button"
                disabled={loading}
                onClick={() => resetForType(value)}
                className={`rounded-xl border p-4 text-left transition ${
                  guideType === value
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                    : "border-gray-200 bg-white hover:border-orange-200"
                }`}
              >
                <div className="font-semibold text-gray-800">{title}</div>
                <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {guideType === "REQUEST" && (
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Requerimiento *
              </label>
              <select
                value={requestId}
                disabled={loading}
                onChange={(event) => handleRequestChange(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Selecciona un requerimiento</option>
                {availableRequests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.requestNumber} - {request.warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {guideType === "MANUAL_WAREHOUSE" && (
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mina / almacén de destino *
              </label>
              <select
                value={destinationWarehouseId}
                disabled={loading}
                onChange={(event) => setDestinationWarehouseId(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Selecciona destino</option>
                {activeWarehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} {warehouse.code ? `(${warehouse.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {guideType === "EXTERNAL_SERVICE" && (
            <div className="lg:col-span-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Proveedor / taller / destinatario *
                </label>
                <Input value={recipientName} disabled={loading} onChange={(e) => setRecipientName(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">RUC</label>
                <Input value={recipientRuc} disabled={loading} onChange={(e) => setRecipientRuc(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Punto de llegada *
                </label>
                <Input value={arrivalPoint} disabled={loading} onChange={(e) => setArrivalPoint(e.target.value)} placeholder="Dirección del proveedor o taller" />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Serie</label>
            <Input value={series} maxLength={10} disabled={loading} onChange={(e) => setSeries(e.target.value)} />
          </div>
        </div>

        {selectedRequest && guideType === "REQUEST" && (
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Origen</p>
              <p className="mt-1 font-semibold text-gray-800">Almacén Principal Lima</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Destino</p>
              <p className="mt-1 font-semibold text-gray-800">{selectedRequest.warehouse.name}</p>
              <p className="mt-1 text-xs text-gray-500">{selectedRequest.warehouse.address ?? selectedRequest.warehouse.city ?? ""}</p>
            </div>
          </div>
        )}

        {guideType === "EXTERNAL_SERVICE" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Esta guía es referencial para un servicio externo y no generará ningún movimiento de inventario.
          </div>
        )}

        {guideType === "MANUAL_WAREHOUSE" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Esta guía transferirá inventario desde el almacén central de Lima hacia la mina seleccionada, aunque no exista requerimiento.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Fecha de emisión</label>
            <Input type="date" value={issueDate} disabled={loading} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Inicio del traslado *</label>
            <Input type="date" value={transferStartDate} disabled={loading} onChange={(e) => setTransferStartDate(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Productos a trasladar</h3>

              {guideType === "REQUEST" && selectedRequest && (
                <p className="mt-1 text-xs text-gray-500">
                  Puedes quitar de esta guía los productos que no se enviarán ahora.
                  Los productos o cantidades pendientes seguirán disponibles para una siguiente guía.
                </p>
              )}
            </div>

            {guideType === "REQUEST" && selectedRequest && (
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => handleRequestChange(requestId)}
              >
                Restaurar productos pendientes
              </Button>
            )}
          </div>

          {(guideType === "MANUAL_WAREHOUSE" || guideType === "EXTERNAL_SERVICE") && (
            <div className="mb-3 flex justify-end">
              <Button type="button" variant="secondary" disabled={loading} onClick={addLine}>
                <Plus size={16} /> Agregar producto
              </Button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[1050px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="min-w-[360px] px-4 py-3 text-left">Producto / descripción</th>
                  <th className="px-4 py-3 text-center">U.M.</th>
                  {guideType === "REQUEST" && <>
                    <th className="px-4 py-3 text-center">Aprobado</th>
                    <th className="px-4 py-3 text-center">Ya enviado</th>
                    <th className="px-4 py-3 text-center">Pendiente</th>
                  </>}
                  <th className="min-w-[130px] px-4 py-3 text-center">Enviar</th>
                  <th className="min-w-[140px] px-4 py-3 text-center">Peso total</th>
                  <th className="px-4 py-3 text-center">Quitar</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={`${line.requestDetailId ?? "manual"}-${index}`} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      {guideType === "REQUEST" ? (
                        <span className="font-medium text-gray-800">{line.description}</span>
                      ) : guideType === "EXTERNAL_SERVICE" && line.freeText ? (
                        <div className="space-y-2">
                          <Input value={line.description} disabled={loading} placeholder="Descripción libre" onChange={(e) => updateLine(index, "description", e.target.value)} />
                          <button type="button" className="text-xs font-semibold text-orange-600" onClick={() => toggleFreeText(index)}>
                            Usar producto registrado
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ProductSearchSelect
                            products={activeProducts}
                            value={Number(line.productId) || null}
                            disabledIds={selectedProductIds.filter((id) => id !== Number(line.productId))}
                            disabled={loading}
                            placeholder="Buscar producto por nombre, código o SKU..."
                            onChange={(productId) => handleProductChange(index, productId)}
                          />
                          {guideType === "EXTERNAL_SERVICE" && (
                            <button type="button" className="text-xs font-semibold text-orange-600" onClick={() => toggleFreeText(index)}>
                              Escribir producto no registrado
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {guideType === "EXTERNAL_SERVICE" && line.freeText ? (
                        <Input value={line.unit} disabled={loading} placeholder="Unidad" onChange={(e) => updateLine(index, "unit", e.target.value)} />
                      ) : line.unit}
                    </td>
                    {guideType === "REQUEST" && <>
                      <td className="px-4 py-3 text-center">{line.approvedQuantity}</td>
                      <td className="px-4 py-3 text-center">{line.deliveredQuantity}</td>
                      <td className="px-4 py-3 text-center font-semibold text-orange-600">{line.pendingQuantity}</td>
                    </>}
                    <td className="px-4 py-3">
                      <Input type="number" min="0.01" step="0.01" max={guideType === "REQUEST" ? line.pendingQuantity : undefined} value={line.quantity} disabled={loading} onChange={(e) => updateLine(index, "quantity", e.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" min="0" step="0.01" value={line.totalWeight} disabled={loading} placeholder="Opcional" onChange={(e) => updateLine(index, "totalWeight", e.target.value)} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        disabled={loading}
                        title={
                          guideType === "REQUEST"
                            ? "No incluir este producto en la guía actual"
                            : "Quitar producto"
                        }
                        onClick={() => removeLine(index)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {lines.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      {guideType === "REQUEST"
                        ? requestId
                          ? "Quitaste todos los productos de esta guía. Restaura los pendientes o deja al menos uno para poder generar la guía."
                          : "Selecciona un requerimiento con productos pendientes."
                        : "Agrega al menos un producto."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-gray-800">Unidad de transporte y conductor</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input value={vehicleBrand} disabled={loading} placeholder="Marca" onChange={(e) => setVehicleBrand(e.target.value)} />
            <Input value={vehiclePlate} disabled={loading} placeholder="Placa" onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())} />
            <Input value={registrationCertificate} disabled={loading} placeholder="Constancia inscripción" onChange={(e) => setRegistrationCertificate(e.target.value)} />
            <Input value={driverLicense} disabled={loading} placeholder="Licencia conductor" onChange={(e) => setDriverLicense(e.target.value.toUpperCase())} />
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-gray-800">Empresa de transporte</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input value={transportCompanyName} disabled={loading} placeholder="Razón social" onChange={(e) => setTransportCompanyName(e.target.value)} />
            <Input value={transportCompanyRuc} disabled={loading} placeholder="RUC" onChange={(e) => setTransportCompanyRuc(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Referencia O/C</label>
            <Input value={purchaseOrderReference} disabled={loading} placeholder="Opcional" onChange={(e) => setPurchaseOrderReference(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Costo mínimo</label>
            <Input type="number" min="0" step="0.01" value={minimumCost} disabled={loading} placeholder="0.00" onChange={(e) => setMinimumCost(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Motivo del traslado</label>
          <select value={transferReason} disabled={loading} onChange={(e) => setTransferReason(e.target.value as TransferReason)} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm">
            <option value="BETWEEN_ESTABLISHMENTS">Entre establecimientos de la misma empresa</option>
            <option value="SALE">Venta</option>
            <option value="PURCHASE">Compra</option>
            <option value="CONSIGNMENT">Consignación</option>
            <option value="RETURN">Devolución</option>
            <option value="TRANSFORMATION">Transformación</option>
            <option value="PICKUP">Recojo</option>
            <option value="IMPORT">Importación</option>
            <option value="EXPORT">Exportación</option>
            <option value="OTHER">Otros</option>
          </select>
        </div>

        {transferReason === "OTHER" && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Especificar motivo</label>
            <Input value={otherTransferReason} disabled={loading} onChange={(e) => setOtherTransferReason(e.target.value)} />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Observaciones</label>
          <textarea rows={3} value={observations} disabled={loading} onChange={(e) => setObservations(e.target.value)} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white py-4">
          <Button type="button" variant="secondary" disabled={loading} onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading || lines.length === 0}>
            {loading ? "Generando..." : "Generar guía de remisión"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}