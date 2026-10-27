import React, { useState, useRef, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileImage,
  ShieldCheck,
  Clock,
  Lock,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { MasterDriver, DatabaseSIM, StatusDriver, DriverKirim, JenisSIM } from '../types';
import { computeSIMStatus, formatDateIndonesian } from '../services/storage';
import { compressSIMPhoto } from '../utils/imageCompressor';

interface FormSOViewProps {
  masterDrivers: MasterDriver[];
  simList: DatabaseSIM[];
  onSubmitSO: (simData: DatabaseSIM, isUpdate: boolean) => void;
}

export const FormSOView: React.FC<FormSOViewProps> = ({ masterDrivers, simList, onSubmitSO }) => {
  // Filter active drivers only for auto-suggest
  const activeMasterDrivers = useMemo(
    () => masterDrivers.filter((d) => d.statusKeaktifan === 'AKTIF'),
    [masterDrivers]
  );

  // Form State
  const [selectedDriverKey, setSelectedDriverKey] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [nik, setNik] = useState<string>('');
  const [namaDriver, setNamaDriver] = useState<string>('');
  const [statusDriver, setStatusDriver] = useState<StatusDriver>('IDM');
  const [driverKirim, setDriverKirim] = useState<DriverKirim>('DRY');
  const [jenisSIM, setJenisSIM] = useState<JenisSIM>('B1 UMUM');
  const [tglBerlakuSIM, setTglBerlakuSIM] = useState<string>('');
  
  // Image & Upload state
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoSizeKB, setPhotoSizeKB] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered auto-suggest list
  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return activeMasterDrivers;
    const q = searchQuery.toLowerCase();
    return activeMasterDrivers.filter(
      (d) => d.namaDriver.toLowerCase().includes(q) || d.nik.includes(q)
    );
  }, [activeMasterDrivers, searchQuery]);

  // Handle Driver Select from auto-suggest
  const handleSelectDriver = (driver: MasterDriver) => {
    setSelectedDriverKey(`${driver.namaDriver} - ${driver.nik}`);
    setSearchQuery(`${driver.namaDriver} - ${driver.nik}`);
    setNik(driver.nik);
    setNamaDriver(driver.namaDriver);
    setStatusDriver(driver.statusDriver);
    setDriverKirim(driver.defaultDriverKirim);
    setIsDropdownOpen(false);
  };

  // Handle live search typing - also auto-fills when match is found
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsDropdownOpen(true);
    if (!val.trim()) {
      setNik('');
      setNamaDriver('');
      setSelectedDriverKey('');
      return;
    }
    const clean = val.trim().toLowerCase();
    const match = activeMasterDrivers.find(
      (d) =>
        d.nik.toLowerCase() === clean ||
        d.namaDriver.toLowerCase() === clean ||
        `${d.namaDriver} - ${d.nik}`.toLowerCase() === clean
    );
    if (match) {
      setNik(match.nik);
      setNamaDriver(match.namaDriver);
      setStatusDriver(match.statusDriver);
      setDriverKirim(match.defaultDriverKirim);
      setSelectedDriverKey(`${match.namaDriver} - ${match.nik}`);
    }
  };

  // Handle File Upload and Compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!nik || !namaDriver) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Driver Terlebih Dahulu',
        text: 'Silakan pilih driver dari daftar Master Driver sebelum mengunggah foto SIM.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    try {
      setIsCompressing(true);
      const result = await compressSIMPhoto(file, nik, namaDriver, jenisSIM);
      setPhotoDataUrl(result.dataUrl);
      setPhotoFileName(result.fileName);
      setPhotoSizeKB(result.fileSizeKB);

      Swal.fire({
        icon: 'success',
        title: 'Foto SIM Berhasil Dibuat',
        text: `Ukuran foto terkompresi: ${result.fileSizeKB} KB. Format penamaan: ${result.fileName}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error compressing photo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memproses Foto',
        text: 'Terjadi kesalahan saat mengompresi foto SIM.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedDriverKey('');
    setSearchQuery('');
    setNik('');
    setNamaDriver('');
    setStatusDriver('IDM');
    setDriverKirim('DRY');
    setJenisSIM('B1 UMUM');
    setTglBerlakuSIM('');
    setPhotoDataUrl('');
    setPhotoFileName('');
    setPhotoSizeKB(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Live status calculation
  const computedStatus = useMemo(() => {
    if (!tglBerlakuSIM) return null;
    return computeSIMStatus(tglBerlakuSIM);
  }, [tglBerlakuSIM]);

  // Form Submit with Smart Duplicate Detector
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nik || !namaDriver || !tglBerlakuSIM) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulir Belum Lengkap',
        text: 'Mohon lengkapi NIK, Nama Driver, Jenis SIM, dan Tanggal Berlaku SIM.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    // Default image placeholder if no photo uploaded
    const finalPhotoUrl =
      photoDataUrl ||
      `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380"><rect width="600" height="380" fill="#0f172a"/><text x="300" y="190" font-family="Arial" font-size="20" fill="#ffffff" text-anchor="middle">VERIFIED SIM PHYSICAL SO - ${nik}</text></svg>`
      )}`;

    // SMART DUPLICATE DETECTION CHECK
    const existingSIM = simList.find((s) => s.nik === nik);

    if (existingSIM) {
      // Trigger Interactive Duplicate Alert Pop-up via SweetAlert2
      Swal.fire({
        title: 'Terdeteksi Duplikasi Data SIM!',
        html: `
          <div class="text-left text-xs text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-2">
            <p className="font-bold text-amber-900 mb-1">Driver <strong>${existingSIM.namaDriver}</strong> (${existingSIM.nik}) sudah tercatat pada database SIM:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Jenis SIM Lama: <strong>${existingSIM.jenisSIM}</strong></li>
              <li>Tgl Berlaku Lama: <strong>${formatDateIndonesian(existingSIM.tglBerlakuSIM)}</strong></li>
              <li>Status Expiry: <strong>${existingSIM.statusKadaluarsa}</strong></li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 mt-2">Apakah Anda ingin memperbarui data SIM lama dengan input fisik baru ini?</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Perlu Di-update (Timpa/Perbarui)',
        cancelButtonText: 'Data Sudah Benar / Batalkan',
        confirmButtonColor: '#0d9488',
        cancelButtonColor: '#64748b',
        customClass: {
          confirmButton: 'text-xs px-3 py-2 font-bold',
          cancelButton: 'text-xs px-3 py-2 font-bold',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceed with UPDATE
          const updatedRecord: DatabaseSIM = {
            ...existingSIM,
            namaDriver,
            statusDriver,
            driverKirim,
            jenisSIM,
            tglBerlakuSIM,
            urlFotoSIM: finalPhotoUrl,
            statusKadaluarsa: computeSIMStatus(tglBerlakuSIM),
            lastUpdated: new Date().toLocaleString('id-ID'),
          };

          onSubmitSO(updatedRecord, true);
          Swal.fire({
            icon: 'success',
            title: 'Data SIM Berhasil Di-update!',
            text: `Data SIM ${namaDriver} telah diperbarui di database.`,
            timer: 2000,
            showConfirmButton: false,
          });
          handleReset();
        } else {
          // Cancelled by user
          Swal.fire({
            icon: 'info',
            title: 'Input Dibatalkan',
            text: 'Data lama tetap dipertahankan.',
            timer: 1500,
            showConfirmButton: false,
          });
          handleReset();
        }
      });
    } else {
      // NEW RECORD SUBMISSION
      const newSIMRecord: DatabaseSIM = {
        no: simList.length + 1,
        nik,
        namaDriver,
        statusDriver,
        driverKirim,
        jenisSIM,
        tglBerlakuSIM,
        urlFotoSIM: finalPhotoUrl,
        statusKadaluarsa: computeSIMStatus(tglBerlakuSIM),
        lastUpdated: new Date().toLocaleString('id-ID'),
      };

      onSubmitSO(newSIMRecord, false);
      Swal.fire({
        icon: 'success',
        title: 'Stock Opname SIM Berhasil Disimpan!',
        text: `Data SIM ${namaDriver} telah dicatat ke database DC Bandung.`,
        timer: 2000,
        showConfirmButton: false,
      });
      handleReset();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* View Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Formulir Stock Opname (SO) SIM Physical Driver
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih driver aktif, periksa dokumen SIM fisik, lalu simpan hasil verifikasi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* STEP 1: Ketik Nama atau NIK Driver dari Master Driver */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Pilih Driver Aktif DC Bandung <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-teal-700 font-medium">
                Ketik Nama / NIK &rarr; Status Driver & Driver Kirim otomatis terisi dari Master
              </span>
            </div>

            {/* Input Field: Ketik Nama atau NIK */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Ketik Nama Driver atau NIK (Contoh: Aang, Adi, 2015...)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

              {/* Auto-suggest dropdown when searching or focused */}
              {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {filteredDrivers.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 text-center">
                      Driver tidak ditemukan di Master Driver Aktif
                    </div>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <button
                        key={driver.nik}
                        type="button"
                        onClick={() => handleSelectDriver(driver)}
                        className="w-full text-left p-3 hover:bg-teal-50/80 transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {driver.namaDriver}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            NIK: {driver.nik} · Status: {driver.statusDriver} · Divisi: {driver.defaultDriverKirim}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          Pilih
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>


          {/* STEP 2: Informasi Driver dari Master (Status Driver & Driver Kirim Terkunci / Read-Only) */}
          <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-inner">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">NIK Driver</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                {nik || <span className="text-slate-400 font-normal text-xs italic">—</span>}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Nama Driver</span>
              <span className="font-bold text-slate-900 text-xs mt-1 block">
                {namaDriver || <span className="text-slate-400 font-normal text-xs italic">Pilih nama di atas</span>}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Driver</span>
                <span className="text-[9px] text-teal-700 font-semibold flex items-center gap-0.5 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  <Lock className="w-2.5 h-2.5" /> Read-Only
                </span>
              </div>
              <input
                type="text"
                readOnly
                disabled
                value={nik ? statusDriver : ''}
                placeholder="Auto-fill master"
                className="mt-1 w-full text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-not-allowed select-none shadow-inner"
                title="Status Driver read-only dan otomatis terisi dari sheet Master Driver"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Driver Kirim</span>
                <span className="text-[9px] text-teal-700 font-semibold flex items-center gap-0.5 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  <Lock className="w-2.5 h-2.5" /> Read-Only
                </span>
              </div>
              <input
                type="text"
                readOnly
                disabled
                value={nik ? driverKirim : ''}
                placeholder="Auto-fill master"
                className="mt-1 w-full text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-not-allowed select-none shadow-inner"
                title="Driver Kirim read-only dan otomatis terisi dari sheet Master Driver"
              />
            </div>
          </div>



          {/* STEP 3: SIM Document Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Jenis SIM */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Jenis SIM Fisik <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenisSIM}
                onChange={(e) => setJenisSIM(e.target.value as JenisSIM)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="A">SIM A</option>
                <option value="B1">SIM B1</option>
                <option value="B1 UMUM">SIM B1 UMUM</option>
                <option value="B2">SIM B2</option>
                <option value="B2 UMUM">SIM B2 UMUM</option>
              </select>
            </div>

            {/* Tanggal Berlaku SIM */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Tanggal Berlaku SIM s/d <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tglBerlakuSIM}
                onChange={(e) => setTglBerlakuSIM(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              {/* Live Expiry Status Calculation Indicator */}
              {computedStatus && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Status Otomatis:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-bold text-[11px] ${
                      computedStatus === 'AKTIF'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : computedStatus === 'MEPET (< 30 HARI)'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {computedStatus === 'AKTIF' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : computedStatus === 'MEPET (< 30 HARI)' ? (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {computedStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: Automated File Handler & Compression */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              4. Upload / Ambil Foto SIM Fisik
            </label>
            <p className="text-[11px] text-slate-500">
              Foto dikompres otomatis (&lt; 300KB) dengan format nama standar: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">[NIK]_[NAMA]_[JENIS_SIM].jpg</code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Dropzone Input */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-teal-50/30 transition-all flex flex-col items-center justify-center min-h-[140px]">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  id="sim-photo-input"
                />
                <label
                  htmlFor="sim-photo-input"
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Klik untuk Ambil Foto Kamera / Unggah File
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    JPG, PNG, WEBP (Max 5MB)
                  </span>
                </label>
              </div>

              {/* Compressed Preview */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-white flex flex-col justify-between min-h-[140px]">
                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2 py-6">
                    <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengompresi Foto Canvas...</span>
                  </div>
                ) : photoDataUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-400 font-semibold flex items-center gap-1">
                        <FileImage className="w-3.5 h-3.5" /> Preview Terkompresi
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {photoSizeKB} KB
                      </span>
                    </div>

                    <img
                      src={photoDataUrl}
                      alt="Preview SIM"
                      className="h-20 w-auto object-contain rounded border border-slate-700 mx-auto"
                    />

                    <div className="text-[10px] font-mono text-slate-400 truncate text-center">
                      {photoFileName}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-6 text-center">
                    <ShieldCheck className="w-8 h-8 text-slate-700 mb-1" />
                    <span>Belum ada foto terpilih</span>
                    <span className="text-[10px] text-slate-600">
                      (Sistem akan menyertakan placeholder terverifikasi jika dikosongkan)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Aksi ini akan dicatat ke <strong>LOG_AKTIVITAS</strong> audit trail.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan hasil Stock Opname</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
