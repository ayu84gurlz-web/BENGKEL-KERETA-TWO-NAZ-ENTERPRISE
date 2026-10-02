import React from 'react';
import { 
  X, 
  Plus, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Tag, 
  Layers, 
  TrendingUp, 
  AlertTriangle,
  History
} from 'lucide-react';
import { InventoryItem, StockTransaction } from '../../types';
import { formatCurrency, formatStock, getStockStatus, formatDateTime } from '../../utils/format';
import { ItemImage } from '../ItemImage';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  transactions: StockTransaction[];
  onClose: () => void;
  onRestock: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  transactions,
  onClose,
  onRestock,
  onStockOut,
  onEdit,
  onDelete,
}) => {
  if (!item) return null;

  const totalValue = item.price * item.quantity;
  const status = getStockStatus(item.quantity, item.minStock);

  // Filter transactions for this specific item
  const itemTransactions = transactions
    .filter((tx) => tx.itemId === item.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
              Butiran Terperinci Barang
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Visual & Title Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Large Image */}
            <div className="md:col-span-1">
              <ItemImage item={item} size="lg" className="h-52 w-full rounded-2xl shadow-xl" />
            </div>

            {/* Core Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {item.category}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                  status === 'HABIS'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : status === 'STOK RENDAH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {status}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] leading-tight">
                {item.name}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.notes || 'Tiada nota tambahan untuk item ini.'}
              </p>

              {/* Price & Value Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Harga Seunit</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Jumlah Nilai Keseluruhan</span>
                  <span className="text-lg font-bold font-mono text-orange-400">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-0.5">Jenama:</span>
              <strong className="text-slate-100 text-sm">{item.brand}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Model Kenderaan:</span>
              <strong className="text-slate-100 text-sm">{item.carModel}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Stok Semasa:</span>
              <strong className="text-emerald-400 text-sm">{item.quantity} {item.unit}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Minimum Stok:</span>
              <strong className="text-amber-400 text-sm">{item.minStock} {item.unit}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-0.5">Lokasi Simpanan:</span>
              <strong className="text-slate-200 text-sm flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                {item.storageLocation}
              </strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-0.5">Jumlah Penggunaan:</span>
              <strong className="text-slate-200 text-sm">{item.totalUsage} {item.unit} dikeluarkan</strong>
            </div>
          </div>

          {/* Stock History / Sejarah Transaksi */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="h-4 w-4 text-orange-400" />
                Sejarah Transaksi Stok
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {itemTransactions.length} rekod
              </span>
            </div>

            {itemTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">
                Belum ada transaksi keluar/masuk direkodkan untuk barang ini.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {itemTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                        tx.type === 'in'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {tx.type === 'in' ? '+ Masuk' : '- Keluar'}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-200">{tx.reason}</p>
                        <p className="text-[11px] text-slate-400">
                          Oleh: {tx.technician} · {formatDateTime(tx.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {tx.type === 'in' ? '+' : '-'}{tx.quantity} {tx.unit}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Baki: {tx.newStock} {tx.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer: 4 Requested Buttons (+ Tambah Stok, - Keluarkan Stok, Edit, Padam) */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="h-4 w-4 text-amber-400" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDelete(item)}
              className="px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Padam</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStockOut(item)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
              <span>- Keluarkan Stok</span>
            </button>

            <button
              onClick={() => onRestock(item)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Tambah Stok</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
