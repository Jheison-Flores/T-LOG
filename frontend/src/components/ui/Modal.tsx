import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

export type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  width?: string;
  closeOnBackdrop?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-[1500px]",
  full: "max-w-[98vw]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  width,
  closeOnBackdrop = true,
}: ModalProps) {
  if (!open) {
    return null;
  }

  const modalStyle: CSSProperties =
    size === "2xl"
      ? {
          height: "88vh",
          minHeight: "650px",
          maxHeight: "92vh",
        }
      : size === "full"
        ? {
            height: "94vh",
            maxHeight: "94vh",
          }
        : {
            maxHeight: "92vh",
          };

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (closeOnBackdrop) {
      onClose();
    }
  };

  const widthClass =
    width ??
    sizeClasses[size];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.50)",
      }}
      onMouseDown={handleBackdropClick}
    >
      <div
        style={modalStyle}
        className={`
          flex
          w-full
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          ${widthClass}
        `}
      >
        <div
          style={{
            minHeight: "60px",
            flexShrink: 0,
          }}
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white
            px-6
          "
        >
          <h2 className="text-lg font-bold text-gray-900">
            {title ?? ""}
          </h2>

          <button
            type="button"
            title="Cerrar"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <X size={21} />
          </button>
        </div>

        <div
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "visible",
          }}
          className="bg-white px-6 py-5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}