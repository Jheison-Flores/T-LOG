import { Search } from "lucide-react";
import { Input } from "./Input";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Buscar...",
}: SearchBoxProps) {
  return (
    <div className="relative w-80">
      <Search
        size={18}
        className="absolute left-3 top-3 text-gray-400"
      />

      <Input
        className="pl-10"
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}