import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Database,
  Users,
  History,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  PlusCircle,
} from 'lucide-react';
import { ActiveTab, DatabaseSIM } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  simList: DatabaseSIM[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  simList,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const totalSim = simList.length;
  const mepetCount = simList.filter((s) => s.statusKadaluarsa === 'MEPET (< 30 HARI)').length;
  const expiredCount = simList.filter((s) => s.statusKadaluarsa === 'EXPIRED').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Analytics',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'form-so' as ActiveTab,
      label: 'Form Stock Opname',
      shortLabel: '+ SO SIM',
      icon: ClipboardCheck,
      badge: 'Input',
    },
    {
      id: 'database-sim' as ActiveTab,
      label: 'Database SIM Driver',
      shortLabel: 'Database',
      icon: Database,
      badge: totalSim > 0 ? totalSim : null,
    },
    {
      id: 'master-driver' as ActiveTab,
      label: 'Master Driver',
      shortLabel: 'Drivers',
      icon: Users,
      badge: null,
    },
    {
      id: 'log-aktivitas' as ActiveTab,
      label: 'Log Aktivitas Audit',
      shortLabel: 'Audit Log',
      icon: History,
      badge: null,
    },
    {
      id: 'konfigurasi' as ActiveTab,
      label: 'Konfigurasi',
      shortLabel: 'Config',
      icon: Settings,
      badge: 'Sync',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* SIDEBAR CONTAINER (Desktop Sidebar + Mobile Slide-Out Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 md:h-full z-40 w-72 md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 no-print transition-transform duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 md:hidden bg-slate-950">
          <span className="font-bold text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            Menu Navigasi Fleet
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Menu Utama Ops DC
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 md:py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold shadow-sm'
                    : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Status Summary Box in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 pb-20 md:pb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Status SIM Live</span>
            <span className="text-[9px] font-mono text-teal-400">DC BANDUNG</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-400 text-[11px]">Aktif</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-[11px]">
                {simList.filter((s) => s.statusKadaluarsa === 'AKTIF').length}
              </span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-400 text-[11px]">Mepet (&lt; 30d)</span>
              </div>
              <span className="font-mono font-bold text-amber-400 text-[11px]">
                {mepetCount}
              </span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-slate-400 text-[11px]">Expired</span>
              </div>
              <span className="font-mono font-bold text-rose-400 text-[11px]">
                {expiredCount}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSelectTab('form-so')}
            className="mt-3 w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Input SO SIM Baru</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM STICKY QUICK NAV BAR (1-Tap smartphone access) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-6 py-1.5 px-0.5 no-print shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all ${
                isActive ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400 scale-110' : 'text-slate-400'}`} />
              <span className="text-[9px] mt-0.5 truncate max-w-[50px] leading-tight">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
