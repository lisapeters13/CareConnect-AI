import React from 'react';
import { ResidentProfile, CaregiverProfile } from '../types';
import { ShieldAlert, MapPin, Calendar, Heart } from 'lucide-react';
import { TeamMemberSwitcher } from './TeamMemberSwitcher';

interface ResidentHeaderProps {
  resident: ResidentProfile;
  activeCaregiver: CaregiverProfile;
  teamMembers: CaregiverProfile[];
  onSelectCaregiver: (caregiver: CaregiverProfile) => void;
  onOpenHandoverModal: () => void;
  onEndShift: () => void;
}

export const ResidentHeader: React.FC<ResidentHeaderProps> = ({
  resident,
  activeCaregiver,
  teamMembers,
  onSelectCaregiver,
  onOpenHandoverModal,
  onEndShift,
}) => {
  return (
    <section className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Resident Profile Card for Mrs. Brimberg */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-teal-300 font-bold text-xl flex items-center justify-center border-2 border-slate-200 shadow-sm">
              MB
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold"
              title="Resident Checked In"
            >
              ✓
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{resident.name}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  {resident.room || '480 Park'}
                </span>
              </h1>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <Calendar className="w-3 h-3 text-slate-500" />
                Age 92 · Turning 93 in Dec
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                <ShieldAlert className="w-3 h-3" />
                {resident.fallRiskScore}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 max-w-2xl line-clamp-1 sm:line-clamp-none flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{resident.notes}</span>
            </p>
          </div>
        </div>

        {/* Right: Shared iPad Team Switcher & Active Caregiver */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <TeamMemberSwitcher
            teamMembers={teamMembers}
            activeMember={activeCaregiver}
            onSelectMember={onSelectCaregiver}
            onOpenHandoverModal={onOpenHandoverModal}
          />

          {activeCaregiver.isShiftActive ? (
            <button
              onClick={onEndShift}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              title="Handover shift to next caregiver"
            >
              End Shift
            </button>
          ) : (
            <button
              onClick={onOpenHandoverModal}
              className="px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Start Shift</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

