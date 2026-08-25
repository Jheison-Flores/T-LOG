import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Building2,
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

interface SupplierLike {
  id: number;
  name: string;
  ruc?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

interface Props {
  suppliers: SupplierLike[];
  value?: number | null;
  placeholder?: string;
  disabled?: boolean;
  onlyActive?: boolean;
  onChange: (
    supplierId: number | null,
  ) => void;
}

function normalizeText(
  value:
    string | null | undefined,
) {
  return (
    value ??
    ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

export function SupplierSearchSelect({
  suppliers,
  value,
  placeholder =
    "Buscar proveedor por razón social o RUC...",
  disabled = false,
  onlyActive = true,
  onChange,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    highlightedIndex,
    setHighlightedIndex,
  ] =
    useState(0);

  const selectedSupplier =
    useMemo(
      () =>
        suppliers.find(
          (
            supplier,
          ) =>
            supplier.id ===
            value,
        ) ??
        null,
      [
        suppliers,
        value,
      ],
    );

  const filteredSuppliers =
    useMemo(
      () => {
        const term =
          normalizeText(
            search,
          );

        const available =
          suppliers.filter(
            (
              supplier,
            ) =>
              !onlyActive ||
              supplier.isActive !==
                false ||
              supplier.id ===
                value,
          );

        if (!term) {
          return available.slice(
            0,
            50,
          );
        }

        return available
          .filter(
            (
              supplier,
            ) => {
              const name =
                normalizeText(
                  supplier.name,
                );

              const ruc =
                normalizeText(
                  supplier.ruc,
                );

              const email =
                normalizeText(
                  supplier.email,
                );

              const phone =
                normalizeText(
                  supplier.phone,
                );

              return (
                name.includes(
                  term,
                ) ||
                ruc.includes(
                  term,
                ) ||
                email.includes(
                  term,
                ) ||
                phone.includes(
                  term,
                )
              );
            },
          )
          .slice(
            0,
            50,
          );
      },
      [
        suppliers,
        search,
        onlyActive,
        value,
      ],
    );

  useEffect(
    () => {
      setHighlightedIndex(
        0,
      );
    },
    [
      search,
    ],
  );

  useEffect(
    () => {
      const handleClickOutside = (
        event:
          MouseEvent,
      ) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as Node,
          )
        ) {
          setOpen(
            false,
          );
        }
      };

      document.addEventListener(
        "mousedown",
        handleClickOutside,
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside,
        );
      };
    },
    [],
  );

  const selectSupplier = (
    supplier:
      SupplierLike,
  ) => {
    onChange(
      supplier.id,
    );

    setSearch(
      "",
    );

    setOpen(
      false,
    );
  };

  const clearSelection = () => {
    onChange(
      null,
    );

    setSearch(
      "",
    );
  };

  const handleKeyDown = (
    event:
      React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      !open &&
      (
        event.key ===
          "ArrowDown" ||
        event.key ===
          "Enter"
      )
    ) {
      setOpen(
        true,
      );

      return;
    }

    if (
      !open
    ) {
      return;
    }

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      setHighlightedIndex(
        (
          current,
        ) =>
          Math.min(
            current +
              1,
            filteredSuppliers.length -
              1,
          ),
      );
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      setHighlightedIndex(
        (
          current,
        ) =>
          Math.max(
            current -
              1,
            0,
          ),
      );
    }

    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      const supplier =
        filteredSuppliers[
          highlightedIndex
        ];

      if (
        supplier
      ) {
        selectSupplier(
          supplier,
        );
      }
    }

    if (
      event.key ===
      "Escape"
    ) {
      setOpen(
        false,
      );
    }
  };

  return (
    <div
      ref={
        containerRef
      }
      className="relative"
    >
      <div
        className={[
          "flex min-h-11 items-center rounded-lg border bg-white transition",
          open
            ? "border-orange-400 ring-2 ring-orange-100"
            : "border-gray-300",
          disabled
            ? "cursor-not-allowed bg-gray-100 opacity-70"
            : "",
        ].join(
          " ",
        )}
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <Search
            size={
              17
            }
            className="shrink-0 text-gray-400"
          />

          {selectedSupplier &&
          !open ? (
            <button
              type="button"
              disabled={
                disabled
              }
              onClick={() =>
                setOpen(
                  true,
                )
              }
              className="min-w-0 flex-1 py-2 text-left"
            >
              <div className="truncate text-sm font-semibold text-gray-800">
                {
                  selectedSupplier.name
                }
              </div>

              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                {selectedSupplier.ruc && (
                  <span>
                    RUC:{" "}
                    {
                      selectedSupplier.ruc
                    }
                  </span>
                )}

                {selectedSupplier.email && (
                  <span className="truncate">
                    {
                      selectedSupplier.email
                    }
                  </span>
                )}
              </div>
            </button>
          ) : (
            <input
              type="text"
              value={
                search
              }
              disabled={
                disabled
              }
              placeholder={
                placeholder
              }
              onFocus={() =>
                setOpen(
                  true,
                )
              }
              onChange={(
                event,
              ) => {
                setSearch(
                  event.target.value,
                );

                setOpen(
                  true,
                );
              }}
              onKeyDown={
                handleKeyDown
              }
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          )}
        </div>

        {selectedSupplier &&
          !disabled && (
            <button
              type="button"
              title="Limpiar selección"
              onClick={
                clearSelection
              }
              className="flex h-10 w-10 items-center justify-center text-gray-400 transition hover:text-red-500"
            >
              <X
                size={
                  16
                }
              />
            </button>
          )}

        <button
          type="button"
          disabled={
            disabled
          }
          onClick={() =>
            setOpen(
              (
                current,
              ) =>
                !current,
            )
          }
          className="flex h-10 w-10 items-center justify-center text-gray-400"
        >
          <ChevronDown
            size={
              17
            }
            className={
              open
                ? "rotate-180 transition"
                : "transition"
            }
          />
        </button>
      </div>

      {open &&
        !disabled && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Proveedores
                </span>

                <span className="text-xs text-gray-400">
                  {
                    filteredSuppliers.length
                  }{" "}
                  resultados
                </span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {filteredSuppliers.length >
              0 ? (
                filteredSuppliers.map(
                  (
                    supplier,
                    index,
                  ) => {
                    const selected =
                      supplier.id ===
                      value;

                    const highlighted =
                      index ===
                      highlightedIndex;

                    return (
                      <button
                        key={
                          supplier.id
                        }
                        type="button"
                        onMouseEnter={() =>
                          setHighlightedIndex(
                            index,
                          )
                        }
                        onClick={() =>
                          selectSupplier(
                            supplier,
                          )
                        }
                        className={[
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                          highlighted
                            ? "bg-orange-50"
                            : "hover:bg-gray-50",
                        ].join(
                          " ",
                        )}
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Building2
                            size={
                              17
                            }
                            className="text-gray-500"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-800">
                              {
                                supplier.name
                              }
                            </p>

                            {selected && (
                              <Check
                                size={
                                  17
                                }
                                className="shrink-0 text-green-600"
                              />
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            {supplier.ruc && (
                              <span>
                                RUC:{" "}
                                {
                                  supplier.ruc
                                }
                              </span>
                            )}

                            {supplier.email && (
                              <span>
                                {
                                  supplier.email
                                }
                              </span>
                            )}

                            {supplier.phone && (
                              <span>
                                {
                                  supplier.phone
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  },
                )
              ) : (
                <div className="px-5 py-8 text-center">
                  <Building2
                    size={
                      28
                    }
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-2 text-sm font-medium text-gray-500">
                    No se encontraron proveedores
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Busca por razón social, RUC, correo o teléfono.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}