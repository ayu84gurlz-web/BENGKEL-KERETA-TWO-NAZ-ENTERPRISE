import React from 'react';
import { 
  AlertTriangle, 
  Plus, 
  ShoppingCart, 
  CheckCircle2, 
  Eye, 
  TrendingUp, 
  ShieldAlert 
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, formatStock, getStockStatus } from '../utils/format';
import { ItemImage } from './ItemImage';

interface LowStockViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onRestockItem: (item: InventoryItem) => void;
}

export const LowStockView: React.FC<LowStockViewProps> = ({
  items,
  onSelectItem,
  onRestockItem,
}) => {
  const lowStockItems = items
    .filter((item) => item.quantity <= item.minStock)
    .sort((a, b) => a.quantity / (a.minStock || 1) - b.quantity / (b.minStock || 1));

  const totalReplenishCost = lowStockItems.reduce((acc, item) => {
    const suggestedUnits = Math.max(1, (item.minStock * 2) - item.quantity);
    return acc + suggestedUnits * item.price;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
            <AlertTriangle className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight flex items-center gap-2">
              <span>Pengurusan Stok Rendah &amp; Kritikal</span>
              {lowStockItems.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold animate-pulse">
                  {lowStockItems.length} Amaran
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Barang yang telah menyamai atau berada di bawah paras minimum simpanan bengkel.
            </p>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="text-right p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Anggaran Kos Tambah Stok (2x Min)</span>
            <span className="text-base font-bold font-mono text-orange-400">
              {formatCurrency(totalReplenishCost)}
            </span>
          </div>
        )}
      </div>

      {lowStockItems.length === 0 ? (
        <div className="py-20 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Semua Paras Stok Memuaskan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Tiada barang yang berada pada paras kritikal atau rendah buat masa ini. Sistem akan memberi amaran automatik sebaik sahaja kuantiti jatuh ke paras minimum.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lowStockItems.map((item) => {
              const suggestedOrder = Math.max(1, (item.minStock * 2) - item.quantity);
              const isOut = item.quantity === 0;
              const isCritical = item.quantity <= Math.ceil(item.minStock * 0.4);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl bg-slate-900/90 border p-5 shadow-xl transition-all duration-300 flex flex-col justify-between ${
                    isOut
                      ? 'border-rose-500/60 shadow-rose-500/10'
                      : isCritical
                      ? 'border-rose-500/30 shadow-rose-500/5'
                      : 'border-amber-500/30'
                  }`}
                >
                  <div>
                    {/* Top Row: Category and Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                        {item.category} · {item.brand}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isOut
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                          : isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isOut ? 'STOK HABIS' : isCritical ? 'KRITIKAL' : 'STOK RENDAH'}
                      </span>
                    </div>

                    {/* Image & Title */}
                    <div className="flex items-center gap-3">
                      <ItemImage item={item} size="sm" className="h-14 w-14 rounded-xl shrink-0" />
                      <div className="min-w-0">
                        <h3 
                          onClick={() => onSelectItem(item)}
                          className="text-sm font-bold text-white hover:text-orange-400 cursor-pointer transition-colors truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Lokasi: <span className="text-slate-300">{item.storageLocation}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stock comparison & progress bar */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Baki Semasa:</span>
                        <span className={`font-bold ${isOut ? 'text-rose-400' : 'text-amber-400'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Paras Minima:</span>
                        <span className="text-slate-300 font-semibold">{item.minStock} {item.unit}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, Math.max(5, (item.quantity / item.minStock) * 100))}%` }}
                          className={`h-full rounded-full ${isOut ? 'bg-rose-600' : isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                        />
                      </div>
                    </div>

                    {/* Recommendation box */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>Cadangan Tempahan:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        + {suggestedOrder} {item.unit} ({formatCurrency(suggestedOrder * item.price)})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-400" />
                      <span>Lihat Butiran</span>
                    </button>

                    <button
                      onClick={() => onRestockItem(item)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>+ Tambah Stok</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
