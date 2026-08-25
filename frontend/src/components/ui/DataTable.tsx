import type { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">

      <table className="min-w-full">

        <thead className="bg-gray-100">

          <tr>

            {columns.map((column) => (

              <th
                key={String(column.key)}
                className={`px-5 py-4 text-left text-sm font-semibold text-gray-700 ${column.className ?? ""}`}
              >
                {column.title}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {data.map((row, index) => (

            <tr
              key={index}
              className="border-t hover:bg-orange-50 transition-colors"
            >

              {columns.map((column) => (

                <td
                  key={String(column.key)}
                  className={`px-5 py-4 text-sm ${column.className ?? ""}`}
                >

                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? "")}

                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}