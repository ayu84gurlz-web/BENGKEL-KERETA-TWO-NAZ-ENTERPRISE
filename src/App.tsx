/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InventoryItem, StockTransaction, WorkshopSettings, CMSAuditRecord } from './types';
import { INITIAL_ITEMS, INITIAL_TRANSACTIONS, DEFAULT_SETTINGS } from './data/initialData';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ToolsView } from './components/ToolsView';
import { PartsView } from './components/PartsView';
import { FluidsView } from './components/FluidsView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { LowStockView } from './components/LowStockView';
import { CmsAdminView } from './components/CmsAdminView';
import { SettingsView } from './components/SettingsView';
import { ItemDetailModal } from './components/modals/ItemDetailModal';
import { AddEditItemModal } from './components/modals/AddEditItemModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';

const STORAGE_KEYS = {
  ITEMS: 'bengkel_pro_inventory_v1',
  TRANSACTIONS: 'bengkel_pro_transactions_v1',
  SETTINGS: 'bengkel_pro_settings_v1',
  AUDIT_LOGS: 'bengkel_pro_audit_logs_v1',
};

const INITIAL_AUDIT_LOGS: CMSAuditRecord[] = [
  {
    id: 'audit-001',
    itemId: 'oil-001',
    itemName: 'Fully Synthetic Engine Oil 5W-30 (4L)',
    fieldChanged: 'HARGA',
    oldValue: 'RM 90.00',
    newValue: 'RM 95.00',
    adjustedBy: 'Mohd Nazrul (Pentadbir)',
    reason: 'Penyelarasan Harga Runcit Pasaran Terkini',
    timestamp: '2026-09-28T08:30:00Z',
  },
  {
    id: 'audit-002',
    itemId: 'part-004',
    itemName: 'Laser Iridium Spark Plug (4 Pcs)',
    fieldChanged: 'KUANTITI',
    oldValue: '35 set',
    newValue: '40 set',
    adjustedBy: 'Mohd Nazrul (Pentadbir)',
    reason: 'Kiraan Fizikal Audit Stok Akhir Bulan',
    timestamp: '2026-09-30T10:45:00Z',
  },
  {
    id: 'audit-003',
    itemId: 'tool-001',
    itemName: 'Cordless Brushless Impact Wrench 1/2"',
    fieldChanged: 'SEMUA_BUTIRAN',
    oldValue: 'Harga: RM 620.00, Stok: 3',
    newValue: 'Harga: RM 650.00, Stok: 4',
    adjustedBy: 'Mohd Nazrul (Pentadbir)',
    reason: 'Penambahan Unit Baru & Kemaskini Harga Modal',
    timestamp: '2026-10-01T07:15:00Z',
  },
];

