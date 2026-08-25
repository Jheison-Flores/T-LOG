export interface SettingsWarehouse {
  id: number;
  code: string;
  name: string;
  type: string;
  city?: string | null;
  isActive: boolean;
}

export interface SystemSettings {
  id: number;

  companyName: string;

  ruc?: string | null;

  companyAddress?: string | null;

  companyPhone?: string | null;

  companyEmail?: string | null;

  centralWarehouse?:
    | SettingsWarehouse
    | null;

  requestPrefix: string;

  dispatchPrefix: string;

  purchasePrefix: string;

  systemName: string;

  currency: string;

  timezone: string;

  createdAt: string;

  updatedAt: string;
}

export interface UpdateSettingsDto {
  companyName?: string;

  ruc?: string;

  companyAddress?: string;

  companyPhone?: string;

  companyEmail?: string;

  centralWarehouseId?:
    | number
    | null;

  requestPrefix?: string;

  dispatchPrefix?: string;

  purchasePrefix?: string;

  systemName?: string;

  currency?: string;

  timezone?: string;
}