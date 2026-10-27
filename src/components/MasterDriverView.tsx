import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { MasterDriver, StatusDriver, DriverKirim, StatusKeaktifan } from '../types';

interface MasterDriverViewProps {
  masterDrivers: MasterDriver[];
  onAddDriver: (driver: MasterDriver) => void;
  onEditDriver?: (oldNik: string, updatedDriver: MasterDriver) => void;
  onDeleteDriver?: (nik: string) => void;
  onToggleKeaktifan: (nik: string) => void;
  onBulkUpload: (drivers: MasterDriver[]) => void;
}

export const MasterDriverView: React.FC<MasterDriverViewProps> = ({
  masterDrivers,
  onAddDriver,
  onEditDriver,
  onDeleteDriver,
  onToggleKeaktifan,
  onBulkUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [keaktifanFilter, setKeaktifanFilter] = useState<string>('ALL');

  // Modal State for Add Single Driver
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newNik, setNewNik] = useState<string>('');
  const [newNama, setNewNama] = useState<string>('');
  const [newStatus, setNewStatus] = useState<StatusDriver>('IDM');
  const [newDefaultKirim, setNewDefaultKirim] = useState<DriverKirim>('DRY');

  // Modal State for Edit Driver
  const [editingDriver, setEditingDriver] = useState<MasterDriver | null>(null);
  const [editNik, setEditNik] = useState<string>('');
  const [editNama, setEditNama] = useState<string>('');
  const [editStatus, setEditStatus] = useState<StatusDriver>('IDM');
  const [editDefaultKirim, setEditDefaultKirim] = useState<DriverKirim>('DRY');
  const [editKeaktifan, setEditKeaktifan] = useState<StatusKeaktifan>('AKTIF');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filtered master drivers
  const filteredList = useMemo(() => {
    return masterDrivers.filter((driver) => {
      const matchSearch =
        driver.namaDriver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.nik.includes(searchQuery);

      const matchStatus =
        keaktifanFilter === 'ALL' ? true : driver.statusKeaktifan === keaktifanFilter;

      return matchSearch && matchStatus;
    });
  }, [masterDrivers, searchQuery, keaktifanFilter]);

  // Pagination calculations
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedList = useMemo(() => {
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, startIndex, pageSize]);

  // Handle Add Single Driver Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNik.trim() || !newNama.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Mohon Lengkapi Data Driver',
        text: 'NIK dan Nama Lengkap Driver wajib diisi.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    if (masterDrivers.some((d) => d.nik === newNik.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'NIK Sudah Terdaftar',
        text: `Driver dengan NIK ${newNik} sudah ada di Master Driver.`,
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    const newDriver: MasterDriver = {
      nik: newNik.trim(),
      namaDriver: newNama.trim().toUpperCase(),
      statusDriver: newStatus,
      defaultDriverKirim: newDefaultKirim,
      statusKeaktifan: 'AKTIF',
    };

    onAddDriver(newDriver);
    Swal.fire({
      icon: 'success',
      title: 'Driver Berhasil Ditambahkan',
      text: `${newNama} telah terdaftar di Master Driver Aktif.`,
      timer: 1800,
      showConfirmButton: false,
    });

    setNewNik('');
    setNewNama('');
    setIsAddModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (driver: MasterDriver) => {
    setEditingDriver(driver);
    setEditNik(driver.nik);
    setEditNama(driver.namaDriver);
    setEditStatus(driver.statusDriver);
    setEditDefaultKirim(driver.defaultDriverKirim);
    setEditKeaktifan(driver.statusKeaktifan);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    if (!editNik.trim() || !editNama.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Mohon Lengkapi Data',
        text: 'NIK dan Nama Driver tidak boleh kosong.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    // Check if new NIK collides with another existing driver
    if (
      editNik.trim() !== editingDriver.nik &&
      masterDrivers.some((d) => d.nik === editNik.trim())
    ) {
      Swal.fire({
        icon: 'error',
        title: 'NIK Sudah Digunakan',
        text: `NIK ${editNik} sudah dipakai oleh driver lain.`,
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    const updatedDriver: MasterDriver = {
      nik: editNik.trim(),
      namaDriver: editNama.trim().toUpperCase(),
      statusDriver: editStatus,
      defaultDriverKirim: editDefaultKirim,
      statusKeaktifan: editKeaktifan,
    };

    onEditDriver?.(editingDriver.nik, updatedDriver);

    Swal.fire({
      icon: 'success',
      title: 'Data Driver Diperbarui',
      text: `Perubahan data driver ${updatedDriver.namaDriver} berhasil disimpan.`,
      timer: 1800,
      showConfirmButton: false,
    });

    setEditingDriver(null);
  };

  // Handle Delete Driver with Confirmation
  const handleDeleteDriver = (driver: MasterDriver) => {
    Swal.fire({
      title: 'Hapus Driver?',
      text: `Apakah Anda yakin ingin menghapus driver ${driver.namaDriver} (NIK: ${driver.nik}) dari Master Driver?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Driver',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    }).then((res) => {
      if (res.isConfirmed) {
        onDeleteDriver?.(driver.nik);
        Swal.fire({
          icon: 'success',
          title: 'Driver Berhasil Dihapus',
          text: `Driver ${driver.namaDriver} telah dihapus dari sistem.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Bulk Upload File Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const wsname =
          wb.SheetNames.find((s) => s.toUpperCase().includes('MASTER')) ||
          wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawData.length < 2) {
          throw new Error('File Excel tidak memiliki baris data');
        }

        let nikIdx = -1;
        let namaIdx = -1;
        let statusIdx = -1;
        let kirimIdx = -1;
        let headerRowIdx = -1;

        for (let r = 0; r < Math.min(10, rawData.length); r++) {
          const row = rawData[r];
          if (!Array.isArray(row)) continue;

          row.forEach((cell, cIdx) => {
            const val = String(cell || '').trim().toUpperCase();
            if (val.includes('NIK')) nikIdx = cIdx;
            if (val.includes('NAMA')) namaIdx = cIdx;
            if (val.includes('STATUS')) statusIdx = cIdx;
            if (val.includes('KIRIM')) kirimIdx = cIdx;
          });

          if (nikIdx !== -1 && namaIdx !== -1) {
            headerRowIdx = r;
            break;
          }
        }

        if (nikIdx === -1 || namaIdx === -1) {
          nikIdx = 1;
          namaIdx = 2;
          statusIdx = 3;
          kirimIdx = 4;
          headerRowIdx = 1;
        }

        const parsedDrivers: MasterDriver[] = [];

        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || !row[nikIdx]) continue;

          const nik = String(row[nikIdx]).trim();
          const nama = String(row[namaIdx] || '').trim();

          if (!nik || nik.length < 3) continue;

          let statusDriver: StatusDriver = 'IDM';
          if (statusIdx !== -1 && row[statusIdx]) {
            const sVal = String(row[statusIdx]).toUpperCase();
            if (sVal.includes('GBN')) statusDriver = 'GBN';
            else if (sVal.includes('PINJAM') || sVal.includes('DC')) statusDriver = 'PINJAMAN (DC)';
          }

          let defaultDriverKirim: DriverKirim = 'DRY';
          if (kirimIdx !== -1 && row[kirimIdx]) {
            const kVal = String(row[kirimIdx]).toUpperCase();
            if (kVal.includes('BUAH')) defaultDriverKirim = 'BUAH';
            else if (kVal.includes('ROTI')) defaultDriverKirim = 'ROTI';
            else if (kVal.includes('YUMMI')) defaultDriverKirim = 'YUMMI';
            else if (kVal.includes('TAKAKI')) defaultDriverKirim = 'TAKAKI';
            else if (kVal.includes('MISDO')) defaultDriverKirim = 'MISDO';
            else if (kVal.includes('LPG')) defaultDriverKirim = 'LPG';
          }

          parsedDrivers.push({
            nik,
            namaDriver: nama.toUpperCase() || `DRIVER ${nik}`,
            statusDriver,
            defaultDriverKirim,
            statusKeaktifan: 'AKTIF',
          });
        }

        if (parsedDrivers.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Format Tidak Sesuai',
            text: 'Tidak ada baris driver valid yang terbaca dari file Excel tersebut.',
            confirmButtonColor: '#0d9488',
          });
          return;
        }

        onBulkUpload(parsedDrivers);

        Swal.fire({
          icon: 'success',
          title: 'Import Massal Berhasil!',
          text: `${parsedDrivers.length} data driver berhasil diproses dan digabungkan ke Master Driver.`,
          confirmButtonColor: '#0d9488',
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Membaca File',
          text: err.message || 'Pastikan file berekstensi .xlsx atau .xls dengan header kolom yang sesuai.',
          confirmButtonColor: '#dc2626',
        });
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Download Sample Template for Bulk Upload
  const handleDownloadTemplate = () => {
    const templateData = [
      ['NO', 'NIK', 'NAMA DRIVER', 'STATUS IDM / GBN / PINJAMAN', 'DRIVER KIRIM'],
      [1, '2025091101', 'BUDI SANTOSO', 'IDM', 'DRY'],
      [2, '2025091102', 'CECEP SUPRIATNA', 'GBN', 'ROTI'],
      [3, '2025091103', 'DEDI KURNIAWAN', 'IDM', 'BUAH'],
      [4, '2025091104', 'EKO PRASETYO', 'PINJAMAN (DC)', 'TAKAKI'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TEMPLATE_MASTER');
    XLSX.writeFile(wb, 'Template_Master_Driver_DC_Bandung.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Master Driver DC Bandung</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola daftar personel resmi driver aktif, status keaktifan, edit biodata, dan import massal
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            title="Download Template Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Template</span>
          </button>

          <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Driver</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari NIK atau Nama Driver..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Keaktifan Filter */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Filter:</span>
          <button
            onClick={() => {
              setKeaktifanFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg transition-colors ${
              keaktifanFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({masterDrivers.length})
          </button>
          <button
            onClick={() => {
              setKeaktifanFilter('AKTIF');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg transition-colors ${
              keaktifanFilter === 'AKTIF'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Aktif ({masterDrivers.filter((d) => d.statusKeaktifan === 'AKTIF').length})
          </button>
          <button
            onClick={() => {
              setKeaktifanFilter('NON-AKTIF');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg transition-colors ${
              keaktifanFilter === 'NON-AKTIF'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Non-Aktif ({masterDrivers.filter((d) => d.statusKeaktifan === 'NON-AKTIF').length})
          </button>
        </div>
      </div>

      {/* Master Driver Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">NIK Driver</th>
                <th className="py-3 px-4">Nama Lengkap Driver</th>
                <th className="py-3 px-4">Status Driver</th>
                <th className="py-3 px-4">Default Kirim</th>
                <th className="py-3 px-4">Status Keaktifan</th>
                <th className="py-3 px-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada driver ditemukan dalam Master Driver.
                  </td>
                </tr>
              ) : (
                paginatedList.map((driver, idx) => {
                  const absoluteIndex = startIndex + idx + 1;
                  const isAktif = driver.statusKeaktifan === 'AKTIF';

                  return (
                    <tr key={driver.nik} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{absoluteIndex}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{driver.nik}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{driver.namaDriver}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {driver.statusDriver}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{driver.defaultDriverKirim}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isAktif
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isAktif ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          {driver.statusKeaktifan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status */}
                          <button
                            onClick={() => onToggleKeaktifan(driver.nik)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isAktif
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            title={isAktif ? 'Non-Aktifkan Driver' : 'Aktifkan Driver'}
                          >
                            {isAktif ? 'Set Resign' : 'Aktifkan'}
                          </button>

                          {/* Edit Driver Button */}
                          <button
                            onClick={() => handleOpenEdit(driver)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200"
                            title="Edit Data Driver"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Driver Button */}
                          <button
                            onClick={() => handleDeleteDriver(driver)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Hapus Driver dari Master"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              <strong>{totalItems}</strong> driver
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

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Master Driver Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">NIK Driver *</label>
                <input
                  type="text"
                  required
                  value={newNik}
                  onChange={(e) => setNewNik(e.target.value)}
                  placeholder="Contoh: 2025091100"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Lengkap Driver *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: AGUS KURNIAWAN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Status Driver</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StatusDriver)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="IDM">IDM</option>
                    <option value="GBN">GBN</option>
                    <option value="PINJAMAN (DC)">PINJAMAN (DC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Default Kirim</label>
                  <select
                    value={newDefaultKirim}
                    onChange={(e) => setNewDefaultKirim(e.target.value as DriverKirim)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Simpan Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm">Edit Data Driver Master</h3>
              </div>
              <button
                onClick={() => setEditingDriver(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">NIK Driver *</label>
                <input
                  type="text"
                  required
                  value={editNik}
                  onChange={(e) => setEditNik(e.target.value)}
                  placeholder="NIK Driver"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Lengkap Driver *</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Nama Lengkap Driver"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 uppercase focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Status Driver</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as StatusDriver)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="IDM">IDM</option>
                    <option value="GBN">GBN</option>
                    <option value="PINJAMAN (DC)">PINJAMAN (DC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Default Kirim</label>
                  <select
                    value={editDefaultKirim}
                    onChange={(e) => setEditDefaultKirim(e.target.value as DriverKirim)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
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

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Status Keaktifan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditKeaktifan('AKTIF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      editKeaktifan === 'AKTIF'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AKTIF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditKeaktifan('NON-AKTIF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      editKeaktifan === 'NON-AKTIF'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>NON-AKTIF</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
