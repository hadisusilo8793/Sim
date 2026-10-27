import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { DatabaseSIM } from '../types';
import { formatDateIndonesian, getRemainingDays } from '../services/storage';
import { exportSIMDatabaseToExcelWithImages } from '../services/excelExportService';

interface DatabaseSIMViewProps {
  simList: DatabaseSIM[];
  onDeleteSIM: (nik: string) => void;
  onInspectPhoto: (sim: DatabaseSIM) => void;
  onNavigateToSO: () => void;
}

export const DatabaseSIMView: React.FC<DatabaseSIMViewProps> = ({
  simList,
  onDeleteSIM,
  onInspectPhoto,
  onNavigateToSO,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filtered dataset based on search, status badge, and category
  const filteredList = useMemo(() => {
    return simList.filter((item) => {
      const matchSearch =
        item.namaDriver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nik.includes(searchQuery) ||
        item.jenisSIM.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ? true : item.statusKadaluarsa === statusFilter;

      const matchCategory =
        categoryFilter === 'ALL' ? true : item.driverKirim === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [simList, searchQuery, statusFilter, categoryFilter]);

  // Pagination calculation
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedList = useMemo(() => {
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, startIndex, pageSize]);

  /**
   * Generates and downloads an actual .xlsx Excel file with embedded photos inside cells
   * Matching the exact format of G027-DC BDG SIM DRIVER (update).xlsx
   */
  const handleExportExcel = async (exportScope: 'filtered' | 'all') => {
    const datasetToExport = exportScope === 'filtered' ? filteredList : simList;

    if (datasetToExport.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak Ada Data Untuk Diexport',
        text: 'Tidak ada baris data SIM yang sesuai dengan kriteria filter saat ini.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    try {
      setIsExporting(true);

      // Loading toast
      Swal.fire({
        title: 'Menyiapkan File Excel...',
        html: `
          <div class="text-xs text-slate-600 mt-2">
            <p>Memproses dan menyematkan <strong>${datasetToExport.length} foto SIM fisik</strong> ke dalam cell Excel (Kolom FOTO SIM DRIVER)...</p>
          </div>
        `,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const prefix =
        exportScope === 'filtered'
          ? 'G027-DC BDG SIM DRIVER (Filtered)'
          : 'G027-DC BDG SIM DRIVER (update)';

      await exportSIMDatabaseToExcelWithImages(datasetToExport, prefix);

      Swal.fire({
        icon: 'success',
        title: 'Excel Berhasil Di-download!',
        html: `
          <div class="text-left text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 space-y-1">
            <p className="font-bold text-teal-800">✅ Foto SIM Berhasil Tersemat di Dalam Cell:</p>
            <ul class="list-disc pl-4 space-y-0.5 text-slate-600">
              <li>Sheet: <strong>DATA</strong> & <strong>INFO</strong></li>
              <li>Kolom I: <strong>FOTO SIM DRIVER</strong> (Gambar fisik SIM driver)</li>
              <li>Format Baris: Sesuai standar DC Bandung</li>
              <li>Jumlah Data: <strong>${datasetToExport.length} baris</strong></li>
            </ul>
          </div>
        `,
        confirmButtonColor: '#0d9488',
      });
    } catch (error) {
      console.error('Export Excel with images error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Export Excel',
        text: 'Terjadi kesalahan saat menyematkan gambar ke dalam file Excel.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Delete Record Handler with confirmation
  const handleDelete = (item: DatabaseSIM) => {
    Swal.fire({
      title: 'Hapus Data SIM?',
      text: `Apakah Anda yakin ingin menghapus data SIM ${item.namaDriver} (${item.nik})? Aksi ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteSIM(item.nik);
        Swal.fire({
          icon: 'success',
          title: 'Data Berhasil Dihapus',
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
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Database Master SIM Driver DC Bandung
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabel rekapitulasi dokumen SIM fisik driver, inspeksi foto, dan export Excel (.xlsx) dengan foto di dalam cell.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Enhanced Excel Export with embedded pictures */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handleExportExcel('filtered')}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Download File Excel (.xlsx) dengan gambar foto SIM di dalam cell"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>Download Excel Bergambar ({filteredList.length})</span>
            </button>
            <button
              onClick={() => handleExportExcel('all')}
              disabled={isExporting}
              className="px-3 py-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              title="Download Seluruh Database SIM ke Excel (.xlsx) dengan gambar"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Semua ({simList.length})</span>
            </button>
          </div>

          <button
            onClick={onNavigateToSO}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>+ SO SIM Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Instant Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NIK, Nama Driver, atau Jenis SIM..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Badges & Category Selection */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Segmented Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({simList.length})
            </button>
            <button
              onClick={() => setStatusFilter('AKTIF')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                statusFilter === 'AKTIF'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter('MEPET (< 30 HARI)')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                statusFilter === 'MEPET (< 30 HARI)'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Mepet
            </button>
            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                statusFilter === 'EXPIRED'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3 h-3" />
              Expired
            </button>
          </div>

          {/* Driver Kirim Dropdown Filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">Semua Kirim</option>
              <option value="DRY">DRY</option>
              <option value="BUAH">BUAH</option>
              <option value="ROTI">ROTI</option>
              <option value="YUMMI">YUMMI</option>
              <option value="TAKAKI">TAKAKI</option>
              <option value="MISDO">MISDO</option>
              <option value="LPG">LPG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">NIK Driver</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Driver Kirim</th>
                <th className="py-3 px-4">Jenis SIM</th>
                <th className="py-3 px-4">Tgl Berlaku SIM</th>
                <th className="py-3 px-4">Status Kadaluarsa</th>
                <th className="py-3 px-4 text-center">Foto SIM</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Tidak ada data SIM yang sesuai dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const absoluteIndex = startIndex + idx + 1;
                  const days = getRemainingDays(item.tglBerlakuSIM);

                  return (
                    <tr key={item.nik} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{absoluteIndex}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.nik}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{item.namaDriver}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {item.statusDriver}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.driverKirim}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200">
                          {item.jenisSIM}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {formatDateIndonesian(item.tglBerlakuSIM)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            item.statusKadaluarsa === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : item.statusKadaluarsa === 'MEPET (< 30 HARI)'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {item.statusKadaluarsa === 'AKTIF' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {item.statusKadaluarsa === 'MEPET (< 30 HARI)' && <Clock className="w-3 h-3 text-amber-600" />}
                          {item.statusKadaluarsa === 'EXPIRED' && <XCircle className="w-3 h-3 text-rose-600" />}
                          {item.statusKadaluarsa}
                          <span className="opacity-75 text-[9px] font-mono">
                            ({days < 0 ? `+${Math.abs(days)}d` : `${days}d`})
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.urlFotoSIM && (
                            <img
                              src={item.urlFotoSIM}
                              alt="SIM Thumbnail"
                              className="w-12 h-8 object-cover rounded border border-slate-200 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => onInspectPhoto(item)}
                            />
                          )}
                          <button
                            onClick={() => onInspectPhoto(item)}
                            className="px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Data SIM"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan{' '}
              <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> -{' '}
              <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> dari{' '}
              <strong>{totalItems}</strong> data SIM
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-[11px] text-slate-500">Per hal:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 font-semibold">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - safeCurrentPage) <= 2 || p === 1 || p === totalPages)
                  .map((p, index, array) => {
                    const prev = array[index - 1];
                    return (
                      <React.Fragment key={p}>
                        {prev && p - prev > 1 && (
                          <span className="px-1 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                            safeCurrentPage === p
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
