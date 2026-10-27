import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  ArrowRight,
  Eye,
  PlusCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { MasterDriver, DatabaseSIM, ActiveTab } from '../types';
import { formatDateIndonesian, getRemainingDays } from '../services/storage';

interface DashboardViewProps {
  masterDrivers: MasterDriver[];
  simList: DatabaseSIM[];
  setActiveTab: (tab: ActiveTab) => void;
  onInspectPhoto: (sim: DatabaseSIM) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  masterDrivers,
  simList,
  setActiveTab,
  onInspectPhoto,
}) => {
  const activeDriversCount = masterDrivers.filter((d) => d.statusKeaktifan === 'AKTIF').length;
  const simAktifCount = simList.filter((s) => s.statusKadaluarsa === 'AKTIF').length;
  const simMepetList = simList
    .filter((s) => s.statusKadaluarsa === 'MEPET (< 30 HARI)')
    .sort((a, b) => getRemainingDays(a.tglBerlakuSIM) - getRemainingDays(b.tglBerlakuSIM));
  const simExpiredList = simList
    .filter((s) => s.statusKadaluarsa === 'EXPIRED')
    .sort((a, b) => getRemainingDays(a.tglBerlakuSIM) - getRemainingDays(b.tglBerlakuSIM));

  // Urgent list combining expired and mepet drivers
  const urgentAlertList = [...simExpiredList, ...simMepetList];

  // SIM Type breakdown calculation
  const jenisSimCounts: Record<string, number> = {
    A: 0,
    B1: 0,
    'B1 UMUM': 0,
    B2: 0,
    'B2 UMUM': 0,
  };
  simList.forEach((s) => {
    if (jenisSimCounts[s.jenisSIM] !== undefined) {
      jenisSimCounts[s.jenisSIM] += 1;
    }
  });

  // Driver Kirim category breakdown
  const categoryCounts: Record<string, number> = {
    DRY: 0,
    BUAH: 0,
    ROTI: 0,
    YUMMI: 0,
    TAKAKI: 0,
    MISDO: 0,
    LPG: 0,
  };
  simList.forEach((s) => {
    if (categoryCounts[s.driverKirim] !== undefined) {
      categoryCounts[s.driverKirim] += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Pusat Distribusi (DC) Bandung · Logistics Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Monitoring & Stock Opname SIM Driver
          </h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Sistem pengawasan fisik SIM driver secara real-time. Memastikan keabsahan dokumen berkendara fleet armada Indomaret DC Bandung, deteksi dini kadaluarsa, dan kepatuhan audit operasional.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('form-so')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input SO SIM Driver</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Driver Terdata */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Master Driver Aktif</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {activeDriversCount}
            </span>
            <span className="text-xs text-slate-500">Personel</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tercatat SO: <strong className="text-slate-800 font-mono">{simList.length}</strong></span>
            <button
              onClick={() => setActiveTab('master-driver')}
              className="text-teal-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              Master <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* SIM Valid / Aktif */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">SIM Status Valid (Aktif)</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-600 tabular-nums">
              {simAktifCount}
            </span>
            <span className="text-xs text-slate-500">SIM</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span>🟢 Dokumen aman & beroperasional normal</span>
          </div>
        </div>

        {/* SIM Mepet Expired */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">SIM Mepet (&lt; 30 Hari)</span>
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-amber-600 tabular-nums">
              {simMepetList.length}
            </span>
            <span className="text-xs text-amber-800 font-medium">Perlu Perpanjangan</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <span>🟡 Peringatan H-30 sebelum mati</span>
          </div>
        </div>

        {/* SIM Expired */}
        <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-900">SIM Expired (Habis)</span>
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-rose-600 tabular-nums">
              {simExpiredList.length}
            </span>
            <span className="text-xs text-rose-800 font-medium">Banned Jalan</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-700 font-medium flex items-center gap-1">
            <span>🔴 Dilarang membawa armada DC</span>
          </div>
        </div>
      </div>

      {/* Grid Content: Urgent Alert Feed & Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Feed Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="font-bold text-slate-800 text-sm">
                  Daftar Peringatan Peringatan Masa Berlaku SIM
                </h2>
                <p className="text-[11px] text-slate-500">
                  Prioritas penanganan driver dengan SIM kadaluarsa atau mendekati jatuh tempo
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('database-sim')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Lihat Semua SIM <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentAlertList.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-emerald-800">Semua SIM Driver Dalam Kondisi Aman!</h3>
              <p className="text-xs text-emerald-600 mt-0.5">Tidak ada SIM yang expired maupun mendekati jatuh tempo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">SIM</th>
                    <th className="py-2.5 px-3">Kirim</th>
                    <th className="py-2.5 px-3">Jatuh Tempo</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {urgentAlertList.slice(0, 7).map((item) => {
                    const days = getRemainingDays(item.tglBerlakuSIM);
                    const isExpired = days < 0;

                    return (
                      <tr key={item.no} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{item.namaDriver}</div>
                          <div className="text-[10px] font-mono text-slate-500">{item.nik}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.jenisSIM}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600">{item.driverKirim}</td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {formatDateIndonesian(item.tglBerlakuSIM)}
                          <span className="block text-[10px] text-slate-400">
                            {isExpired ? `Lewat ${Math.abs(days)} hari` : `Sisa ${days} hari`}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                              isExpired
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isExpired ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {item.statusKadaluarsa}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onInspectPhoto(item)}
                            className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-1 font-medium"
                            title="Pratinjau Foto SIM"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Foto</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visual Distribution Breakdown Side Column */}
        <div className="space-y-6">
          {/* Distribution by Jenis SIM */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Distribusi Jenis SIM</span>
              <span className="text-teal-600 font-mono font-bold text-[11px]">{simList.length} Total</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(jenisSimCounts).map(([type, count]) => {
                const percentage = simList.length > 0 ? Math.round((count / simList.length) * 100) : 0;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">SIM {type}</span>
                      <span className="font-mono text-slate-500">
                        {count} <span className="text-[10px] text-slate-400">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown by Category Kirim */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
              Breakdown Driver Kirim DC
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{cat}</span>
                  <span className="font-mono text-xs font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
