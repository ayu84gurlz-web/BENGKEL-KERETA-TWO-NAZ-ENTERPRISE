import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  ArrowUpRight, 
  Fuel, 
  ShieldAlert, 
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, formatStock, getStockStatus } from '../utils/format';
import { ItemImage } from './ItemImage';

interface FluidsViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRestockItem: (item: InventoryItem) => void;
  onStockOutItem: (item: InventoryItem) => void;
  onAddNewFluid: () => void;
}

export const FluidsView: React.FC<FluidsViewProps> = ({
  items,
  onSelectItem,
  onEditItem,
  onRestockItem,
  onStockOutItem,
  onAddNewFluid,
}) => {
  const [subFilter, setSubFilter] = useState<'Semua' | 'Minyak' | 'Cecair'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const fluids = useMemo(() => {
    return items.filter(
      (item) => item.category === 'Minyak' || item.category === 'Cecair'
    );
  }, [items]);

  const filteredFluids = useMemo(() => {
    return fluids.filter((item) => {
      const matchSub = subFilter === 'Semua' || item.category === subFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q);
      return matchSub && matchSearch;
    });
  }, [fluids, subFilter, searchQuery]);

  const totalValue = fluids.reduce((acc, f) => acc + f.price * f.quantity, 0);
  const totalBottles = fluids.reduce((acc, f) => acc + f.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
            <Droplet className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Minyak &amp; Cecair Servis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Koleksi minyak enjin (5W-30, 10W-40, 0W-20), minyak transmisi ATF/CVT, cecair brek dan penyejuk radiator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Nilai Stok Minyak &amp; Cecair</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {formatCurrency(totalValue)}
            </span>
          </div>

          <button
            onClick={onAddNewFluid}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Tambah Minyak / Cecair</span>
          </button>
        </div>
      </div>

      {/* Subcategory toggle & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Toggle Minyak vs Cecair */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          {(['Semua', 'Minyak', 'Cecair'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                subFilter === tab
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'Semua' ? 'Semua Pelincir' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kelikatan (5W-30, DOT 4, Coolant, ATF WS)..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-4 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredFluids.map((fluid) => {
          const totalFluidVal = fluid.price * fluid.quantity;
          const status = getStockStatus(fluid.quantity, fluid.minStock);

          return (
            <div
              key={fluid.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 shadow-lg hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Visual Image */}
                <div className="relative p-2 pb-0">
                  <ItemImage item={fluid} size="lg" className="rounded-xl h-44 w-full object-cover" />

                  {/* Category Pill Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                      {fluid.category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase backdrop-blur-md shadow ${
                      status === 'HABIS'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                        : status === 'STOK RENDAH'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5">
                  <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    {fluid.brand}
                  </div>
                  <h3
                    onClick={() => onSelectItem(fluid)}
                    className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                    title={fluid.name}
                  >
                    {fluid.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {fluid.notes || `Lokasi: ${fluid.storageLocation}`}
                  </p>

                  {/* Pricing and Stock */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Harga Jualan</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatCurrency(fluid.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Baki Tong / Botol</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        {fluid.quantity} {fluid.unit}
                      </span>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="mt-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Nilai Stok:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatCurrency(totalFluidVal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectItem(fluid)}
                  className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  <span>Lihat</span>
                </button>

                <button
                  onClick={() => onRestockItem(fluid)}
                  className="px-2 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>+ Stok</span>
                </button>

                <button
                  onClick={() => onStockOutItem(fluid)}
                  className="px-2 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Servis</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
