import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  User, 
  Calendar, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2,
  ShieldCheck,
  X
} from 'lucide-react';
import { InventoryItem, StockTransaction } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
  items: InventoryItem[];
  transactions: StockTransaction[];
  onSelectItem: (item: InventoryItem) => void;
  chiefMechanicName?: string;
  onNavigateToCms?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenMobileMenu,
  items,
  transactions,
  onSelectItem,
  chiefMechanicName = 'Mohd Nazrul',
  onNavigateToCms,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter low stock items for notifications
  const lowStockAlerts = items.filter((item) => item.quantity <= item.minStock);

  // Real-time matched items for search preview
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : items.filter((item) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.carModel.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's date in Malay style
  const today = new Intl.DateTimeFormat('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-6 max-w-7xl mx-auto">
        {/* Left: Mobile trigger & Search input */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            aria-label="Buka Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div ref={searchRef} className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Cari tools, alat ganti atau barang..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/80 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick search instant preview popup */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800/60">
                <div className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Hasil Carian Pantas ({searchResults.length})
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      setShowSearchResults(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.category} · {item.brand} · Lokasi: {item.storageLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-orange-400">
                        {formatCurrency(item.price)}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Stok: <strong className="text-slate-200">{item.quantity}</strong> {item.unit}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Zone: Date, Notifications, User profile, + Tambah Barang Button */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Current Date Display */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 font-medium px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <Calendar className="h-4 w-4 text-orange-400" />
            <span className="capitalize">{today}</span>
          </div>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              aria-label="Pemberitahuan"
            >
              <Bell className="h-4 w-4" />
              {lowStockAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950 font-mono animate-pulse">
                  {lowStockAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Card */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-400" />
                    Pemberitahuan & Amaran Stok
                  </h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {lowStockAlerts.length} Amaran
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                  {lowStockAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                      Semua stok barang berada pada paras mencukupi.
                    </div>
                  ) : (
                    lowStockAlerts.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectItem(item);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Tinggal <strong className="text-rose-400 font-mono">{item.quantity} {item.unit}</strong> (Min: {item.minStock})
                            </p>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                            item.quantity === 0 
                              ? 'bg-rose-500/30 text-rose-300' 
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {item.quantity === 0 ? 'HABIS' : 'KRITIKAL'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Recent movements */}
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                      Transaksi Terkini
                    </p>
                    {transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="p-2 rounded-lg bg-slate-950/40 text-xs text-slate-300 mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          {tx.type === 'in' ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                          )}
                          <span className="truncate">{tx.itemName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {tx.type === 'in' ? '+' : '-'}{tx.quantity} {tx.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & CMS Quick Access */}
          <div 
            onClick={onNavigateToCms}
            className={`flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-800 ${onNavigateToCms ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
            title="Klik untuk membuka CMS Admin"
          >
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center text-slate-200 shadow">
              <User className="h-5 w-5" />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] text-white">
                ✓
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-100 leading-tight">{chiefMechanicName}</p>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                  CMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Ketua Mekanik / Pentadbir</p>
            </div>
          </div>

          {/* Primary CTA: + Tambah Barang */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>
    </header>
  );
};
