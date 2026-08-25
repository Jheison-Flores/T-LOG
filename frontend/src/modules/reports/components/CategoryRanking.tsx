import type {
  CategoryReportItem,
} from "../types/report.types";

interface Props {
  data: CategoryReportItem[];
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

export function CategoryRanking({
  data,
}: Props) {
  const top = data.slice(0, 8);
  const total = data.reduce(
    (accumulator, item) =>
      accumulator + item.totalAmount,
    0,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Categorías con mayor valor
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Ranking de categorías según materiales enviados.
        </p>
      </div>

      {top.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center text-sm text-gray-400">
          Sin datos.
        </div>
      ) : (
        <div className="mt-5 divide-y divide-gray-100">
          {top.map((item, index) => {
            const percentage =
              total > 0
                ? (item.totalAmount / total) * 100
                : 0;

            return (
              <div
                key={item.categoryId ?? `category-${index}`}
                className="flex items-center gap-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate font-semibold text-gray-800">
                      {item.categoryName}
                    </p>
                    <span className="shrink-0 text-sm font-bold text-gray-900">
                      {money(item.totalAmount)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-orange-400"
                        style={{
                          width: `${Math.max(2, percentage)}%`,
                        }}
                      />
                    </div>

                    <span className="w-14 text-right text-xs text-gray-400">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}