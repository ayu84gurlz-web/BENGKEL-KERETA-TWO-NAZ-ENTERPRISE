import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Wrench, 
  Disc, 
  Droplet, 
  Package, 
  Sparkles,
  Link,
  Image as ImageIcon
} from 'lucide-react';
import { InventoryItem, ItemCategory } from '../../types';

interface AddEditItemModalProps {
  isOpen: boolean;
  itemToEdit: InventoryItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'totalUsage' | 'lastUpdated'> & { id?: string }) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Tools',
  'Alat Ganti',
  'Minyak',
  'Cecair',
  'Peralatan Bengkel',
  'Bahan Habis Guna',
];

const CAR_MODELS = [
  'Universal',
  'Proton',
  'Perodua',
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Mitsubishi',
  'Ford',
  'Lain-lain',
];

const COMMON_UNITS = [
  'unit',
  'set',
  'botol',
  'tong',
  'tin',
  'kotak',
  'keping',
  'gulung',
];

// Presets with generated real workshop photos
const PRESET_IMAGES = [
  { label: 'Impact Wrench', url: '/src/assets/images/tool_impact_wrench_1790907379274.jpg' },
  { label: 'Brake Disc & Pad', url: '/src/assets/images/part_brake_system_1790907390013.jpg' },
  { label: 'Engine Oil & Filter', url: '/src/assets/images/fluid_motor_oil_1790907400940.jpg' },
  { label: 'Bengkel Workshop Bay', url: '/src/assets/images/hero_bengkel_bay_1790907365264.jpg' },
];

export const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Tools');
  const [unit, setUnit] = useState('unit');
  const [price, setPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [brand, setBrand] = useState('');
  const [carModel, setCarModel] = useState('Universal');
  const [storageLocation, setStorageLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setUnit(itemToEdit.unit || 'unit');
      setPrice(itemToEdit.price);
      setQuantity(itemToEdit.quantity);
      setMinStock(itemToEdit.minStock);
      setBrand(itemToEdit.brand);
      setCarModel(itemToEdit.carModel || 'Universal');
      setStorageLocation(itemToEdit.storageLocation);
      setNotes(itemToEdit.notes || '');
      setImageUrl(itemToEdit.image || '');
    } else {
      // Defaults for new item
      setName('');
      setCategory('Tools');
      setUnit('unit');
      setPrice('');
      setQuantity('');
      setMinStock(5);
      setBrand('');
      setCarModel('Universal');
      setStorageLocation('Rak Utama');
      setNotes('');
      setImageUrl('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || price === '' || quantity === '') {
      alert('Sila lengkapkan maklumat wajib (Nama, Harga & Kuantiti).');
      return;
    }

    onSave({
      id: itemToEdit ? itemToEdit.id : undefined,
      name: name.trim(),
      category,
      unit: unit || 'unit',
      price: Number(price),
      quantity: Number(quantity),
      minStock: Number(minStock) || 1,
      brand: brand.trim() || 'Standard',
      carModel: carModel.trim() || 'Universal',
      storageLocation: storageLocation.trim() || 'Rak Bengkel',
      notes: notes.trim(),
      image: imageUrl.trim() || undefined,
    });

    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-400" />
              <span>{itemToEdit ? 'Kemaskini Maklumat Barang' : 'Tambah Barang Baharu'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isikan maklumat stok alatan, alat ganti atau minyak untuk inventori.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Nama Barang & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Nama Barang *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cth: Brake Pad Proton Persona, Impact Wrench..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Jenama, Model Kereta & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Jenama / Pengeluar
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Cth: Brembo, Castrol, Bosch..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Kesesuaian Kenderaan
              </label>
              <select
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {CAR_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Lokasi Simpanan
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="Cth: Rak A-02, Kabinet 1..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Row 3: Harga Seunit, Kuantiti, Min Stok & Unit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-xs font-mono text-orange-400 uppercase mb-1 font-bold">
                Harga Seunit (RM) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                Kuantiti Masuk *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Unit Sukatan
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-400 uppercase mb-1 font-bold">
                Minimum Stok
              </label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 4: Image Selector (Presets, URL, or Upload) */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-slate-400 uppercase">
              Gambar Produk / Alatan
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Masukkan URL gambar atau pilih preset di bawah..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                <Upload className="h-4 w-4" />
                <span>Muat Naik Fail</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-mono text-slate-400">Pilihan Gambar Bengkel:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    imageUrl === preset.url
                      ? 'bg-orange-600/30 text-orange-300 border-orange-500/50'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Catatan */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Catatan / Spesifikasi Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kelikatan 5W-30 sesuai Proton & Perodua enjin moden..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Buttons: Simpan Barang & Batal */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4 stroke-[2.5]" />
              <span>Simpan Barang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
