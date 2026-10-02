import React, { useState, useMemo } from 'react';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  CheckCircle2, 
  Flame, 
  BarChart2, 
  PieChart as PieIcon, 
  Clock, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Fuel
} from 'lucide-react';
import { InventoryItem, StockTransaction } from '../types';
import { formatCurrency, formatStock, getStockStatus } from '../utils/format';
import { ItemImage } from './ItemImage';
import { heroBayImg } from '../assets/images';

interface DashboardViewProps {
  items: InventoryItem[];
  transactions: StockTransaction[];
  onSelectItem: (item: InventoryItem) => void;
  onQuickRestock: (item: InventoryItem) => void;
  onNavigateTab: (tab: any) => void;
  workshopName?: string;
}

type Period = 'Hari' | 'Minggu' | 'Bulan' | 'Tahun';

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  transactions,
  onSelectItem,
  onQuickRestock,
  onNavigateTab,
  workshopName = 'TWO NAZ ENTERPRISE',
}) => {
  const [chartPeriod, setChartPeriod] = useState<Period>('Bulan');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  // 1. Calculate Key Metrics
  const totalItemTypes = items.length;
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalInventoryValue = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const lowStockItems = useMemo(() => {
    return items
      .filter((item) => item.quantity <= item.minStock)
      .sort((a, b) => (a.quantity / (a.minStock || 1)) - (b.quantity / (b.minStock || 1)));
  }, [items]);

  const toolItems = items.filter((item) => item.category === 'Tools');
  const totalToolUnits = toolItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalToolValue = toolItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 2. Top 5 Lowest Stock Items
  const topLowStock = lowStockItems.slice(0, 5);

  // 3. Most Popular / High Usage Items
  const popularItems = useMemo(() => {
    return [...items]
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, 5);
  }, [items]);

  // 4. Category breakdown for Donut Chart
  const categories = [
    'Tools',
    'Alat Ganti',
    'Minyak',
    'Cecair',
    'Peralatan Bengkel',
    'Bahan Habis Guna',
  ] as const;

  const categoryData = useMemo(() => {
    const categoryColors: Record<string, string> = {
      'Tools': '#f97316', // orange
      'Alat Ganti': '#3b82f6', // blue
      'Minyak': '#f59e0b', // amber
      'Cecair': '#06b6d4', // cyan
      'Peralatan Bengkel': '#10b981', // emerald
      'Bahan Habis Guna': '#f43f5e', // rose
    };

    const data = categories.map((cat) => {
      const catItems = items.filter((i) => i.category === cat);
      const value = catItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const count = catItems.reduce((acc, i) => acc + i.quantity, 0);
      return {
        name: cat,
        value,
        count,
        color: categoryColors[cat] || '#94a3b8',
      };
    });

    const totalVal = data.reduce((acc, d) => acc + d.value, 0) || 1;

    return data.map((d) => ({
      ...d,
      percentage: ((d.value / totalVal) * 100).toFixed(1),
    }));
  }, [items]);

  // 5. Dynamic Data for Trend Chart based on Period
  const trendData = useMemo(() => {
    if (chartPeriod === 'Hari') {
      return [
        { label: '08:00', value: totalInventoryValue * 0.96 },
        { label: '10:00', value: totalInventoryValue * 0.98 },
        { label: '12:00', value: totalInventoryValue * 0.95 },
        { label: '14:00', value: totalInventoryValue * 0.97 },
        { label: '16:00', value: totalInventoryValue * 0.99 },
        { label: '18:00', value: totalInventoryValue },
      ];
    } else if (chartPeriod === 'Minggu') {
      return [
        { label: 'Isnin', value: totalInventoryValue * 0.92 },
        { label: 'Selasa', value: totalInventoryValue * 0.94 },
        { label: 'Rabu', value: totalInventoryValue * 0.91 },
        { label: 'Khamis', value: totalInventoryValue * 0.97 },
        { label: 'Jumaat', value: totalInventoryValue * 0.95 },
        { label: 'Sabtu', value: totalInventoryValue * 0.99 },
        { label: 'Ahad', value: totalInventoryValue },
      ];
    } else if (chartPeriod === 'Bulan') {
      return [
        { label: 'Mei', value: 39500 },
        { label: 'Jun', value: 41800 },
        { label: 'Jul', value: 43200 },
        { label: 'Ogo', value: 45600 },
        { label: 'Sep', value: 47100 },
        { label: 'Okt', value: totalInventoryValue },
      ];
    } else {
      return [
        { label: '2023', value: 32000 },
        { label: '2024', value: 38400 },
        { label: '2025', value: 44100 },
        { label: '2026 (Semasa)', value: totalInventoryValue },
      ];
    }
  }, [chartPeriod, totalInventoryValue]);

  const maxTrendVal = Math.max(...trendData.map((d) => d.value), 1);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero Workshop Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden md:block pointer-events-none">
          <img
            src={heroBayImg}
            alt="Bengkel Pro Bay"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Pusat Kawalan Operasi & Inventori Bengkel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Cabinet_Grotesk'] text-balance">
            Selamat Datang ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">{workshopName}</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Pantau pergerakan stok alatan, alat ganti, minyak pelincir serta cecair servis secara langsung dengan kawalan inventori berketepatan tinggi.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>Urus Inventori Lengkap</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigateTab('lowstock')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Semak {lowStockItems.length} Stok Rendah</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: JUMLAH ITEM */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Jumlah Item
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {totalUnits}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              unit ({totalItemTypes} jenis)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+6.2%</span>
            </div>
            <span className="text-slate-400 text-[11px]">berbanding bulan lepas</span>
          </div>
          {/* Mini visual bars */}
          <div className="absolute -bottom-2 right-4 flex items-end gap-1 opacity-20 pointer-events-none">
            <span className="w-1.5 h-6 bg-blue-500 rounded-t" />
            <span className="w-1.5 h-10 bg-blue-500 rounded-t" />
            <span className="w-1.5 h-8 bg-blue-500 rounded-t" />
            <span className="w-1.5 h-12 bg-blue-500 rounded-t" />
          </div>
        </div>

        {/* Card 2: NILAI INVENTORI */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Nilai Inventori
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight truncate">
              {formatCurrency(totalInventoryValue)}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+8.4%</span>
            </div>
            <span className="text-slate-400 text-[11px]">nilai aset bengkel</span>
          </div>
          <div className="absolute -bottom-2 right-4 flex items-end gap-1 opacity-20 pointer-events-none">
            <span className="w-1.5 h-8 bg-emerald-500 rounded-t" />
            <span className="w-1.5 h-12 bg-emerald-500 rounded-t" />
            <span className="w-1.5 h-10 bg-emerald-500 rounded-t" />
            <span className="w-1.5 h-14 bg-emerald-500 rounded-t" />
          </div>
        </div>

        {/* Card 3: STOK RENDAH */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Stok Rendah
            </span>
            <div className={`p-2.5 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'} group-hover:scale-110 transition-transform`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono tracking-tight ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              item perlu restock
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-rose-400 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Tindakan Segera</span>
            </div>
            <span className="text-slate-400 text-[11px]">&le; paras minimum</span>
          </div>
          <div className="absolute -bottom-2 right-4 flex items-end gap-1 opacity-20 pointer-events-none">
            <span className="w-1.5 h-14 bg-rose-500 rounded-t" />
            <span className="w-1.5 h-10 bg-rose-500 rounded-t" />
            <span className="w-1.5 h-6 bg-rose-500 rounded-t" />
            <span className="w-1.5 h-4 bg-rose-500 rounded-t" />
          </div>
        </div>

        {/* Card 4: JUMLAH TOOLS */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Jumlah Tools
            </span>
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {totalToolUnits}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              unit ({toolItems.length} alat)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-orange-400 font-mono font-semibold">
              {formatCurrency(totalToolValue)}
            </span>
            <span className="text-slate-400 text-[11px]">nilai alatan bengkel</span>
          </div>
          <div className="absolute -bottom-2 right-4 flex items-end gap-1 opacity-20 pointer-events-none">
            <span className="w-1.5 h-6 bg-orange-500 rounded-t" />
            <span className="w-1.5 h-9 bg-orange-500 rounded-t" />
            <span className="w-1.5 h-12 bg-orange-500 rounded-t" />
            <span className="w-1.5 h-10 bg-orange-500 rounded-t" />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION: GRAF NILAI INVENTORI & INVENTORI MENGIKUT KATEGORI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): GRAF NILAI INVENTORI */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Graf Nilai Inventori
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trend penilaian aset stok keseluruhan bengkel
                  </p>
                </div>
              </div>

              {/* Timeframe switcher: Hari, Minggu, Bulan, Tahun */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {(['Hari', 'Minggu', 'Bulan', 'Tahun'] as Period[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      chartPeriod === period
                        ? 'bg-orange-500 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Current period indicator */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Nilai Semasa ({chartPeriod})</span>
                <p className="text-2xl font-bold font-mono text-white mt-0.5">
                  {formatCurrency(totalInventoryValue)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                    chartType === 'bar' 
                      ? 'bg-slate-800 border-orange-500/50 text-orange-400' 
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                    chartType === 'line' 
                      ? 'bg-slate-800 border-orange-500/50 text-orange-400' 
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="mt-6 h-60 w-full relative flex items-end pt-4 pb-6">
              {/* Horizontal gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-dashed border-slate-500 w-full" />
                <div className="border-b border-dashed border-slate-500 w-full" />
                <div className="border-b border-dashed border-slate-500 w-full" />
                <div className="border-b border-slate-700 w-full" />
              </div>

              {chartType === 'bar' ? (
                /* Bar chart */
                <div className="relative z-10 w-full h-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                  {trendData.map((d, index) => {
                    const heightPercent = Math.max(15, Math.round((d.value / maxTrendVal) * 100));
                    const isLast = index === trendData.length - 1;
                    return (
                      <div key={d.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono font-bold text-white pointer-events-none whitespace-nowrap shadow-lg">
                          {formatCurrency(d.value)}
                        </div>
                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ${
                            isLast
                              ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-lg shadow-orange-500/30'
                              : 'bg-gradient-to-t from-slate-800 to-slate-600 group-hover:from-orange-800 group-hover:to-orange-600'
                          }`}
                        />
                        {/* Label */}
                        <span className="text-[11px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Line chart */
                <div className="relative z-10 w-full h-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    {(() => {
                      const points = trendData.map((d, i) => {
                        const x = (i / (trendData.length - 1)) * 500;
                        const y = 160 - ((d.value / maxTrendVal) * 130);
                        return `${x},${y}`;
                      });
                      const dPath = `M 0,160 L ${points.join(' L ')} L 500,160 Z`;
                      const strokePath = `M ${points.join(' L ')}`;
                      return (
                        <>
                          <path d={dPath} fill="url(#areaGradient)" />
                          <path d={strokePath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                          {trendData.map((d, i) => {
                            const x = (i / (trendData.length - 1)) * 500;
                            const y = 160 - ((d.value / maxTrendVal) * 130);
                            return (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="5"
                                fill="#0f172a"
                                stroke="#f97316"
                                strokeWidth="2.5"
                                className="hover:r-7 transition-all cursor-pointer"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  {/* Bottom Labels */}
                  <div className="absolute -bottom-6 inset-x-0 flex justify-between px-1 text-[11px] font-mono text-slate-400">
                    {trendData.map((d) => (
                      <span key={d.label}>{d.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Data dikemaskini secara automatik dari rekod transaksi.</span>
            <span className="font-mono text-slate-300">Pusat Servis Bersepadu</span>
          </div>
        </div>

        {/* Right (1 col): INVENTORI MENGIKUT KATEGORI (Donut Chart) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <PieIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Inventori Mengikut Kategori
                </h3>
                <p className="text-xs text-slate-400">
                  Agihan nilai aset mengikut kelompok
                </p>
              </div>
            </div>

            {/* Donut Chart representation */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let accumulatedPercent = 0;
                    return categoryData.map((cat) => {
                      const pct = parseFloat(cat.percentage);
                      if (pct <= 0) return null;
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = -accumulatedPercent;
                      accumulatedPercent += pct;
                      return (
                        <circle
                          key={cat.name}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth="15"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Inner center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Nilai Bersih
                  </span>
                  <span className="text-sm font-bold font-mono text-white mt-0.5">
                    {formatCurrency(totalInventoryValue)}
                  </span>
                  <span className="text-[10px] text-orange-400 font-semibold mt-0.5">
                    6 Kategori
                  </span>
                </div>
              </div>
            </div>

            {/* Category breakdown legend */}
            <div className="space-y-2 mt-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-2.5 w-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="text-slate-300 font-medium truncate max-w-[120px]">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{cat.percentage}%</span>
                    <span className="text-slate-200 font-semibold">{formatCurrency(cat.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: STOK HAMPIR HABIS & BARANG POPULAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: ⚠️ STOK HAMPIR HABIS */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Stok Hampir Habis
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {lowStockItems.length} Perlu Pesanan
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  5 barang dengan baki stok paling rendah
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('lowstock')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {topLowStock.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                Semua stok barang berada pada paras sihat.
              </div>
            ) : (
              topLowStock.map((item) => {
                const ratio = Math.min(100, Math.round((item.quantity / (item.minStock || 1)) * 100));
                const isCritical = item.quantity <= Math.ceil(item.minStock * 0.4);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ItemImage item={item} size="sm" className="h-11 w-11 shrink-0 rounded-lg" />
                        <div>
                          <p 
                            onClick={() => onSelectItem(item)}
                            className="text-sm font-bold text-white hover:text-orange-400 cursor-pointer transition-colors"
                          >
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.category} · {item.brand} · Lokasi: {item.storageLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isCritical ? 'KRITIKAL' : 'RENDAH'}
                        </span>
                        <button
                          onClick={() => onQuickRestock(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-all"
                          title="Tambah Stok Segera"
                        >
                          <Plus className="h-3.5 w-3.5 text-orange-400" />
                          <span>+ Stok</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          Baki: <strong className="text-white font-bold">{item.quantity}</strong> {item.unit}
                        </span>
                        <span className="text-slate-400">
                          Minimum: <strong className="text-slate-300">{item.minStock}</strong> {item.unit}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(5, ratio)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: 🔥 BARANG POPULAR (Paling Banyak Digunakan) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Barang Popular
                </h3>
                <p className="text-xs text-slate-400">
                  Item paling kerap digunakan &amp; dikeluarkan untuk servis
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>Laporan Lengkap</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {popularItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-orange-500/30 hover:bg-slate-900/60 cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 group-hover:border-orange-500/40 group-hover:text-orange-400">
                    #{index + 1}
                  </div>
                  <ItemImage item={item} size="sm" className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 group-hover:text-orange-400 transition-colors truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.category} · {item.brand}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-white flex items-center gap-1 justify-end">
                    <span className="text-orange-400">{item.totalUsage}</span>
                    <span className="text-xs text-slate-400 font-normal">{item.unit} dikeluarkan</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Stok Semasa: <strong className="text-slate-200">{item.quantity}</strong> {item.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
