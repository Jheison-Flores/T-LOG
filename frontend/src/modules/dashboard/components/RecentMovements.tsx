import { ArrowRightLeft } from "lucide-react";

interface Props {
  movements: any[];
}

export function RecentMovements({
  movements,
}: Props) {

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <h3 className="font-semibold text-lg mb-4">
        Últimos movimientos
      </h3>

      {movements.length === 0 ? (

        <div className="text-center py-12 text-gray-400">

          <ArrowRightLeft
            className="mx-auto mb-3"
            size={40}
          />

          No existen movimientos registrados.

        </div>

      ) : (

        <div className="space-y-3">

          {movements.map((movement) => (

            <div
              key={movement.id}
              className="flex justify-between border-b pb-2"
            >

              <span>
                {movement.reference}
              </span>

              <span className="text-gray-500">

                {movement.movementType}

              </span>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}