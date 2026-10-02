import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  Check, 
  X, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Package, 
  Sliders, 
  History, 
  ArrowUpDown, 
  Percent, 
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { InventoryItem, ItemCategory, CMSAuditRecord } from '../types';
import { formatCurrency, formatStock, getStockStatus } from '../utils/format';
import { ItemImage } from './ItemImage';

interface CmsAdminViewProps {
  items: InventoryItem[];
  auditLogs: CMSAuditRecord[];
  onUpdateItem: (updatedItem: InventoryItem, auditLog?: CMSAuditRecord) => void;
  onBatchUpdatePrices: (category: string, adjustType: 'percent' | 'fixed', amount: number, reason: string) => void;
  chiefMechanicName: string;
}

export const CmsAdminView: React.FC<CmsAdminViewProps> = ({
  items,
  auditLogs,
  onUpdateItem,
  onBatchUpdatePrices,
  chiefMechanicName,
}) => {
  // Navigation tabs within CMS Admin
  const [activeTab, setActiveTab] = useState<'inventory_editor' | 'batch_operations' | 'audit_log'>('inventory_editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'margin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Inline editing state: { itemId: { fieldName: value } }
  const [inlineDrafts, setInlineDrafts] = useState<Record<string, Partial<InventoryItem>>>({});
  const [savedRowIds, setSavedRowIds] = useState<Record<string, boolean>>({});

  // Detailed Modal for Full Item CMS Edit
  const [detailModalItem, setDetailModalItem] = useState<InventoryItem | null>(null);
  const [detailDraft, setDetailDraft] = useState<Partial<InventoryItem>>({});
  const [auditReason, setAuditReason] = useState<string>('Penyelarasan Terperinci CMS Admin');

  // Batch Update Modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCategory, setBatchCategory] = useState('Semua');
  const [batchType, setBatchType] = useState<'percent' | 'fixed'>('percent');
  const [batchValue, setBatchValue] = useState<number | ''>(5);
  const [batchReason, setBatchReason] = useState('Pelarasan Harga Pasaran Tahunan');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  // Categories
  const categories: string[] = [
    'Semua',
    'Tools',
    'Alat Ganti',
    'Minyak',
    'Cecair',
    'Peralatan Bengkel',
    'Bahan Habis Guna',
  ];

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchSearch =
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          (item.sku && item.sku.toLowerCase().includes(q)) ||
          item.storageLocation.toLowerCase().includes(q) ||
          item.carModel.toLowerCase().includes(q);

        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'price') diff = a.price - b.price;
        else if (sortBy === 'quantity') diff = a.quantity - b.quantity;
        else if (sortBy === 'margin') {
          const marginA = a.costPrice ? ((a.price - a.costPrice) / a.price) : 0;
          const marginB = b.costPrice ? ((b.price - b.costPrice) / b.price) : 0;
          diff = marginA - marginB;
        }

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [items, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Overall Financial Stats for CMS
  const totalValue = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalEstimatedCost = items.reduce((acc, i) => acc + (i.costPrice || i.price * 0.65) * i.quantity, 0);
  const grossProfitMargin = totalValue > 0 ? (((totalValue - totalEstimatedCost) / totalValue) * 100).toFixed(1) : '0';

  // Handle Inline Draft Change
  const handleInlineChange = (itemId: string, field: keyof InventoryItem, value: any) => {
    setInlineDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  // Save Inline Changes for single row
  const handleSaveInline = (item: InventoryItem) => {
    const draft = inlineDrafts[item.id];
    if (!draft) return;

    const newPrice = draft.price !== undefined ? Number(draft.price) : item.price;
    const newQty = draft.quantity !== undefined ? Number(draft.quantity) : item.quantity;
    const newMin = draft.minStock !== undefined ? Number(draft.minStock) : item.minStock;
    const newCost = draft.costPrice !== undefined ? Number(draft.costPrice) : (item.costPrice || Number((item.price * 0.65).toFixed(2)));
    const newLocation = draft.storageLocation !== undefined ? String(draft.storageLocation) : item.storageLocation;
    const newSku = draft.sku !== undefined ? String(draft.sku) : (item.sku || `SKU-${item.id.toUpperCase()}`);

    // Check what changed for audit log
    const changes: string[] = [];
    if (newPrice !== item.price) changes.push(`Harga: RM ${item.price.toFixed(2)} → RM ${newPrice.toFixed(2)}`);
    if (newQty !== item.quantity) changes.push(`Kuantiti: ${item.quantity} → ${newQty} ${item.unit}`);
    if (newMin !== item.minStock) changes.push(`Min Stok: ${item.minStock} → ${newMin}`);
    if (newCost !== (item.costPrice || 0)) changes.push(`Kos: RM ${(item.costPrice || 0).toFixed(2)} → RM ${newCost.toFixed(2)}`);
    if (newLocation !== item.storageLocation) changes.push(`Lokasi: ${item.storageLocation} → ${newLocation}`);

    const updatedItem: InventoryItem = {
      ...item,
      price: newPrice,
      quantity: newQty,
      minStock: newMin,
      costPrice: newCost,
      storageLocation: newLocation,
      sku: newSku,
      lastUpdated: new Date().toISOString(),
    };

    let auditLog: CMSAuditRecord | undefined = undefined;
    if (changes.length > 0) {
      auditLog = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        itemId: item.id,
        itemName: item.name,
        fieldChanged: newPrice !== item.price ? 'HARGA' : newQty !== item.quantity ? 'KUANTITI' : 'SEMUA_BUTIRAN',
        oldValue: `Harga: RM ${item.price.toFixed(2)}, Stok: ${item.quantity}`,
        newValue: `Harga: RM ${newPrice.toFixed(2)}, Stok: ${newQty}`,
        adjustedBy: `${chiefMechanicName} (Pentadbir)`,
        reason: 'Kemaskini Pantas Inline CMS Admin',
        timestamp: new Date().toISOString(),
      };
    }

    onUpdateItem(updatedItem, auditLog);

    // Clear draft and show momentary green check
    setInlineDrafts((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });

    setSavedRowIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setSavedRowIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2500);
  };

  // Open Full Detail Modal
  const openDetailModal = (item: InventoryItem) => {
    setDetailModalItem(item);
    setDetailDraft({
      name: item.name,
      category: item.category,
      brand: item.brand,
      carModel: item.carModel,
      unit: item.unit,
      price: item.price,
      costPrice: item.costPrice || Number((item.price * 0.65).toFixed(2)),
      quantity: item.quantity,
      minStock: item.minStock,
      maxStock: item.maxStock || item.minStock * 4,
      storageLocation: item.storageLocation,
      sku: item.sku || `SKU-${item.id.toUpperCase()}`,
      supplier: item.supplier || (item.category === 'Minyak' ? 'Castrol / Shell Supplier' : 'Spare Parts Wholesaler'),
      notes: item.notes || '',
      image: item.image || '',
    });
    setAuditReason('Penyelarasan Terperinci Rekod CMS');
  };

  // Save Full Detail Modal
  const handleSaveDetailModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModalItem) return;

    const oldPrice = detailModalItem.price;
    const oldQty = detailModalItem.quantity;
    const newPrice = Number(detailDraft.price ?? oldPrice);
    const newQty = Number(detailDraft.quantity ?? oldQty);

    const updatedItem: InventoryItem = {
      ...detailModalItem,
      ...detailDraft,
      price: newPrice,
      quantity: newQty,
      costPrice: Number(detailDraft.costPrice || 0),
      minStock: Number(detailDraft.minStock || 1),
      maxStock: Number(detailDraft.maxStock || 10),
      lastUpdated: new Date().toISOString(),
    } as InventoryItem;

    const auditLog: CMSAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemId: detailModalItem.id,
      itemName: detailDraft.name || detailModalItem.name,
      fieldChanged: 'SEMUA_BUTIRAN',
      oldValue: `Harga: RM ${oldPrice.toFixed(2)}, Stok: ${oldQty}`,
      newValue: `Harga: RM ${newPrice.toFixed(2)}, Stok: ${newQty}`,
      adjustedBy: `${chiefMechanicName} (Pentadbir)`,
      reason: auditReason.trim() || 'Penyelarasan Terperinci CMS Admin',
      timestamp: new Date().toISOString(),
    };

    onUpdateItem(updatedItem, auditLog);
    setDetailModalItem(null);
  };

  // Submit Batch Update
  const handleConfirmBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(batchValue);
    if (!val || isNaN(val)) {
      alert('Sila masukkan nilai perubahan harga yang sah.');
      return;
    }

    onBatchUpdatePrices(batchCategory, batchType, val, batchReason);
    setShowBatchModal(false);
    setBatchSuccessMsg(`Pelarasan harga secara pukal berjaya dilaksanakan untuk kategori: ${batchCategory}`);
    setTimeout(() => setBatchSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. CMS Security & Command Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-orange-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0">
              <ShieldCheck className="h-7 w-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
                  CMS Admin &amp; Pengurusan Stok Terperinci
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
                  <Unlock className="h-3 w-3" />
                  Akses Penuh
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Kebenaran Pentadbir Diaktifkan untuk <strong className="text-orange-400 font-semibold">{chiefMechanicName}</strong>. Ubah harga jualan, harga kos, kuantiti stok, dan lokasi simpanan secara langsung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              <Percent className="h-4 w-4 stroke-[2.5]" />
              <span>Pelarasan Harga Pukal</span>
            </button>
          </div>
        </div>

        {/* 3 Overview Financial KPI Pills for Admin */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Nilai Aset Jualan (Retail)</span>
            <span className="text-sm font-bold font-mono text-white">{formatCurrency(totalValue)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Anggaran Kos Modal</span>
            <span className="text-sm font-bold font-mono text-slate-300">{formatCurrency(totalEstimatedCost)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Purata Margin Untung Kasar</span>
            <span className="text-sm font-bold font-mono text-emerald-400">+{grossProfitMargin}%</span>
          </div>
        </div>
      </div>

      {batchSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{batchSuccessMsg}</span>
        </div>
      )}

      {/* 2. Sub-Navigation Tabs: Pengeditan Inventori / Log Audit */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory_editor')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inventory_editor'
              ? 'bg-slate-900 text-orange-400 border border-orange-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Editor Stok &amp; Harga Pantas</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit_log'
              ? 'bg-slate-900 text-orange-400 border border-orange-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Log Audit CMS ({auditLogs.length})</span>
        </button>
      </div>

      {/* VIEW 1: INVENTORY EDITOR (Inline & Details) */}
      {activeTab === 'inventory_editor' && (
        <div className="space-y-4">
          {/* Controls: Search, Category, Sorting */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari mengikut nama, SKU, jenama, model atau lokasi..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Susun:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="name">Nama Barang</option>
                  <option value="price">Harga Jualan</option>
                  <option value="quantity">Kuantiti Stok</option>
                  <option value="margin">Margin Untung (%)</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                  title="Tukar susunan"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-2 shrink-0">
                Kategori:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
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

          {/* Quick CMS Helper Tip */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-400" />
              <span>
                <strong>Mod Pengeditan Pantas:</strong> Anda boleh menaip nilai harga dan kuantiti stok secara langsung dalam kotak input di bawah. Klik butang <span className="font-mono text-emerald-400">Simpan</span> untuk mengesahkan.
              </span>
            </span>
            <span className="font-mono text-[11px] text-blue-400 hidden sm:inline">
              {filteredItems.length} rekod sedia disunting
            </span>
          </div>

          {/* Main CMS Table with Inline Inputs */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 w-14">Gambar</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Barang &amp; SKU</th>
                    <th className="py-3.5 px-3 min-w-[130px]">Harga Jualan (RM)</th>
                    <th className="py-3.5 px-3 min-w-[120px]">Harga Kos (RM)</th>
                    <th className="py-3.5 px-3 min-w-[110px]">Margin Untung</th>
                    <th className="py-3.5 px-3 min-w-[110px]">Stok Semasa</th>
                    <th className="py-3.5 px-3 min-w-[90px]">Min Stok</th>
                    <th className="py-3.5 px-3 min-w-[130px]">Lokasi Rak</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px]">Tindakan CMS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {filteredItems.map((item) => {
                    const draft = inlineDrafts[item.id] || {};
                    const currentPrice = draft.price !== undefined ? draft.price : item.price;
                    const currentCost = draft.costPrice !== undefined ? draft.costPrice : (item.costPrice || Number((item.price * 0.65).toFixed(2)));
                    const currentQty = draft.quantity !== undefined ? draft.quantity : item.quantity;
                    const currentMin = draft.minStock !== undefined ? draft.minStock : item.minStock;
                    const currentLocation = draft.storageLocation !== undefined ? draft.storageLocation : item.storageLocation;

                    // Margin calculation
                    const priceNum = Number(currentPrice);
                    const costNum = Number(currentCost);
                    const profitRM = priceNum - costNum;
                    const profitPercent = priceNum > 0 ? ((profitRM / priceNum) * 100).toFixed(1) : '0';

                    const hasChanges = Object.keys(draft).length > 0;
                    const isSaved = savedRowIds[item.id];
                    const status = getStockStatus(Number(currentQty), Number(currentMin));

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${hasChanges ? 'bg-orange-500/5' : 'hover:bg-slate-800/40'}`}
                      >
                        {/* Gambar */}
                        <td className="py-3 px-4">
                          <ItemImage item={item} size="sm" className="h-10 w-10 rounded-lg shrink-0" />
                        </td>

                        {/* Nama Barang & SKU */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                            <span className="text-orange-400">{item.brand}</span>
                            <span>·</span>
                            <span>{item.sku || `SKU-${item.id.toUpperCase()}`}</span>
                          </div>
                        </td>

                        {/* Editable: Harga Jualan (RM) */}
                        <td className="py-3 px-3">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                              RM
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentPrice}
                              onChange={(e) => handleInlineChange(item.id, 'price', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-lg pl-9 pr-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Editable: Harga Kos (RM) */}
                        <td className="py-3 px-3">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                              RM
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentCost}
                              onChange={(e) => handleInlineChange(item.id, 'costPrice', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg pl-9 pr-2 py-1.5 text-xs font-mono font-bold text-slate-200 focus:outline-none"
                            />
                          </div>
                        </td>

                        {/* Margin % (Auto-calculated) */}
                        <td className="py-3 px-3 font-mono text-xs">
                          <div className={`font-bold ${Number(profitPercent) >= 25 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            +{profitPercent}%
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Untung: RM {profitRM.toFixed(2)}
                          </div>
                        </td>

                        {/* Editable: Kuantiti Stok */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={currentQty}
                              onChange={(e) => handleInlineChange(item.id, 'quantity', e.target.value)}
                              className={`w-16 bg-slate-950 border rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-center focus:outline-none ${
                                Number(currentQty) <= Number(currentMin)
                                  ? 'border-rose-500/60 text-rose-400'
                                  : 'border-slate-700 text-white focus:border-orange-500'
                              }`}
                            />
                            <span className="text-[11px] font-mono text-slate-400">{item.unit}</span>
                          </div>
                        </td>

                        {/* Editable: Min Stok */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            value={currentMin}
                            onChange={(e) => handleInlineChange(item.id, 'minStock', e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-300 text-center focus:outline-none"
                          />
                        </td>

                        {/* Editable: Lokasi Simpanan */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={currentLocation}
                            onChange={(e) => handleInlineChange(item.id, 'storageLocation', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                          />
                        </td>

                        {/* Actions: Save Inline / Open Detailed Drawer */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Save Button for changes */}
                            {hasChanges && (
                              <button
                                onClick={() => handleSaveInline(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all cursor-pointer animate-pulse"
                                title="Simpan Perubahan"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>Simpan</span>
                              </button>
                            )}

                            {isSaved && (
                              <span className="px-2 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                <span>Disimpan</span>
                              </span>
                            )}

                            {/* Open Full Details Drawer */}
                            <button
                              onClick={() => openDetailModal(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Buka Editor Terperinci"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-orange-400" />
                              <span className="hidden sm:inline">Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CMS AUDIT LOG */}
      {activeTab === 'audit_log' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="h-5 w-5 text-orange-400" />
                Jejak Audit &amp; Sejarah Perubahan CMS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rekod setiap pengubahsuaian harga, stok, dan spesifikasi yang dibuat oleh pentadbir bengkel.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
              {auditLogs.length} Log Direkod
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <History className="h-10 w-10 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="font-semibold text-slate-300">Belum ada sebarang pengubahsuaian CMS dilakukan.</p>
              <p className="text-slate-500 mt-1">Setiap perubahan harga atau stok yang disimpan akan direkodkan di sini secara automatik.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {log.fieldChanged}
                      </span>
                      <strong className="text-white text-sm font-semibold">{log.itemName}</strong>
                    </div>
                    <div className="text-slate-400 text-xs font-mono">
                      <span>Nilai Terdahulu: <span className="text-rose-400">{log.oldValue}</span></span>
                      <span className="mx-2">→</span>
                      <span>Nilai Baharu: <span className="text-emerald-400 font-bold">{log.newValue}</span></span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      Sebab: "{log.reason}"
                    </p>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className="text-slate-300 font-semibold block">{log.adjustedBy}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('ms-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MODAL: FULL DETAIL CMS ITEM EDITOR */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div 
            className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Penyuntingan Terperinci CMS Admin
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ubah harga jualan, harga kos, stok audit, had minimum &amp; maksimum bagi <strong className="text-orange-400">{detailModalItem.name}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDetailModal} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Nama, Kategori & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    required
                    value={detailDraft.name || ''}
                    onChange={(e) => setDetailDraft({ ...detailDraft, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Kod SKU / Barcode
                  </label>
                  <input
                    type="text"
                    value={detailDraft.sku || ''}
                    onChange={(e) => setDetailDraft({ ...detailDraft, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: FINANCIAL PRICING & MARGIN BOX */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-orange-500/20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Penetapan Harga &amp; Analisis Margin
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Kiraan keuntungan kasar automatik
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Harga Kos Modal */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                      Harga Kos Modal (RM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={detailDraft.costPrice ?? ''}
                      onChange={(e) => setDetailDraft({ ...detailDraft, costPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Harga Jualan Pelanggan */}
                  <div>
                    <label className="block text-xs font-mono text-orange-400 uppercase mb-1 font-bold">
                      Harga Jualan Pelanggan (RM) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={detailDraft.price ?? ''}
                      onChange={(e) => setDetailDraft({ ...detailDraft, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Calculated Margin Card */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
                    <span className="text-[11px] font-mono text-slate-400 block">Margin Untung Kasar</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-base font-bold font-mono text-emerald-400">
                        +{((Number(detailDraft.price || 0) > 0 ? ((Number(detailDraft.price) - Number(detailDraft.costPrice || 0)) / Number(detailDraft.price)) * 100 : 0)).toFixed(1)}%
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        (Untung: RM {(Number(detailDraft.price || 0) - Number(detailDraft.costPrice || 0)).toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: QUANTITY, AUDIT STOCK, MIN & MAX THRESHOLDS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                  Kawalan Stok &amp; Ambang Amaran
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Kuantiti Stok Sebenar (Audit Override) */}
                  <div>
                    <label className="block text-xs font-mono text-white uppercase mb-1 font-bold">
                      Kuantiti Stok Fizikal ({detailDraft.unit || 'unit'}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={detailDraft.quantity ?? ''}
                      onChange={(e) => setDetailDraft({ ...detailDraft, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Minimum Stok */}
                  <div>
                    <label className="block text-xs font-mono text-amber-400 uppercase mb-1">
                      Paras Minimum Amaran
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={detailDraft.minStock ?? ''}
                      onChange={(e) => setDetailDraft({ ...detailDraft, minStock: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Maksimum Stok */}
                  <div>
                    <label className="block text-xs font-mono text-blue-400 uppercase mb-1">
                      Kapasiti Maksimum Rak
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={detailDraft.maxStock ?? ''}
                      onChange={(e) => setDetailDraft({ ...detailDraft, maxStock: parseInt(e.target.value) || 20 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Jenama, Model, Pembekal & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Pembekal Utama (Supplier)
                  </label>
                  <input
                    type="text"
                    value={detailDraft.supplier || ''}
                    onChange={(e) => setDetailDraft({ ...detailDraft, supplier: e.target.value })}
                    placeholder="Nama syarikat pembekal..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Lokasi Rak / Petak Simpanan
                  </label>
                  <input
                    type="text"
                    value={detailDraft.storageLocation || ''}
                    onChange={(e) => setDetailDraft({ ...detailDraft, storageLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Reason for Audit Log */}
              <div>
                <label className="block text-xs font-mono text-orange-400 uppercase mb-1 font-bold">
                  Sebab Pengubahsuaian (Direkodkan ke Log Audit) *
                </label>
                <input
                  type="text"
                  required
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="Cth: Penyelarasan kiraan stok fizikal / Kenaikan harga pembekal..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDetailModalItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4 stroke-[2.5]" />
                  <span>Sahkan &amp; Rekod Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: BATCH PRICE ADJUSTMENT */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pelarasan Harga Pukal (Batch Price)</h3>
                  <p className="text-xs text-slate-400">Ubah harga jualan untuk keseluruhan kategori serentak</p>
                </div>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Pilih Kategori Sasaran
                </label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Jenis Pelarasan
                  </label>
                  <select
                    value={batchType}
                    onChange={(e) => setBatchType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="percent">Peratusan (%)</option>
                    <option value="fixed">Jumlah Tetap (RM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Nilai ({batchType === 'percent' ? '+ %' : '+ RM'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={batchValue}
                    onChange={(e) => setBatchValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Catatan Sebab Pelarasan
                </label>
                <input
                  type="text"
                  required
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30"
                >
                  Laksanakan Pelarasan Pukal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
