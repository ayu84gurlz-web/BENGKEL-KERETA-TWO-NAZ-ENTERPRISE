import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  ArrowUpRight, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { InventoryItem, ItemCategory, StockStatus } from '../types';
import { formatCurrency, formatStock, getStockStatus, exportInventoryToCSV } from '../utils/format';
import { ItemImage } from './ItemImage';

interface InventoryViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRestockItem: (item: InventoryItem) => void;
  onStockOutItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onAddNewItem: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onSelectItem,
  onEditItem,
  onRestockItem,
  onStockOutItem,
  onDeleteItem,
  onAddNewItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'price' | 'quantity' | 'total'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
        const status = getStockStatus(item.quantity, item.minStock);
        const matchesStatus = selectedStatus === 'Semua' || status === selectedStatus;
        
        const q = search.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.carModel.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.storageLocation.toLowerCase().includes(q);

        return matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'category') diff = a.category.localeCompare(b.category);
        else if (sortBy === 'price') diff = a.price - b.price;
        else if (sortBy === 'quantity') diff = a.quantity - b.quantity;
        else if (sortBy === 'total') diff = (a.price * a.quantity) - (b.price * b.quantity);

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [items, selectedCategory, selectedStatus, search, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalFilteredValue = filteredItems.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  const handleSort = (field: 'name' | 'category' | 'price' | 'quantity' | 'total') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const categories: string[] = [
    'Semua',
    'Tools',
    'Alat Ganti',
    'Minyak',
    'Cecair',
    'Peralatan Bengkel',
    'Bahan Habis Guna',
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
            <Package className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Pangkalan Data Inventori
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Jadual lengkap senarai barang, harga, kuantiti stok, pengiraan nilai dan status bengkel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportInventoryToCSV(filteredItems)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Eksport CSV</span>
          </button>

          <button
            onClick={onAddNewItem}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari mengikut nama, jenama, model kereta, lokasi rak..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="TERSEDIA">Tersedia</option>
              <option value="STOK RENDAH">Stok Rendah</option>
              <option value="HABIS">Habis</option>
            </select>
          </div>
        </div>

        {/* Category Pills / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <div>
          Menunjukkan <strong className="text-white font-bold">{filteredItems.length}</strong> daripada {items.length} item
        </div>
        <div>
          Nilai Keseluruhan Paparan: <strong className="text-orange-400 text-sm">{formatCurrency(totalFilteredValue)}</strong>
        </div>
      </div>

      {/* Inventory Modern Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 w-16">Gambar</th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Barang</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white select-none hidden sm:table-cell"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kategori</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('price')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Harga</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('quantity')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Kuantiti</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('total')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white select-none hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Jumlah Nilai</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center hidden lg:table-cell">Min Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-300">Tiada barang dijumpai</p>
                    <p className="text-xs text-slate-400 mt-1">Cuba ubah kata kunci carian atau tetapan penapis anda.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const totalValue = item.price * item.quantity;
                  const status = getStockStatus(item.quantity, item.minStock);

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Gambar */}
                      <td className="py-3 px-4">
                        <ItemImage item={item} size="sm" className="h-12 w-12 rounded-lg shrink-0" />
                      </td>

                      {/* Nama Barang */}
                      <td className="py-3 px-4 max-w-xs">
                        <div 
                          onClick={() => onSelectItem(item)}
                          className="font-bold text-white group-hover:text-orange-400 cursor-pointer transition-colors truncate"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          <span className="font-mono text-slate-400">{item.brand}</span>
                          <span className="mx-1.5">·</span>
                          <span className="text-slate-400">{item.storageLocation}</span>
                          {item.carModel !== 'Universal' && (
                            <>
                              <span className="mx-1.5">·</span>
                              <span className="text-blue-400 font-medium">{item.carModel}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-xs font-mono font-medium text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      {/* Harga */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        {formatCurrency(item.price)}
                      </td>

                      {/* Kuantiti */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`font-bold ${item.quantity <= item.minStock ? 'text-rose-400' : 'text-white'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                      </td>

                      {/* Jumlah Nilai (Harga x Kuantiti) */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-orange-400 hidden md:table-cell">
                        {formatCurrency(totalValue)}
                      </td>

                      {/* Minimum Stok */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400 hidden lg:table-cell">
                        {item.minStock} {item.unit}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          status === 'HABIS'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : status === 'STOK RENDAH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {status}
                        </span>
                      </td>

                      {/* Tindakan */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick View */}
                          <button
                            onClick={() => onSelectItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Lihat Butiran"
                          >
                            <Eye className="h-4 w-4 text-blue-400" />
                          </button>

                          {/* Quick Restock */}
                          <button
                            onClick={() => onRestockItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Tambah Stok"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          {/* Quick Stock Out */}
                          <button
                            onClick={() => onStockOutItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition-colors"
                            title="Keluarkan Stok"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Edit Barang"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Padam */}
                          <button
                            onClick={() => onDeleteItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Padam Barang"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <div>
              Halaman {currentPage} daripada {totalPages}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-medium ${
                    currentPage === pg
                      ? 'bg-orange-600 text-white font-bold'
                      : 'border border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 text-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