export default function App() {
  // 1. Persistent State Initialization with localStorage
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading inventory from storage', e);
    }
    return INITIAL_ITEMS;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading transactions from storage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<WorkshopSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.workshopName) {
          return {
            ...parsed,
            workshopName: parsed.workshopName === 'BENGKEL PRO AUTO SERVICES' ? 'TWO NAZ ENTERPRISE' : (parsed.workshopName || 'TWO NAZ ENTERPRISE'),
            ownerName: parsed.ownerName === 'Azman Zainal' ? 'Mohd Nazrul' : (parsed.ownerName || 'Mohd Nazrul'),
          };
        }
      }
    } catch (e) {
      console.error('Error loading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<CMSAuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading audit logs from storage', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed saving items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed saving transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed saving audit logs', e);
    }
  }, [auditLogs]);

  // 2. Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Modal States
  const [selectedItemDetail, setSelectedItemDetail] = useState<InventoryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  // Stock Adjustment Modal
  const [adjustTargetItem, setAdjustTargetItem] = useState<InventoryItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<'in' | 'out'>('in');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Delete Confirmation Modal
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // 4. Action Handlers
  const handleSaveItem = (itemData: Omit<InventoryItem, 'id' | 'totalUsage' | 'lastUpdated'> & { id?: string }) => {
    if (itemData.id) {
      // Edit existing
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemData.id
            ? {
                ...item,
                ...itemData,
                lastUpdated: new Date().toISOString(),
              }
            : item
        )
      );

      // Also update selectedItemDetail if it's currently open
      if (selectedItemDetail?.id === itemData.id) {
        setSelectedItemDetail((prev) => (prev ? { ...prev, ...itemData } : null));
      }
    } else {
      // Add new
      const newItem: InventoryItem = {
        ...itemData,
        id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        totalUsage: 0,
        lastUpdated: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);

      // Record transaction
      const newTx: StockTransaction = {
        id: `tx-${Date.now()}`,
        itemId: newItem.id,
        itemName: newItem.name,
        category: newItem.category,
        type: 'in',
        quantity: newItem.quantity,
        previousStock: 0,
        newStock: newItem.quantity,
        unit: newItem.unit,
        reason: 'Pendaftaran Item Baharu',
        technician: settings.ownerName || 'Pengurus Bengkel',
        timestamp: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    if (selectedItemDetail?.id === itemToDelete.id) {
      setSelectedItemDetail(null);
    }
    setItemToDelete(null);
  };

  // Stock Adjustment (In / Out)
  const handleOpenStockAdjust = (item: InventoryItem, mode: 'in' | 'out') => {
    setAdjustTargetItem(item);
    setAdjustMode(mode);
    setIsAdjustModalOpen(true);
  };

  const handleConfirmStockAdjust = (
    item: InventoryItem,
    type: 'in' | 'out',
    adjustQty: number,
    reason: string,
    technician: string
  ) => {
    const prevStock = item.quantity;
    const newStock = type === 'in' ? prevStock + adjustQty : Math.max(0, prevStock - adjustQty);

    // Update Item
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          const updatedUsage = type === 'out' ? (i.totalUsage || 0) + adjustQty : i.totalUsage;
          const updated = {
            ...i,
            quantity: newStock,
            totalUsage: updatedUsage,
            lastUpdated: new Date().toISOString(),
          };
          // Also update detail modal if open
          if (selectedItemDetail?.id === item.id) {
            setSelectedItemDetail(updated);
          }
          return updated;
        }
        return i;
      })
    );

    // Record Transaction
    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      type,
      quantity: adjustQty,
      previousStock: prevStock,
      newStock,
      unit: item.unit,
      reason,
      technician,
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // CMS Handlers
  const handleCmsUpdateItem = (updatedItem: InventoryItem, auditLog?: CMSAuditRecord) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    if (auditLog) {
      setAuditLogs((prev) => [auditLog, ...prev]);
    }
  };

  const handleCmsBatchPriceUpdate = (
    category: string,
    adjustType: 'percent' | 'fixed',
    amount: number,
    reason: string
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (category === 'Semua' || item.category === category) {
          const oldPrice = item.price;
          let newPrice = oldPrice;
          if (adjustType === 'percent') {
            newPrice = Number((oldPrice * (1 + amount / 100)).toFixed(2));
          } else {
            newPrice = Number(Math.max(1, oldPrice + amount).toFixed(2));
          }
          return {
            ...item,
            price: newPrice,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    const batchAudit: CMSAuditRecord = {
      id: `audit-batch-${Date.now()}`,
      itemId: 'BATCH',
      itemName: `Pelarasan Pukal (${category})`,
      fieldChanged: 'PELARASAN_PUKAL',
      oldValue: `Sebelum Pelarasan`,
      newValue: adjustType === 'percent' ? `+${amount}%` : `+RM ${amount.toFixed(2)}`,
      adjustedBy: `${settings.ownerName} (Pentadbir)`,
      reason,
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => [batchAudit, ...prev]);
  };

  // Reset to original 32+ demo data
  const handleResetDemoData = () => {
    setItems(INITIAL_ITEMS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  };

  const handleImportData = (newItems: InventoryItem[], newTransactions: StockTransaction[]) => {
    setItems(newItems);
    setTransactions(newTransactions);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-['Plus_Jakarta_Sans']">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        items={items}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        workshopName={settings.workshopName}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => {
            setItemToEdit(null);
            setIsAddEditModalOpen(true);
          }}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          items={items}
          transactions={transactions}
          onSelectItem={(item) => setSelectedItemDetail(item)}
          chiefMechanicName={settings.ownerName}
          onNavigateToCms={() => setCurrentTab('cms')}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              items={items}
              transactions={transactions}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onQuickRestock={(item) => handleOpenStockAdjust(item, 'in')}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              workshopName={settings.workshopName}
            />
          )}

          {currentTab === 'tools' && (
            <ToolsView
              items={items}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onEditItem={(item) => {
                setItemToEdit(item);
                setIsAddEditModalOpen(true);
              }}
              onRestockItem={(item) => handleOpenStockAdjust(item, 'in')}
              onAddNewTool={() => {
                setItemToEdit(null);
                setIsAddEditModalOpen(true);
              }}
            />
          )}

          {currentTab === 'parts' && (
            <PartsView
              items={items}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onEditItem={(item) => {
                setItemToEdit(item);
                setIsAddEditModalOpen(true);
              }}
              onRestockItem={(item) => handleOpenStockAdjust(item, 'in')}
              onStockOutItem={(item) => handleOpenStockAdjust(item, 'out')}
              onAddNewPart={() => {
                setItemToEdit(null);
                setIsAddEditModalOpen(true);
              }}
            />
          )}

          {currentTab === 'fluids' && (
            <FluidsView
              items={items}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onEditItem={(item) => {
                setItemToEdit(item);
                setIsAddEditModalOpen(true);
              }}
              onRestockItem={(item) => handleOpenStockAdjust(item, 'in')}
              onStockOutItem={(item) => handleOpenStockAdjust(item, 'out')}
              onAddNewFluid={() => {
                setItemToEdit(null);
                setIsAddEditModalOpen(true);
              }}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              items={items}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onEditItem={(item) => {
                setItemToEdit(item);
                setIsAddEditModalOpen(true);
              }}
              onRestockItem={(item) => handleOpenStockAdjust(item, 'in')}
              onStockOutItem={(item) => handleOpenStockAdjust(item, 'out')}
              onDeleteItem={(item) => handleDeleteItem(item)}
              onAddNewItem={() => {
                setItemToEdit(null);
                setIsAddEditModalOpen(true);
              }}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              items={items}
              transactions={transactions}
              settings={settings}
            />
          )}

          {currentTab === 'lowstock' && (
            <LowStockView
              items={items}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onRestockItem={(item) => handleOpenStockAdjust(item, 'in')}
            />
          )}

          {currentTab === 'cms' && (
            <CmsAdminView
              items={items}
              auditLogs={auditLogs}
              onUpdateItem={handleCmsUpdateItem}
              onBatchUpdatePrices={handleCmsBatchPriceUpdate}
              chiefMechanicName={settings.ownerName}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              onResetDemoData={handleResetDemoData}
              items={items}
              transactions={transactions}
              onImportData={handleImportData}
            />
          )}
        </main>
      </div>

      {/* 3. Global Modals */}
      {/* Item Details Modal */}
      <ItemDetailModal
        item={selectedItemDetail}
        transactions={transactions}
        onClose={() => setSelectedItemDetail(null)}
        onRestock={(item) => handleOpenStockAdjust(item, 'in')}
        onStockOut={(item) => handleOpenStockAdjust(item, 'out')}
        onEdit={(item) => {
          setItemToEdit(item);
          setIsAddEditModalOpen(true);
        }}
        onDelete={(item) => handleDeleteItem(item)}
      />

      {/* Add / Edit Item Modal */}
      <AddEditItemModal
        isOpen={isAddEditModalOpen}
        itemToEdit={itemToEdit}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
      />

      {/* Stock Adjust Modal (Tambah / Keluar Stok) */}
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        item={adjustTargetItem}
        mode={adjustMode}
        defaultTechnician={settings.ownerName}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setAdjustTargetItem(null);
        }}
        onConfirm={handleConfirmStockAdjust}
      />

      {/* Delete Item Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">Padam Barang Daripada Inventori?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adakah anda pasti mahu memadam <strong className="text-orange-400 font-bold">{itemToDelete.name}</strong>? Tindakan ini akan membuang rekod barang daripada pengiraan stok bengkel.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ya, Padam Barang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
