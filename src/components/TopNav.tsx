import React from 'react';
import { Role, CaregiverProfile } from '../types';
import {
  AlertTriangle,
  Wifi,
  WifiOff,
  Shield,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

interface TopNavProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeCaregiver: CaregiverProfile;
  caregivers: CaregiverProfile[];
  onSelectCaregiver: (caregiver: CaregiverProfile) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onOpenVoiceModal: () => void;
  onOpenIncidentModal: () => void;
  onOpenHandoverModal: () => void;
  onExportData?: () => void;
  activeTab: 'dashboard' | 'diary' | 'head_nurse';
  setActiveTab: (tab: 'dashboard' | 'diary' | 'head_nurse') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRole,
  onRoleChange,
  activeCaregiver,
  caregivers,
  onSelectCaregiver,
  isOnline,
  pendingSyncCount,
  onOpenVoiceModal,
  onOpenIncidentModal,
  onOpenHandoverModal,
  onExportData,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Zone 1: Wordmark: IrishCareConnect */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-teal-300 font-extrabold text-xl shadow-md border border-emerald-700/50">
                ☘
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                  IrishCareConnect
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium leading-none">
                  Care Diary & Handover · 480 Park
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Care Notepad & I&O Sheet
            </button>
            <button
              onClick={() => {
                onRoleChange('head_nurse');
                setActiveTab('head_nurse');
              }}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'head_nurse'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-850 hover:text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Head Nurse Portal (Margaret Brady)</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions & User State */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Export / Save Care Record */}
            {onExportData && (
              <button
                onClick={onExportData}
                className="hidden lg:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-xs"
                title="Save & Export full caregiving records to file"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Record</span>
              </button>
            )}

            {/* Incident Red Flag Button */}
            <button
              onClick={onOpenIncidentModal}
              className="px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 shadow-sm shadow-red-500/20 active:scale-95 transition-all whitespace-nowrap"
              title="Report clinical incident immediately"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Incident</span>
            </button>

            {/* Voice Dictate Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl flex items-center gap-1.5 shadow-sm shadow-teal-800/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Voice-to-Sort</span>
              <span className="sm:hidden">Dictate</span>
            </button>

            {/* Offline / Cloud Sync Indicator */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg ${
                isOnline
                  ? pendingSyncCount > 0
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-600 bg-slate-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
              title={isOnline ? (pendingSyncCount > 0 ? `${pendingSyncCount} cached logs pending sync` : 'Connected & Synced') : 'Offline mode: saving locally on iPad'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xl:inline text-[11px] font-mono">
                    {pendingSyncCount > 0 ? `${pendingSyncCount} queue` : 'Saved'}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[11px] font-mono">Local Only</span>
                </>
              )}
            </div>

            {/* Role & Caregiver Quick Switcher */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
              {currentRole === 'head_nurse' ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    MB
                  </div>
                  <div className="hidden xl:block text-left text-xs">
                    <p className="font-bold text-slate-900 leading-tight">Margaret Brady, RN</p>
                    <p className="text-emerald-700 font-semibold text-[10px]">Head Nurse</p>
                  </div>
                  <button
                    onClick={() => {
                      onRoleChange('caregiver');
                      setActiveTab('dashboard');
                    }}
                    className="text-xs text-teal-800 hover:text-teal-900 font-bold px-2 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Caregiver Mode
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={activeCaregiver.id}
                    onChange={(e) => {
                      const cg = caregivers.find((c) => c.id === e.target.value);
                      if (cg) onSelectCaregiver(cg);
                    }}
                    className="text-xs bg-slate-100 border border-slate-300 text-slate-900 font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-[130px] sm:max-w-[170px] truncate shadow-2xs"
                    title="Switch user on this iPad"
                  >
                    {caregivers.map((cg) => (
                      <option key={cg.id} value={cg.id} disabled={cg.status === 'revoked'}>
                        {cg.name} {cg.role === 'head_nurse' ? '★ (Head Nurse)' : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      onRoleChange('head_nurse');
                      setActiveTab('head_nurse');
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors hidden sm:inline"
                    title="Switch to Head Nurse Margaret Brady view"
                  >
                    Nurse View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-700'
            }`}
          >
            Notepad & I&O
          </button>
          <button
            onClick={() => {
              onRoleChange('head_nurse');
              setActiveTab('head_nurse');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'head_nurse' ? 'bg-emerald-800 text-white' : 'text-slate-700'
            }`}
          >
            Head Nurse
          </button>
          <button
            onClick={onOpenHandoverModal}
            className="px-2.5 py-1.5 text-teal-800 bg-teal-50 rounded-lg font-bold"
          >
            Pre-Shift
          </button>
          {onExportData && (
            <button
              onClick={onExportData}
              className="px-2.5 py-1.5 text-slate-700 bg-slate-100 rounded-lg font-bold"
            >
              Export
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
