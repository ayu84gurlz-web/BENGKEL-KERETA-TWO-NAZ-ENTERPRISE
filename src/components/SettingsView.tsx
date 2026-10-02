import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  Store, 
  Phone, 
  MapPin, 
  Coins, 
  AlertTriangle 
} from 'lucide-react';
import { WorkshopSettings, InventoryItem, StockTransaction } from '../types';

interface SettingsViewProps {
  settings: WorkshopSettings;
  onUpdateSettings: (newSettings: WorkshopSettings) => void;
  onResetDemoData: () => void;
  items: InventoryItem[];
  transactions: StockTransaction[];
  onImportData: (items: InventoryItem[], transactions: StockTransaction[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDemoData,
  items,
  transactions,
  onImportData,
}) => {
  const [formData, setFormData] = useState<WorkshopSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: formData,
      items,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bengkel_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.items && Array.isArray(parsed.items)) {
          onImportData(parsed.items, parsed.transactions || []);
          if (parsed.settings) {
            onUpdateSettings(parsed.settings);
            setFormData(parsed.settings);
          }
          alert('Sandaran berjaya dimuat naik dan data telah dipulihkan!');
        } else {
          alert('Format fail sandaran tidak sah.');
        }
      } catch (err) {
        alert('Ralat membaca fail sandaran JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header bar */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
          <Settings className="h-6 w-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
            Tetapan Sistem Bengkel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Konfigurasi profil bengkel, mata wang, paras amaran stok dan pengurusan sandaran data.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Tetapan berjaya disimpan dan dikemaskini.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workshop Profile Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Store className="h-5 w-5 text-orange-400" />
            Maklumat &amp; Profil Bengkel
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Nama Bengkel / Syarikat *
              </label>
              <input
                type="text"
                required
                value={formData.workshopName}
                onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Tagline Rasmi
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Nama Pemilik / Pengurus
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Nombor Telefon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Alamat Premis Bengkel
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* System & Currency Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Coins className="h-5 w-5 text-amber-400" />
            Mata Wang &amp; Ambang Amaran
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Simbol Mata Wang
              </label>
              <input
                type="text"
                disabled
                value={formData.currency}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Ditetapkan secara automatik kepada Ringgit Malaysia (RM).
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Ambang Lalai Stok Rendah (Unit)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.lowStockThresholdDefault}
                onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: parseInt(e.target.value) || 5 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Nilai cadangan minimum apabila menambah barang baharu.
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4 stroke-[2.5]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Backup, Restore & Reset Section */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Download className="h-5 w-5 text-blue-400" />
          Penyimpanan &amp; Sandaran Data (LocalStorage)
        </h2>

        <p className="text-xs text-slate-400">
          Semua rekod inventori disimpan secara selamat dalam storan penyemak imbas (localStorage). Anda boleh muat turun sandaran JSON atau set semula kepada data contoh pada bila-bila masa.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-400" />
            <span>Muat Turun Sandaran JSON</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="h-4 w-4 text-emerald-400" />
            <span>Pulihkan Sandaran JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Set Semula Data Contoh (30+ Item)</span>
          </button>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3 mt-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Adakah anda pasti mahu set semula?</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tindakan ini akan mengembalikan pangkalan data kepada 30+ item contoh asal dan memadamkan sebarang perubahan tambahan yang anda lakukan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Ya, Set Semula Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
