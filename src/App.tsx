import React, { useState, useEffect } from 'react';
import { ActiveTab, MasterDriver, DatabaseSIM, LogAktivitas } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FormSOView } from './components/FormSOView';
import { DatabaseSIMView } from './components/DatabaseSIMView';
import { MasterDriverView } from './components/MasterDriverView';
import { LogAktivitasView } from './components/LogAktivitasView';
import { KonfigurasiView } from './components/KonfigurasiView';
import { PhotoModal } from './components/PhotoModal';
import Swal from 'sweetalert2';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // State Stores
  const [masterDrivers, setMasterDrivers] = useState<MasterDriver[]>([]);
  const [simList, setSimList] = useState<DatabaseSIM[]>([]);
  const [logs, setLogs] = useState<LogAktivitas[]>([]);

  // Selected Photo Modal
  const [inspectedSIM, setInspectedSIM] = useState<DatabaseSIM | null>(null);

  // Load initial dataset from storage service
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const drivers = StorageService.getMasterDrivers();
    const sims = StorageService.getSIMDatabase();
    const activityLogs = StorageService.getLogs();

    setMasterDrivers(drivers);
    setSimList(sims);
    setLogs(activityLogs);
  };

  // Handle SO Submission (Add or Update)
  const handleSubmitSO = (simData: DatabaseSIM, isUpdate: boolean) => {
    let updatedSims: DatabaseSIM[];
    if (isUpdate) {
      updatedSims = simList.map((item) => (item.nik === simData.nik ? simData : item));
      StorageService.addLog(
        'Admin Logistics DC',
        'UPDATE',
        `Pembaruan SO SIM ${simData.jenisSIM} - ${simData.namaDriver} (${simData.nik})`
      );
    } else {
      updatedSims = [simData, ...simList];
      StorageService.addLog(
        'Admin Logistics DC',
        'TAMBAH',
        `Stock Opname SIM Baru ${simData.jenisSIM} - ${simData.namaDriver} (${simData.nik})`
      );
    }

    StorageService.saveSIMDatabase(updatedSims);
    setSimList(updatedSims);
    setLogs(StorageService.getLogs());
  };

  // Delete SIM Record
  const handleDeleteSIM = (nik: string) => {
    const target = simList.find((s) => s.nik === nik);
    const updated = simList.filter((s) => s.nik !== nik);

    StorageService.saveSIMDatabase(updated);
    setSimList(updated);

    if (target) {
      StorageService.addLog(
        'Admin Logistics DC',
        'DELETE',
        `Penghapusan data SIM ${target.jenisSIM} - ${target.namaDriver} (${target.nik})`
      );
      setLogs(StorageService.getLogs());
    }
  };

  // Add Master Driver
  const handleAddMasterDriver = (newDriver: MasterDriver) => {
    const updated = [newDriver, ...masterDrivers];
    StorageService.saveMasterDrivers(updated);
    setMasterDrivers(updated);

    StorageService.addLog(
      'Admin Logistics DC',
      'TAMBAH',
      `Registrasi Driver Baru di Master Driver - ${newDriver.namaDriver} (${newDriver.nik})`
    );
    setLogs(StorageService.getLogs());
  };

  // Toggle Keaktifan Driver (Aktif / Resign Non-Aktif)
  const handleToggleKeaktifan = (nik: string) => {
    const updated = masterDrivers.map((driver) => {
      if (driver.nik === nik) {
        const nextStatus = driver.statusKeaktifan === 'AKTIF' ? 'NON-AKTIF' : 'AKTIF';
        StorageService.addLog(
          'Admin Logistics DC',
          'UPDATE',
          `Ubah status keaktifan driver ${driver.namaDriver} (${driver.nik}) -> ${nextStatus}`
        );
        return { ...driver, statusKeaktifan: nextStatus as any };
      }
      return driver;
    });

    StorageService.saveMasterDrivers(updated);
    setMasterDrivers(updated);
    setLogs(StorageService.getLogs());
  };

  // Edit Master Driver
  const handleEditMasterDriver = (oldNik: string, updatedDriver: MasterDriver) => {
    const updated = masterDrivers.map((d) => (d.nik === oldNik ? updatedDriver : d));
    StorageService.saveMasterDrivers(updated);
    setMasterDrivers(updated);

    // Also update NIK and Name in DatabaseSIM if driver exists there
    if (oldNik !== updatedDriver.nik || updatedDriver.namaDriver) {
      const updatedSIM = simList.map((s) => {
        if (s.nik === oldNik) {
          return {
            ...s,
            nik: updatedDriver.nik,
            namaDriver: updatedDriver.namaDriver,
            statusDriver: updatedDriver.statusDriver,
            driverKirim: updatedDriver.defaultDriverKirim,
          };
        }
        return s;
      });
      StorageService.saveSIMDatabase(updatedSIM);
      setSimList(updatedSIM);
    }

    StorageService.addLog(
      'Admin Logistics DC',
      'UPDATE',
      `Edit data driver ${updatedDriver.namaDriver} (NIK: ${updatedDriver.nik})`
    );
    setLogs(StorageService.getLogs());
  };

  // Delete Master Driver
  const handleDeleteMasterDriver = (nik: string) => {
    const target = masterDrivers.find((d) => d.nik === nik);
    const updated = masterDrivers.filter((d) => d.nik !== nik);
    StorageService.saveMasterDrivers(updated);
    setMasterDrivers(updated);

    StorageService.addLog(
      'Admin Logistics DC',
      'DELETE',
      `Hapus driver ${target?.namaDriver || nik} dari Master Driver`
    );
    setLogs(StorageService.getLogs());
  };

  // Bulk Upload Master Drivers
  const handleBulkUpload = (newDrivers: MasterDriver[]) => {
    // Merge without duplication on NIK
    const existingNiks = new Set(masterDrivers.map((d) => d.nik));
    const uniqueNew = newDrivers.filter((d) => !existingNiks.has(d.nik));

    const updated = [...uniqueNew, ...masterDrivers];
    StorageService.saveMasterDrivers(updated);
    setMasterDrivers(updated);

    StorageService.addLog(
      'Admin Logistics DC',
      'BULK_UPLOAD',
      `Import massal ${uniqueNew.length} driver baru ke Master Driver`
    );
    setLogs(StorageService.getLogs());
  };

  // Clear Logs
  const handleClearLogs = () => {
    localStorage.removeItem('so_sim_activity_logs_v1');
    setLogs([]);
  };

  // Reset Data to Default Initial Seed
  const handleResetData = () => {
    Swal.fire({
      title: 'Reset Semua Data Ke State Default?',
      text: 'Semua perubahan data master, SIM, dan log akan dikembalikan ke data sampel awal DC Bandung.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Reset Data',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    }).then((res) => {
      if (res.isConfirmed) {
        StorageService.resetToDefault();
        loadData();
        Swal.fire({
          icon: 'success',
          title: 'Data Berhasil Direset',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col font-sans overflow-hidden">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Workspace Body - Sidebar stationary, main content scrolls independently */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Sidebar Nav (Stationary on Desktop, Drawer on Mobile) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          simList={simList}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Viewport Content Area with independent scroll */}
        <main className="flex-1 overflow-y-auto w-full h-full min-h-0 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                masterDrivers={masterDrivers}
                simList={simList}
                setActiveTab={setActiveTab}
                onInspectPhoto={(sim) => setInspectedSIM(sim)}
              />
            )}

            {activeTab === 'form-so' && (
              <FormSOView
                masterDrivers={masterDrivers}
                simList={simList}
                onSubmitSO={handleSubmitSO}
              />
            )}

            {activeTab === 'database-sim' && (
              <DatabaseSIMView
                simList={simList}
                onDeleteSIM={handleDeleteSIM}
                onInspectPhoto={(sim) => setInspectedSIM(sim)}
                onNavigateToSO={() => setActiveTab('form-so')}
              />
            )}

            {activeTab === 'master-driver' && (
              <MasterDriverView
                masterDrivers={masterDrivers}
                onAddDriver={handleAddMasterDriver}
                onEditDriver={handleEditMasterDriver}
                onDeleteDriver={handleDeleteMasterDriver}
                onToggleKeaktifan={handleToggleKeaktifan}
                onBulkUpload={handleBulkUpload}
              />
            )}

            {activeTab === 'log-aktivitas' && (
              <LogAktivitasView
                logs={logs}
                onClearLogs={handleClearLogs}
              />
            )}

            {activeTab === 'konfigurasi' && (
              <KonfigurasiView
                masterDrivers={masterDrivers}
                simList={simList}
                logs={logs}
                onResetData={handleResetData}
                onClearLogs={handleClearLogs}
              />
            )}
          </div>
        </main>
      </div>

      {/* Full-Resolution SIM Photo Inspection Modal */}
      <PhotoModal
        item={inspectedSIM}
        onClose={() => setInspectedSIM(null)}
      />
    </div>

  );
}
