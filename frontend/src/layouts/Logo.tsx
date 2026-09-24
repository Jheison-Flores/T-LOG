import { Link } from "react-router-dom";
import logoImg from "@/assets/logo-teincomin.png";

export function Logo() {
  return (
    <div className="flex items-center justify-center h-24 border-b border-neutral-800/80 px-4 py-2">
      <Link
        to="/"
        className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
        title="TEINCOMIN - Inicio"
      >
        <img
          src={logoImg}
          alt="TEINCOMIN"
          className="h-[74px] w-auto max-w-[220px] object-contain select-none"
        />
      </Link>
    </div>
  );
}
