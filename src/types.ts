export type StatusDriver = 'IDM' | 'GBN' | 'PINJAMAN (DC)';

export type DriverKirim = 'DRY' | 'BUAH' | 'ROTI' | 'YUMMI' | 'TAKAKI' | 'MISDO' | 'LPG';

export type StatusKeaktifan = 'AKTIF' | 'NON-AKTIF';

export type JenisSIM = 'A' | 'B1' | 'B1 UMUM' | 'B2' | 'B2 UMUM';

export type StatusKadaluarsa = 'AKTIF' | 'MEPET (< 30 HARI)' | 'EXPIRED';

export interface MasterDriver {
  nik: string;
  namaDriver: string;
  statusDriver: StatusDriver;
  defaultDriverKirim: DriverKirim;
  statusKeaktifan: StatusKeaktifan;
}

export interface DatabaseSIM {
  no: number;
  nik: string;
  namaDriver: string;
  statusDriver: StatusDriver;
  driverKirim: DriverKirim;
  jenisSIM: JenisSIM;
  tglBerlakuSIM: string; // YYYY-MM-DD
  urlFotoSIM: string; // Data URL or Image Link
  statusKadaluarsa?: StatusKadaluarsa;
  lastUpdated?: string;
}

export type AksiLog = 'TAMBAH' | 'UPDATE' | 'DELETE' | 'BULK_UPLOAD';

export interface LogAktivitas {
  id: string;
  timestamp: string;
  adminUser: string;
  aksi: AksiLog;
  detailInfo: string;
}

export type ActiveTab = 'dashboard' | 'form-so' | 'database-sim' | 'master-driver' | 'log-aktivitas' | 'konfigurasi';
