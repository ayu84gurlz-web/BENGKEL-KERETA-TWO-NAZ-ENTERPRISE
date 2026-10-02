import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  Plus, 
  Car, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { formatCurrency, formatStock } from '../../utils/format';
import { ItemImage } from '../ItemImage';

interface StockAdjustModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  mode: 'in' | 'out'; // in = Tambah Stok, out = Keluarkan Stok
  onClose: () => void;
  defaultTechnician?: string;
  onConfirm: (
    item: InventoryItem,
    type: 'in' | 'out',
    quantity: number,
    reason: string,
    technician: string
  ) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  item,
  mode,
  onClose,
  defaultTechnician = 'Mohd Nazrul',
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [reason, setReason] = useState('');
  const [technician, setTechnician] = useState(defaultTechnician);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setErrorMsg('');
      setTechnician(defaultTechnician);
      if (mode === 'out') {
        setReason('Servis Berkala Pelanggan');
      } else {
        setReason('Restock Pembekal');
      }
    }
  }, [isOpen, mode, defaultTechnician]);

  if (!isOpen || !item) return null;

  const currentQty = item.quantity;
  const numQty = typeof quantity === 'number' ? quantity : 0;
  const newQty = mode === 'out' ? currentQty - numQty : currentQty + numQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || quantity <= 0) {
      setErrorMsg('Sila masukkan kuantiti yang sah (sekurang-kurangnya 1).');
      return;
    }

    if (mode === 'out' && numQty > currentQty) {
      setErrorMsg(`Kuantiti keluar (${numQty}) melebihi baki stok semasa (${currentQty}).`);
      return;
    }

    onConfirm(
      item,
      mode,
      numQty,
      reason.trim() || (mode === 'out' ? 'Servis Pelanggan' : 'Restock'),
      technician.trim() || 'Mekanik Bengkel'
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-slate-800 ${
          mode === 'out' ? 'bg-orange-950/40' : 'bg-emerald-950/40'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              mode === 'out' 
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {mode === 'out' ? <ArrowUpRight className="h-5 w-5" /> : <Plus className="h-5 w-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'out' ? 'Keluarkan Stok Barang' : 'Tambah / Restock Stok Barang'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'out' ? 'Rekod penggunaan untuk servis atau jualan' : 'Rekod penerimaan stok daripada pembekal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item summary card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <ItemImage item={item} size="sm" className="h-12 w-12 rounded-xl shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
              <p className="text-xs text-slate-400">
                {item.category} · {item.brand} · {formatCurrency(item.price)}
              </p>
            </div>
            <div className="text-right font-mono shrink-0">
              <span className="text-[11px] text-slate-400 block">Baki Semasa</span>
              <span className="text-base font-bold text-white">
                {item.quantity} {item.unit}
              </span>
            </div>
          </div>

          {/* Quantity Input with Live Stock Preview */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                {mode === 'out' ? 'Kuantiti Keluar *' : 'Kuantiti Tambah *'} ({item.unit})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={mode === 'out' ? currentQty : 9999}
                  required
                  value={quantity}
                  onChange={(e) => {
                    setErrorMsg('');
                    setQuantity(e.target.value === '' ? '' : parseInt(e.target.value));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                {/* Quick preset adders */}
                <div className="flex items-center gap-1">
                  {[1, 2, 4, 10].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setQuantity(val)}
                      className="px-2.5 py-2 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Preview Box */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Anggaran Baki Selepas Transaksi:</span>
              <span className={`text-sm font-bold ${
                newQty <= item.minStock ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {newQty} {item.unit}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reason / Reference */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              {mode === 'out' ? 'Tujuan / No. Plat Kereta Pelanggan' : 'No. Invois / Catatan Pembekal'}
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={mode === 'out' ? 'Cth: Servis Proton Saga (VDA 8821)' : 'Cth: Invois Pembekal #INV-8832'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Technician Name */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Nama Mekanik / Pengendali
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Nama staf bertugas..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${
                mode === 'out'
                  ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{mode === 'out' ? 'Sahkan Pengeluaran' : 'Sahkan Tambah Stok'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
