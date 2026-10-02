import { InventoryItem, StockStatus } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('MYR', 'RM')
    .trim();
}

export function formatStock(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}

export function getStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= 0) return 'HABIS';
  if (quantity <= minStock) return 'STOK RENDAH';
  return 'TERSEDIA';
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ms-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function exportInventoryToCSV(items: InventoryItem[]): void {
  const headers = [
    'ID Barang',
    'Nama Barang',
    'Kategori',
    'Jenama',
    'Model / Kesesuaian',
    'Harga Seunit (RM)',
    'Kuantiti',
    'Unit',
    'Jumlah Nilai (RM)',
    'Minimum Stok',
    'Status Stok',
    'Lokasi Simpanan',
    'Penggunaan Keseluruhan',
  ];

  const rows = items.map((item) => {
    const totalVal = (item.price * item.quantity).toFixed(2);
    const status = getStockStatus(item.quantity, item.minStock);
    return [
      `"${item.id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.brand}"`,
      `"${item.carModel}"`,
      item.price.toFixed(2),
      item.quantity,
      `"${item.unit}"`,
      totalVal,
      item.minStock,
      `"${status}"`,
      `"${item.storageLocation}"`,
      item.totalUsage,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `bengkel_pro_inventori_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
