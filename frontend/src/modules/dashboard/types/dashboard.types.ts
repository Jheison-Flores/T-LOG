export interface DashboardWarehouse {
  id: number;
  code?: string;
  name: string;
  city?: string | null;
  address?: string | null;
}

export interface DashboardProduct {
  id: number;
  name: string;
  sku?: string | null;
  internalCode?: string | null;
  minimumStock: number;
  unit?: string;
}

export interface DashboardInventoryItem {
  id: number;
  quantity: number | string;
  product: DashboardProduct;
  warehouse: DashboardWarehouse;
}

export interface DashboardMovement {
  id: number;
  movementType: string;
  quantity: number | string;
  reason?: string | null;
  reference?: string | null;
  createdAt: string;
  sourceInventory?: {
    product?: DashboardProduct | null;
    warehouse?: DashboardWarehouse | null;
  } | null;
  destinationInventory?: {
    product?: DashboardProduct | null;
    warehouse?: DashboardWarehouse | null;
  } | null;
  user?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

export interface DashboardPurchase {
  id: number;
  purchaseOrderNumber: string;
  status: string;
  purchaseDate?: string | null;
  createdAt: string;
  warehouse?: DashboardWarehouse | null;
  supplier?: {
    id: number;
    name: string;
  } | null;
}

export interface DashboardPendingGuide {
  id: number;
  fullNumber: string;
  transferStartDate: string;
  destinationWarehouse?: DashboardWarehouse | null;
}

export interface DashboardResponse {
  scope: {
    global: boolean;
    warehouse: DashboardWarehouse | null;
  };

  summary: {
    totalProducts: number;
    totalWarehouses: number;
    totalInventoryRecords: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalPurchases: number;
    pendingPurchases: number;
    pendingRequests: number;
    approvedRequests: number;
    inProgressRequests: number;
    issuedGuides: number;
    pendingRouteSheets: number;
    routeSheetsWithObservations: number;
    totalMovements: number;
  };

  inventory: {
    totalInventoryRecords: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };

  requests: {
    pendingRequests: number;
    approvedRequests: number;
    inProgressRequests: number;
    rejectedRequests: number;
    deliveredRequests: number;
    completedRequests: number;
  };

  purchases: {
    totalPurchases: number;
    pendingReceipt: number;
    recentPurchases: DashboardPurchase[];
  };

  guides: {
    issuedGuides: number;
    pendingRouteSheets: number;
    routeSheetsWithObservations: number;
    recentPendingReceptionGuides: DashboardPendingGuide[];
  };

  movements: {
    totalMovements: number;
    recentMovements: DashboardMovement[];
  };

  alerts: {
    lowStockAlerts: DashboardInventoryItem[];
    pendingRequestsAlerts: Array<{
      id: number;
      requestNumber: string;
      requester?: string;
      createdAt: string;
      warehouse?: DashboardWarehouse | null;
      createdBy?: {
        id: number;
        username?: string;
        firstName?: string;
        lastName?: string;
      } | null;
    }>;
  };
}