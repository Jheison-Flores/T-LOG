import { AlertTriangle } from "lucide-react";

interface Props {
  products: any[];
}

export function LowStockTable({
  products,
}: Props) {

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <h3 className="font-semibold text-lg mb-4">

        Stock bajo

      </h3>

      {products.length === 0 ? (

        <div className="text-center py-12 text-green-600">

          <AlertTriangle
            size={40}
            className="mx-auto mb-3"
          />

          No existen alertas.

        </div>

      ) : (

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-2">
                Producto
              </th>

              <th>
                Stock
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map((item) => (

              <tr key={item.id}>

                <td className="py-3">

                  {item.product.name}

                </td>

                <td className="text-center font-bold text-red-600">

                  {item.stock}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}