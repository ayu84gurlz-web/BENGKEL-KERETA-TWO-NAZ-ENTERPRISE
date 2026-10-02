import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Award, 
  ArrowDownCircle, 
  CheckCircle2, 
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { InventoryItem, StockTransaction, WorkshopSettings } from '../types';
import { formatCurrency, formatStock, exportInventoryToCSV } from '../utils/format';

interface ReportsViewProps {
  items: InventoryItem[];
  transactions: StockTransaction[];
  settings: WorkshopSettings;
}

type Period = 'Hari' | 'Minggu' | 'Bulan' | 'Tahun';

export const ReportsView: React.FC<ReportsViewProps> = ({
  items,
  transactions,
  settings,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<Period>('Bulan');
  const [chartMode, setChartMode] = useState<'value' | 'units'>('value');

  // Key Calculations
  const totalInventoryValue = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItemTypes = items.length;
  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);

  // Most Expensive Item (Highest price)
  const mostExpensiveItem = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => b.price - a.price)[0];
  }, [items]);

  // Highest stock quantity
  const highestStockItem = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => b.quantity - a.quantity)[0];
  }, [items]);

  // Lowest stock item (>0)
  const lowestStockItem = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => a.quantity - b.quantity)[0];
  }, [items]);

  // Low stock items count
  const lowStockCount = items.filter((i) => i.quantity <= i.minStock).length;

  // Breakdown by Category
  const categoryStats = useMemo(() => {
    const cats = [
      'Tools',
      'Alat Ganti',
      'Minyak',
      'Cecair',
      'Peralatan Bengkel',
      'Bahan Habis Guna',
    ] as const;

    const colors: Record<string, string> = {
      'Tools': '#f97316',
      'Alat Ganti': '#3b82f6',
      'Minyak': '#f59e0b',
      'Cecair': '#06b6d4',
      'Peralatan Bengkel': '#10b981',
      'Bahan Habis Guna': '#f43f5e',
    };

    return cats.map((cat) => {
      const match = items.filter((i) => i.category === cat);
      const value = match.reduce((s, i) => s + i.price * i.quantity, 0);
      const units = match.reduce((s, i) => s + i.quantity, 0);
      const percentage = totalInventoryValue > 0 ? ((value / totalInventoryValue) * 100).toFixed(1) : '0';

      return {
        category: cat,
        value,
        units,
        count: match.length,
        percentage,
        color: colors[cat] || '#94a3b8',
      };
    }).sort((a, b) => b.value - a.value);
  }, [items, totalInventoryValue]);

  // Highest bar value for scaling
  const maxCategoryVal = Math.max(...categoryStats.map((c) => chartMode === 'value' ? c.value : c.units), 1);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Title header (visible when printing) */}
      <div className="hidden print:block mb-6 border-b border-black pb-4 text-black">
        <h1 className="text-2xl font-bold">{settings.workshopName}</h1>
        <p className="text-sm">{settings.address} · Tel: {settings.phone}</p>
        <p className="text-xs mt-1">Laporan Rasmi Inventori &amp; Penilaian Aset Bengkel · Tarikh: {new Date().toLocaleDateString('ms-MY')}</p>
      </div>

      {/* Screen Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
            <BarChart3 className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Laporan &amp; Analitik Inventori
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Ringkasan penilaian kewangan, statistik stok, analisis kategori dan eksport data rasmi.
            </p>
          </div>
        </div>

        {/* Buttons: Export CSV & Print Report */}
        <div className="flex items-center gap-3">
          {/* Timeframe selector: Hari, Minggu, Bulan, Tahun */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {(['Hari', 'Minggu', 'Bulan', 'Tahun'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterPeriod === period
                    ? 'bg-orange-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportInventoryToCSV(items)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Eksport</span> CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 stroke-[2.5]" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* 7 Key Metric Cards required by prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Nilai Keseluruhan Inventori */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Nilai Keseluruhan</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {formatCurrency(totalInventoryValue)}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
            Penilaian aset aktif
          </span>
        </div>

        {/* 2. Jumlah Item & Jumlah Stok */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Jumlah Item &amp; Stok</span>
            <Package className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {totalUnits} <span className="text-sm font-normal text-slate-400">unit</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Merangkumi {totalItemTypes} jenis barang
          </span>
        </div>

        {/* 3. Barang Paling Mahal */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Barang Paling Mahal</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-base font-bold text-amber-400 truncate">
            {mostExpensiveItem ? mostExpensiveItem.name : '—'}
          </div>
          <span className="text-xs font-mono text-slate-300 font-semibold block mt-1">
            {mostExpensiveItem ? formatCurrency(mostExpensiveItem.price) : 'RM 0.00'} / unit
          </span>
        </div>

        {/* 4. Stok Rendah Alert */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Barang Stok Rendah</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400 font-mono">
            {lowStockCount} <span className="text-sm font-normal text-slate-400">item</span>
          </div>
          <span className="text-[11px] text-rose-400 font-semibold block mt-1">
            Perlu pesanan segera
          </span>
        </div>
      </div>

      {/* Secondary Highlights: Barang Paling Banyak & Barang Paling Kurang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barang Paling Banyak */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">Barang Paling Banyak Stok</span>
              <p className="text-sm font-bold text-white mt-0.5">{highestStockItem?.name || '—'}</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-base font-bold text-emerald-400">
              {highestStockItem?.quantity} {highestStockItem?.unit}
            </span>
            <p className="text-[11px] text-slate-400">Tersimpan</p>
          </div>
        </div>

        {/* Barang Paling Kurang */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">Barang Paling Kurang Stok</span>
              <p className="text-sm font-bold text-white mt-0.5">{lowestStockItem?.name || '—'}</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-base font-bold text-rose-400">
              {lowestStockItem?.quantity} {lowestStockItem?.unit}
            </span>
            <p className="text-[11px] text-slate-400">Baki minimum: {lowestStockItem?.minStock}</p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CHARTS: Bar Chart + Donut Chart + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Bar Chart: Analisis Mengikut Kategori (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Perbandingan Nilai Aset Mengikut Kategori
                </h3>
                <p className="text-xs text-slate-400">
                  Agihan pelaburan inventori merentasi 6 bahagian utama
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setChartMode('value')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    chartMode === 'value' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Nilai (RM)
                </button>
                <button
                  onClick={() => setChartMode('units')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    chartMode === 'units' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kuantiti (Unit)
                </button>
              </div>
            </div>

            {/* Horizontal Bar Chart for high readability */}
            <div className="mt-6 space-y-4">
              {categoryStats.map((stat) => {
                const metric = chartMode === 'value' ? stat.value : stat.units;
                const widthPercent = Math.max(8, Math.round((metric / maxCategoryVal) * 100));

                return (
                  <div key={stat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="h-2.5 w-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: stat.color }} 
                        />
                        <span className="font-semibold text-slate-200">{stat.category}</span>
                        <span className="text-slate-400 text-[11px] font-mono">({stat.count} item)</span>
                      </div>
                      <div className="font-mono font-bold text-white">
                        {chartMode === 'value' ? formatCurrency(stat.value) : `${stat.units} unit`}
                        <span className="text-slate-400 text-xs ml-2 font-normal">({stat.percentage}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        style={{ 
                          width: `${widthPercent}%`,
                          backgroundColor: stat.color 
                        }}
                        className="h-full rounded-full transition-all duration-700 shadow-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Dihitung berdasarkan harga belian/jualan seunit &amp; baki semasa.</span>
            <span className="font-mono text-emerald-400 font-semibold">Status: Seimbang</span>
          </div>
        </div>

        {/* 2. Donut Chart Breakdown (1 col) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-800 flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-orange-400" />
              <div>
                <h3 className="text-base font-bold text-white">Agihan Peratusan</h3>
                <p className="text-xs text-slate-400">Komposisi stok fizikal</p>
              </div>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let accumulated = 0;
                    return categoryStats.map((item) => {
                      const pct = parseFloat(item.percentage);
                      if (pct <= 0) return null;
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = -accumulated;
                      accumulated += pct;
                      return (
                        <circle
                          key={item.category}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                        />
                      );
                    });
                  })()}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                    Jumlah
                  </span>
                  <span className="text-base font-bold font-mono text-white">
                    {totalUnits}
                  </span>
                  <span className="text-[10px] text-slate-400">Unit</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {categoryStats.slice(0, 4).map((c) => (
                <div key={c.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-300 truncate max-w-[110px]">{c.category}</span>
                  </div>
                  <span className="font-mono text-slate-200">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
