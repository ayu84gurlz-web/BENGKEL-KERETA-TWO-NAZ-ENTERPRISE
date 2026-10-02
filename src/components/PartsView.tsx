import React, { useState, useMemo } from 'react';
import { 
  Cog, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Car, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { InventoryItem, CarBrand } from '../types';
import { formatCurrency, formatStock, getStockStatus } from '../utils/format';
import { ItemImage } from './ItemImage';

interface PartsViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRestockItem: (item: InventoryItem) => void;
  onStockOutItem: (item: InventoryItem) => void;
  onAddNewPart: () => void;
}

const CAR_BRANDS: CarBrand[] = [
  'Semua',
  'Toyota',
  'Honda',
  'Proton',
  'Perodua',
  'Nissan',
  'Universal',
];

export const PartsView: React.FC<PartsViewProps> = ({
  items,
  onSelectItem,
  onEditItem,
  onRestockItem,
  onStockOutItem,
  onAddNewPart,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<CarBrand>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items in Alat Ganti
  const parts = useMemo(() => {
    return items.filter((item) => item.category === 'Alat Ganti');
  }, [items]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchBrand = selectedBrand === 'Semua' || part.carModel === selectedBrand || (selectedBrand === 'Universal' && part.carModel === 'Universal');
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        part.name.toLowerCase().includes(q) ||
        part.brand.toLowerCase().includes(q) ||
        part.carModel.toLowerCase().includes(q) ||
        part.storageLocation.toLowerCase().includes(q);
      return matchBrand && matchSearch;
    });
  }, [parts, selectedBrand, searchQuery]);

  const totalValue = parts.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
            <Cog className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Alat Ganti Kenderaan (Spare Parts)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Pengurusan alat ganti tulen, brek, palam pencucuh, bateri, tali sawat dan penapis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Nilai Stok Alat Ganti</span>
            <span className="text-base font-bold font-mono text-blue-400">
              {formatCurrency(totalValue)}
            </span>
          </div>

          <button
            onClick={onAddNewPart}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Tambah Alat Ganti</span>
          </button>
        </div>
      </div>

      {/* Car Brand Filter Tabs (Toyota, Honda, Proton, Perodua, Nissan, Universal) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-blue-400" />
            Penapis Model Kenderaan:
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {filteredParts.length} alat ganti dipaparkan
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CAR_BRANDS.map((brand) => {
            const isSelected = selectedBrand === brand;
            const count = brand === 'Semua' 
              ? parts.length 
              : parts.filter((p) => p.carModel === brand).length;

            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`
                  px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2
                  ${isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'}
                `}
              >
                <span>{brand}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-blue-800/80 text-blue-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari alat ganti (cth: Brake Pad, Oil Filter, Spark Plug, Wiper)..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Grid of Spare Parts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredParts.map((part) => {
          const totalPartVal = part.price * part.quantity;
          const status = getStockStatus(part.quantity, part.minStock);

          return (
            <div
              key={part.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Visual Image */}
                <div className="relative p-2 pb-0">
                  <ItemImage item={part} size="lg" className="rounded-xl h-44 w-full object-cover" />

                  {/* Model Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-950/80 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                      {part.carModel}
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
                    {part.brand}
                  </div>
                  <h3
                    onClick={() => onSelectItem(part)}
                    className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer"
                    title={part.name}
                  >
                    {part.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {part.notes || `Lokasi: ${part.storageLocation}`}
                  </p>

                  {/* Financial & Stock Details */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Harga Seunit</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatCurrency(part.price)} <span className="text-slate-400 text-xs font-normal">/ {part.unit}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Baki Stok</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        {part.quantity} {part.unit}
                      </span>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="mt-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Nilai Stok:</span>
                    <span className="font-mono font-bold text-blue-400 text-sm">
                      {formatCurrency(totalPartVal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectItem(part)}
                  className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  <span>Lihat</span>
                </button>

                <button
                  onClick={() => onRestockItem(part)}
                  className="px-2 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>+ Stok</span>
                </button>

                <button
                  onClick={() => onStockOutItem(part)}
                  className="px-2 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Keluarkan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
