import React, { useState } from 'react';
import { CaregiverProfile } from '../types';
import { Users, Check, Shield, Tablet, Smartphone, Sparkles } from 'lucide-react';

interface TeamMemberSwitcherProps {
  teamMembers: CaregiverProfile[];
  activeMember: CaregiverProfile;
  onSelectMember: (member: CaregiverProfile) => void;
  onOpenHandoverModal: () => void;
}

export const TeamMemberSwitcher: React.FC<TeamMemberSwitcherProps> = ({
  teamMembers,
  activeMember,
  onSelectMember,
  onOpenHandoverModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button styled for iPad / Touch use */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-xl transition-all shadow-xs"
        title="Tap to switch logged-in caregiver on this shared iPad"
        aria-label="Switch logged-in team member"
      >
        <div className={`w-8 h-8 rounded-lg ${activeMember.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}>
          {activeMember.initials}
        </div>
        <div className="text-left leading-tight hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-slate-900">{activeMember.name}</span>
            {activeMember.role === 'head_nurse' && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                Head Nurse
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Tablet className="w-2.5 h-2.5 text-slate-400" />
            <span>Shared iPad · Tap to switch</span>
          </span>
        </div>
        <Users className="w-4 h-4 text-slate-500 ml-1 shrink-0" />
      </button>

      {/* Dropdown Modal for Shared iPad Team Switching */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tablet className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm">Shared iPad / Team Switcher</h3>
                </div>
                <span className="text-[11px] font-medium text-teal-200 bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-700/50">
                  IrishCareConnect
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Tap your name to sign notes and flowsheets under your profile.
              </p>
            </div>

            {/* Team Roster list */}
            <div className="p-3 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              <div className="pb-2 px-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  Care Team Members
                </span>
              </div>

              {teamMembers.map((member) => {
                const isSelected = member.id === activeMember.id;
                const isHeadNurse = member.role === 'head_nurse';

                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      onSelectMember(member);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left mt-1 ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${member.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-xs`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">
                            {member.name}
                          </span>
                          {isHeadNurse && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md">
                              <Shield className="w-2.5 h-2.5 text-emerald-700" />
                              Head Nurse
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {member.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5 text-teal-700" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium group-hover:text-slate-700">
                          Tap to select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer with testing guidance and mobile access info */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Smartphone className="w-3 h-3 text-slate-400" />
                  Head Nurse on mobile: Margaret Brady
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenHandoverModal();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 px-2 py-1 rounded-md transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-teal-700" />
                  Handover Briefing
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
