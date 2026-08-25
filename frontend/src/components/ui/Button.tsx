import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-xl font-semibold transition-all duration-200",
        {
          "bg-orange-500 hover:bg-orange-600 text-white":
            variant === "primary",

          "bg-gray-200 hover:bg-gray-300 text-gray-800":
            variant === "secondary",

          "bg-red-500 hover:bg-red-600 text-white":
            variant === "danger",
        },
        className
      )}
      {...props}
    />
  );
}