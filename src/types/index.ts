export type ItemCategory = 
  | 'Tools' 
  | 'Alat Ganti' 
  | 'Minyak' 
  | 'Cecair' 
  | 'Peralatan Bengkel' 
  | 'Bahan Habis Guna';

export type CarBrand = 
  | 'Semua'
  | 'Toyota' 
  | 'Honda' 
  | 'Proton' 
  | 'Perodua' 
  | 'Nissan' 
  | 'Universal';

export type StockStatus = 'TERSEDIA' | 'STOK RENDAH' | 'HABIS';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  unit: string; // 'unit', 'set', 'botol', 'tin', 'tong', 'kotak', etc.
  price: number; // in RM (Harga Jualan)
  costPrice?: number; // in RM (Harga Kos Modal Pembekal)
  sku?: string; // Kod SKU / Barcode
  supplier?: string; // Pembekal utama
  maxStock?: number; // Paras stok maksimum
  quantity: number;
  minStock: number;
  brand: string;
  carModel: string; // e.g., 'Proton', 'Toyota', 'Universal', etc.
  storageLocation: string; // e.g., 'Rak A-02', 'Kabinet Tools 1'
  notes?: string;
  image?: string; // Image path or preset ID
  svgIconType?: string; // Built-in high fidelity SVG identifier
  totalUsage: number; // units issued over time
  lastUpdated: string;
}

export interface CMSAuditRecord {
  id: string;
  itemId: string;
  itemName: string;
  fieldChanged: 'HARGA' | 'KUANTITI' | 'MIN_STOK' | 'KOS_MODAL' | 'LOKASI' | 'SEMUA_BUTIRAN' | 'PELARASAN_PUKAL';
  oldValue: string | number;
  newValue: string | number;
  adjustedBy: string;
  reason: string;
  timestamp: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  category: ItemCategory;
  type: 'in' | 'out'; // in = Tambah Stok, out = Keluarkan Stok
  quantity: number;
  previousStock: number;
  newStock: number;
  unit: string;
  reason: string; // e.g. "Servis Proton X50 (VDA 8821)", "Restock Pembekal"
  technician: string; // e.g. "Azman Zainal", "Farid Mekanik"
  timestamp: string; // ISO string
}

export interface WorkshopSettings {
  workshopName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  currency: string;
  lowStockThresholdDefault: number;
}
