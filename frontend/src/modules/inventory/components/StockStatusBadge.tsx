interface StockStatusBadgeProps {
  quantity: number;
  minimumStock: number;
}

export function StockStatusBadge({
  quantity,
  minimumStock,
}: StockStatusBadgeProps) {
  if (quantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Agotado
      </span>
    );
  }

  if (quantity <= minimumStock) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Stock bajo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Normal
    </span>
  );
}