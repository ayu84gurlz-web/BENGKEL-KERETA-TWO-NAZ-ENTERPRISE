import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Cog, 
  Droplet, 
  Package, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  ShieldCheck,
  Car,
  X
} from 'lucide-react';
import { InventoryItem } from '../types';

export type NavTab = 
  | 'dashboard' 
  | 'tools' 
  | 'parts' 
  | 'fluids' 
  | 'inventory' 
  | 'reports' 
  | 'lowstock' 
  | 'cms'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  items: InventoryItem[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
  workshopName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  items,
  mobileOpen,
  onCloseMobile,
  workshopName = 'TWO NAZ ENTERPRISE',
}) => {
  const lowStockCount = items.filter(
    (item) => item.quantity <= item.minStock
  ).length;

  const totalValue = items.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      id: 'parts',
      label: 'Alat Ganti',
      icon: <Cog className="h-5 w-5" />,
    },
    {
      id: 'fluids',
      label: 'Minyak & Cecair',
      icon: <Droplet className="h-5 w-5" />,
    },
    {
      id: 'inventory',
      label: 'Inventori',
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: 'lowstock',
      label: 'Stok Rendah',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'cms',
      label: 'CMS Admin',
      icon: <ShieldCheck className="h-5 w-5 text-orange-400" />,
    },
    {
      id: 'settings',
      label: 'Tetapan',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/80 
        backdrop-blur-md flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <Car className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wide text-white font-['Cabinet_Grotesk']">
                  {workshopName}
                </span>
              </div>
              <p className="text-[11px] text-orange-400 font-medium leading-tight">
                Sistem Pengurusan Bengkel
              </p>
            </div>
          </div>

          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-colors ${isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workshop status summary box */}
        <div className="p-4 m-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider">Status Bengkel</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Aktif
            </span>
          </div>
          <div className="text-[13px] font-bold text-white font-mono">
            RM {totalValue.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{items.length} jenis item</span>
            <span>{items.reduce((s, i) => s + i.quantity, 0)} unit fizikal</span>
          </div>
        </div>

        {/* Tagline footer */}
        <div className="p-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 italic">
            "Urus Bengkel. Urus Stok. Urus Dengan Mudah."
          </p>
        </div>
      </aside>
    </>
  );
};
