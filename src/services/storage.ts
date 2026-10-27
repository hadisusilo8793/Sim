import { MasterDriver, DatabaseSIM, LogAktivitas, StatusKadaluarsa, AksiLog } from '../types';
import { INITIAL_MASTER_DRIVERS, INITIAL_SIM_DATABASE, INITIAL_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  MASTER_DRIVERS: 'so_sim_master_drivers_v2',
  SIM_DATABASE: 'so_sim_database_v2',
  LOGS: 'so_sim_activity_logs_v2',
};

// Calculate SIM status dynamically based on current date
export function computeSIMStatus(tglBerlakuSIM: string): StatusKadaluarsa {
  if (!tglBerlakuSIM) return 'EXPIRED';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiryDate = new Date(tglBerlakuSIM);
  expiryDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'EXPIRED';
  } else if (diffDays <= 30) {
    return 'MEPET (< 30 HARI)';
  } else {
    return 'AKTIF';
  }
}

// Format Date YYYY-MM-DD to DD-MMM-YYYY (e.g. 15-Okt-2026)
export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agus', 'Sep', 'Okt', 'Nov', 'Des'];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day}-${months[monthIdx]}-${year}`;
    }
  }
  return dateStr;
}

// Calculate remaining days
export function getRemainingDays(dateStr: string): number {
  if (!dateStr) return -999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Storage Service API
export const StorageService = {
  getMasterDrivers(): MasterDriver[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MASTER_DRIVERS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.MASTER_DRIVERS, JSON.stringify(INITIAL_MASTER_DRIVERS));
        return INITIAL_MASTER_DRIVERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_MASTER_DRIVERS;
    }
  },

  saveMasterDrivers(drivers: MasterDriver[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTER_DRIVERS, JSON.stringify(drivers));
  },

  getSIMDatabase(): DatabaseSIM[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIM_DATABASE);
      let list: DatabaseSIM[] = raw ? JSON.parse(raw) : INITIAL_SIM_DATABASE;
      
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.SIM_DATABASE, JSON.stringify(INITIAL_SIM_DATABASE));
      }

      // Dynamically attach statusKadaluarsa based on today's date
      return list.map((item) => ({
        ...item,
        statusKadaluarsa: computeSIMStatus(item.tglBerlakuSIM),
      }));
    } catch {
      return INITIAL_SIM_DATABASE.map((item) => ({
        ...item,
        statusKadaluarsa: computeSIMStatus(item.tglBerlakuSIM),
      }));
    }
  },

  saveSIMDatabase(sims: DatabaseSIM[]): void {
    const updated = sims.map((item) => ({
      ...item,
      statusKadaluarsa: computeSIMStatus(item.tglBerlakuSIM),
    }));
    localStorage.setItem(STORAGE_KEYS.SIM_DATABASE, JSON.stringify(updated));
  },

  getLogs(): LogAktivitas[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
        return INITIAL_LOGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(adminUser: string, aksi: AksiLog, detailInfo: string): void {
    const current = this.getLogs();
    const newLog: LogAktivitas = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
      adminUser: adminUser || 'Admin Logistics DC',
      aksi,
      detailInfo,
    };
    const updated = [newLog, ...current];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.MASTER_DRIVERS, JSON.stringify(INITIAL_MASTER_DRIVERS));
    localStorage.setItem(STORAGE_KEYS.SIM_DATABASE, JSON.stringify(INITIAL_SIM_DATABASE));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  },
};
