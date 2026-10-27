import { MasterDriver, DatabaseSIM, LogAktivitas } from '../types';

export const INITIAL_MASTER_DRIVERS: MasterDriver[] = [
  {
    nik: '2015267970',
    namaDriver: 'AANG SAMSUDIN',
    statusDriver: 'IDM',
    defaultDriverKirim: 'DRY',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2015476821',
    namaDriver: 'ABDUL ZENAL ARIPIN',
    statusDriver: 'IDM',
    defaultDriverKirim: 'ROTI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2015540244',
    namaDriver: 'ADI SETIAWAN',
    statusDriver: 'IDM',
    defaultDriverKirim: 'DRY',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2015509622',
    namaDriver: 'ADI SUPRIATNA',
    statusDriver: 'IDM',
    defaultDriverKirim: 'ROTI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2012090928',
    namaDriver: 'Asep Andriansyah',
    statusDriver: 'IDM',
    defaultDriverKirim: 'DRY',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2015031120',
    namaDriver: 'Budi Santoso',
    statusDriver: 'IDM',
    defaultDriverKirim: 'BUAH',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2018070415',
    namaDriver: 'Cecep Supriatna',
    statusDriver: 'GBN',
    defaultDriverKirim: 'ROTI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2019120803',
    namaDriver: 'Dedi Kurniawan',
    statusDriver: 'IDM',
    defaultDriverKirim: 'YUMMI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2020011589',
    namaDriver: 'Eko Prasetyo',
    statusDriver: 'PINJAMAN (DC)',
    defaultDriverKirim: 'TAKAKI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2021052204',
    namaDriver: 'Firmawan Hidayat',
    statusDriver: 'IDM',
    defaultDriverKirim: 'MISDO',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2021093012',
    namaDriver: 'Ginanjar Rahayu',
    statusDriver: 'GBN',
    defaultDriverKirim: 'LPG',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2022021455',
    namaDriver: 'Herman Mulyana',
    statusDriver: 'IDM',
    defaultDriverKirim: 'DRY',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2022080971',
    namaDriver: 'Indra Hermawan',
    statusDriver: 'IDM',
    defaultDriverKirim: 'BUAH',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2023010533',
    namaDriver: 'Joko Susilo',
    statusDriver: 'GBN',
    defaultDriverKirim: 'ROTI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2023041890',
    namaDriver: 'Kiki Ramdani',
    statusDriver: 'IDM',
    defaultDriverKirim: 'YUMMI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2023091102',
    namaDriver: 'Lukman Hakim',
    statusDriver: 'PINJAMAN (DC)',
    defaultDriverKirim: 'TAKAKI',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2024022847',
    namaDriver: 'Maman Abdurrahman',
    statusDriver: 'IDM',
    defaultDriverKirim: 'LPG',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2024061219',
    namaDriver: 'Nandang Kusnadi',
    statusDriver: 'GBN',
    defaultDriverKirim: 'DRY',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2024100588',
    namaDriver: 'Oki Setiawan',
    statusDriver: 'IDM',
    defaultDriverKirim: 'BUAH',
    statusKeaktifan: 'AKTIF',
  },
  {
    nik: '2011010101',
    namaDriver: 'Rudi Hartono (Resign)',
    statusDriver: 'IDM',
    defaultDriverKirim: 'DRY',
    statusKeaktifan: 'NON-AKTIF',
  },
];

// Helper to get relative date string YYYY-MM-DD
function getRelativeDateStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates an authentic Indonesian SIM card SVG (Surat Izin Mengemudi)
 * Matching the exact visual style in the user's reference Excel file!
 */
