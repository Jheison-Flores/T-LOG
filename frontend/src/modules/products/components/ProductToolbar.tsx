import {
  Search,
  Plus,
} from "lucide-react";

import {
  Button,
  Input,
} from "@/components/ui";

interface Props {

  search: string;

  onSearch: (value: string) => void;

  onCreate: () => void;

  total: number;

}

export function ProductToolbar({

  search,

  onSearch,

  onCreate,

  total,

}: Props) {

  return (

    <div className="bg-white rounded-2xl border border-gray-200 p-5">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <p className="text-sm text-gray-500">
            Productos registrados
          </p>

          <p className="text-2xl font-bold text-gray-800">
            {total}
          </p>

        </div>

        <div className="flex items-center gap-3">

          <div className="relative w-80">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              className="pl-10"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) =>
                onSearch(e.target.value)
              }
            />

          </div>

          <Button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2"
          >

            <Plus size={18} />

            Nuevo producto

          </Button>

        </div>

      </div>

    </div>

  );
}