import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Card({ children }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {children}
    </div>
  );
}