import React, { useState } from 'react';
import { 
  Wrench, 
  Disc, 
  Droplet, 
  Cog, 
  Package, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Gauge,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { InventoryItem } from '../types';
import { resolveAssetImage } from '../assets/images';

interface ItemImageProps {
  item: InventoryItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ItemImage: React.FC<ItemImageProps> = ({ 
  item, 
  className = '', 
  size = 'md' 
}) => {
  const [imageError, setImageError] = useState(false);
  const resolvedSrc = resolveAssetImage(item.image);

  const sizeClasses = {
    sm: 'h-12 w-12 text-xs',
    md: 'h-24 w-24 text-sm',
    lg: 'h-48 w-full text-base',
    xl: 'h-64 w-full text-lg',
  };

  // If item has a valid image and no error has occurred, show the image with fallback
  if (resolvedSrc && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group ${sizeClasses[size]} ${className}`}>
        <img
          src={resolvedSrc}
          alt={item.name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Render high-fidelity category-themed automotive SVG backdrop
  const getCategoryDetails = () => {
    switch (item.category) {
      case 'Tools':
        return {
          gradient: 'from-orange-950/60 via-slate-900 to-slate-950',
          border: 'border-orange-500/20 group-hover:border-orange-500/40',
          iconColor: 'text-orange-400',
          accentColor: '#f97316',
          Icon: Wrench,
          bgPattern: 'radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
          subLabel: 'ALATAN GRED INDUSTRI',
        };
      case 'Alat Ganti':
        return {
          gradient: 'from-blue-950/60 via-slate-900 to-slate-950',
          border: 'border-blue-500/20 group-hover:border-blue-500/40',
          iconColor: 'text-blue-400',
          accentColor: '#3b82f6',
          Icon: Disc,
          bgPattern: 'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          subLabel: 'KOMPONEN ASLI',
        };
      case 'Minyak':
        return {
          gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
          border: 'border-amber-500/20 group-hover:border-amber-500/40',
          iconColor: 'text-amber-400',
          accentColor: '#f59e0b',
          Icon: Droplet,
          bgPattern: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          subLabel: 'MINYAK & PELINCIR',
        };
      case 'Cecair':
        return {
          gradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
          border: 'border-cyan-500/20 group-hover:border-cyan-500/40',
          iconColor: 'text-cyan-400',
          accentColor: '#06b6d4',
          Icon: Gauge,
          bgPattern: 'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          subLabel: 'CECAIR SPESIFIKASI',
        };
      case 'Peralatan Bengkel':
        return {
          gradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
          border: 'border-emerald-500/20 group-hover:border-emerald-500/40',
          iconColor: 'text-emerald-400',
          accentColor: '#10b981',
          Icon: Cog,
          bgPattern: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          subLabel: 'MESIN & PERALATAN',
        };
      case 'Bahan Habis Guna':
      default:
        return {
          gradient: 'from-rose-950/60 via-slate-900 to-slate-950',
          border: 'border-rose-500/20 group-hover:border-rose-500/40',
          iconColor: 'text-rose-400',
          accentColor: '#f43f5e',
          Icon: Package,
          bgPattern: 'radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.15) 0%, transparent 70%)',
          subLabel: 'BAHAN HABIS GUNA',
        };
    }
  };

  const details = getCategoryDetails();
  const IconComponent = details.Icon;

  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${details.gradient} border ${details.border} flex flex-col items-center justify-center p-3 text-center transition-all duration-300 group ${sizeClasses[size]} ${className}`}
      style={{ backgroundImage: details.bgPattern }}
    >
      {/* Decorative automotive geometry grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `radial-gradient(${details.accentColor} 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
      }} />

      {/* Main central automotive badge */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform duration-300 ${details.iconColor}`}>
          <IconComponent className={size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'} strokeWidth={1.75} />
        </div>

        {size !== 'sm' && (
          <div className="mt-2 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold block">
              {details.subLabel}
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-1 max-w-[180px]">
              {item.brand}
            </span>
          </div>
        )}
      </div>

      {/* Ambient corner light */}
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: details.accentColor }}
      />
    </div>
  );
};