export function generateSIMPlaceholderSVG(
  nik: string,
  nama: string,
  jenis: string,
  tglExpiryStr?: string
): string {
  const cleanNama = (nama || 'PENGEMUDI DC').toUpperCase();
  const simNo = `1305-${nik.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const displayExpiry = tglExpiryStr || '15-10-2027';

  // Format jenis SIM display (e.g. "B II UMUM", "B I", "A")
  let displayJenis = jenis;
  if (jenis === 'B1') displayJenis = 'B I';
  else if (jenis === 'B1 UMUM') displayJenis = 'B I UMUM';
  else if (jenis === 'B2') displayJenis = 'B II';
  else if (jenis === 'B2 UMUM') displayJenis = 'B II UMUM';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdfcf8"/>
        <stop offset="50%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient>
      <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 Q 20 0 40 20 Q 20 40 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.7" opacity="0.6"/>
      </pattern>
    </defs>

    <!-- Card Base -->
    <rect width="600" height="380" rx="18" fill="url(#cardBg)" stroke="#94a3b8" stroke-width="2"/>
    <rect width="600" height="380" rx="18" fill="url(#guilloche)"/>

    <!-- Red Header Bar (Indonesian SIM Standard) -->
    <rect x="0" y="0" width="600" height="72" rx="18" fill="#b91c1c"/>
    <rect x="0" y="52" width="600" height="20" fill="#b91c1c"/>

    <!-- Header Text & Badge -->
    <text x="300" y="32" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">INDONESIA</text>
    <text x="300" y="56" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="700" fill="#fef08a" text-anchor="middle" letter-spacing="1">SURAT IZIN MENGEMUDI (DRIVING LICENSE)</text>

    <!-- SIM Category Stamp (Top Right) -->
    <g transform="translate(450, 85)">
      <rect x="0" y="0" width="125" height="48" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="62" y="32" font-family="'Arial Black', Impact, sans-serif" font-size="24" font-weight="900" fill="#38bdf8" text-anchor="middle">${displayJenis}</text>
    </g>

    <!-- SIM Number -->
    <text x="575" y="152" font-family="Courier, monospace" font-size="13" font-weight="700" fill="#1e293b" text-anchor="end">${simNo}</text>

    <!-- Driver Photo Box (Left) -->
    <g transform="translate(30, 95)">
      <rect width="135" height="185" rx="10" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
      <circle cx="67" cy="65" r="40" fill="#475569"/>
      <path d="M 22 175 C 22 125, 112 125, 112 175 Z" fill="#334155"/>
      <rect x="0" y="155" width="135" height="30" fill="rgba(15, 23, 42, 0.75)" rx="0"/>
      <text x="67" y="174" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">DC BANDUNG</text>
    </g>

    <!-- Driver Data Field List (Right of Photo) -->
    <g transform="translate(185, 125)" font-family="Arial, sans-serif" fill="#0f172a">
      <!-- 1. Nama -->
      <text x="0" y="0" font-size="11" font-weight="700" fill="#64748b">1. NAMA</text>
      <text x="0" y="20" font-size="15" font-weight="900" fill="#0f172a">${cleanNama}</text>

      <!-- 2. Alamat & TTL -->
      <text x="0" y="44" font-size="11" font-weight="700" fill="#64748b">2. TEMPAT / TGL LAHIR</text>
      <text x="0" y="60" font-size="12" font-weight="700" fill="#1e293b">BANDUNG, 12-08-1991</text>

      <!-- 3. Gol Darah & Jenis Kelamin -->
      <text x="0" y="82" font-size="11" font-weight="700" fill="#64748b">3. GOL. DARAH / JK</text>
      <text x="0" y="98" font-size="12" font-weight="700" fill="#1e293b">O  ·  PRIA</text>

      <!-- 4. Alamat Tugas -->
      <text x="0" y="120" font-size="11" font-weight="700" fill="#64748b">4. ALAMAT TUGAS</text>
      <text x="0" y="136" font-size="12" font-weight="700" fill="#1e293b">LOGISTIK FLEET DC BANDUNG</text>

      <!-- 5. Pekerjaan -->
      <text x="0" y="156" font-size="11" font-weight="700" fill="#64748b">5. PEKERJAAN</text>
      <text x="0" y="170" font-size="12" font-weight="700" fill="#1e293b">PENGEMUDI (DRIVER DC)</text>
    </g>

    <!-- Watermark Emblem / Hologram (Bottom Right) -->
    <g transform="translate(480, 220)">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#0284c7" stroke-width="2" opacity="0.4"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#0284c7" stroke-dasharray="4,3" stroke-width="1.5" opacity="0.5"/>
      <text x="50" y="55" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle" opacity="0.7">POLDA</text>
      <text x="50" y="68" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" opacity="0.7">JABAR</text>
    </g>

    <!-- Card Bottom Footer: NIK & Expiry Date -->
    <rect x="0" y="325" width="600" height="55" rx="0" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="30" y="358" font-family="Courier, monospace" font-size="14" font-weight="800" fill="#0f172a">NIK: ${nik}</text>
    <text x="575" y="358" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="#b91c1c" text-anchor="end">BERLAKU S/D: ${displayExpiry}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_SIM_DATABASE: DatabaseSIM[] = [
  {
    no: 1,
    nik: '2015267970',
    namaDriver: 'AANG SAMSUDIN',
    statusDriver: 'IDM',
    driverKirim: 'DRY',
    jenisSIM: 'B2',
    tglBerlakuSIM: '2025-10-13',
    urlFotoSIM: generateSIMPlaceholderSVG('2015267970', 'AANG SAMSUDIN', 'B2', '13-10-2025'),
  },
  {
    no: 2,
    nik: '2015476821',
    namaDriver: 'ABDUL ZENAL ARIPIN',
    statusDriver: 'IDM',
    driverKirim: 'ROTI',
    jenisSIM: 'B1',
    tglBerlakuSIM: '2027-08-01',
    urlFotoSIM: generateSIMPlaceholderSVG('2015476821', 'ABDUL ZENAL ARIPIN', 'B1', '01-08-2027'),
  },
  {
    no: 3,
    nik: '2015540244',
    namaDriver: 'ADI SETIAWAN',
    statusDriver: 'IDM',
    driverKirim: 'DRY',
    jenisSIM: 'B1',
    tglBerlakuSIM: '2025-12-29',
    urlFotoSIM: generateSIMPlaceholderSVG('2015540244', 'ADI SETIAWAN', 'B1', '29-12-2025'),
  },
  {
    no: 4,
    nik: '2015509622',
    namaDriver: 'ADI SUPRIATNA',
    statusDriver: 'IDM',
    driverKirim: 'ROTI',
    jenisSIM: 'B1',
    tglBerlakuSIM: '2026-12-18',
    urlFotoSIM: generateSIMPlaceholderSVG('2015509622', 'ADI SUPRIATNA', 'B1', '18-12-2026'),
  },
  {
    no: 5,
    nik: '2012090928',
    namaDriver: 'Asep Andriansyah',
    statusDriver: 'IDM',
    driverKirim: 'DRY',
    jenisSIM: 'B2 UMUM',
    tglBerlakuSIM: getRelativeDateStr(120),
    urlFotoSIM: generateSIMPlaceholderSVG('2012090928', 'Asep Andriansyah', 'B2 UMUM'),
  },
  {
    no: 6,
    nik: '2015031120',
    namaDriver: 'Budi Santoso',
    statusDriver: 'IDM',
    driverKirim: 'BUAH',
    jenisSIM: 'B1 UMUM',
    tglBerlakuSIM: getRelativeDateStr(12),
    urlFotoSIM: generateSIMPlaceholderSVG('2015031120', 'Budi Santoso', 'B1 UMUM'),
  },
  {
    no: 7,
    nik: '2018070415',
    namaDriver: 'Cecep Supriatna',
    statusDriver: 'GBN',
    driverKirim: 'ROTI',
    jenisSIM: 'B1',
    tglBerlakuSIM: getRelativeDateStr(-5),
    urlFotoSIM: generateSIMPlaceholderSVG('2018070415', 'Cecep Supriatna', 'B1'),
  },
  {
    no: 8,
    nik: '2019120803',
    namaDriver: 'Dedi Kurniawan',
    statusDriver: 'IDM',
    driverKirim: 'YUMMI',
    jenisSIM: 'A',
    tglBerlakuSIM: getRelativeDateStr(210),
    urlFotoSIM: generateSIMPlaceholderSVG('2019120803', 'Dedi Kurniawan', 'A'),
  },
  {
    no: 9,
    nik: '2020011589',
    namaDriver: 'Eko Prasetyo',
    statusDriver: 'PINJAMAN (DC)',
    driverKirim: 'TAKAKI',
    jenisSIM: 'B2',
    tglBerlakuSIM: getRelativeDateStr(18),
    urlFotoSIM: generateSIMPlaceholderSVG('2020011589', 'Eko Prasetyo', 'B2'),
  },
  {
    no: 10,
    nik: '2021052204',
    namaDriver: 'Firmawan Hidayat',
    statusDriver: 'IDM',
    driverKirim: 'MISDO',
    jenisSIM: 'A',
    tglBerlakuSIM: getRelativeDateStr(365),
    urlFotoSIM: generateSIMPlaceholderSVG('2021052204', 'Firmawan Hidayat', 'A'),
  },
  {
    no: 11,
    nik: '2021093012',
    namaDriver: 'Ginanjar Rahayu',
    statusDriver: 'GBN',
    driverKirim: 'LPG',
    jenisSIM: 'B2 UMUM',
    tglBerlakuSIM: getRelativeDateStr(-25),
    urlFotoSIM: generateSIMPlaceholderSVG('2021093012', 'Ginanjar Rahayu', 'B2 UMUM'),
  },
  {
    no: 12,
    nik: '2022021455',
    namaDriver: 'Herman Mulyana',
    statusDriver: 'IDM',
    driverKirim: 'DRY',
    jenisSIM: 'B1 UMUM',
    tglBerlakuSIM: getRelativeDateStr(85),
    urlFotoSIM: generateSIMPlaceholderSVG('2022021455', 'Herman Mulyana', 'B1 UMUM'),
  },
  {
    no: 13,
    nik: '2022080971',
    namaDriver: 'Indra Hermawan',
    statusDriver: 'IDM',
    driverKirim: 'BUAH',
    jenisSIM: 'B1',
    tglBerlakuSIM: getRelativeDateStr(5),
    urlFotoSIM: generateSIMPlaceholderSVG('2022080971', 'Indra Hermawan', 'B1'),
  },
  {
    no: 14,
    nik: '2023010533',
    namaDriver: 'Joko Susilo',
    statusDriver: 'GBN',
    driverKirim: 'ROTI',
    jenisSIM: 'A',
    tglBerlakuSIM: getRelativeDateStr(150),
    urlFotoSIM: generateSIMPlaceholderSVG('2023010533', 'Joko Susilo', 'A'),
  },
  {
    no: 15,
    nik: '2023041890',
    namaDriver: 'Kiki Ramdani',
    statusDriver: 'IDM',
    driverKirim: 'YUMMI',
    jenisSIM: 'B1 UMUM',
    tglBerlakuSIM: getRelativeDateStr(28),
    urlFotoSIM: generateSIMPlaceholderSVG('2023041890', 'Kiki Ramdani', 'B1 UMUM'),
  },
  {
    no: 16,
    nik: '2023091102',
    namaDriver: 'Lukman Hakim',
    statusDriver: 'PINJAMAN (DC)',
    driverKirim: 'TAKAKI',
    jenisSIM: 'B2 UMUM',
    tglBerlakuSIM: getRelativeDateStr(-2),
    urlFotoSIM: generateSIMPlaceholderSVG('2023091102', 'Lukman Hakim', 'B2 UMUM'),
  },
  {
    no: 17,
    nik: '2024022847',
    namaDriver: 'Maman Abdurrahman',
    statusDriver: 'IDM',
    driverKirim: 'LPG',
    jenisSIM: 'B2',
    tglBerlakuSIM: getRelativeDateStr(400),
    urlFotoSIM: generateSIMPlaceholderSVG('2024022847', 'Maman Abdurrahman', 'B2'),
  },
  {
    no: 18,
    nik: '2024061219',
    namaDriver: 'Nandang Kusnadi',
    statusDriver: 'GBN',
    driverKirim: 'DRY',
    jenisSIM: 'B1',
    tglBerlakuSIM: getRelativeDateStr(90),
    urlFotoSIM: generateSIMPlaceholderSVG('2024061219', 'Nandang Kusnadi', 'B1'),
  },
  {
    no: 19,
    nik: '2024100588',
    namaDriver: 'Oki Setiawan',
    statusDriver: 'IDM',
    driverKirim: 'BUAH',
    jenisSIM: 'A',
    tglBerlakuSIM: getRelativeDateStr(180),
    urlFotoSIM: generateSIMPlaceholderSVG('2024100588', 'Oki Setiawan', 'A'),
  },
];

export const INITIAL_LOGS: LogAktivitas[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toLocaleString('id-ID'),
    adminUser: 'Admin Logistics DC',
    aksi: 'BULK_UPLOAD',
    detailInfo: 'Import massal 19 data master driver awal DC Bandung',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 12).toLocaleString('id-ID'),
    adminUser: 'SPV Delivery DC',
    aksi: 'TAMBAH',
    detailInfo: 'Stock Opname SIM B2 - AANG SAMSUDIN (2015267970)',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('id-ID'),
    adminUser: 'Admin Logistics DC',
    aksi: 'UPDATE',
    detailInfo: 'Pembaruan SIM B1 - ABDUL ZENAL ARIPIN (2015476821)',
  },
];
