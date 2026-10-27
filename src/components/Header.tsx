import React from 'react';
import { Truck, Shield, RefreshCw, Menu, X, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetData: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Analytics';
      case 'form-so':
        return 'Form Stock Opname SIM';
      case 'database-sim':
        return 'Database SIM Driver';
      case 'master-driver':
        return 'Kelola Master Driver';
      case 'log-aktivitas':
        return 'Log Aktivitas Audit';
      case 'konfigurasi':
        return 'Konfigurasi & Integrasi';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900 border-b border-slate-800 text-white px-4 md:px-6 flex items-center justify-between gap-4 no-print shadow-md">
      {/* Zone 1: Mobile Hamburger Toggle + Brand Wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-white block leading-none">
              DC BANDUNG FLEET
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-wide block sm:inline">
              SIM STOCK OPNAME
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Breadcrumb context for Desktop */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap overflow-hidden">
        <span className="text-slate-500">Logistics DC Bandung</span>
        <span>/</span>
        <span className="font-semibold text-slate-200">{getTabLabel(activeTab)}</span>
      </div>

      {/* Zone 3: Actions & Admin Status */}
      <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0">
        <button
          onClick={() => {
            setActiveTab('konfigurasi');
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'konfigurasi'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
          title="Buka Menu Konfigurasi & Sinkronisasi"
        >
          <Settings className={`w-4 h-4 ${activeTab === 'konfigurasi' ? 'text-slate-950' : 'text-teal-400'}`} />
          <span className="hidden sm:inline">Konfigurasi</span>
        </button>

        <button
          onClick={onResetData}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Data ke Default Initial State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>

        <div className="hidden sm:flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 text-xs font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-slate-200 leading-none">Admin Logistics</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">DC Bandung</span>
          </div>
        </div>
      </div>
    </header>
  );
};

