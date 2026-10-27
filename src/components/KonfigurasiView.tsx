import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Code,
  Zap,
  Trash2,
  Database,
  ExternalLink,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { MasterDriver, DatabaseSIM, LogAktivitas } from '../types';
import { GoogleSheetsSyncService, SyncPayload } from '../services/googleSheetsSync';

interface KonfigurasiViewProps {
  masterDrivers: MasterDriver[];
  simList: DatabaseSIM[];
  logs: LogAktivitas[];
  onResetData: () => void;
  onClearLogs: () => void;
}

export const KonfigurasiView: React.FC<KonfigurasiViewProps> = ({
  masterDrivers,
  simList,
  logs,
  onResetData,
  onClearLogs,
}) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(GoogleSheetsSyncService.getWebhookUrl());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('');
  const [syncCounter, setSyncCounter] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'script' | 'payload' | 'system'>('sync');
  const [previewPayload, setPreviewPayload] = useState<SyncPayload | null>(null);

  const appsScriptCode = GoogleSheetsSyncService.getAppsScriptCodeSnippet();

  useEffect(() => {
    // Generate fresh payload preview
    GoogleSheetsSyncService.buildPayload(masterDrivers, simList, logs)
      .then((p) => setPreviewPayload(p))
      .catch((err) => console.error('Error preparing payload preview:', err));
  }, [masterDrivers, simList, logs]);

  const handleSaveUrl = () => {
    GoogleSheetsSyncService.setWebhookUrl(webhookUrl);
    Swal.fire({
      icon: 'success',
      title: 'Webhook URL Disimpan',
      text: 'URL Web App Google Apps Script tersimpan di browser cache.',
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
    Swal.fire({
      icon: 'success',
      title: 'Kode Disalin!',
      text: 'Kode Google Apps Script telah disalin ke clipboard.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleTriggerSync = async () => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Webhook Belum Benar',
        text: 'Masukkan URL Web App Google Apps Script (berawalan https://script.google.com/...)',
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(5);
    setSyncCounter(`0/${simList.length}`);
    setSyncStatusText('Memulai proses sinkronisasi...');
    GoogleSheetsSyncService.setWebhookUrl(webhookUrl);

    const result = await GoogleSheetsSyncService.triggerSync(
      masterDrivers,
      simList,
      logs,
      (percent, statusMessage, counter) => {
        setSyncProgress(percent);
        setSyncStatusText(statusMessage);
        if (counter) {
          setSyncCounter(counter);
        }
      }
    );

    setIsSyncing(false);

    Swal.fire({
      icon: result.success ? 'success' : 'error',
      title: result.success ? 'Sync Google Sheets Berhasil!' : 'Gagal Sinkronisasi',
      html: `
        <div class="text-left text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 space-y-2">
          <p class="font-bold text-teal-800 flex items-center gap-1.5">
            <span>✅ 4 Sheet Otomatis Dibuat Baru (Sheet Lama Dihapus & Diperbarui):</span>
          </p>
          <ul class="list-disc pl-4 space-y-1 text-slate-600">
            <li><strong>DATA_SIM_BERGAMBAR</strong>: Sheet lama otomatis dihapus & dibuat baru dari awal dengan ${simList.length} foto SIM proporsional (170&times;102px) di cell Kolom I tanpa tumpang tindih.</li>
            <li><strong>MASTER_DRIVER</strong>: Sinkronisasi data personel driver aktif DC.</li>
            <li><strong>DATABASE_SIM</strong>: Rekap data tabular SIM lengkap.</li>
            <li><strong>LOG_AKTIVITAS</strong>: Catatan histori audit stock opname DC Bandung.</li>
          </ul>
          <p class="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            Status: ${result.message}
          </p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#0d9488',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Pengaturan Operasional DC Bandung</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Konfigurasi & Integrasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola sinkronisasi Google Sheets, webhook Google Apps Script, dan preferensi data sistem.
          </p>
        </div>

        {/* Quick Sync Action in Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
              isSyncing
                ? 'bg-emerald-300 text-white cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-md'
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyinkronkan ({syncCounter || `${syncProgress}%`})...</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-emerald-100" />
                <span>Mulai Sync Google Sheets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex items-center gap-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'sync'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Google Sheets Sync</span>
        </button>

        <button
          onClick={() => setActiveSubTab('script')}
          className={`flex items-center gap-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'script'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Script Code.gs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payload')}
          className={`flex items-center gap-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'payload'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Pratinjau Payload ({simList.length} SIM)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center gap-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSubTab === 'system'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Sistem & Database</span>
        </button>
      </div>

      {/* TAB 1: GOOGLE SHEETS SYNC CONTROL */}
      {activeSubTab === 'sync' && (
        <div className="space-y-6">
          {/* Main Sync Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Koneksi & Sinkronisasi Spreadsheet
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kirim data ke Google Sheets dengan foto SIM berukuran proporsional (170&times;102px) di cell.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Webhook Ready
              </span>
            </div>

            {/* Webhook URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Google Apps Script Web App URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white"
                />
                <button
                  onClick={handleSaveUrl}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm"
                >
                  Simpan URL
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Gunakan URL deployment Web App dari Apps Script spreadsheet Anda dengan akses "Siapa saja" (Anyone).
              </p>
            </div>

            {/* Live Progress Bar when Syncing */}
            {isSyncing && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>{syncStatusText || 'Sedang memproses sinkronisasi...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {syncCounter && (
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 text-[11px]">
                        Foto: {syncCounter}
                      </span>
                    )}
                    <span className="font-mono font-bold text-emerald-800">{syncProgress}%</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-emerald-200/60 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${Math.max(syncProgress, 5)}%` }}
                  />
                </div>

                <p className="text-[11px] text-emerald-700">
                  Proses otomatis menghapus sheet lama <code className="font-mono font-bold">DATA_SIM_BERGAMBAR</code> dan membuat sheet baru berisi foto SIM proporsional sesuai cell.
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Siap sinkron: <strong>{simList.length} SIM</strong>, <strong>{masterDrivers.length} Driver</strong>, <strong>{logs.length} Log</strong>
                </span>
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  isSyncing
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sinkronisasi Sedang Berjalan ({syncCounter || `${syncProgress}%`})...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-emerald-200" />
                    <span>Mulai Sinkronisasi Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">Clean Slate Sync</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ketika tombol sync diklik, sheet <code className="font-mono font-semibold text-slate-700">DATA_SIM_BERGAMBAR</code> lama otomatis dihapus dan dibuat baru dari awal agar tidak ada data dobel.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">Foto Presisi Proporsional</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Foto SIM disesuaikan dengan dimensi 170&times;102 px dalam cell Baris 90 px & Kolom I 180 px tanpa gepeng atau terpotong.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">4 Sheet Komprehensif</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mencakup 4 tab: <code className="font-mono text-slate-700">DATA_SIM_BERGAMBAR</code>, <code className="font-mono text-slate-700">MASTER_DRIVER</code>, <code className="font-mono text-slate-700">DATABASE_SIM</code>, dan <code className="font-mono text-slate-700">LOG_AKTIVITAS</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPS SCRIPT CODE */}
      {activeSubTab === 'script' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-600" />
                <span>Google Apps Script (Code.gs)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Salin dan tempel kode ini ke menu <em>Ekstensi &gt; Apps Script</em> pada Google Spreadsheet Anda.
              </p>
            </div>

            <button
              onClick={handleCopyScript}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copiedScript
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'Tersalin ke Clipboard!' : 'Salin Kode Script'}</span>
            </button>
          </div>

          {/* Quick steps */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Panduan Pasang di Spreadsheet (Sekali Saja):</span>
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li>Buka file Google Spreadsheet Anda.</li>
              <li>Klik menu <strong>Ekstensi</strong> &rarr; <strong>Apps Script</strong>.</li>
              <li>Hapus semua isi di file <code className="font-mono text-teal-800 font-bold">Code.gs</code>, lalu paste kode di bawah.</li>
              <li>Klik <strong>Deploy (Terapkan)</strong> &rarr; <strong>New deployment (Kelola Deployment Baru)</strong>.</li>
              <li>Pilih tipe <strong>Web App</strong>. Set "Execute as": <em>Me</em> dan "Who has access": <em>Anyone (Siapa saja)</em>.</li>
              <li>Salin URL Web App yang dihasilkan lalu simpan di tab <strong>Google Sheets Sync</strong>.</li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800">
              <code>{appsScriptCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: PAYLOAD PREVIEW */}
      {activeSubTab === 'payload' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <span>Pratinjau Data Payload JSON</span>
              </h2>
              <p className="text-xs text-slate-500">
                Struktur JSON yang dikirimkan ke Google Apps Script Webhook saat sinkronisasi.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              {simList.length} Rekam SIM Siap Sync
            </span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800">
            <code>
              {previewPayload
                ? JSON.stringify(
                    {
                      action: previewPayload.action,
                      timestamp: previewPayload.timestamp,
                      adminUser: previewPayload.adminUser,
                      totalMasterDriver: previewPayload.masterDriver?.length || 0,
                      totalSIM: previewPayload.databaseSIM?.length || 0,
                      totalLogs: previewPayload.logAktivitas?.length || 0,
                      sampleRecordSIM: previewPayload.databaseSIM?.slice(0, 2).map((item) => ({
                        ...item,
                        urlFotoSIM: item.urlFotoSIM
                          ? `${item.urlFotoSIM.substring(0, 40)}... (truncated base64 length: ${item.urlFotoSIM.length})`
                          : '',
                      })),
                    },
                    null,
                    2
                  )
                : 'Memuat data payload...'}
            </code>
          </pre>
        </div>
      )}

      {/* TAB 4: SYSTEM & DATABASE SETTINGS */}
      {activeSubTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reset Data Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Reset Data ke Default Initial</h3>
                <p className="text-xs text-slate-500">Kembalikan data ke seed awal DC Bandung.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              Tindakan ini akan mengembalikan seluruh Master Driver (19 orang), Database SIM (19 record dengan foto SIM sample), dan Log Aktivitas ke kondisi default awal.
            </p>

            <button
              onClick={onResetData}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Semua Data DC Bandung</span>
            </button>
          </div>

          {/* Clear Audit Logs Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Bersihkan Riwayat Log Audit</h3>
                <p className="text-xs text-slate-500">Hapus riwayat aktivitas tanpa mengubah data SIM.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
              Menghapus {logs.length} catatan riwayat log audit di browser. Data master driver dan data SIM tetap aman dan tidak terhapus.
            </p>

            <button
              onClick={() => {
                Swal.fire({
                  title: 'Bersihkan Riwayat Log Audit?',
                  text: `${logs.length} catatan log audit akan dihapus dari cache.`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Ya, Bersihkan',
                  cancelButtonText: 'Batal',
                  confirmButtonColor: '#f59e0b',
                }).then((res) => {
                  if (res.isConfirmed) {
                    onClearLogs();
                    Swal.fire({
                      icon: 'success',
                      title: 'Log Berhasil Dibersihkan',
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  }
                });
              }}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Log ({logs.length} Catatan)</span>
            </button>
          </div>

          {/* System Specs Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Informasi Lingkungan Sistem</h3>
                <p className="text-xs text-slate-500">Status penyimpanan dan arsitektur aplikasi.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Unit DC</span>
                <span className="font-bold text-slate-800 text-sm">DC Bandung (G027)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Penyimpanan Lokal</span>
                <span className="font-bold text-emerald-700 text-sm">Indexed Storage</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Total Driver Master</span>
                <span className="font-bold text-slate-800 text-sm">{masterDrivers.length} Personel</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Total SIM Terdata</span>
                <span className="font-bold text-teal-700 text-sm">{simList.length} SIM Card</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
