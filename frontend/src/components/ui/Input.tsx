import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-gray-300 px-4 py-2 outline-none",
        "focus:border-orange-500 focus:ring-2 focus:ring-orange-200",
        className
      )}
      {...props}
    />
  );
}