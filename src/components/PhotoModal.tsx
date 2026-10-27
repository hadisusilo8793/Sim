import React from 'react';
import { X, Download, ShieldCheck } from 'lucide-react';
import { DatabaseSIM } from '../types';
import { formatDateIndonesian } from '../services/storage';

interface PhotoModalProps {
  item: DatabaseSIM | null;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.urlFotoSIM;
    link.download = `${item.nik}_${item.namaDriver.replace(/\s+/g, '_')}_${item.jenisSIM}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                Inspeksi Foto SIM Fisik Driver
              </h3>
              <p className="text-xs text-slate-400">
                NIK: <span className="font-mono text-teal-300">{item.nik}</span> · {item.namaDriver}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[320px]">
          {item.urlFotoSIM ? (
            <img
              src={item.urlFotoSIM}
              alt={`Foto SIM ${item.namaDriver}`}
              className="max-h-[420px] w-auto object-contain rounded-lg border border-slate-800 shadow-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center p-8 text-slate-500">
              Tidak ada foto SIM yang tersedia
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jenis SIM</span>
              <span className="font-bold text-slate-800 text-sm">{item.jenisSIM}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Driver Kirim</span>
              <span className="font-medium text-slate-800">{item.driverKirim}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Berlaku s/d</span>
              <span className="font-mono font-medium text-slate-800">{formatDateIndonesian(item.tglBerlakuSIM)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Expiry</span>
              <span
                className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                  item.statusKadaluarsa === 'AKTIF'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.statusKadaluarsa === 'MEPET (< 30 HARI)'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.statusKadaluarsa}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-xs shadow-sm transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            Unduh Foto (.jpg)
          </button>
        </div>
      </div>
    </div>
  );
};
