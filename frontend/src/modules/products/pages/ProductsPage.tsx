import {
  useMemo,
  useState,
} from "react";

import {
  useCreateProduct,
  useProducts,
  useUpdateProduct,
  useActivateProduct,
  useDeactivateProduct,
} from "../hooks/useProducts";

import {
  ProductTable,
} from "../components/ProductTable";

import {
  ProductToolbar,
} from "../components/ProductToolbar";

import {
  ProductModal,
} from "../components/ProductModal";

import {
  ProductDetailModal,
} from "../components/ProductDetailModal";

import {
  ConfirmDialog,
} from "@/components/ui/ConfirmDialog";

import type {
  CreateProductDto,
  Product,
} from "../types/product.types";

export function ProductsPage() {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useProducts();

  const createProduct =
    useCreateProduct();

  const updateProduct =
    useUpdateProduct();

  const activateProduct =
    useActivateProduct();

  const deactivateProduct =
    useDeactivateProduct();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    detailProduct,
    setDetailProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    productToDeactivate,
    setProductToDeactivate,
  ] =
    useState<Product | null>(
      null,
    );

  const filteredProducts =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return products;
        }

        return products.filter(
          (
            product,
          ) =>
            product.name
              .toLowerCase()
              .includes(
                term,
              ) ||
            (
              product.sku ??
              ""
            )
              .toLowerCase()
              .includes(
                term,
              ) ||
            (
              product.internalCode ??
              ""
            )
              .toLowerCase()
              .includes(
                term,
              ) ||
            (
              product.category
                ?.name ??
              ""
            )
              .toLowerCase()
              .includes(
                term,
              ),
        );
      },
      [
        products,
        search,
      ],
    );

  const handleCreate =
    () => {
      setSelectedProduct(
        null,
      );

      setModalOpen(
        true,
      );
    };

  const handleEdit = (
    product:
      Product,
  ) => {
    setSelectedProduct(
      product,
    );

    setModalOpen(
      true,
    );
  };

  const handleViewDetail = (
    product:
      Product,
  ) => {
    setDetailProduct(
      product,
    );
  };

  const handleCloseModal =
    () => {
      if (
        createProduct.isPending ||
        updateProduct.isPending
      ) {
        return;
      }

      setModalOpen(
        false,
      );

      setSelectedProduct(
        null,
      );
    };

  const handleSubmit =
    async (
      data:
        CreateProductDto,
    ) => {
      try {
        if (
          selectedProduct
        ) {
          await updateProduct.mutateAsync(
            {
              id:
                selectedProduct.id,

              data,
            },
          );
        } else {
          await createProduct.mutateAsync(
            data,
          );
        }

        setModalOpen(
          false,
        );

        setSelectedProduct(
          null,
        );
      } catch (
        error
      ) {
        console.error(
          "Error guardando producto:",
          error,
        );
      }
    };

  const handleActivate =
    async (
      product:
        Product,
    ) => {
      try {
        await activateProduct.mutateAsync(
          product.id,
        );
      } catch (
        error
      ) {
        console.error(
          "Error activando producto:",
          error,
        );
      }
    };

  const handleDeactivate = (
    product:
      Product,
  ) => {
    setProductToDeactivate(
      product,
    );
  };

  const confirmDeactivate =
    async () => {
      if (
        !productToDeactivate
      ) {
        return;
      }

      try {
        await deactivateProduct.mutateAsync(
          productToDeactivate.id,
        );

        setProductToDeactivate(
          null,
        );
      } catch (
        error
      ) {
        console.error(
          "Error desactivando producto:",
          error,
        );
      }
    };

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Productos
          </h1>

          <p className="mt-1 text-gray-500">
            Administración del catálogo de productos
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="animate-pulse text-gray-500">
            Cargando productos...
          </div>
        </div>
      </div>
    );
  }

  if (
    isError
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Productos
          </h1>

          <p className="mt-1 text-gray-500">
            Administración del catálogo de productos
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-12 text-center">
          <p className="font-medium text-red-600">
            No se pudieron cargar los productos.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Verifica la conexión con el servidor.
          </p>
        </div>
      </div>
    );
  }

  const mutationLoadingId =
    activateProduct.isPending
      ? activateProduct.variables
      : deactivateProduct.isPending
        ? deactivateProduct.variables
        : null;

  const formLoading =
    createProduct.isPending ||
    updateProduct.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Productos
        </h1>

        <p className="mt-1 text-gray-500">
          Administración del catálogo de productos
        </p>
      </div>

      <ProductToolbar
        search={
          search
        }
        total={
          filteredProducts.length
        }
        onSearch={
          setSearch
        }
        onCreate={
          handleCreate
        }
      />

      <ProductTable
        products={
          filteredProducts
        }
        onViewDetail={
          handleViewDetail
        }
        onEdit={
          handleEdit
        }
        onActivate={
          handleActivate
        }
        onDeactivate={
          handleDeactivate
        }
        loadingId={
          mutationLoadingId
        }
      />

      <ProductModal
        open={
          modalOpen
        }
        onClose={
          handleCloseModal
        }
        onSubmit={
          handleSubmit
        }
        loading={
          formLoading
        }
        defaultValues={
          selectedProduct
            ? {
                name:
                  selectedProduct.name,

                description:
                  selectedProduct.description ??
                  undefined,

                brand:
                  selectedProduct.brand ??
                  undefined,

                model:
                  selectedProduct.model ??
                  undefined,

                unit:
                  selectedProduct.unit,

                minimumStock:
                  selectedProduct.minimumStock,

                requiresSerial:
                  selectedProduct.requiresSerial,

                requiresBatch:
                  selectedProduct.requiresBatch,

                categoryId:
                  selectedProduct.category.id,
              }
            : undefined
        }
      />

      <ProductDetailModal
        open={
          detailProduct !==
          null
        }
        product={
          detailProduct
        }
        onClose={() =>
          setDetailProduct(
            null,
          )
        }
      />

      <ConfirmDialog
        open={
          productToDeactivate !==
          null
        }
        title="Desactivar producto"
        message={
          productToDeactivate
            ? `¿Estás seguro de que deseas desactivar "${productToDeactivate.name}"? El producto no será eliminado y conservará su historial.`
            : ""
        }
        confirmText="Desactivar"
        cancelText="Cancelar"
        loading={
          deactivateProduct.isPending
        }
        onConfirm={
          confirmDeactivate
        }
        onCancel={() =>
          setProductToDeactivate(
            null,
          )
        }
      />
    </div>
  );
}