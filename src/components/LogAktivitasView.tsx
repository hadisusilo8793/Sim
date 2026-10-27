import React, { useState } from 'react';
import { History, Search, Download, Shield, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { LogAktivitas } from '../types';

interface LogAktivitasViewProps {
  logs: LogAktivitas[];
  onClearLogs: () => void;
}

export const LogAktivitasView: React.FC<LogAktivitasViewProps> = ({ logs, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aksiFilter, setAksiFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.detailInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAksi = aksiFilter === 'ALL' ? true : log.aksi === aksiFilter;

    return matchSearch && matchAksi;
  });

  const handleExportLogs = () => {
    const data = filteredLogs.map((l, idx) => ({
      NO: idx + 1,
      TIMESTAMP: l.timestamp,
      ADMIN_USER: l.adminUser,
      AKSI: l.aksi,
      DETAIL_INFO: l.detailInfo,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LOG_AKTIVITAS');

    XLSX.writeFile(
      workbook,
      `LOG_AKTIVITAS_AUDIT_DC_BANDUNG_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleClearConfirm = () => {
    Swal.fire({
      title: 'Bersihkan Log Aktivitas?',
      text: 'Semua riwayat audit trail akan dibersihkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Bersihkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
    }).then((res) => {
      if (res.isConfirmed) {
        onClearLogs();
        Swal.fire({
          icon: 'success',
          title: 'Log Dibersihkan',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Log Aktivitas & Audit Trail Operasional DC
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan otomatis setiap aksi pendaftaran, pembaruan, penghapusan, dan bulk upload data SIM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export Log Excel</span>
          </button>
          <button
            onClick={handleClearConfirm}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Bersihkan Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci di detail info / admin..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-500 mr-1">Tipe Aksi:</span>
          {['ALL', 'TAMBAH', 'UPDATE', 'DELETE', 'BULK_UPLOAD'].map((aksi) => (
            <button
              key={aksi}
              onClick={() => setAksiFilter(aksi)}
              className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                aksiFilter === aksi
                  ? 'bg-teal-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {aksi}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">Waktu (Timestamp)</th>
                <th className="py-3 px-4">Admin User</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Detail Perubahan / Catatan Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-sans">
                    Belum ada log aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-sans flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-teal-600" />
                      <span>{log.adminUser}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.aksi === 'TAMBAH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.aksi === 'UPDATE'
                            ? 'bg-sky-100 text-sky-800'
                            : log.aksi === 'BULK_UPLOAD'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.aksi}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 font-medium">{log.detailInfo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
