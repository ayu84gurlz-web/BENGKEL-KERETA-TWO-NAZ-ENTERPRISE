import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown,
  Layers
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, formatStock, getStockStatus } from '../utils/format';
import { ItemImage } from './ItemImage';

interface ToolsViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRestockItem: (item: InventoryItem) => void;
  onAddNewTool: () => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  items,
  onSelectItem,
  onEditItem,
  onRestockItem,
  onAddNewTool,
}) => {
  const [filterSearch, setFilterSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'total'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter tools
  const tools = useMemo(() => {
    return items.filter((item) => item.category === 'Tools');
  }, [items]);

  const filteredTools = useMemo(() => {
    let result = tools.filter((tool) => {
      const q = filterSearch.toLowerCase();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.brand.toLowerCase().includes(q) ||
        tool.storageLocation.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.name.localeCompare(b.name);
      else if (sortBy === 'price') comp = a.price - b.price;
      else if (sortBy === 'quantity') comp = a.quantity - b.quantity;
      else if (sortBy === 'total') comp = (a.price * a.quantity) - (b.price * b.quantity);

      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [tools, filterSearch, sortBy, sortOrder]);

  const totalToolValue = tools.reduce((acc, t) => acc + t.price * t.quantity, 0);
  const totalUnits = tools.reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
            <Wrench className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Alatan &amp; Tools Bengkel
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Katalog alatan kerja bengkel, mesin tork, kunci khas dan peralatan mekanik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Nilai Keseluruhan Tools</span>
            <span className="text-base font-bold font-mono text-orange-400">
              {formatCurrency(totalToolValue)}
            </span>
          </div>

          <button
            onClick={onAddNewTool}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Tambah Tool Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Cari alatan mengikut nama, jenama, atau laci simpanan..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-4 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Susun:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="name">Nama Alatan</option>
            <option value="price">Harga Seunit</option>
            <option value="quantity">Kuantiti Baki</option>
            <option value="total">Jumlah Nilai</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
            title="Tukar tertib susunan"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid of Tools Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTools.map((tool) => {
          const totalValue = tool.price * tool.quantity;
          const status = getStockStatus(tool.quantity, tool.minStock);

          return (
            <div
              key={tool.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-orange-500/40 shadow-lg hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Visual / Image */}
                <div className="relative p-2 pb-0">
                  <ItemImage item={tool} size="lg" className="rounded-xl h-44 w-full object-cover" />
                  
                  {/* Status Badge floating */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase backdrop-blur-md shadow ${
                      status === 'HABIS'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                        : status === 'STOK RENDAH'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {status === 'TERSEDIA' ? 'Stok Tersedia' : status}
                    </span>
                  </div>

                  {/* Brand Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-950/80 text-slate-300 border border-slate-700 backdrop-blur-md">
                      {tool.brand}
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 sm:p-5">
                  <div className="text-[11px] font-mono text-orange-400 font-semibold uppercase tracking-wider mb-1">
                    {tool.category}
                  </div>
                  <h3 
                    onClick={() => onSelectItem(tool)}
                    className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer"
                    title={tool.name}
                  >
                    {tool.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Lokasi: <span className="text-slate-300">{tool.storageLocation}</span>
                  </p>

                  {/* Financial & Stock Details */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Harga Seunit</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatCurrency(tool.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Kuantiti</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        {tool.quantity} {tool.unit}
                      </span>
                    </div>
                  </div>

                  {/* Total Stock Value */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">Jumlah Nilai:</span>
                    <span className="text-sm font-mono font-bold text-orange-400">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Mandatory Action Buttons: "Lihat", "Edit", "Tambah Stok" */}
              <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectItem(tool)}
                  className="px-2 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  <span>Lihat</span>
                </button>

                <button
                  onClick={() => onEditItem(tool)}
                  className="px-2 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => onRestockItem(tool)}
                  className="px-2 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>+ Stok</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
