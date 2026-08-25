import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

import {
  createPortal,
} from "react-dom";

interface SearchableProduct {
  id: number;
  name: string;

  sku?: string | null;

  internalCode?: string | null;

  brand?: string | null;

  model?: string | null;

  unit?: string | null;

  isActive?: boolean;
}

interface Props {
  products:
    SearchableProduct[];

  value:
    number | null;

  onChange: (
    productId:
      number | null,
  ) => void;

  disabled?: boolean;

  disabledIds?: number[];

  placeholder?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

// ============================================================
// NORMALIZAR TEXTO
// ============================================================

function normalizeText(
  value:
    string | null | undefined,
): string {
  return (
    value ??
    ""
  )
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

// ============================================================
// COMPONENTE
// ============================================================

export function ProductSearchSelect({
  products,
  value,
  onChange,
  disabled = false,
  disabledIds = [],
  placeholder = "Buscar producto...",
}: Props) {
  const triggerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const searchInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const dropdownRef =
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
    position,
    setPosition,
  ] =
    useState<DropdownPosition>({
      top: 0,
      left: 0,
      width: 420,
      maxHeight: 360,
    });

  // ============================================================
  // SELECCIONADO
  // ============================================================

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (
            product,
          ) =>
            product.id ===
            value,
        ) ??
        null,
      [
        products,
        value,
      ],
    );

  // ============================================================
  // IDS BLOQUEADOS
  // ============================================================

  const disabledIdSet =
    useMemo(
      () =>
        new Set(
          disabledIds,
        ),
      [
        disabledIds,
      ],
    );

  // ============================================================
  // FILTRADO
  // ============================================================

  const filteredProducts =
    useMemo(
      () => {
        const term =
          normalizeText(
            search,
          );

        const sorted =
          [
            ...products,
          ].sort(
            (
              a,
              b,
            ) =>
              a.name.localeCompare(
                b.name,
                "es",
                {
                  sensitivity:
                    "base",
                },
              ),
          );

        if (
          !term
        ) {
          return sorted;
        }

        return sorted.filter(
          (
            product,
          ) => {
            const searchable =
              normalizeText(
                [
                  product.name,
                  product.internalCode,
                  product.sku,
                  product.brand,
                  product.model,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    " ",
                  ),
              );

            return searchable.includes(
              term,
            );
          },
        );
      },
      [
        products,
        search,
      ],
    );

  // ============================================================
  // POSICIÓN DEL DROPDOWN
  //
  // Se renderiza mediante PORTAL directamente en document.body.
  // Así no queda cortado por overflow-x-auto, tablas o modales.
  // ============================================================

  const updatePosition =
    () => {
      const trigger =
        triggerRef.current;

      if (
        !trigger
      ) {
        return;
      }

      const rect =
        trigger.getBoundingClientRect();

      const viewportWidth =
        window.innerWidth;

      const viewportHeight =
        window.innerHeight;

      const sideMargin =
        12;

      const preferredWidth =
        Math.max(
          rect.width,
          520,
        );

      const width =
        Math.min(
          preferredWidth,
          viewportWidth -
            sideMargin *
              2,
        );

      let left =
        rect.left;

      if (
        left +
          width >
        viewportWidth -
          sideMargin
      ) {
        left =
          viewportWidth -
          width -
          sideMargin;
      }

      left =
        Math.max(
          sideMargin,
          left,
        );

      const spaceBelow =
        viewportHeight -
        rect.bottom -
        sideMargin;

      const spaceAbove =
        rect.top -
        sideMargin;

      const preferredHeight =
        390;

      const openUpward =
        spaceBelow <
          260 &&
        spaceAbove >
          spaceBelow;

      const availableHeight =
        openUpward
          ? spaceAbove -
            8
          : spaceBelow -
            8;

      const maxHeight =
        Math.max(
          220,
          Math.min(
            preferredHeight,
            availableHeight,
          ),
        );

      const estimatedHeight =
        Math.min(
          preferredHeight,
          maxHeight,
        );

      const top =
        openUpward
          ? Math.max(
              sideMargin,
              rect.top -
                estimatedHeight -
                8,
            )
          : rect.bottom +
            8;

      setPosition({
        top,
        left,
        width,
        maxHeight,
      });
    };

  // ============================================================
  // ABRIR
  // ============================================================

  const handleOpen =
    () => {
      if (
        disabled
      ) {
        return;
      }

      setSearch(
        "",
      );

      updatePosition();

      setOpen(
        true,
      );
    };

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      const timer =
        window.setTimeout(
          () => {
            updatePosition();

            searchInputRef.current?.focus();
          },
          0,
        );

      const handleViewportChange =
        () => {
          updatePosition();
        };

      window.addEventListener(
        "resize",
        handleViewportChange,
      );

      window.addEventListener(
        "scroll",
        handleViewportChange,
        true,
      );

      return () => {
        window.clearTimeout(
          timer,
        );

        window.removeEventListener(
          "resize",
          handleViewportChange,
        );

        window.removeEventListener(
          "scroll",
          handleViewportChange,
          true,
        );
      };
    },
    [
      open,
    ],
  );

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      const handleMouseDown =
        (
          event:
            MouseEvent,
        ) => {
          const target =
            event.target as
              Node;

          if (
            triggerRef.current?.contains(
              target,
            )
          ) {
            return;
          }

          if (
            dropdownRef.current?.contains(
              target,
            )
          ) {
            return;
          }

          setOpen(
            false,
          );
        };

      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
            "Escape"
          ) {
            setOpen(
              false,
            );

            triggerRef.current?.focus();
          }
        };

      document.addEventListener(
        "mousedown",
        handleMouseDown,
      );

      document.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleMouseDown,
        );

        document.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      open,
    ],
  );

  // ============================================================
  // SELECCIONAR
  // ============================================================

  const handleSelect =
    (
      product:
        SearchableProduct,
    ) => {
      if (
        disabledIdSet.has(
          product.id,
        )
      ) {
        return;
      }

      onChange(
        product.id,
      );

      setOpen(
        false,
      );

      setSearch(
        "",
      );
    };

  // ============================================================
  // LIMPIAR
  // ============================================================

  const handleClear =
    (
      event:
        React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation();

      if (
        disabled
      ) {
        return;
      }

      onChange(
        null,
      );

      setSearch(
        "",
      );
    };

  // ============================================================
  // RENDER DROPDOWN
  // ============================================================

  const dropdown =
    open &&
    typeof document !==
      "undefined"
      ? createPortal(
          <div
            ref={
              dropdownRef
            }
            style={{
              position:
                "fixed",
              top:
                position.top,
              left:
                position.left,
              width:
                position.width,
              maxHeight:
                position.maxHeight,
              zIndex:
                99999,
            }}
            className="
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-2xl
            "
          >
            {/* BUSCADOR */}

            <div
              className="
                sticky
                top-0
                z-10
                border-b
                border-gray-100
                bg-white
                p-3
              "
            >
              <div
                className="
                  relative
                "
              >
                <Search
                  size={
                    17
                  }
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  ref={
                    searchInputRef
                  }
                  type="text"
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Buscar por nombre, código, SKU, marca o modelo..."
                  className="
                    h-11
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    pl-10
                    pr-10
                    text-sm
                    text-gray-800
                    outline-none
                    transition
                    focus:border-orange-400
                    focus:ring-2
                    focus:ring-orange-100
                  "
                />

                {search && (
                  <button
                    type="button"
                    title="Limpiar búsqueda"
                    onClick={() =>
                      setSearch(
                        "",
                      )
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-md
                      text-gray-400
                      hover:bg-gray-100
                      hover:text-gray-700
                    "
                  >
                    <X
                      size={
                        15
                      }
                    />
                  </button>
                )}
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-1
                "
              >
                <span
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-400
                  "
                >
                  Productos
                </span>

                <span
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  {
                    filteredProducts.length
                  }{" "}
                  resultado
                  {
                    filteredProducts.length ===
                    1
                      ? ""
                      : "s"
                  }
                </span>
              </div>
            </div>

            {/* RESULTADOS */}

            <div
              style={{
                maxHeight:
                  Math.max(
                    150,
                    position.maxHeight -
                      92,
                  ),
              }}
              className="
                overflow-y-auto
                overscroll-contain
                py-1
              "
            >
              {filteredProducts.length ===
              0 ? (
                <div
                  className="
                    px-4
                    py-10
                    text-center
                  "
                >
                  <p
                    className="
                      text-sm
                      font-medium
                      text-gray-500
                    "
                  >
                    No se encontraron productos.
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-400
                    "
                  >
                    Prueba con otro nombre, código o SKU.
                  </p>
                </div>
              ) : (
                filteredProducts.map(
                  (
                    product,
                  ) => {
                    const itemDisabled =
                      disabledIdSet.has(
                        product.id,
                      );

                    const selected =
                      value ===
                      product.id;

                    return (
                      <button
                        key={
                          product.id
                        }
                        type="button"
                        disabled={
                          itemDisabled
                        }
                        onClick={() =>
                          handleSelect(
                            product,
                          )
                        }
                        className={`
                          flex
                          w-full
                          items-start
                          gap-3
                          px-4
                          py-3
                          text-left
                          transition
                          ${
                            itemDisabled
                              ? "cursor-not-allowed bg-gray-50 opacity-45"
                              : selected
                                ? "bg-orange-50 hover:bg-orange-100"
                                : "hover:bg-gray-50"
                          }
                        `}
                      >
                        <div
                          className={`
                            mt-0.5
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            ${
                              selected
                                ? "border-orange-200 bg-orange-100 text-orange-600"
                                : "border-gray-200 bg-gray-50 text-gray-400"
                            }
                          `}
                        >
                          {selected ? (
                            <Check
                              size={
                                16
                              }
                            />
                          ) : (
                            <span
                              className="
                                text-[10px]
                                font-bold
                              "
                            >
                              PR
                            </span>
                          )}
                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-gray-800
                            "
                            title={
                              product.name
                            }
                          >
                            {
                              product.name
                            }
                          </p>

                          <div
                            className="
                              mt-1
                              flex
                              flex-wrap
                              gap-x-3
                              gap-y-1
                              text-xs
                              text-gray-500
                            "
                          >
                            {product.internalCode && (
                              <span>
                                Código:{" "}
                                {
                                  product.internalCode
                                }
                              </span>
                            )}

                            {product.sku && (
                              <span>
                                SKU:{" "}
                                {
                                  product.sku
                                }
                              </span>
                            )}

                            {product.brand && (
                              <span>
                                {
                                  product.brand
                                }
                              </span>
                            )}

                            {product.unit && (
                              <span>
                                U.M.:{" "}
                                {
                                  product.unit
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  },
                )
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className="
          w-full
        "
      >
        <div
          ref={
            triggerRef
          }
          role="button"
          tabIndex={
            disabled
              ? -1
              : 0
          }
          aria-disabled={
            disabled
          }
          aria-expanded={
            open
          }
          onClick={() => {
            if (
              disabled
            ) {
              return;
            }

            if (
              open
            ) {
              setOpen(
                false,
              );
            } else {
              handleOpen();
            }
          }}
          onKeyDown={(
            event,
          ) => {
            if (
              disabled
            ) {
              return;
            }

            if (
              event.key ===
                "Enter" ||
              event.key ===
                " "
            ) {
              event.preventDefault();

              if (
                open
              ) {
                setOpen(
                  false,
                );
              } else {
                handleOpen();
              }
            }
          }}
          className={`
            flex
            min-h-11
            w-full
            items-center
            gap-2
            rounded-lg
            border
            bg-white
            px-3
            py-2
            text-left
            text-sm
            outline-none
            transition
            ${
              open
                ? "border-orange-400 ring-2 ring-orange-100"
                : "border-gray-300 hover:border-gray-400"
            }
            ${
              disabled
                ? "cursor-not-allowed bg-gray-50 opacity-60"
                : ""
            }
          `}
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            {selectedProduct ? (
              <>
                <p
                  className="
                    truncate
                    font-medium
                    text-gray-800
                  "
                >
                  {
                    selectedProduct.name
                  }
                </p>

                {(
                  selectedProduct.internalCode ||
                  selectedProduct.sku
                ) && (
                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-gray-400
                    "
                  >
                    {selectedProduct.internalCode
                      ? `Código: ${selectedProduct.internalCode}`
                      : ""}

                    {selectedProduct.internalCode &&
                    selectedProduct.sku
                      ? " · "
                      : ""}

                    {selectedProduct.sku
                      ? `SKU: ${selectedProduct.sku}`
                      : ""}
                  </p>
                )}
              </>
            ) : (
              <span
                className="
                  text-gray-400
                "
              >
                {
                  placeholder
                }
              </span>
            )}
          </div>

          {selectedProduct &&
          !disabled ? (
            <button
              type="button"
              title="Limpiar selección"
              onClick={
                handleClear
              }
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-md
                text-gray-400
                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              <X
                size={
                  15
                }
              />
            </button>
          ) : null}

          <ChevronDown
            size={
              17
            }
            className={`
              shrink-0
              text-gray-400
              transition-transform
              ${
                open
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </div>
      </div>

      {
        dropdown
      }
    </>
  );
}